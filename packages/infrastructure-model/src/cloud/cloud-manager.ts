import type {
  CloudAccount,
  CloudComputeInstance,
  CloudMigrationProgress,
  CloudProvider,
  CloudSubnet,
  CloudVpc,
  DeploymentTarget,
  ManagedDatabaseInstance,
  NetworkRule,
  ObjectStorageBucket,
  ObjectStorageObject,
  PostgresTelemetryRecord,
} from '@solar-grove/game-types';

export interface ConnectivityResult {
  allowed: boolean;
  matchedRule?: NetworkRule;
  reason: string;
}

export interface CloudCostSummary {
  hourlyCostGold: number;
  dailyCostGold: number;
  breakdown: {
    compute: number;
    database: number;
    storage: number;
  };
}

export class CloudManager {
  private activeProvider: CloudProvider = 'aws';
  private deploymentTarget: DeploymentTarget = 'local';

  // Domain entity maps
  private accounts: Map<string, CloudAccount> = new Map();
  private vpcs: Map<string, CloudVpc> = new Map();
  private subnets: Map<string, CloudSubnet> = new Map();
  private computeInstances: Map<string, CloudComputeInstance> = new Map();
  private managedDatabases: Map<string, ManagedDatabaseInstance> = new Map();
  private buckets: Map<string, ObjectStorageBucket> = new Map();
  private networkRules: Map<string, NetworkRule> = new Map();

  // Migration state
  private migrationProgress: CloudMigrationProgress = {
    phase: 'IDLE',
    step: 0,
    totalSteps: 4,
    currentTask: 'Awaiting initialization',
    logs: ['[system] Cloud infrastructure subsystem ready.'],
  };

  constructor() {
    this.initializeDefaultState();
  }

