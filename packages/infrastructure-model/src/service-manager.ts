import type {
  CertificateStatus,
  CloudAccount,
  CloudComputeInstance,
  CloudMigrationProgress,
  CloudProvider,
  CloudSubnet,
  CloudVpc,
  ContainerHealth,
  ContainerStatus,
  DeploymentTarget,
  DnsRecord,
  DockerImage,
  DockerNetwork,
  HostPort,
  HostProcess,
  ManagedDatabaseInstance,
  NetworkHost,
  NetworkRule,
  ObjectStorageBucket,
  ObjectStorageObject,
  PostgresState,
  PostgresTelemetryRecord,
  ProxyRoute,
  ReverseProxyState,
  SimulatedContainer,
  SimulatedHttpResponse,
  SoftwareDeploymentStatus,
  TlsCertificate,
} from '@solar-grove/game-types';
import { CloudCostSummary, CloudManager, ConnectivityResult } from './cloud';

export interface ServiceDefinition {
  name: string;
  description: string;
  command: string;
  port: number;
  runtime: 'node' | 'python' | 'nginx' | 'binary';
  status: 'running' | 'stopped' | 'failed';
  deploymentStatus: SoftwareDeploymentStatus;
  pid?: number;
  cpu: number;
  memoryMb: number;
  logs: string[];
}

export interface IrrigationTelemetry {
  pumpingActive: boolean;
  reservoirPct: number;
  soilMoisturePct: number;
  activeZones: number;
  maxZones: number;
  litersPerMinute: number;
}

export class ServiceManager {
  private services: Map<string, ServiceDefinition> = new Map();
  private containers: Map<string, SimulatedContainer> = new Map();
  private remoteRegistry: Map<string, DockerImage> = new Map();
  private localImages: Map<string, DockerImage> = new Map();
  private networks: Map<string, DockerNetwork> = new Map();
  private hosts: Map<string, NetworkHost> = new Map();
  private dnsRecords: Map<string, DnsRecord> = new Map();
  private proxyRoutes: Map<string, ProxyRoute> = new Map();
  private tlsCertificates: Map<string, TlsCertificate> = new Map();
  private cloudManager: CloudManager = new CloudManager();
  private nextPid = 1421;

  private irrigationTelemetry: IrrigationTelemetry = {
    pumpingActive: false,
    reservoirPct: 78,
    soilMoisturePct: 43,
    activeZones: 2,
    maxZones: 5,
    litersPerMinute: 12.5,
  };

  private postgresState: PostgresState = {
    database: 'greenhouse',
    user: 'greenhouse',
    password: 'greenhouse',
    port: 5432,
    connectionState: 'AVAILABLE',
    tables: {
      greenhouse_telemetry: [
        { temperature: 24.5, humidity: 71, soilMoisture: 82, timestamp: '2026-09-06 10:00:00' },
        { temperature: 24.7, humidity: 70, soilMoisture: 81, timestamp: '2026-09-06 10:01:00' },
        { temperature: 24.4, humidity: 72, soilMoisture: 83, timestamp: '2026-09-06 10:02:00' },
      ],
      growth_cycles: [
        {
          id: 1,
          startedAt: '2026-09-06 09:30:00',
          growthMultiplier: 1.5,
          status: 'ACTIVE',
        },
      ],
      harvests: [
        {
          id: 101,
          crop: 'sunroot',
          quantity: 16,
          quality: 'PRISTINE',
          timestamp: '2026-09-06 09:45:00',
        },
      ],
    },
  };

  // Structured Docker Compose configuration
  private composeConfig = {
    services: {
      'greenhouse-db': {
        image: 'postgres:16',
        ports: ['5432:5432'],
        environment: {
          POSTGRES_DB: 'greenhouse',
          POSTGRES_USER: 'greenhouse',
          POSTGRES_PASSWORD: 'greenhouse',
        },
        network: 'greenhouse-network',
      },
      'greenhouse-controller': {
        image: 'solar-grove/greenhouse-controller:1.0',
        ports: ['4000:4000'],
        environment: {
          PORT: '4000',
          NODE_ENV: 'production',
          DATABASE_URL: 'postgresql://greenhouse:wrong-password@greenhouse-db:5432/greenhouse',
        },
        network: 'greenhouse-network',
      },
    },
  };

  constructor() {
    this.initDefaultServices();
    this.initDockerRegistry();
    this.initDockerNetworks();
    this.initNetworkTopology();
    this.initDnsRecords();
    this.initProxyRoutes();
    this.initTlsCertificates();
  }

  private initDefaultServices() {
    // Irrigation Controller for Helio Irrigation Station (Phase 2 Native systemd)
    this.services.set('irrigation-controller', {
      name: 'irrigation-controller',
      description: 'Helio Irrigation Array Controller Service',
      command: '/usr/local/bin/node /opt/solargrove/irrigation/index.js',
      port: 8080,
      runtime: 'node',
      status: 'stopped',
      deploymentStatus: 'NOT_DEPLOYED',
      cpu: 0,
      memoryMb: 0,
      logs: [
        'irrigation-controller.service - Helio Irrigation Array Controller Service',
        'Loaded: loaded (/etc/systemd/system/irrigation-controller.service; enabled; vendor preset: enabled)',
        'Active: inactive (dead)',
      ],
    });

    // Helio Relay Edge Gateway (Phase 4 Nginx Reverse Proxy & TLS Terminator)
    this.services.set('helio-relay', {
      name: 'helio-relay',
      description: 'Helio Relay Edge Gateway (Nginx Reverse Proxy & TLS Terminator)',
      command: 'nginx -g "daemon off;"',
      port: 443,
      runtime: 'nginx',
      status: 'stopped',
      deploymentStatus: 'NOT_DEPLOYED',
      cpu: 0,
      memoryMb: 0,
      logs: [
        'helio-relay.service - Helio Relay Edge Gateway (Nginx)',
        'Loaded: loaded (/etc/systemd/system/helio-relay.service; enabled; vendor preset: enabled)',
        'Active: inactive (dead)',
      ],
    });
  }

  private initNetworkTopology() {
    this.hosts.set('10.0.0.1', {
      ip: '10.0.0.1',
      hostname: 'farm-dns.solar-grove.local',
      role: 'gateway',
      description: 'Farm Gateway & Primary DNS Nameserver (10.0.0.1/24)',
      ports: [53],
      status: 'ONLINE',
    });
    this.hosts.set('10.0.0.2', {
      ip: '10.0.0.2',
      hostname: 'pixel-pc.solar-grove.local',
      role: 'workstation',
      description: 'Solar Grove Operator Terminal (Pixel PC - 10.0.0.2/24)',
      ports: [],
      status: 'ONLINE',
    });
    this.hosts.set('10.0.0.10', {
      ip: '10.0.0.10',
      hostname: 'relay.solar-grove.local',
      role: 'proxy',
      description: 'Helio Relay Station (Nginx Reverse Proxy & Ingress - 10.0.0.10/24)',
      ports: [80, 443],
      status: 'ONLINE',
    });
    this.hosts.set('10.0.0.20', {
      ip: '10.0.0.20',
      hostname: 'greenhouse.local',
      role: 'container-host',
      description: 'Verdant Glasshouse Docker Container Host (10.0.0.20/24)',
      ports: [4000, 5432],
      status: 'ONLINE',
    });
    this.hosts.set('10.0.0.30', {
      ip: '10.0.0.30',
      hostname: 'irrigation.local',
      role: 'device',
      description: 'Helio Irrigation Station Systemd Host (10.0.0.30/24)',
      ports: [8080],
      status: 'ONLINE',
    });
  }

