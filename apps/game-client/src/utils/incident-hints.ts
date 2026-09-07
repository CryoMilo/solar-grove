import type { IncidentType } from '@solar-grove/game-types';

export interface IncidentGuideData {
  farmImpact: string;
  observedSymptom: string;
  investigationChecklist: string[];
  hints: [string, string, string, string];
  relevantTool: 'terminal' | 'browser' | 'network' | 'cloud' | 'certs' | 'software';
}

export const INCIDENT_GUIDES: Record<IncidentType, IncidentGuideData> = {
  'process-crash': {
    farmImpact: 'Automatic irrigation halted. Soil moisture draining and crop hydration falling.',
    observedSymptom: '502 Bad Gateway / Connection Refused on http://irrigation.local:8080.',
    investigationChecklist: [
      'Is the irrigation-controller system process currently alive?',
      'Did systemctl report an active (running) state?',
      'Do the journalctl logs indicate why the process terminated?',
    ],
    hints: [
      'Check whether the service is running using `systemctl status irrigation-controller` or `ps`.',
      'Inspect the process logs using `journalctl -u irrigation-controller` to read the crash trace.',
      'The service terminated abnormally and needs to be restarted.',
      'Run `systemctl restart irrigation-controller` in the Terminal to restore service.',
    ],
    relevantTool: 'terminal',
  },
  'wrong-port': {
    farmImpact: 'Edge relay cannot route water telemetry; hydration optimization is disabled.',
    observedSymptom: 'ERR_CONNECTION_REFUSED on expected port.',
    investigationChecklist: [
      'Which port is the service configured to bind to?',
      'Are there active listening sockets reported by netstat?',
      'Is the reverse proxy forwarding to the matching port?',
    ],
    hints: [
      'Check active listening sockets with `netstat -tlpn` or `ss -tulpn`.',
      'Compare the listening port against the reverse proxy or browser destination.',
      'The service is running on an unexpected port.',
      'Run `curl -I http://localhost:8080` to verify the correct listening port and update routes.',
    ],
    relevantTool: 'terminal',
  },
  'high-cpu': {
    farmImpact: 'Telemetry lag spikes and delayed pump actuation.',
    observedSymptom: 'High system load alert (>95% CPU consumption).',
    investigationChecklist: [
      'Which process PID is consuming the most CPU cycles?',
      'Is the process stuck in a tight loop or compute spike?',
      'Does restarting the affected service clear the runaway thread?',
    ],
    hints: [
      'Inspect running processes using `top` or `ps aux`.',
      'Identify the PID consuming over 90% CPU.',
      'A runaway computation thread is stalling the telemetry worker.',
      'Restart the offending service with `systemctl restart <service>` or kill the offending PID.',
    ],
    relevantTool: 'terminal',
  },
  'memory-leak': {
    farmImpact: 'Memory pressure building; crash imminent without intervention.',
    observedSymptom: 'Memory usage exceeding 90% threshold (OOM warning).',
    investigationChecklist: [
      'How much RAM is currently allocated vs free?',
      'Which daemon is holding onto unreleased memory buffers?',
      'Can the service be safely restarted before kernel OOM killer acts?',
    ],
    hints: [
      'Check system memory usage with `free -m` or `ps aux --sort=-%mem`.',
      'Observe which service has continuously climbing memory allocation.',
      'A memory leak in the telemetry cache is consuming host RAM.',
      'Restart the service using `systemctl restart <service>` to release memory buffers.',
    ],
    relevantTool: 'terminal',
  },
  'disk-full': {
    farmImpact: 'Crop harvest telemetry failing to persist to disk logs.',
    observedSymptom: 'Disk capacity at 98% (No space left on device).',
    investigationChecklist: [
      'Which partition is full according to df?',
      'Are unrotated logs accumulating in /var/log/?',
      'Will clearing obsolete log archives restore writable disk space?',
    ],
    hints: [
      'Inspect mounted disk volumes with `df -h`.',
      'Check log directory sizes with `ls -la /var/log/`.',
      'The rotated log archives are filling the root disk partition.',
      'Clean old log files using `rm -rf /var/log/old/` in the Terminal.',
    ],
    relevantTool: 'terminal',
  },
  'greenhouse-auth-failure': {
    farmImpact: 'Climate regulation offline. Photosynthesis boost (+50%) disabled.',
    observedSymptom: 'Greenhouse controller container status reports UNHEALTHY.',
    investigationChecklist: [
      'Is greenhouse-db accessible on port 5432?',
      'Are the container environment credentials matching postgres credentials?',
      'What error is printed in `docker logs greenhouse-controller`?',
    ],
    hints: [
      'Run `docker ps` to see which container is failing its health check.',
      'Run `docker logs greenhouse-controller` to read the database connection error.',
      'The log shows: `FATAL: password authentication failed for user greenhouse`.',
      'Update DATABASE_URL to `postgresql://greenhouse:greenhouse@greenhouse-db:5432/greenhouse` and restart.',
    ],
    relevantTool: 'terminal',
  },
  'container-crash': {
    farmImpact: 'Glasshouse automated climate controls offline.',
    observedSymptom: 'Container exited with non-zero exit code.',
    investigationChecklist: [
      'Is the container listed as Exited in `docker ps -a`?',
      'What was the last log line emitted before shutdown?',
      'Can the stack be brought back up with docker compose?',
    ],
    hints: [
      'Inspect container states using `docker ps -a`.',
      'Read exit logs using `docker logs greenhouse-controller`.',
      'The container stopped due to an unhandled exit signal.',
      'Execute `docker compose up` or `docker start greenhouse-controller` to restart it.',
    ],
    relevantTool: 'terminal',
  },
  'bad-upstream': {
    farmImpact: 'Public gateway cannot route incoming traffic to greenhouse controller.',
    observedSymptom: '502 Bad Gateway on http://greenhouse.solar-grove.local.',
    investigationChecklist: [
      'Is Helio Relay Nginx reverse proxy running?',
      'Does the upstream configuration point to the right container and port?',
      'What does `nginx -t` or `journalctl -u helio-relay` report?',
    ],
    hints: [
      'Inspect reverse proxy routes in Network Console or `journalctl -u helio-relay`.',
      'Verify whether the upstream target is configured to host `greenhouse-controller:4000`.',
      'The proxy is forwarding traffic to an invalid port (e.g. 9999 instead of 4000).',
      'Open the Network Console or edit Nginx config to set upstream to `greenhouse-controller:4000`.',
    ],
    relevantTool: 'network',
  },
  'cert-missing': {
    farmImpact: 'Secure farm ingress blocked by untrusted TLS warning.',
    observedSymptom: 'NET::ERR_CERT_AUTHORITY_INVALID / 495 SSL Certificate Error in browser.',
    investigationChecklist: [
      'Is there an active TLS certificate installed for *.solar-grove.local?',
      'Has the certificate expired or failed validation?',
      'Can an ACME certificate be issued via Certificate Manager?',
    ],
    hints: [
      'Open the Certificate Manager in Pixel PC or test with `openssl s_client`.',
      'Notice that the domain has no valid TLS certificate bound to port 443.',
      'The reverse proxy requires an authorized SSL/TLS certificate for encrypted HTTPS.',
      'Click [Issue Certificate] in Certificate Manager or run `certbot certonly` in Terminal.',
    ],
    relevantTool: 'certs',
  },
  'cloud-security-group-blocked': {
    farmImpact: 'Cloud greenhouse controller cannot reach managed database. Telemetry stalled.',
    observedSymptom: 'Database connection timeout on greenhouse-db.internal:5432.',
    investigationChecklist: [
      'Is TCP port 5432 authorized from greenhouse-app to greenhouse-db?',
      'Does the Cloud Console Security tab show the ingress rule as enabled?',
      'Is network traffic blocked by the cloud security group / firewall?',
    ],
    hints: [
      'Open the Cloud Console and switch to the **Security** tab.',
      'Look for the rule governing ingress to `greenhouse-db` on port 5432.',
      'The rule allowing traffic from `greenhouse-app` is currently DISABLED.',
      'Toggle the rule to ENABLED in Cloud Console or authorize it via CLI.',
    ],
    relevantTool: 'cloud',
  },
  'cloud-wrong-db-endpoint': {
    farmImpact: 'Cloud compute instance attempting to connect to deprecated local database.',
    observedSymptom: 'Migration verification failing: Connection refused on localhost:5432.',
    investigationChecklist: [
      'What is the value of DATABASE_URL on cloud compute instance i-greenhouse-01?',
      'Is it pointing to localhost or the managed database endpoint?',
      'Does greenhouse-db.internal resolve to the managed database in private subnet?',
    ],
    hints: [
      'Inspect compute environment variables in Cloud Console (**Compute** tab).',
      'DATABASE_URL is still configured as `localhost:5432` instead of the managed cloud endpoint.',
      'The managed RDS/Cloud SQL database has the endpoint `greenhouse-db.internal:5432`.',
      'Click [Fix DATABASE_URL] in Cloud Console Migration tab or update environment.',
    ],
    relevantTool: 'cloud',
  },
  'cloud-public-database': {
    farmImpact: 'Security posture audit failed. Database exposed to public internet.',
    observedSymptom: 'Security violation: RDS database resides outside private subnet.',
    investigationChecklist: [
      'Which subnet is the managed database deployed in?',
      'Is the database assigned a public IP address?',
      'Can the database be relocated to the isolated private subnet?',
    ],
    hints: [
      'Inspect the subnet assignment in Cloud Console (**Database** tab).',
      'The database instance is currently located in the public subnet `subnet-public-01`.',
      'Production zero-trust architectures require databases to reside in isolated private subnets.',
      'Reconfigure the database subnet to `subnet-private-01` to enforce private isolation.',
    ],
    relevantTool: 'cloud',
  },
  'cloud-compute-stopped': {
    farmImpact: 'Cloud-hosted greenhouse controller is completely offline.',
    observedSymptom: '502 Bad Gateway / Ingress upstream unreachable on cloud IP 10.10.1.10.',
    investigationChecklist: [
      'What is the state of instance `i-greenhouse-01` in Cloud Console?',
      'Is the virtual machine running or stopped?',
      'Will starting the instance restore the cloud application?',
    ],
    hints: [
      'Open Cloud Console and inspect the **Compute** tab.',
      'Instance `i-greenhouse-01` is in STOPPED status.',
      'The virtual server is powered down and not servicing requests.',
      'Click [Start Instance] in Cloud Console or run `aws ec2 start-instances`.',
    ],
    relevantTool: 'cloud',
  },
  'cloud-region-degraded': {
    farmImpact: 'Transient latency and slow crop telemetry synchronization.',
    observedSymptom: 'High round-trip latency alert on cloud provider connection.',
    investigationChecklist: [
      'Is the primary cloud region experiencing degraded availability?',
      'Are healthy instances available in alternate zones?',
      'Will verifying health metrics confirm recovery?',
    ],
    hints: [
      'Check cloud status overview in Cloud Console.',
      'Observe regional telemetry metrics and latency graphs.',
      'Transient degradation in ap-southeast-1 is impacting packet transit.',
      'Verify failover routes or restart application worker to reconnect to healthy pool.',
    ],
    relevantTool: 'cloud',
  },
};