  private initializeDefaultState(): void {
    // 1. Cloud Accounts (AWS & GCP)
    this.accounts.set('sim-aws-001', {
      id: 'sim-aws-001',
      name: 'Solar Grove AWS Production',
      provider: 'aws',
      region: 'ap-southeast-1',
      status: 'ACTIVE',
      credentialsStatus: 'SIMULATED',
      createdAt: Date.now() - 86400000 * 5,
    });

    this.accounts.set('solar-grove-prod', {
      id: 'solar-grove-prod',
      name: 'Solar Grove GCP Project',
      provider: 'gcp',
      region: 'asia-southeast1',
      status: 'ACTIVE',
      credentialsStatus: 'SIMULATED',
      createdAt: Date.now() - 86400000 * 3,
    });

    // 2. VPC
    this.vpcs.set('vpc-solar-01', {
      id: 'vpc-solar-01',
      name: 'solar-vpc-prod',
      cidrBlock: '10.10.0.0/16',
      provider: 'aws',
      region: 'ap-southeast-1',
      subnets: ['subnet-public-01', 'subnet-private-01'],
      isDefault: true,
    });

    // 3. Subnets (Public compute, Private database)
    this.subnets.set('subnet-public-01', {
      id: 'subnet-public-01',
      vpcId: 'vpc-solar-01',
      name: 'public-subnet-1a',
      cidrBlock: '10.10.1.0/24',
      type: 'public',
      availabilityZone: 'ap-southeast-1a',
      routeTableId: 'rtb-public-01',
      gatewayAttached: true,
    });

    this.subnets.set('subnet-private-01', {
      id: 'subnet-private-01',
      vpcId: 'vpc-solar-01',
      name: 'private-subnet-1a',
      cidrBlock: '10.10.2.0/24',
      type: 'private',
      availabilityZone: 'ap-southeast-1a',
      routeTableId: 'rtb-private-01',
      gatewayAttached: false,
    });

    // 4. Compute Instance (EC2 / Compute Engine)
    this.computeInstances.set('i-greenhouse-01', {
      id: 'i-greenhouse-01',
      name: 'greenhouse-controller-vm',
      provider: 'aws',
      instanceType: 't3.micro',
      status: 'RUNNING',
      publicIp: '13.250.14.22',
      privateIp: '10.10.1.10',
      vpcId: 'vpc-solar-01',
      subnetId: 'subnet-public-01',
      securityGroups: ['greenhouse-app'],
      deployedApp: 'greenhouse-controller',
      environment: {
        NODE_ENV: 'production',
        PORT: '4000',
        DATABASE_URL: 'postgresql://postgres:solar_grove_pass@greenhouse-db.internal:5432/solar_grove',
      },
      costPerHour: 2,
      uptimeSeconds: 3600,
      cpuUsagePercent: 14,
      memoryUsagePercent: 28,
    });

    // 5. Managed PostgreSQL Database (RDS / Cloud SQL)
    this.managedDatabases.set('db-greenhouse-pg', {
      id: 'db-greenhouse-pg',
      name: 'greenhouse-db',
      provider: 'aws',
      engine: 'postgresql',
      version: '16.2',
      status: 'AVAILABLE',
      endpoint: 'greenhouse-db.internal',
      port: 5432,
      vpcId: 'vpc-solar-01',
      subnetId: 'subnet-private-01',
      securityGroups: ['greenhouse-db'],
      database: 'solar_grove',
      masterUsername: 'postgres',
      isPubliclyAccessible: false,
      storageGb: 20,
      costPerHour: 3,
    });

    // 6. Object Storage Bucket (Outside VPC in Managed Services)
    this.buckets.set('solar-grove-telemetry-archive', {
      id: 'solar-grove-telemetry-archive',
      name: 'solar-grove-telemetry-archive',
      provider: 'aws',
      region: 'ap-southeast-1',
      isPublic: false,
      createdAt: '2026-09-01T00:00:00.000Z',
      objects: [
        {
          key: 'telemetry/archive-baseline.json',
          sizeBytes: 15420,
          lastModified: '2026-09-01T12:00:00.000Z',
          contentType: 'application/json',
          dataSummary: '100 historical telemetry records initialized from local farm sensor array',
        },
      ],
      storageBytes: 15420,
      costPerHour: 1,
    });

    // 7. Security / Firewall Rules (Compute to Database reachability)
    this.networkRules.set('rule-app-to-db', {
      id: 'rule-app-to-db',
      name: 'allow-compute-to-postgres',
      sourceType: 'security-group',
      source: 'greenhouse-app',
      destination: 'greenhouse-db',
      protocol: 'tcp',
      port: 5432,
      action: 'ALLOW',
      enabled: true,
      description: 'Allow TCP 5432 from greenhouse-app security group to managed PostgreSQL',
      provider: 'aws',
    });

    this.networkRules.set('rule-public-ingress', {
      id: 'rule-public-ingress',
      name: 'allow-relay-to-compute',
      sourceType: 'cidr',
      source: '0.0.0.0/0',
      destination: 'greenhouse-app',
      protocol: 'tcp',
      port: 4000,
      action: 'ALLOW',
      enabled: true,
      description: 'Allow HTTP 4000 traffic to greenhouse controller compute instance',
      provider: 'aws',
    });
  }

  // --- Getters & Setters ---

  getActiveProvider(): CloudProvider {
    return this.activeProvider;
  }

  setActiveProvider(provider: CloudProvider): void {
    this.activeProvider = provider;
  }

  getDeploymentTarget(): DeploymentTarget {
    return this.deploymentTarget;
  }

  setDeploymentTarget(target: DeploymentTarget): void {
    this.deploymentTarget = target;
  }

  getAccounts(): CloudAccount[] {
    return Array.from(this.accounts.values());
  }

  getAccount(id: string): CloudAccount | undefined {
    return this.accounts.get(id);
  }

  getVpcs(): CloudVpc[] {
    return Array.from(this.vpcs.values());
  }

  getVpc(id: string): CloudVpc | undefined {
    return this.vpcs.get(id);
  }

  getSubnets(): CloudSubnet[] {
    return Array.from(this.subnets.values());
  }

  getSubnet(id: string): CloudSubnet | undefined {
    return this.subnets.get(id);
  }

  getComputeInstances(): CloudComputeInstance[] {
    return Array.from(this.computeInstances.values());
  }