  private initDnsRecords() {
    this.dnsRecords.set('greenhouse.solar-grove.local', {
      hostname: 'greenhouse.solar-grove.local',
      type: 'A',
      value: '10.0.0.10',
      ttl: 300,
    });
    this.dnsRecords.set('irrigation.solar-grove.local', {
      hostname: 'irrigation.solar-grove.local',
      type: 'A',
      value: '10.0.0.10',
      ttl: 300,
    });
    this.dnsRecords.set('relay.solar-grove.local', {
      hostname: 'relay.solar-grove.local',
      type: 'A',
      value: '10.0.0.10',
      ttl: 300,
    });
    this.dnsRecords.set('greenhouse.local', {
      hostname: 'greenhouse.local',
      type: 'A',
      value: '10.0.0.20',
      ttl: 300,
    });
    this.dnsRecords.set('irrigation.local', {
      hostname: 'irrigation.local',
      type: 'A',
      value: '10.0.0.30',
      ttl: 300,
    });
  }

  private initProxyRoutes() {
    // Deliberate initial misconfiguration: upstreamHost is 'greenhouse-app' instead of 'greenhouse-controller'
    this.proxyRoutes.set('route-greenhouse', {
      id: 'route-greenhouse',
      hostname: 'greenhouse.solar-grove.local',
      path: '/',
      upstreamHost: 'greenhouse-app',
      upstreamPort: 4000,
      enabled: true,
      tlsRequired: true,
    });
  }

  private initTlsCertificates() {
    // Deliberate initial state: MISSING certificate to trigger privacy warning
    this.tlsCertificates.set('cert-solar-grove', {
      id: 'cert-solar-grove',
      domain: '*.solar-grove.local',
      issuer: "Let's Encrypt Authority X3",
      status: 'MISSING',
      valid: false,
      keyType: 'RSA 2048',
      autoRenew: false,
    });
  }

  private initDockerRegistry() {
    this.remoteRegistry.set('solar-grove/greenhouse-controller:1.0', {
      id: 'c91f48a20de1',
      repository: 'solar-grove/greenhouse-controller',
      tag: '1.0',
      size: '142MB',
      createdAt: '2 days ago',
      status: 'AVAILABLE',
    });

    this.remoteRegistry.set('postgres:16', {
      id: '8df30291ba42',
      repository: 'postgres',
      tag: '16',
      size: '380MB',
      createdAt: '3 weeks ago',
      status: 'AVAILABLE',
    });
  }

  private initDockerNetworks() {
    this.networks.set('bridge', {
      id: 'net-bridge-01',
      name: 'bridge',
      driver: 'bridge',
      containers: [],
      subnet: '172.17.0.0/16',
    });

    this.networks.set('greenhouse-network', {
      id: 'net-gh-02',
      name: 'greenhouse-network',
      driver: 'bridge',
      containers: [],
      subnet: '172.28.0.0/16',
    });
  }

  // ==========================================
  // --- Phase 2: Linux Services Lifecycle ---
  // ==========================================

  deploySoftware(serviceName: string): { success: boolean; message: string } {
    const service = this.services.get(serviceName);
    if (!service) {
      return { success: false, message: `Package ${serviceName} not found in repository.` };
    }

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    service.deploymentStatus = 'DEPLOYED';
    service.logs.push(`[${timestamp}] [dpkg] Unpacking ${serviceName} (v1.4.2)...`);
    service.logs.push(
      `[${timestamp}] [systemd] Created symlink /etc/systemd/system/multi-user.target.wants/${serviceName}.service.`
    );
    service.logs.push(`[${timestamp}] [systemd] Reloaded systemd daemon configuration.`);

    return {
      success: true,
      message: `Deployed ${serviceName} successfully. Ready to start via systemctl.`,
    };
  }

  startService(name: string): { success: boolean; message: string; pid?: number } {
    const service = this.services.get(name);
    if (!service) {
      return { success: false, message: `Failed to start ${name}.service: Unit not found.` };
    }
    if (service.status === 'running') {
      return {
        success: true,
        message: `${name}.service is already active (running).`,
        pid: service.pid,
      };
    }

    service.status = 'running';
    service.deploymentStatus = 'HEALTHY';
    service.pid = this.nextPid++;
    service.cpu = Math.round(4 + Math.random() * 3);
    service.memoryMb = Math.round(85 + Math.random() * 15);

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    service.logs.push(`[${timestamp}] [systemd] Started ${service.description}.`);
    if (name === 'helio-relay') {
      service.logs.push(`[${timestamp}] [nginx] Configuration /etc/nginx/nginx.conf syntax ok`);
      service.logs.push(`[${timestamp}] [nginx] Worker process started (PID: ${service.pid + 1})`);
      service.logs.push(`[${timestamp}] [nginx] Listening on 0.0.0.0:80 (HTTP) and 0.0.0.0:443 (HTTPS)`);
    } else {
      service.logs.push(`[${timestamp}] [${service.name}] Server listening on port ${service.port}`);
      service.logs.push(
        `[${timestamp}] [${service.name}] Aquifer telemetry linked. Pressure normal at 4.2 bar.`
      );
    }

    return {
      success: true,
      message: `Started ${name}.service (PID: ${service.pid}).`,
      pid: service.pid,
    };
  }

  stopService(name: string): { success: boolean; message: string } {
    const service = this.services.get(name);
    if (!service) {
      return { success: false, message: `Failed to stop ${name}.service: Unit not found.` };
    }
    service.status = 'stopped';
    service.deploymentStatus = 'STOPPED';
    service.pid = undefined;
    service.cpu = 0;
    service.memoryMb = 0;

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    service.logs.push(`[${timestamp}] [systemd] Stopping ${service.description}...`);
    service.logs.push(`[${timestamp}] [systemd] Stopped ${service.description}.`);

    if (name === 'irrigation-controller') {
      this.irrigationTelemetry.pumpingActive = false;
    }

    return { success: true, message: `Stopped ${name}.service.` };
  }

  simulateCrash(
    name: string,
    reason = 'Fatal error: unexpected memory corruption in telemetry polling'
  ): boolean {
    const service = this.services.get(name);
    if (!service || service.status !== 'running') return false;

    const crashedPid = service.pid || this.nextPid;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    service.status = 'failed';
    service.deploymentStatus = 'CRASHED';
    service.pid = undefined;
    service.cpu = 0;
    service.memoryMb = 0;

    service.logs.push(`[${timestamp}] [${name}][${crashedPid}] ${reason}`);
    service.logs.push(
      `[${timestamp}] [systemd] ${name}.service: Main process exited unexpectedly (code=killed, status=SIGSEGV).`
    );
    service.logs.push(`[${timestamp}] [systemd] ${name}.service: Unit entered failed state.`);

    if (name === 'irrigation-controller') {
      this.irrigationTelemetry.pumpingActive = false;
    }

    return true;
  }

  restartService(name: string): { success: boolean; message: string; pid?: number } {
    this.stopService(name);
    return this.startService(name);
  }

  getService(name: string): ServiceDefinition | undefined {
    return this.services.get(name);
  }

  getAllServices(): ServiceDefinition[] {
    return Array.from(this.services.values());
  }

  getJournalLogs(name: string, count = 20): string[] {
    const service = this.services.get(name);
    if (!service) return [`-- No entries found for unit ${name}.service --`];
    return service.logs.slice(-count);
  }

  // ==========================================
  // --- Process & Port Introspection ---
  // ==========================================

