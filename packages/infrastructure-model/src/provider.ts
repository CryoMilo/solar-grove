import type { ComputeInstance, InfrastructureMetrics } from '@solar-grove/game-types';

export interface ComputeProvider {
  name: string;
  createInstance(config: Partial<ComputeInstance>): Promise<ComputeInstance>;
  stopInstance(id: string): Promise<void>;
  startInstance(id: string): Promise<void>;
  restartInstance(id: string): Promise<void>;
  getInstance(id: string): ComputeInstance | undefined;
  listInstances(): ComputeInstance[];
  getMetrics(id: string): InfrastructureMetrics;
}

export class SimulatedLocalProvider implements ComputeProvider {
  readonly name = 'Local Linux Server';
  private instances: Map<string, ComputeInstance> = new Map();

  constructor() {
    // Default local machine instance
    const localHost: ComputeInstance = {
      id: 'inst-local-01',
      provider: 'local',
      name: 'solargrove-node-01',
      region: 'local-farm',
      instanceType: 'bare-metal',
      status: 'running',
      ipAddress: '127.0.0.1',
      costGoldPerDay: 0,
      cpuCores: 4,
      memoryGb: 8,
      diskGb: 64,
      diskUsagePercent: 28,
      uptimeSeconds: 3600,
    };
    this.instances.set(localHost.id, localHost);
  }

  async createInstance(config: Partial<ComputeInstance>): Promise<ComputeInstance> {
    const id = `inst-local-${Date.now().toString(36)}`;
    const instance: ComputeInstance = {
      id,
      provider: 'local',
      name: config.name || `local-node-${this.instances.size + 1}`,
      region: 'local-farm',
      instanceType: 'bare-metal',
      status: 'running',
      ipAddress: `192.168.1.${10 + this.instances.size}`,
      costGoldPerDay: 2,
      cpuCores: 2,
      memoryGb: 4,
      diskGb: 32,
      diskUsagePercent: 15,
      uptimeSeconds: 0,
      ...config,
    };
    this.instances.set(id, instance);
    return instance;
  }

  async stopInstance(id: string): Promise<void> {
    const inst = this.instances.get(id);
    if (inst) inst.status = 'stopped';
  }

  async startInstance(id: string): Promise<void> {
    const inst = this.instances.get(id);
    if (inst) inst.status = 'running';
  }

  async restartInstance(id: string): Promise<void> {
    await this.stopInstance(id);
    await this.startInstance(id);
  }

  getInstance(id: string): ComputeInstance | undefined {
    return this.instances.get(id);
  }

  listInstances(): ComputeInstance[] {
    return Array.from(this.instances.values());
  }

  getMetrics(id: string): InfrastructureMetrics {
    const inst = this.instances.get(id);
    if (!inst || inst.status !== 'running') {
      return {
        cpuUsagePercent: 0,
        memoryUsagePercent: 0,
        diskUsagePercent: inst?.diskUsagePercent || 0,
        networkLatencyMs: 0,
        errorRatePerMinute: 0,
        uptimePercent: 0,
      };
    }
    return {
      cpuUsagePercent: Math.round(15 + Math.random() * 10),
      memoryUsagePercent: Math.round(35 + Math.random() * 5),
      diskUsagePercent: inst.diskUsagePercent,
      networkLatencyMs: 1 + Math.round(Math.random() * 2),
      errorRatePerMinute: 0,
      uptimePercent: 99.98,
    };
  }
}

export class SimulatedAwsProvider implements ComputeProvider {
  readonly name = 'Amazon Web Services';
  private instances: Map<string, ComputeInstance> = new Map();

  constructor() {
    const ec2Demo: ComputeInstance = {
      id: 'i-0a8bf8c991b3e817',
      provider: 'aws',
      name: 'verdant-cluster-ec2',
      region: 'ap-southeast-1',
      instanceType: 't3.micro',
      status: 'stopped',
      ipAddress: '13.250.41.82',
      costGoldPerDay: 5,
      cpuCores: 2,
      memoryGb: 1,
      diskGb: 20,
      diskUsagePercent: 42,
      uptimeSeconds: 0,
    };
    this.instances.set(ec2Demo.id, ec2Demo);
  }

  async createInstance(config: Partial<ComputeInstance>): Promise<ComputeInstance> {
    const id = `i-${Math.random().toString(16).substring(2, 18)}`;
    const instance: ComputeInstance = {
      id,
      provider: 'aws',
      name: config.name || 'aws-ec2-workload',
      region: config.region || 'ap-southeast-1',
      instanceType: config.instanceType || 't3.micro',
      status: 'running',
      ipAddress: `13.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      costGoldPerDay: 8,
      cpuCores: 2,
      memoryGb: 1,
      diskGb: 30,
      diskUsagePercent: 20,
      uptimeSeconds: 0,
      ...config,
    };
    this.instances.set(id, instance);
    return instance;
  }

  async stopInstance(id: string): Promise<void> {
    const inst = this.instances.get(id);
    if (inst) inst.status = 'stopped';
  }

  async startInstance(id: string): Promise<void> {
    const inst = this.instances.get(id);
    if (inst) inst.status = 'running';
  }

  async restartInstance(id: string): Promise<void> {
    await this.stopInstance(id);
    await this.startInstance(id);
  }

  getInstance(id: string): ComputeInstance | undefined {
    return this.instances.get(id);
  }

  listInstances(): ComputeInstance[] {
    return Array.from(this.instances.values());
  }

  getMetrics(id: string): InfrastructureMetrics {
    const inst = this.instances.get(id);
    if (!inst || inst.status !== 'running') {
      return {
        cpuUsagePercent: 0,
        memoryUsagePercent: 0,
        diskUsagePercent: inst?.diskUsagePercent || 0,
        networkLatencyMs: 0,
        errorRatePerMinute: 0,
        uptimePercent: 0,
      };
    }
    return {
      cpuUsagePercent: Math.round(25 + Math.random() * 15),
      memoryUsagePercent: Math.round(52 + Math.random() * 8),
      diskUsagePercent: inst.diskUsagePercent,
      networkLatencyMs: 24 + Math.round(Math.random() * 6),
      errorRatePerMinute: 0,
      uptimePercent: 99.95,
    };
  }
}