  getComputeInstance(id: string): CloudComputeInstance | undefined {
    return this.computeInstances.get(id);
  }

  getManagedDatabases(): ManagedDatabaseInstance[] {
    return Array.from(this.managedDatabases.values());
  }

  getManagedDatabase(id: string): ManagedDatabaseInstance | undefined {
    return this.managedDatabases.get(id);
  }

  getBuckets(): ObjectStorageBucket[] {
    return Array.from(this.buckets.values());
  }

  getBucket(id: string): ObjectStorageBucket | undefined {
    return this.buckets.get(id);
  }

  getNetworkRules(): NetworkRule[] {
    return Array.from(this.networkRules.values());
  }

  getNetworkRule(id: string): NetworkRule | undefined {
    return this.networkRules.get(id);
  }

  getMigrationProgress(): CloudMigrationProgress {
    return { ...this.migrationProgress };
  }

  // --- Provider Terminology ---

  getProviderTerminology(provider: CloudProvider = this.activeProvider) {
    if (provider === 'gcp') {
      return {
        providerName: 'Google Cloud Platform (GCP)',
        accountLabel: 'Project',
        computeLabel: 'Compute Engine (VM)',
        databaseLabel: 'Cloud SQL (PostgreSQL)',
        storageLabel: 'Cloud Storage Bucket',
        firewallLabel: 'VPC Firewall Rule',
        instanceTypeExample: 'e2-micro',
        regionLabel: 'asia-southeast1',
      };
    }
    return {
      providerName: 'Amazon Web Services (AWS)',
      accountLabel: 'Account',
      computeLabel: 'EC2 Instance',
      databaseLabel: 'Amazon RDS (PostgreSQL)',
      storageLabel: 'S3 Bucket',
      firewallLabel: 'Security Group Rule',
      instanceTypeExample: 't3.micro',
      regionLabel: 'ap-southeast-1',
    };
  }

  // --- Network Reachability Evaluation ---

  evaluateConnectivity(
    sourceIdentifier: string,
    destinationIdentifier: string,
    port: number
  ): ConnectivityResult {
    // 1. Look for explicit rules matching destination and port
    const matchingRules = Array.from(this.networkRules.values()).filter((r) => {
      const destMatches =
        r.destination === destinationIdentifier ||
        r.destination === '0.0.0.0/0' ||
        r.destination === '*';
      return destMatches && r.port === port;
    });

    if (matchingRules.length === 0) {
      return {
        allowed: false,
        reason: `No ingress rule found for destination '${destinationIdentifier}' on port ${port}. Default cloud security posture is DENY.`,
      };
    }

    // Check if source matches any rule
    for (const rule of matchingRules) {
      if (!rule.enabled) continue;

      let sourceMatches = false;
      if (rule.source === '*' || rule.source === '0.0.0.0/0') {
        sourceMatches = true;
      } else if (rule.sourceType === 'security-group' && rule.source === sourceIdentifier) {
        sourceMatches = true;
      } else if (rule.sourceType === 'cidr') {
        if (rule.source === sourceIdentifier) {
          sourceMatches = true;
        } else if (sourceIdentifier.startsWith('10.10.1.') && rule.source.startsWith('10.10.1.')) {
          sourceMatches = true;
        }
      } else if (rule.sourceType === 'instance' && rule.source === sourceIdentifier) {
        sourceMatches = true;
      }

      if (sourceMatches) {
        if (rule.action === 'ALLOW') {
          return {
            allowed: true,
            matchedRule: rule,
            reason: `Traffic allowed by rule '${rule.name}' (${rule.source} -> ${rule.destination}:${rule.port})`,
          };
        }
        return {
          allowed: false,
          matchedRule: rule,
          reason: `Traffic explicitly DENIED by rule '${rule.name}'.`,
        };
      }
    }

    return {
      allowed: false,
      reason: `No matching rule allowed source '${sourceIdentifier}' to reach destination '${destinationIdentifier}' on port ${port}.`,
    };
  }