  getProcesses(): HostProcess[] {
    const procs: HostProcess[] = [
      {
        pid: 1,
        name: 'systemd',
        command: '/sbin/init systemd',
        status: 'RUNNING',
        cpu: 0.2,
        memoryMb: 12.4,
        startedAt: Date.now() - 3600000,
      },
      {
        pid: 104,
        name: 'systemd-journald',
        command: '/lib/systemd/systemd-journald',
        status: 'RUNNING',
        cpu: 0.1,
        memoryMb: 8.1,
        startedAt: Date.now() - 3600000,
      },
      {
        pid: 218,
        name: 'dockerd',
        command: '/usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock',
        status: 'RUNNING',
        cpu: 0.5,
        memoryMb: 42.6,
        startedAt: Date.now() - 3600000,
      },
    ];

    // Native Services
    for (const s of this.services.values()) {
      if (s.status === 'running' && s.pid) {
        if (s.name === 'helio-relay') {
          procs.push({
            pid: s.pid,
            name: 'nginx: master',
            command: 'nginx: master process /usr/sbin/nginx -g daemon off;',
            status: 'RUNNING',
            cpu: 0.8,
            memoryMb: 24.5,
            startedAt: Date.now() - 60000,
          });
          procs.push({
            pid: s.pid + 1,
            name: 'nginx: worker',
            command: 'nginx: worker process',
            status: 'RUNNING',
            cpu: 1.4,
            memoryMb: 36.2,
            startedAt: Date.now() - 60000,
          });
        } else {
          procs.push({
            pid: s.pid,
            name: s.name,
            command: s.command,
            status: 'RUNNING',
            cpu: s.cpu,
            memoryMb: s.memoryMb,
            startedAt: Date.now() - 60000,
          });
        }
      }
    }

    // Containers running on host
    let containerPid = 2200;
    for (const c of this.containers.values()) {
      if (c.status === 'RUNNING') {
        procs.push({
          pid: containerPid++,
          name: c.name,
          command: c.command,
          status: 'RUNNING',
          cpu: 1.2,
          memoryMb: c.name.includes('db') ? 140 : 85,
          startedAt: c.createdAt,
        });
      }
    }

    return procs;
  }

  getListeningPorts(): HostPort[] {
    const ports: HostPort[] = [];

    // Native Services
    for (const s of this.services.values()) {
      if (s.status === 'running' && s.pid) {
        if (s.name === 'helio-relay') {
          // Nginx listens on both 80 and 443
          ports.push({
            protocol: 'tcp',
            address: '0.0.0.0',
            port: 80,
            status: 'LISTEN',
            processName: 'nginx: master',
            pid: s.pid,
          });
          ports.push({
            protocol: 'tcp',
            address: '0.0.0.0',
            port: 443,
            status: 'LISTEN',
            processName: 'nginx: master',
            pid: s.pid,
          });
        } else {
          ports.push({
            protocol: 'tcp',
            address: '0.0.0.0',
            port: s.port,
            status: 'LISTEN',
            processName: s.name,
            pid: s.pid,
          });
        }
      }
    }

    // Exposed Container Ports (e.g. 4000, 5432)
    for (const c of this.containers.values()) {
      if (c.status === 'RUNNING') {
        for (const mapping of c.portMappings) {
          ports.push({
            protocol: mapping.protocol,
            address: '0.0.0.0',
            port: mapping.hostPort,
            status: 'LISTEN',
            processName: `docker-proxy (${c.name})`,
            pid: 218,
          });
        }
      }
    }

    return ports;
  }

  // ==========================================
  // --- Phase 3: Docker & Images Model ---
  // ==========================================

  pullImage(imageRef: string): { success: boolean; output: string } {
    let normalized = imageRef.trim();
    if (!normalized.includes(':')) {
      if (normalized === 'postgres') normalized = 'postgres:16';
      else if (normalized === 'solar-grove/greenhouse-controller')
        normalized = 'solar-grove/greenhouse-controller:1.0';
    }

    const regImage = this.remoteRegistry.get(normalized);
    if (!regImage) {
      return {
        success: false,
        output: `Error response from daemon: pull access denied for ${imageRef}, repository does not exist or may require 'docker login': denied: requested access to the resource is denied\r\n`,
      };
    }

    const pulled: DockerImage = {
      ...regImage,
      status: 'AVAILABLE',
    };
    this.localImages.set(normalized, pulled);

    const outLines = [
      `1.0: Pulling from ${regImage.repository}`,
      '7b1a20d4f5c2: Pull complete',
      '3c91e4a28be1: Pull complete',
      'd41d8cd98f00: Pull complete',
      `Digest: sha256:${regImage.id}00000000000000000000000000000000000000000000000000`,
      `Status: Downloaded newer image for ${normalized}`,
      `docker.io/${normalized}`,
      '',
    ];

    return { success: true, output: outLines.join('\r\n') };
  }

  getLocalImages(): DockerImage[] {
    return Array.from(this.localImages.values());
  }

  hasLocalImage(imageRef: string): boolean {
    let normalized = imageRef.trim();
    if (!normalized.includes(':')) {
      if (normalized === 'postgres') normalized = 'postgres:16';
      else if (normalized === 'solar-grove/greenhouse-controller')
        normalized = 'solar-grove/greenhouse-controller:1.0';
    }
    return this.localImages.has(normalized);
  }

  // ==========================================
  // --- Phase 3: Docker Containers Model ---
  // ==========================================

