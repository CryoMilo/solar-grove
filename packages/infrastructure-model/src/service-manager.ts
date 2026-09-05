export interface ServiceDefinition {
  name: string;
  description: string;
  command: string;
  port: number;
  runtime: 'node' | 'python' | 'nginx' | 'binary';
  status: 'running' | 'stopped' | 'failed';
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

export class ServiceManager {
  private services: Map<string, ServiceDefinition> = new Map();
  private containers: Map<string, ContainerDefinition> = new Map();
  private nextPid = 1040;

  constructor() {
    this.initDefaultServices();
  }

  private initDefaultServices() {
    // Service for Helio Pump
    this.services.set('irrigation-controller', {
      name: 'irrigation-controller',
      description: 'Helio Irrigation Array Controller Service',
      command: '/usr/local/bin/node /opt/solargrove/irrigation/index.js',
      port: 3000,
      runtime: 'node',
      status: 'stopped',
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
      command: 'docker run -p 8080:8080 solar-grove/greenhouse-controller:v1.2',
      port: 8080,
      runtime: 'node',
      status: 'stopped',
      cpu: 0,
      memoryMb: 0,
      logs: [
        'greenhouse-api.service - Verdant Glasshouse Controller',
        'Loaded: loaded (/etc/systemd/system/greenhouse-api.service; disabled)',
        'Active: inactive (dead)',
      ],
    });
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
    service.pid = this.nextPid++;
    service.cpu = Math.round(3 + Math.random() * 4);
    service.memoryMb = Math.round(75 + Math.random() * 20);

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    service.logs.push(`[${timestamp}] [systemd] Started ${service.description}.`);
    service.logs.push(`[${timestamp}] [${service.name}] Server listening on port ${service.port}`);
    service.logs.push(
      `[${timestamp}] [${service.name}] Telemetry connected. Irrigation flow synchronized.`
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
    service.pid = undefined;
    service.cpu = 0;
    service.memoryMb = 0;

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    service.logs.push(`[${timestamp}] [systemd] Stopping ${service.description}...`);
    service.logs.push(`[${timestamp}] [systemd] Stopped ${service.description}.`);

    return { success: true, message: `Stopped ${name}.service.` };
  }

  simulateCrash(name: string, reason = 'SIGTERM exit-code 143'): boolean {
    const service = this.services.get(name);
    if (!service || service.status !== 'running') return false;

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    service.status = 'failed';
    service.pid = undefined;
    service.cpu = 0;
    service.memoryMb = 0;

    service.logs.push(
      `[${timestamp}] [systemd] ${name}.service: Main process crashed! Reason: ${reason}`
    );
    service.logs.push(
      `[${timestamp}] [${name}] Error: EADDRINUSE: Address already in use :::${service.port}`
    );
    service.logs.push(
      `[${timestamp}] [${name}]     at Server.setupListenHandle (node:net:1872:16)`
    );
    service.logs.push(`[${timestamp}] [${name}]     at Server.listen (node:net:2008:7)`);
    service.logs.push(`[${timestamp}] [systemd] ${name}.service: Failed with result 'exit-code'.`);
    service.logs.push(`[${timestamp}] [systemd] ${name}.service: Unit entered failed state.`);

    return true;
  }

  getJournalLogs(name: string, count = 20): string[] {
    const service = this.services.get(name);
    if (!service) return [`-- No entries found for unit ${name}.service --`];
    return service.logs.slice(-count);
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
