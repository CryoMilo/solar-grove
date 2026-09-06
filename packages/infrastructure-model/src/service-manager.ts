import type {
  HostPort,
  HostProcess,
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

export interface ContainerDefinition {
  id: string;
  name: string;
  image: string;
  status: 'running' | 'exited';
  ports: string;
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
  private containers: Map<string, ContainerDefinition> = new Map();
  private nextPid = 1421;
  private irrigationTelemetry: IrrigationTelemetry = {
    pumpingActive: false,
    reservoirPct: 78,
    soilMoisturePct: 43,
    activeZones: 2,
    maxZones: 5,
    litersPerMinute: 12.5,
  };

  constructor() {
    this.initDefaultServices();
  }

  private initDefaultServices() {
    // Irrigation Controller for Helio Irrigation Station
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

    // Service for Verdant Glasshouse
    this.services.set('greenhouse-api', {
      name: 'greenhouse-api',
      description: 'Verdant Glasshouse Microclimate & Growth Engine',
      command: 'docker run -p 4000:4000 solar-grove/greenhouse-controller:v2.1',
      port: 4000,
      runtime: 'node',
      status: 'stopped',
      deploymentStatus: 'NOT_DEPLOYED',
      cpu: 0,
      memoryMb: 0,
      logs: [
        'greenhouse-api.service - Verdant Glasshouse Controller',
        'Loaded: loaded (/etc/systemd/system/greenhouse-api.service; disabled)',
        'Active: inactive (dead)',
      ],
    });
  }

  // --- Deployment Lifecycle ---
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

  // --- Process & Port Introspection ---
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
    ];

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

    return procs;
  }

  getListeningPorts(): HostPort[] {
    const ports: HostPort[] = [];
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
    return ports;
  }

  // --- Simulated HTTP Dispatcher ---
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

    // Check irrigation controller
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

    // Check greenhouse controller
    if (isGreenhouseHost && (port === 4000 || port === 80)) {
      const ghService = this.services.get('greenhouse-api');
      if (!ghService || ghService.status !== 'running') {
        return {
          statusCode: 0,
          statusText: 'ERR_CONNECTION_REFUSED',
          headers: {},
          body: '',
          error: 'ERR_CONNECTION_REFUSED: Could not connect to greenhouse.local:4000.',
        };
      }
      return {
        statusCode: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' },
        body: '{"status":"active","service":"greenhouse-api","version":"2.1.0"}',
        jsonData: { status: 'active', service: 'greenhouse-api' },
      };
    }

    // Unresolved
    return {
      statusCode: 404,
      statusText: 'Not Found',
      headers: {},
      body: '404 Not Found: Could not resolve hostname.',
      error: 'ERR_NAME_NOT_RESOLVED',
    };
  }

  // --- Farm & Telemetry Accessors ---
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

  // Containers
  runContainer(image: string, name: string, portMapping: string): ContainerDefinition {
    const id = Math.random().toString(16).substring(2, 14);
    const container: ContainerDefinition = {
      id,
      name,
      image,
      status: 'running',
      ports: portMapping,
      logs: [
        `Container ${id} spawned from image ${image}`,
        `Environment configured. Listening on ${portMapping}`,
        'Ready to process farm telemetry.',
      ],
    };
    this.containers.set(id, container);
    return container;
  }

  stopContainer(idOrName: string): boolean {
    for (const [id, container] of this.containers.entries()) {
      if (id === idOrName || container.name === idOrName) {
        container.status = 'exited';
        return true;
      }
    }
    return false;
  }

  getAllContainers(): ContainerDefinition[] {
    return Array.from(this.containers.values());
  }
}