  createOrRunContainer(options: {
    image: string;
    name?: string;
    ports?: string[];
    environment?: Record<string, string>;
    network?: string;
  }): { success: boolean; container?: SimulatedContainer; error?: string } {
    let imageRef = options.image.trim();
    if (!imageRef.includes(':')) {
      if (imageRef === 'postgres') imageRef = 'postgres:16';
      else if (imageRef === 'solar-grove/greenhouse-controller')
        imageRef = 'solar-grove/greenhouse-controller:1.0';
    }

    if (!this.localImages.has(imageRef)) {
      return {
        success: false,
        error: `Unable to find image '${imageRef}' locally. Please pull it first using 'docker pull ${imageRef}'.`,
      };
    }

    const name = options.name || `container-${Math.random().toString(36).substring(2, 8)}`;

    // If container already exists with same name, remove it or fail
    const existing = this.findContainer(name);
    if (existing) {
      this.containers.delete(existing.id);
    }

    const id = Math.random().toString(16).substring(2, 14);
    const network = options.network || 'greenhouse-network';
    const env = options.environment || {};

    // Parse port mappings
    const portMappings: { hostPort: number; containerPort: number; protocol: 'tcp' | 'udp' }[] = [];
    let portsStr = '';
    if (options.ports && options.ports.length > 0) {
      for (const p of options.ports) {
        const [host, cont] = p.split(':');
        const hNum = Number.parseInt(host, 10);
        const cNum = Number.parseInt(cont || host, 10);
        portMappings.push({ hostPort: hNum, containerPort: cNum, protocol: 'tcp' });
        portsStr += (portsStr ? ', ' : '') + `0.0.0.0:${hNum}->${cNum}/tcp`;
      }
    } else if (name === 'greenhouse-controller') {
      portMappings.push({ hostPort: 4000, containerPort: 4000, protocol: 'tcp' });
      portsStr = '0.0.0.0:4000->4000/tcp';
    } else if (name === 'greenhouse-db') {
      portMappings.push({ hostPort: 5432, containerPort: 5432, protocol: 'tcp' });
      portsStr = '0.0.0.0:5432->5432/tcp';
    }

    let command = '/bin/sh -c "node server.js"';
    if (imageRef.includes('postgres')) {
      command = 'docker-entrypoint.sh postgres';
    }

    // Health Evaluation based on Environment
    let health: ContainerHealth = 'HEALTHY';
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const logs: string[] = [];

    if (name === 'greenhouse-db' || imageRef.includes('postgres')) {
      health = 'HEALTHY';
      logs.push(`[${timestamp}] [postgres] Initializing PostgreSQL database cluster...`);
      logs.push(
        `[${timestamp}] [postgres] Database system was not properly shut down; automatic recovery in progress`
      );
      logs.push(
        `[${timestamp}] [postgres] Database system is ready to accept connections on port 5432`
      );
      logs.push(
        `[${timestamp}] [postgres] PostgreSQL database "greenhouse" initialized for user "greenhouse".`
      );
    } else if (name === 'greenhouse-controller' || imageRef.includes('greenhouse-controller')) {
      const dbUrl = env.DATABASE_URL || '';
      logs.push(
        `[${timestamp}] [greenhouse-controller] Starting Greenhouse Controller v2.1.0 on port ${env.PORT || 4000}...`
      );
      logs.push(
        `[${timestamp}] [greenhouse-controller] Environment: NODE_ENV=${env.NODE_ENV || 'production'}, PORT=${env.PORT || 4000}`
      );
      logs.push(
        `[${timestamp}] [greenhouse-controller] Connecting to PostgreSQL at greenhouse-db:5432/greenhouse...`
      );

      // Check if DATABASE_URL contains correct credentials
      if (dbUrl.includes('wrong-password') || !dbUrl.includes('greenhouse:greenhouse@')) {
        health = 'UNHEALTHY';
        logs.push(
          `[${timestamp}] [greenhouse-controller] error: password authentication failed for user "greenhouse"`
        );
        logs.push(
          `[${timestamp}] [greenhouse-controller] FATAL: Unable to establish database connection.`
        );
        logs.push(
          `[${timestamp}] [greenhouse-controller] Health check failed: database unreachable. Entering UNHEALTHY state.`
        );
      } else {
        health = 'HEALTHY';
        logs.push(
          `[${timestamp}] [greenhouse-controller] Connected to PostgreSQL (database: greenhouse, pool: 10 connections).`
        );
        logs.push(
          `[${timestamp}] [greenhouse-controller] Tables verified: greenhouse_telemetry, growth_cycles, harvests.`
        );
        logs.push(
          `[${timestamp}] [greenhouse-controller] HTTP server listening on 0.0.0.0:4000 [HEALTHY].`
        );
      }
    }

    const container: SimulatedContainer = {
      id,
      name,
      image: imageRef,
      status: 'RUNNING',
      health,
      ports: portsStr,
      portMappings,
      environment: env,
      network,
      command,
      createdAt: Date.now(),
      logs,
    };

    this.containers.set(id, container);

    // Register with network
    const net = this.networks.get(network);
    if (net && !net.containers.includes(name)) {
      net.containers.push(name);
    }

    return { success: true, container };
  }

  stopContainer(nameOrId: string): boolean {
    const c = this.findContainer(nameOrId);
    if (!c) return false;
    c.status = 'STOPPED';
    c.health = 'UNKNOWN';
    c.logs.push(`[${new Date().toISOString()}] Container stopped gracefully.`);
    return true;
  }

  startContainer(nameOrId: string): boolean {
    const c = this.findContainer(nameOrId);
    if (!c) return false;
    c.status = 'RUNNING';

    // Re-evaluate health
    if (c.name === 'greenhouse-controller') {
      const dbUrl = c.environment.DATABASE_URL || '';
      if (dbUrl.includes('wrong-password') || !dbUrl.includes('greenhouse:greenhouse@')) {
        c.health = 'UNHEALTHY';
      } else {
        c.health = 'HEALTHY';
      }
    } else {
      c.health = 'HEALTHY';
    }

    c.logs.push(`[${new Date().toISOString()}] Container restarted.`);
    return true;
  }

  restartContainer(nameOrId: string): boolean {
    this.stopContainer(nameOrId);
    return this.startContainer(nameOrId);
  }

  findContainer(nameOrId: string): SimulatedContainer | undefined {
    for (const [id, c] of this.containers.entries()) {
      if (id === nameOrId || id.startsWith(nameOrId) || c.name === nameOrId) {
        return c;
      }
    }
    return undefined;
  }

  getAllContainers(): SimulatedContainer[] {
    return Array.from(this.containers.values());
  }

  getContainerLogs(nameOrId: string, count = 25): string[] {
    const c = this.findContainer(nameOrId);
    if (!c) return [`Error: No such container: ${nameOrId}`];
    return c.logs.slice(-count);
  }

  inspectContainer(nameOrId: string): Record<string, unknown> | null {
    const c = this.findContainer(nameOrId);
    if (!c) return null;

    const envList = Object.entries(c.environment).map(([k, v]) => `${k}=${v}`);

    return {
      Id: c.id,
      Created: new Date(c.createdAt).toISOString(),
      Path: c.command,
      Args: [],
      State: {
        Status: c.status.toLowerCase(),
        Running: c.status === 'RUNNING',
        Health: {
          Status: c.health.toLowerCase(),
          FailingStreak: c.health === 'UNHEALTHY' ? 3 : 0,
          Log: [
            {
              Start: new Date(Date.now() - 5000).toISOString(),
              End: new Date(Date.now() - 4000).toISOString(),
              ExitCode: c.health === 'UNHEALTHY' ? 1 : 0,
              Output:
                c.health === 'UNHEALTHY'
                  ? 'FATAL: database authentication failed for user "greenhouse"'
                  : 'HTTP/1.1 200 OK - health probe succeeded',
            },
          ],
        },
      },
      Image: c.image,
      Config: {
        Hostname: c.name,
        Env: envList,
        Cmd: [c.command],
      },
      NetworkSettings: {
        Networks: {
          [c.network]: {
            IPAddress:
              c.name === 'greenhouse-db'
                ? '172.28.0.2'
                : c.name === 'greenhouse-controller'
                  ? '172.28.0.3'
                  : '172.28.0.4',
            Gateway: '172.28.0.1',
          },
        },
        Ports: {
          '4000/tcp': [{ HostIp: '0.0.0.0', HostPort: '4000' }],
        },
      },
    };
  }

  // ==========================================
  // --- Phase 3: Docker Compose Engine ---
  // ==========================================

  composeUp(): { output: string; hasFailure: boolean } {
    // 1. Auto-pull images into local cache if not already pulled
    if (!this.localImages.has('solar-grove/greenhouse-controller:1.0')) {
      const reg = this.remoteRegistry.get('solar-grove/greenhouse-controller:1.0');
      if (reg) this.localImages.set('solar-grove/greenhouse-controller:1.0', { ...reg });
    }
    if (!this.localImages.has('postgres:16')) {
      const reg = this.remoteRegistry.get('postgres:16');
      if (reg) this.localImages.set('postgres:16', { ...reg });
    }

    // 2. Start greenhouse-db
    const dbConfig = this.composeConfig.services['greenhouse-db'];
    this.createOrRunContainer({
      image: dbConfig.image,
      name: 'greenhouse-db',
      ports: dbConfig.ports,
      environment: dbConfig.environment,
      network: dbConfig.network,
    });

    // 3. Start greenhouse-controller
    const cConfig = this.composeConfig.services['greenhouse-controller'];
    const res = this.createOrRunContainer({
      image: cConfig.image,
      name: 'greenhouse-controller',
      ports: cConfig.ports,
      environment: cConfig.environment,
      network: cConfig.network,
    });

    const isUnhealthy = res.container?.health === 'UNHEALTHY';

    const output = [
      '[+] Running 3/3',
      ' ✔ Network greenhouse-network          Created',
      ' ✔ Container greenhouse-db             Started',
      ` ✔ Container greenhouse-controller     Started${isUnhealthy ? ' (unhealthy)' : ''}`,
      '',
    ].join('\r\n');

    return { output, hasFailure: isUnhealthy };
  }