  setRuleEnabled(ruleId: string, enabled: boolean): boolean {
    const rule = this.networkRules.get(ruleId);
    if (!rule) return false;
    rule.enabled = enabled;
    return true;
  }

  setRuleAction(ruleId: string, action: 'ALLOW' | 'DENY'): boolean {
    const rule = this.networkRules.get(ruleId);
    if (!rule) return false;
    rule.action = action;
    return true;
  }

  addNetworkRule(rule: NetworkRule): void {
    this.networkRules.set(rule.id, rule);
  }

  // --- Compute Lifecycle ---

  startComputeInstance(instanceId: string): boolean {
    const inst = this.computeInstances.get(instanceId);
    if (!inst) return false;
    inst.status = 'RUNNING';
    return true;
  }

  stopComputeInstance(instanceId: string): boolean {
    const inst = this.computeInstances.get(instanceId);
    if (!inst) return false;
    inst.status = 'STOPPED';
    return true;
  }

  updateComputeEnvironment(instanceId: string, env: Record<string, string>): boolean {
    const inst = this.computeInstances.get(instanceId);
    if (!inst) return false;
    inst.environment = { ...inst.environment, ...env };
    return true;
  }

  // --- Object Storage Operations ---

  archiveTelemetry(records: PostgresTelemetryRecord[]): ObjectStorageObject {
    const bucket = this.buckets.get('solar-grove-telemetry-archive');
    const timestamp = new Date().toISOString();
    const dateSlug = timestamp.replace(/[:.]/g, '-');
    const key = `telemetry/archive-${dateSlug}.json`;
    const serialized = JSON.stringify(records);
    const sizeBytes = serialized.length;

    const newObj: ObjectStorageObject = {
      key,
      sizeBytes,
      lastModified: timestamp,
      contentType: 'application/json',
      dataSummary: `Archived ${records.length} sensor telemetry records to cloud object storage`,
    };

    if (bucket) {
      bucket.objects.push(newObj);
      bucket.storageBytes += sizeBytes;
    }

    return newObj;
  }

  // --- Real Multi-Step Migration Workflow ---

  startMigration(): { success: boolean; message: string } {
    this.migrationProgress = {
      phase: 'PREPARING',
      step: 1,
      totalSteps: 4,
      currentTask: 'Validating cloud infrastructure provisioning...',
      logs: [
        '[migration] Initiated cloud migration pipeline.',
        '[migration] Checking VPC and subnet availability...',
      ],
    };

    if (this.vpcs.size === 0 || this.subnets.size === 0) {
      this.migrationProgress.phase = 'FAILED';
      this.migrationProgress.failureReason = 'VPC or subnets are not configured.';
      return { success: false, message: 'Prerequisites check failed: VPC / Subnets missing.' };
    }

    this.migrationProgress.logs.push(
      '[migration] VPC and subnets verified. Ready for workload provisioning.'
    );
    return { success: true, message: 'Migration prepared. Ready to migrate workload.' };
  }

