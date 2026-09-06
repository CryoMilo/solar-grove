import type {
  ContainerHealth,
  ContainerStatus,
  DockerImage,
  DockerNetwork,
  HostPort,
  HostProcess,
  PostgresState,
  PostgresTelemetryRecord,
  SimulatedContainer,
  SimulatedHttpResponse,
  SoftwareDeploymentStatus,
} from '@solar-grove/game-types';

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
    service.logs.push(`[${timestamp}] [${service.name}] Server listening on port ${service.port}`);
    service.logs.push(
      `[${timestamp}] [${service.name}] Aquifer telemetry linked. Pressure normal at 4.2 bar.`
    );

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
  // --- Simulated HTTP Dispatcher ---
  // ==========================================

  dispatchHttp(
    url: string,
    options: { method?: 'GET' | 'POST'; body?: unknown } = {}
  ): SimulatedHttpResponse {
    const method = options.method || 'GET';

    // Parse URL
    const cleanUrl = url.trim().replace(/^https?:\/\//, '');
    const [hostAndPort, ...pathParts] = cleanUrl.split('/');
    const path = `/${pathParts.join('/')}`.split('?')[0];
    const [host, portStr] = hostAndPort.split(':');
    const port = portStr ? Number.parseInt(portStr, 10) : 80;

    const isIrrigationHost =
      host === 'irrigation.local' || host === 'localhost' || host === '127.0.0.1';
    const isGreenhouseHost = host === 'greenhouse.local';

    // 1. Check irrigation controller (Phase 2)
    if (isIrrigationHost && (port === 8080 || port === 80)) {
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

    // 2. Check greenhouse controller (Phase 3)
    if (isGreenhouseHost && (port === 4000 || port === 80)) {
      const ghContainer = this.findContainer('greenhouse-controller');

      // Check if container is running
      if (!ghContainer || ghContainer.status !== 'RUNNING') {
        return {
          statusCode: 0,
          statusText: 'ERR_CONNECTION_REFUSED',
          headers: {},
          body: '',
          error: 'ERR_CONNECTION_REFUSED: Could not connect to greenhouse.local:4000.',
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

      // Default Web Console Dashboard Payload (Section 16)
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
}