  composeDown(): string {
    this.stopContainer('greenhouse-controller');
    this.stopContainer('greenhouse-db');
    return [
      '[+] Running 3/3',
      ' ✔ Container greenhouse-controller     Removed',
      ' ✔ Container greenhouse-db             Removed',
      ' ✔ Network greenhouse-network          Removed',
      '',
    ].join('\r\n');
  }

  composePs(): string {
    const lines = [
      'NAME                    IMAGE                                  COMMAND                  SERVICE                 STATUS                  PORTS',
    ];

    const cController = this.findContainer('greenhouse-controller');
    if (cController) {
      const statusStr =
        cController.status === 'RUNNING'
          ? `Up 2 minutes (${cController.health.toLowerCase()})`
          : 'Exited';
      lines.push(
        `${cController.name.padEnd(23, ' ')} ${cController.image.padEnd(38, ' ')} "node server.js"         greenhouse-controller   ${statusStr.padEnd(23, ' ')} ${cController.ports}`
      );
    }

    const cDb = this.findContainer('greenhouse-db');
    if (cDb) {
      const statusStr =
        cDb.status === 'RUNNING' ? `Up 2 minutes (${cDb.health.toLowerCase()})` : 'Exited';
      lines.push(
        `${cDb.name.padEnd(23, ' ')} ${cDb.image.padEnd(38, ' ')} "docker-entrypoint.s…"   greenhouse-db           ${statusStr.padEnd(23, ' ')} ${cDb.ports}`
      );
    }

    if (!cController && !cDb) {
      lines.push('(no compose services running in current project)');
    }
    lines.push('');
    return lines.join('\r\n');
  }

  composeLogs(): string {
    const lines: string[] = [];
    const cDb = this.findContainer('greenhouse-db');
    if (cDb) {
      for (const log of cDb.logs.slice(-5)) {
        lines.push(`greenhouse-db-1         | ${log}`);
      }
    }
    const cController = this.findContainer('greenhouse-controller');
    if (cController) {
      for (const log of cController.logs.slice(-5)) {
        lines.push(`greenhouse-controller-1 | ${log}`);
      }
    }
    lines.push('');
    return lines.join('\r\n');
  }

  setGreenhouseDbPassword(password: string) {
    this.composeConfig.services['greenhouse-controller'].environment.DATABASE_URL =
      `postgresql://greenhouse:${password}@greenhouse-db:5432/greenhouse`;

    const c = this.findContainer('greenhouse-controller');
    if (c) {
      c.environment.DATABASE_URL = `postgresql://greenhouse:${password}@greenhouse-db:5432/greenhouse`;
      // Check health
      if (password === 'greenhouse') {
        c.health = 'HEALTHY';
        c.logs.push(
          `[${new Date().toISOString()}] [greenhouse-controller] Connected to PostgreSQL at greenhouse-db:5432/greenhouse (database: greenhouse).`
        );
        c.logs.push(
          `[${new Date().toISOString()}] [greenhouse-controller] HTTP server listening on 0.0.0.0:4000 [HEALTHY].`
        );
      } else {
        c.health = 'UNHEALTHY';
      }
    }
  }

  // ==========================================
  // --- Phase 3: Simulated PostgreSQL Model ---
  // ==========================================

  getPostgresState(): PostgresState {
    return this.postgresState;
  }

  // ==========================================
  // --- Simulated HTTP Dispatcher & Endpoints ---
  // ==========================================

  private handleIrrigationRequest(
    path: string,
    method: string
  ): SimulatedHttpResponse {
    const service = this.services.get('irrigation-controller');
    if (!service || service.status !== 'running') {
      return {
        statusCode: 0,
        statusText: 'ERR_CONNECTION_REFUSED',
        headers: {},
        body: '',
        error: 'ERR_CONNECTION_REFUSED: Could not establish TCP connection to port 8080.',
      };
    }

    // Endpoint: GET /health
    if (path === '/health') {
      const bodyObj = {
        status: 'healthy',
        service: 'irrigation-controller',
        version: '1.4.2',
        pumping: this.irrigationTelemetry.pumpingActive,
        uptimeSec: 412,
      };
      return {
        statusCode: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyObj),
        jsonData: bodyObj,
      };
    }

