import { ServiceManager } from './src/service-manager';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${msg}`);
}

function runPhase4Tests() {
  console.log('--- Phase 4: Infrastructure Model & Gateway Simulation Verification ---\n');

  const sm = new ServiceManager();

  // 1. DNS Resolution
  const dnsRes = sm.resolveDns('greenhouse.solar-grove.local');
  assert(
    dnsRes === '10.0.0.10',
    'DNS resolves greenhouse.solar-grove.local to 10.0.0.10 (Helio Relay)'
  );
  const dnsIrr = sm.resolveDns('irrigation.solar-grove.local');
  assert(dnsIrr === '10.0.0.10', 'DNS resolves irrigation.solar-grove.local to 10.0.0.10');
  const dnsDirect = sm.resolveDns('greenhouse.local');
  assert(dnsDirect === '10.0.0.20', 'DNS resolves direct greenhouse.local to 10.0.0.20');

  // 2. Service Deployment of Helio Relay
  const deployRes = sm.deploySoftware('helio-relay');
  assert(deployRes.success, 'Helio Relay software deployed successfully');
  const startRes = sm.startService('helio-relay');
  assert(startRes.success, 'helio-relay started successfully');
  const relaySvc = sm.getService('helio-relay');
  assert(relaySvc?.status === 'running', 'helio-relay systemd service is running');

  // 3. Check processes & listening ports (Ports 80 and 443)
  const procs = sm.getProcesses();
  assert(
    procs.some((p) => p.command.includes('nginx: master process')),
    'Nginx master process is running'
  );
  assert(
    procs.some((p) => p.command.includes('nginx: worker process')),
    'Nginx worker process is running'
  );

  const ports = sm.getListeningPorts();
  assert(
    ports.some((p) => p.port === 80 && p.processName?.includes('nginx')),
    'Port 80 is listening for helio-relay'
  );
  assert(
    ports.some((p) => p.port === 443 && p.processName?.includes('nginx')),
    'Port 443 is listening for helio-relay'
  );

  // 4. HTTP to HTTPS 301 Redirect on Port 80
  const redirectRes = sm.dispatchHttp('http://greenhouse.solar-grove.local');
  assert(redirectRes.statusCode === 301, 'HTTP request receives 301 Moved Permanently');
  assert(
    Boolean(redirectRes.headers?.Location?.startsWith('https://greenhouse.solar-grove.local')),
    'Redirect location is https://greenhouse.solar-grove.local/'
  );

  // 5. TLS Validation Failure (Missing/Invalid Cert initially)
  const httpsInitialRes = sm.dispatchHttp('https://greenhouse.solar-grove.local');
  assert(
    httpsInitialRes.statusCode === 495,
    'Initial HTTPS request fails with 495 SSL Certificate Error'
  );
  assert(
    Boolean(httpsInitialRes.error?.includes('ERR_CERT')),
    'Error specifies NET::ERR_CERT_COMMON_NAME_INVALID'
  );

  // 6. Request Certificate via Simulated ACME / Let's Encrypt
  const certRes = sm.requestCertificate('*.solar-grove.local');
  assert(certRes.certificate.status === 'VALID', 'Certificate issued with status VALID');
  const certs = sm.getCertificates();
  assert(
    certs.some((c) => c.status === 'VALID'),
    'Valid TLS certificate now registered in ServiceManager'
  );

  // 7. 502 Bad Gateway (Misconfigured Upstream: greenhouse-app:4000)
  sm.pullImage('postgres:16');
  sm.pullImage('solar-grove/greenhouse-controller:1.0');
  sm.composeUp();
  sm.setGreenhouseDbPassword('greenhouse');

  const https502Res = sm.dispatchHttp('https://greenhouse.solar-grove.local');
  assert(
    https502Res.statusCode === 502,
    'HTTPS request receives 502 Bad Gateway due to wrong upstream host'
  );
  assert(Boolean(https502Res.body?.includes('Bad Gateway')), 'Body includes 502 Bad Gateway');

  const relayLogs = relaySvc?.logs || [];
  assert(
    relayLogs.some((l) => l.includes('connect() failed') || l.includes('Connection refused')),
    'Relay logs contain upstream connection refused error'
  );

  // 8. Nginx Configuration Test
  const nginxTest = sm.testNginxConfig();
  assert(nginxTest.valid, 'Nginx configuration test is successful');

  // 9. Route Repair via ServiceManager
  const updateSuccess = sm.updateProxyRoute('route-greenhouse', {
    upstreamHost: 'greenhouse-controller',
    upstreamPort: 4000,
  });
  assert(updateSuccess, 'Proxy route updated successfully to greenhouse-controller:4000');

  // 10. Verify 200 OK after Route Repair
  const httpsFixedRes = sm.dispatchHttp('https://greenhouse.solar-grove.local');
  assert(httpsFixedRes.statusCode === 200, 'HTTPS request now returns 200 OK!');
  assert(
    Boolean(httpsFixedRes.body?.includes('VERDANT GLASSHOUSE')),
    'Response body contains Greenhouse Controller telemetry'
  );

  // 11. Public Irrigation Route Addition
  sm.deploySoftware('irrigation-controller');
  sm.startService('irrigation-controller');
  sm.addProxyRoute({
    id: 'route-irrigation',
    hostname: 'irrigation.solar-grove.local',
    path: '/',
    upstreamHost: '10.0.0.30',
    upstreamPort: 8080,
    tlsRequired: true,
    enabled: true,
  });

  const irrHttpsRes = sm.dispatchHttp('https://irrigation.solar-grove.local');
  assert(irrHttpsRes.statusCode === 200, 'Public irrigation route returns 200 OK');
  assert(
    Boolean(irrHttpsRes.body?.includes('irrigation-controller')),
    'Response body contains Irrigation telemetry'
  );

  console.log('\n🎉 ALL 11 INFRASTRUCTURE MODEL PHASE 4 TESTS PASSED PERFECTLY!\n');
}

runPhase4Tests();