  executeMigrationStep(options: { forceLocalhostError?: boolean } = {}): {
    success: boolean;
    step: number;
    phase: CloudMigrationProgress['phase'];
    message: string;
  } {
    const p = this.migrationProgress;

    // Step 2: MIGRATING (Provision compute & DB)
    if (p.phase === 'PREPARING' || (p.phase === 'FAILED' && p.step <= 2)) {
      p.step = 2;
      p.phase = 'MIGRATING';
      p.currentTask = 'Deploying Greenhouse Controller and provisioning managed PostgreSQL...';
      p.logs.push(
        '[migration] Provisioning managed PostgreSQL (greenhouse-db.internal:5432)...',
        '[migration] Copying existing telemetry records to managed database...',
        '[migration] Deploying Greenhouse Controller to cloud compute instance (i-greenhouse-01)...'
      );

      const compute = this.computeInstances.get('i-greenhouse-01');
      if (compute) {
        compute.status = 'RUNNING';
        if (options.forceLocalhostError) {
          compute.environment.DATABASE_URL =
            'postgresql://postgres:solar_grove_pass@localhost:5432/solar_grove';
        }
      }

      // Check deliberate failure condition (DATABASE_URL referencing localhost)
      const dbUrl = compute?.environment.DATABASE_URL || '';
      if (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1')) {
        p.phase = 'FAILED';
        p.failureReason =
          "Database connection failed: DATABASE_URL points to 'localhost:5432'. In the cloud compute environment, 'localhost' refers to the compute VM itself, not the managed database! Update DATABASE_URL to 'greenhouse-db.internal:5432'.";
        p.logs.push(
          `[error] connect ECONNREFUSED 127.0.0.1:5432`,
          `[error] ${p.failureReason}`
        );
        return {
          success: false,
          step: p.step,
          phase: p.phase,
          message: p.failureReason,
        };
      }

      p.logs.push('[migration] Workload deployment completed. Ready for connectivity verification.');
      p.step = 3;
      p.phase = 'VERIFYING';
      p.currentTask = 'Verifying compute to database connectivity and routing...';
      return {
        success: true,
        step: p.step,
        phase: p.phase,
        message: 'Compute deployed. Ready to verify connectivity.',
      };
    }

    // Step 3 & 4: VERIFYING -> COMPLETE
    if (p.phase === 'VERIFYING' || (p.phase === 'FAILED' && p.step === 3)) {
      p.step = 3;
      p.phase = 'VERIFYING';
      p.currentTask = 'Verifying network reachability to managed PostgreSQL...';

      const compute = this.computeInstances.get('i-greenhouse-01');
      const dbUrl = compute?.environment.DATABASE_URL || '';

      if (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1')) {
        p.phase = 'FAILED';
        p.failureReason =
          "DATABASE_URL still points to 'localhost:5432'. Update DATABASE_URL to use the managed database endpoint 'greenhouse-db.internal'.";
        p.logs.push(`[error] ${p.failureReason}`);
        return {
          success: false,
          step: p.step,
          phase: p.phase,
          message: p.failureReason,
        };
      }

      // Check firewall reachability
      const reachability = this.evaluateConnectivity('greenhouse-app', 'greenhouse-db', 5432);
      if (!reachability.allowed) {
        p.phase = 'FAILED';
        p.failureReason = `Network connectivity verification failed: ${reachability.reason}`;
        p.logs.push(`[error] ${reachability.reason}`);
        return {
          success: false,
          step: p.step,
          phase: p.phase,
          message: p.failureReason,
        };
      }

      p.logs.push(
        '[verification] Database connectivity confirmed via security group greenhouse-app -> greenhouse-db:5432.',
        '[verification] Helio Relay edge ingress verified.'
      );

      // Step 4: COMPLETE
      p.step = 4;
      p.phase = 'COMPLETE';
      p.currentTask = 'Migration fully completed. Farm running on cloud infrastructure.';
      p.completedAt = Date.now();
      p.logs.push('[migration] Switched deployment target to CLOUD. Telemetry flow verified!');

      this.deploymentTarget = 'cloud';
      return {
        success: true,
        step: 4,
        phase: 'COMPLETE',
        message: 'Cloud migration succeeded! Farm is now operating in the cloud.',
      };
    }

    return {
      success: true,
      step: p.step,
      phase: p.phase,
      message: `Migration currently in phase ${p.phase}.`,
    };
  }


  // --- Cloud Infrastructure Cost Calculation ---

  calculateCosts(): CloudCostSummary {
    let computeCost = 0;
    for (const c of this.computeInstances.values()) {
      if (c.status === 'RUNNING') computeCost += c.costPerHour;
    }

    let databaseCost = 0;
    for (const d of this.managedDatabases.values()) {
      if (d.status === 'AVAILABLE') databaseCost += d.costPerHour;
    }

    let storageCost = 0;
    for (const b of this.buckets.values()) {
      storageCost += b.costPerHour;
    }

    const hourly = computeCost + databaseCost + storageCost;
    return {
      hourlyCostGold: hourly,
      dailyCostGold: hourly * 24,
      breakdown: {
        compute: computeCost,
        database: databaseCost,
        storage: storageCost,
      },
    };
  }
}