    // Endpoint: POST /api/irrigation/start
    if (method === 'POST' && (path === '/api/irrigation/start' || path === '/start')) {
      this.irrigationTelemetry.pumpingActive = true;
      this.irrigationTelemetry.soilMoisturePct = Math.min(
        100,
        this.irrigationTelemetry.soilMoisturePct + 15
      );
      const resObj = {
        success: true,
        pumping: true,
        message: 'Aquifer valve opened. Irrigation active across connected zones.',
        telemetry: this.irrigationTelemetry,
      };
      return {
        statusCode: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resObj),
        jsonData: resObj,
      };
    }

    // Endpoint: POST /api/irrigation/stop
    if (method === 'POST' && (path === '/api/irrigation/stop' || path === '/stop')) {
      this.irrigationTelemetry.pumpingActive = false;
      const resObj = {
        success: true,
        pumping: false,
        message: 'Aquifer valve closed. Irrigation stopped.',
        telemetry: this.irrigationTelemetry,
      };
      return {
        statusCode: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resObj),
        jsonData: resObj,
      };
    }

    // Default GET dashboard payload
    const dashboardState = {
      status: 'ONLINE',
      service: 'irrigation-controller',
      version: '1.4.2',
      telemetry: this.irrigationTelemetry,
    };
    return {
      statusCode: 200,
      statusText: 'OK',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dashboardState),
      jsonData: dashboardState,
    };
  }

  private handleGreenhouseRequest(
    path: string,
    method: string
  ): SimulatedHttpResponse {
    // Check if running on Cloud infrastructure (Phase 5)
    if (this.cloudManager.getDeploymentTarget() === 'cloud') {
      const compute = this.cloudManager.getComputeInstance('i-greenhouse-01');
      if (!compute || compute.status !== 'RUNNING') {
        return {
          statusCode: 0,
          statusText: 'ERR_CONNECTION_REFUSED',
          headers: {},
          body: '',
          error: 'ERR_CONNECTION_REFUSED: Could not connect to cloud compute instance at 10.10.1.10:4000.',
        };
      }

      // Check DATABASE_URL misconfiguration (e.g. localhost failure)
      const dbUrl = compute.environment.DATABASE_URL || '';
      if (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1')) {
        const errorPayload = {
          error: 'Bad Gateway',
          statusCode: 502,
          message:
            'Upstream database failure: Unable to establish connection to PostgreSQL at localhost:5432. Connection refused (111: Connection refused). In cloud compute, localhost refers to the local VM/container, not the managed database. Update DATABASE_URL to greenhouse-db.internal.',
          timestamp: new Date().toISOString(),
        };
        return {
          statusCode: 502,
          statusText: 'Bad Gateway',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(errorPayload, null, 2),
          jsonData: errorPayload,
          error: 'HTTP 502 Bad Gateway: Database connection failed (DATABASE_URL references localhost).',
        };
      }

      // Check security group rule reachability
      const reachability = this.cloudManager.evaluateConnectivity('greenhouse-app', 'greenhouse-db', 5432);
      if (!reachability.allowed) {
        const errorPayload = {
          error: 'Bad Gateway',
          statusCode: 502,
          message: `Upstream database failure: Security group blocked TCP 5432 to PostgreSQL at greenhouse-db.internal:5432. Connection timed out. ${reachability.reason}`,
          timestamp: new Date().toISOString(),
        };
        return {
          statusCode: 502,
          statusText: 'Bad Gateway',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(errorPayload, null, 2),
          jsonData: errorPayload,
          error: `HTTP 502 Bad Gateway: Security group blocked TCP 5432 (${reachability.reason})`,
        };
      }

      // Return healthy cloud responses
      if (path === '/health') {
        const healthPayload = {
          status: 'healthy',
          database: 'connected',
          service: 'greenhouse-controller',
          version: '3.0.0-cloud',
          deploymentTarget: 'cloud',
          provider: compute.provider,
          instanceId: compute.id,
        };
        return {
          statusCode: 200,
          statusText: 'OK',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(healthPayload),
          jsonData: healthPayload,
        };
      }

      if (path === '/api/greenhouse/state') {
        const statePayload = {
          status: 'ACTIVE',
          growthOptimization: true,
          temperature: 24.5,
          humidity: 71,
          soilMoisture: 82,
          database: 'CONNECTED',
          controller: 'HEALTHY',
          deploymentTarget: 'cloud',
          provider: compute.provider,
          instanceType: compute.instanceType,
        };
        return {
          statusCode: 200,
          statusText: 'OK',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(statePayload),
          jsonData: statePayload,
        };
      }

      if (path === '/api/greenhouse/telemetry') {
        return {
          statusCode: 200,
          statusText: 'OK',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.postgresState.tables.greenhouse_telemetry),
          jsonData: { telemetry: this.postgresState.tables.greenhouse_telemetry },
        };
      }

      const consoleState = {
        title: 'VERDANT GLASSHOUSE (CLOUD DEPLOYMENT)',
        temperature: '24.5°C',
        humidity: '71%',
        soilMoisture: '82%',
        growthOptimization: 'ACTIVE',
        database: 'CONNECTED',
        controller: 'HEALTHY',
        version: '3.0.0-cloud',
        provider: compute.provider.toUpperCase(),
        instance: compute.id,
      };

      return {
        statusCode: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consoleState, null, 2),
        jsonData: consoleState,
      };
    }

    const ghContainer = this.findContainer('greenhouse-controller');

    // Check if container is running
    if (!ghContainer || ghContainer.status !== 'RUNNING') {
      return {
        statusCode: 0,
        statusText: 'ERR_CONNECTION_REFUSED',
        headers: {},
        body: '',
        error: 'ERR_CONNECTION_REFUSED: Could not connect to greenhouse-controller:4000.',
      };
    }

    // Check if container is UNHEALTHY (Failure Scenario - Section 19 & 32)
    if (ghContainer.health === 'UNHEALTHY') {
      const errorPayload = {
        error: 'Bad Gateway',
        statusCode: 502,
        message:
          'Upstream database failure: Unable to establish connection to PostgreSQL at greenhouse-db:5432. Authentication failed for user "greenhouse".',
        timestamp: new Date().toISOString(),
      };
      return {
        statusCode: 502,
        statusText: 'Bad Gateway',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorPayload, null, 2),
        jsonData: errorPayload,
        error: 'HTTP 502 Bad Gateway: Upstream service failure (PostgreSQL connection error).',
      };
    }

    // Healthy Container Endpoints (Section 17)
    if (path === '/health') {
      const healthPayload = {
        status: 'healthy',
        database: 'connected',
        service: 'greenhouse-controller',
        version: '2.1.0',
      };
      return {
        statusCode: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(healthPayload),
        jsonData: healthPayload,
      };
    }

    if (path === '/api/greenhouse/state') {
      const statePayload = {
        status: 'ACTIVE',
        growthOptimization: true,
        temperature: 24.5,
        humidity: 71,
        soilMoisture: 82,
        database: 'CONNECTED',
        controller: 'HEALTHY',
      };
      return {
        statusCode: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(statePayload),
        jsonData: statePayload,
      };
    }

    if (path === '/api/greenhouse/telemetry') {
      return {
        statusCode: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.postgresState.tables.greenhouse_telemetry),
        jsonData: { telemetry: this.postgresState.tables.greenhouse_telemetry },
      };
    }

    // Default Web Console Dashboard Payload
    const consoleState = {
      title: 'VERDANT GLASSHOUSE',
      temperature: '24.5°C',
      humidity: '71%',
      soilMoisture: '82%',
      growthOptimization: 'ACTIVE',
      database: 'CONNECTED',
      controller: 'HEALTHY',
      version: '2.1.0',
    };

    return {
      statusCode: 200,
      statusText: 'OK',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(consoleState, null, 2),
      jsonData: consoleState,
    };
  }

  dispatchHttp(
    url: string,
    options: { method?: 'GET' | 'POST'; body?: unknown } = {}
  ): SimulatedHttpResponse {
    const method = options.method || 'GET';

    // Parse URL & Protocol
    const trimmed = url.trim();
    const isHttps = trimmed.startsWith('https://');
    const cleanUrl = trimmed.replace(/^https?:\/\//, '');
    const [hostAndPort, ...pathParts] = cleanUrl.split('/');
    const path = `/${pathParts.join('/')}`.split('?')[0] || '/';
    const [host, portStr] = hostAndPort.split(':');
    const port = portStr ? Number.parseInt(portStr, 10) : isHttps ? 443 : 80;

    // 1. Check DNS resolution for edge gateway (Phase 4)
    const resolvedIp = this.resolveDns(host);
    const isRelayDomain =
      resolvedIp === '10.0.0.10' ||
      host.endsWith('.solar-grove.local') ||
      host === '10.0.0.10';

    if (isRelayDomain) {
      const relaySvc = this.services.get('helio-relay');
      if (!relaySvc || relaySvc.status !== 'running') {
        return {
          statusCode: 0,
          statusText: 'ERR_CONNECTION_REFUSED',
          headers: {},
          body: '',
          error: `ERR_CONNECTION_REFUSED: Could not establish TCP connection to edge relay ${resolvedIp || host} on port ${port}.`,
        };
      }

      // HTTP to HTTPS 301 Redirect (Section 12 & 23)
      if (!isHttps && port === 80) {
        return {
          statusCode: 301,
          statusText: 'Moved Permanently',
          headers: {
            Location: `https://${host}${path}`,
            Server: 'nginx/1.24.0',
            'Content-Type': 'text/html',
          },
          body: `<html><head><title>301 Moved Permanently</title></head><body><center><h1>301 Moved Permanently</h1></center><hr><center>nginx/1.24.0</center></body></html>`,
        };
      }

      // HTTPS Traffic on 443
      if (isHttps || port === 443) {
        // Step A: TLS Certificate Verification
        const cert = this.getMatchingCertificate(host);
        if (!cert || cert.status !== 'VALID') {
          return {
            statusCode: 495,
            statusText: 'SSL Certificate Error',
            headers: {
              Server: 'nginx/1.24.0',
            },
            body: `NET::ERR_CERT_COMMON_NAME_INVALID: SSL certificate missing or untrusted for domain ${host}`,
            error: 'NET::ERR_CERT_COMMON_NAME_INVALID',
          };
        }

        // Step B: Reverse Proxy Routing Table Lookup
        const route = this.findMatchingRoute(host);
        if (!route || !route.enabled) {
          return {
            statusCode: 404,
            statusText: 'Not Found',
            headers: { Server: 'nginx/1.24.0', 'Content-Type': 'text/html' },
            body: `<html><head><title>404 Not Found</title></head><body><center><h1>404 Not Found</h1><p>No reverse proxy route defined for ${host}.</p></center><hr><center>nginx/1.24.0</center></body></html>`,
            error: `404 Not Found: No matching proxy route configured for ${host}.`,
          };
        }

        // Check Upstream Target
        if (route.upstreamHost === 'greenhouse-app') {
          // Failure Scenario 1: Bad Upstream Misconfiguration (Section 23)
          const errorLog = `[error] 1422#1422: *1 connect() failed (111: Connection refused) while connecting to upstream, client: 10.0.0.2, server: ${host}, request: "${method} ${path} HTTP/1.1", upstream: "http://greenhouse-app:${route.upstreamPort}${path}", host: "${host}"`;
          relaySvc.logs.push(errorLog);
          if (relaySvc.logs.length > 50) relaySvc.logs.shift();

          const badGatewayPayload = {
            error: 'Bad Gateway',
            statusCode: 502,
            message: `connect() failed (111: Connection refused) while connecting to upstream http://greenhouse-app:${route.upstreamPort}`,
            server: 'nginx/1.24.0',
            timestamp: new Date().toISOString(),
          };

          return {
            statusCode: 502,
            statusText: 'Bad Gateway',
            headers: {
              Server: 'nginx/1.24.0',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(badGatewayPayload, null, 2),
            jsonData: badGatewayPayload,
            error: 'HTTP 502 Bad Gateway: Upstream connection refused (upstream greenhouse-app:4000).',
          };
        }

        // Route to Greenhouse Controller Container or Cloud Compute
        if (
          route.upstreamHost === 'greenhouse-controller' ||
          route.upstreamHost === '10.0.0.20' ||
          route.upstreamHost === '10.10.1.10' ||
          route.upstreamHost === 'greenhouse-compute'
        ) {
          const res = this.handleGreenhouseRequest(path, method);
          res.headers = { ...res.headers, Server: 'nginx/1.24.0' };
          return res;
        }

        // Route to Irrigation Controller
        if (
          route.upstreamHost === 'irrigation-controller' ||
          route.upstreamHost === '10.0.0.30' ||
          route.upstreamHost === 'irrigation.local'
        ) {
          const res = this.handleIrrigationRequest(path, method);
          res.headers = { ...res.headers, Server: 'nginx/1.24.0' };
          return res;
        }
      }
    }

    // 2. Direct Private Internal Resolution (Phase 2 & Phase 3 Backward Compatibility)
    const isDirectIrrigation =
      (host === 'irrigation.local' || host === 'localhost' || host === '127.0.0.1' || host === '10.0.0.30') &&
      (port === 8080 || port === 80);
    if (isDirectIrrigation) {
      return this.handleIrrigationRequest(path, method);
    }

    const isDirectGreenhouse =
      (host === 'greenhouse.local' || host === '10.0.0.20') &&
      (port === 4000 || port === 80);
    if (isDirectGreenhouse) {
      return this.handleGreenhouseRequest(path, method);
    }

    // Unresolved Domain
    return {
      statusCode: 404,
      statusText: 'Not Found',
      headers: {},
      body: '404 Not Found: Could not resolve hostname.',
      error: 'ERR_NAME_NOT_RESOLVED',
    };
  }

  // ==========================================
  // --- Phase 4: Network, DNS, Proxy & TLS Accessors ---
  // ==========================================

  getHosts(): NetworkHost[] {
    return Array.from(this.hosts.values());
  }

  getHost(ipOrName: string): NetworkHost | undefined {
    for (const h of this.hosts.values()) {
      if (h.ip === ipOrName || h.hostname === ipOrName) return h;
    }
    return undefined;
  }

  getDnsRecords(): DnsRecord[] {
    return Array.from(this.dnsRecords.values());
  }

  resolveDns(domain: string): string | undefined {
    const record = this.dnsRecords.get(domain);
    if (record) return record.value;
    // Check wildcard match
    for (const [key, r] of this.dnsRecords.entries()) {
      if (key.startsWith('*.') && domain.endsWith(key.slice(2))) {
        return r.value;
      }
    }
    return undefined;
  }

  addDnsRecord(record: DnsRecord): void {
    this.dnsRecords.set(record.hostname, record);
  }

  getProxyRoutes(): ProxyRoute[] {
    return Array.from(this.proxyRoutes.values());
  }

  getProxyRoute(id: string): ProxyRoute | undefined {
    return this.proxyRoutes.get(id);
  }

  findMatchingRoute(hostname: string): ProxyRoute | undefined {
    for (const r of this.proxyRoutes.values()) {
      if (r.hostname === hostname) return r;
    }
    return undefined;
  }

  updateProxyRoute(id: string, updates: Partial<ProxyRoute>): boolean {
    const route = this.proxyRoutes.get(id);
    if (!route) return false;
    Object.assign(route, updates);

    const relaySvc = this.services.get('helio-relay');
    if (relaySvc && relaySvc.status === 'running') {
      const ts = new Date().toISOString().replace('T', ' ').substring(0, 19);
      relaySvc.logs.push(
        `[${ts}] [nginx] Reloaded configuration for upstream ${route.upstreamHost}:${route.upstreamPort}`
      );
    }
    return true;
  }

  addProxyRoute(route: Omit<ProxyRoute, 'id'> & { id?: string }): ProxyRoute {
    const id = route.id || `route-${route.hostname.replace(/[^a-z0-9]/gi, '-')}`;
    const newRoute: ProxyRoute = {
      ...route,
      id,
      enabled: route.enabled !== undefined ? route.enabled : true,
    };
    this.proxyRoutes.set(id, newRoute);

    const relaySvc = this.services.get('helio-relay');
    if (relaySvc && relaySvc.status === 'running') {
      const ts = new Date().toISOString().replace('T', ' ').substring(0, 19);
      relaySvc.logs.push(
        `[${ts}] [nginx] Added proxy route: ${newRoute.hostname} -> http://${newRoute.upstreamHost}:${newRoute.upstreamPort}`
      );
    }
    return newRoute;
  }

  getReverseProxyState(): ReverseProxyState {
    const relaySvc = this.services.get('helio-relay');
    const isRunning = relaySvc?.status === 'running';
    const hasBadUpstream = Array.from(this.proxyRoutes.values()).some(
      (r) => r.upstreamHost === 'greenhouse-app'
    );

    return {
      serviceName: 'helio-relay',
      status: isRunning ? 'RUNNING' : 'STOPPED',
      listeners: [80, 443],
      routes: Array.from(this.proxyRoutes.values()),
      httpRedirectHttps: true,
      activeConnections: isRunning ? 4 : 0,
      requestsPerSecond: isRunning ? 18.2 : 0,
      tlsTerminatedRequests: isRunning ? 920 : 0,
      upstreamFailures: hasBadUpstream ? 1 : 0,
    };
  }

  testNginxConfig(): { valid: boolean; output: string } {
    for (const r of this.proxyRoutes.values()) {
      if (!r.hostname || !r.upstreamHost || r.upstreamPort <= 0 || r.upstreamPort > 65535) {
        return {
          valid: false,
          output: `nginx: [emerg] invalid upstream specification in /etc/nginx/sites-enabled/${r.hostname}.conf\nnginx: configuration file /etc/nginx/nginx.conf test failed`,
        };
      }
    }
    return {
      valid: true,
      output: `nginx: the configuration file /etc/nginx/nginx.conf syntax is ok\nnginx: configuration file /etc/nginx/nginx.conf test is successful`,
    };
  }

  getCertificates(): TlsCertificate[] {
    return Array.from(this.tlsCertificates.values());
  }

  getCertificate(idOrDomain: string): TlsCertificate | undefined {
    for (const c of this.tlsCertificates.values()) {
      if (c.id === idOrDomain || c.domain === idOrDomain) return c;
    }
    return undefined;
  }

  getMatchingCertificate(domain: string): TlsCertificate | undefined {
    if (this.tlsCertificates.has(domain)) {
      return this.tlsCertificates.get(domain);
    }
    for (const cert of this.tlsCertificates.values()) {
      if (cert.domain.startsWith('*.')) {
        const root = cert.domain.slice(2);
        if (domain.endsWith(root)) {
          return cert;
        }
      }
    }
    return undefined;
  }

  requestCertificate(domain = '*.solar-grove.local'): {
    success: boolean;
    certificate: TlsCertificate;
    logs: string[];
  } {
    const certDomain = domain.startsWith('*.') ? domain : `*.solar-grove.local`;
    const certId = 'cert-solar-grove';
    const now = new Date();
    const expiry = new Date(Date.now() + 90 * 86400000);

    const certificate: TlsCertificate = {
      id: certId,
      domain: certDomain,
      issuer: "Let's Encrypt Authority X3 (ACME v2)",
      status: 'VALID',
      valid: true,
      issuedAt: now.toISOString().split('T')[0],
      expiresAt: expiry.toISOString().split('T')[0],
      fingerprint: 'SHA256:7B:44:91:DE:3C:8A:F1:69:02:11:88:AC:2B:90:5E:FE:09:A1:3D:88',
      keyType: 'RSA 2048',
      autoRenew: true,
    };

    this.tlsCertificates.set(certId, certificate);

    const relaySvc = this.services.get('helio-relay');
    if (relaySvc) {
      const ts = now.toISOString().replace('T', ' ').substring(0, 19);
      relaySvc.logs.push(`[${ts}] [certbot] ACME challenge verified for ${domain}`);
      relaySvc.logs.push(
        `[${ts}] [certbot] Certificate issued: /etc/letsencrypt/live/solar-grove.local/fullchain.pem`
      );
      relaySvc.logs.push(`[${ts}] [nginx] Reloaded configuration with updated TLS certificate`);
    }

    const logs = [
      `Saving debug log to /var/log/letsencrypt/letsencrypt.log`,
      `Requesting a certificate for ${domain}`,
      `Performing the following challenges:`,
      `http-01 challenge for ${domain}`,
      `Using default addresses 10.0.0.10:80`,
      `Waiting for verification...`,
      `Cleaning up challenges`,
      `Subscribe to the EFF mailing list (optional)`,
      `Successfully received certificate.`,
      `Certificate is saved at: /etc/letsencrypt/live/solar-grove.local/fullchain.pem`,
      `Key is saved at:         /etc/letsencrypt/live/solar-grove.local/privkey.pem`,
      `This certificate expires in 90 days.`,
    ];

    return { success: true, certificate, logs };
  }

  installCertificate(id: string): boolean {
    const cert = this.tlsCertificates.get(id);
    if (!cert) return false;
    cert.status = 'VALID';
    return true;
  }

  setCertificateStatus(id: string, status: CertificateStatus): void {
    const cert = this.tlsCertificates.get(id);
    if (cert) {
      cert.status = status;
    }
  }

  // ==========================================
  // --- Farm & Telemetry Accessors ---
  // ==========================================

  getIrrigationTelemetry(): IrrigationTelemetry {
    return this.irrigationTelemetry;
  }

  isIrrigationActivelyPumping(): boolean {
    const svc = this.services.get('irrigation-controller');
    return svc?.status === 'running' && this.irrigationTelemetry.pumpingActive;
  }

  setIrrigationActive(active: boolean) {
    this.irrigationTelemetry.pumpingActive = active;
  }

  isGreenhouseOptimized(): boolean {
    if (this.cloudManager.getDeploymentTarget() === 'cloud') {
      const compute = this.cloudManager.getComputeInstance('i-greenhouse-01');
      if (!compute || compute.status !== 'RUNNING') return false;
      const dbUrl = compute.environment.DATABASE_URL || '';
      if (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1')) return false;
      const reachability = this.cloudManager.evaluateConnectivity('greenhouse-app', 'greenhouse-db', 5432);
      return reachability.allowed;
    }
    const c = this.findContainer('greenhouse-controller');
    return c?.status === 'RUNNING' && c.health === 'HEALTHY';
  }

  getNetworks(): DockerNetwork[] {
    return Array.from(this.networks.values());
  }

  getNetwork(nameOrId: string): DockerNetwork | undefined {
    for (const [name, net] of this.networks.entries()) {
      if (name === nameOrId || net.id === nameOrId) return net;
    }
    return undefined;
  }

  // ==========================================
  // --- Phase 5: Cloud Architecture Facade ---
  // ==========================================

  getCloudManager(): CloudManager {
    return this.cloudManager;
  }

  getActiveCloudProvider(): CloudProvider {
    return this.cloudManager.getActiveProvider();
  }

  setActiveCloudProvider(provider: CloudProvider): void {
    this.cloudManager.setActiveProvider(provider);
  }

  getDeploymentTarget(): DeploymentTarget {
    return this.cloudManager.getDeploymentTarget();
  }

  setDeploymentTarget(target: DeploymentTarget): void {
    this.cloudManager.setDeploymentTarget(target);
    if (target === 'cloud') {
      const route = this.findMatchingRoute('greenhouse.solar-grove.local');
      if (route) {
        route.upstreamHost = '10.10.1.10';
        route.upstreamPort = 4000;
      }
    }
  }

  getCloudAccounts(): CloudAccount[] {
    return this.cloudManager.getAccounts();
  }

  getCloudVpcs(): CloudVpc[] {
    return this.cloudManager.getVpcs();
  }

  getCloudSubnets(): CloudSubnet[] {
    return this.cloudManager.getSubnets();
  }

  getCloudComputeInstances(): CloudComputeInstance[] {
    return this.cloudManager.getComputeInstances();
  }

  getCloudComputeInstance(id: string): CloudComputeInstance | undefined {
    return this.cloudManager.getComputeInstance(id);
  }

  getCloudDatabases(): ManagedDatabaseInstance[] {
    return this.cloudManager.getManagedDatabases();
  }

  getCloudBuckets(): ObjectStorageBucket[] {
    return this.cloudManager.getBuckets();
  }

  getNetworkRules(): NetworkRule[] {
    return this.cloudManager.getNetworkRules();
  }

  getCloudMigrationProgress(): CloudMigrationProgress {
    return this.cloudManager.getMigrationProgress();
  }

  startCloudMigration(): { success: boolean; message: string } {
    return this.cloudManager.startMigration();
  }

  executeCloudMigrationStep(options: { forceLocalhostError?: boolean } = {}) {
    const res = this.cloudManager.executeMigrationStep(options);
    if (res.phase === 'COMPLETE') {
      const route = this.findMatchingRoute('greenhouse.solar-grove.local');
      if (route) {
        route.upstreamHost = '10.10.1.10';
        route.upstreamPort = 4000;
      }
    }
    return res;
  }

  setCloudRuleEnabled(ruleId: string, enabled: boolean): boolean {
    return this.cloudManager.setRuleEnabled(ruleId, enabled);
  }

  archiveTelemetryToCloudStorage(): ObjectStorageObject {
    return this.cloudManager.archiveTelemetry(this.postgresState.tables.greenhouse_telemetry);
  }

  getCloudCostSummary(): CloudCostSummary {
    return this.cloudManager.calculateCosts();
  }
}

