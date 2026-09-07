export type CloudProviderType = 'local' | 'aws' | 'gcp';
export type CloudProvider = 'aws' | 'gcp';

export type SoftwareDeploymentStatus =
  | 'NOT_DEPLOYED'
  | 'DEPLOYING'
  | 'DEPLOYED'
  | 'RUNNING'
  | 'HEALTHY'
  | 'STOPPED'
  | 'CRASHED'
  | 'UNHEALTHY';

export interface SoftwareDefinition {
  id: string;
  name: string;
  version: string;
  runtime: string;
  deployment?: 'bare-metal' | 'docker' | string;
  port: number;
  healthEndpoint: string;
  description: string;
  buildingName: string;
  buildingType: string;
  database: string;
  deployments: string[];
  serviceName: string;
  dependencies?: string[];
  environment?: Record<string, string>;
  requirements?: string[];
  webUrl?: string;
}

export type ContainerStatus = 'CREATED' | 'RUNNING' | 'STOPPED' | 'EXITED' | 'CRASHED';
export type ContainerHealth = 'UNKNOWN' | 'STARTING' | 'HEALTHY' | 'UNHEALTHY';

export interface DockerImage {
  id: string;
  repository: string;
  tag: string;
  size: string;
  createdAt: string;
  status: 'AVAILABLE' | 'NOT_AVAILABLE';
}

export interface SimulatedContainer {
  id: string;
  name: string;
  image: string;
  status: ContainerStatus;
  health: ContainerHealth;
  ports: string;
  portMappings: { hostPort: number; containerPort: number; protocol: 'tcp' | 'udp' }[];
  environment: Record<string, string>;
  network: string;
  command: string;
  createdAt: number;
  logs: string[];
}

export interface DockerNetwork {
  id: string;
  name: string;
  driver: 'bridge' | 'host';
  containers: string[];
  subnet: string;
}

export interface PostgresTelemetryRecord {
  temperature: number;
  humidity: number;
  soilMoisture: number;
  timestamp: string;
}

export interface PostgresState {
  database: string;
  user: string;
  password: string;
  port: number;
  connectionState: 'AVAILABLE' | 'UNAVAILABLE' | 'AUTH_FAILED';
  tables: {
    greenhouse_telemetry: PostgresTelemetryRecord[];
    growth_cycles: Array<{
      id: number;
      startedAt: string;
      completedAt?: string;
      growthMultiplier: number;
      status: string;
    }>;
    harvests: Array<{
      id: number;
      crop: string;
      quantity: number;
      quality: string;
      timestamp: string;
    }>;
  };
}

export interface HostProcess {
  pid: number;
  name: string;
  command: string;
  status: 'RUNNING' | 'STOPPED' | 'CRASHED';
  cpu: number;
  memoryMb: number;
  startedAt: number;
}

export interface HostPort {
  protocol: 'tcp' | 'udp';
  address: string;
  port: number;
  status: 'LISTEN' | 'CLOSED';
  processName: string;
  pid: number;
}

export interface SimulatedHttpResponse {
  statusCode: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  jsonData?: Record<string, unknown>;
  error?: string;
}

export interface ComputeInstance {
  id: string;
  provider: CloudProviderType;
  name: string;
  region: string;
  instanceType: string; // e.g. "t3.micro" or "e2-micro" or "localhost"
  status: 'running' | 'stopped' | 'restarting' | 'error';
  ipAddress: string;
  costGoldPerDay: number;
  cpuCores: number;
  memoryGb: number;
  diskGb: number;
  diskUsagePercent: number;
  uptimeSeconds: number;
}

export interface InfrastructureMetrics {
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  diskUsagePercent: number;
  networkLatencyMs: number;
  errorRatePerMinute: number;
  uptimePercent: number;
}

export interface NetworkHost {
  hostname: string;
  ip: string;
  mac?: string;
  role: 'gateway' | 'workstation' | 'workload' | 'dns' | 'proxy' | 'container-host' | 'device';
  description: string;
  ports: number[];
  status: 'ONLINE' | 'OFFLINE';
}

export interface DnsRecord {
  hostname: string;
  type: 'A' | 'CNAME';
  value: string;
  ttl: number;
}

export interface ProxyRoute {
  id: string;
  hostname: string;
  path: string;
  upstreamHost: string;
  upstreamPort: number;
  enabled?: boolean;
  tlsRequired: boolean;
}

export type CertificateStatus = 'MISSING' | 'PENDING' | 'VALID' | 'EXPIRED' | 'INVALID';

export interface TlsCertificate {
  id: string;
  domain: string;
  issuer: string;
  status: CertificateStatus;
  issuedAt?: string;
  expiresAt?: string;
  valid: boolean;
  fingerprint?: string;
  keyType: string;
  autoRenew?: boolean;
}

export interface ReverseProxyState {
  serviceName: string;
  status: 'RUNNING' | 'STOPPED' | 'FAILED';
  listeners: number[];
  routes: ProxyRoute[];
  httpRedirectHttps: boolean;
  activeConnections?: number;
  requestsPerSecond?: number;
  tlsTerminatedRequests?: number;
  upstreamFailures?: number;
}

export type DeploymentTarget = 'local' | 'cloud';

export interface CloudAccount {
  id: string; // e.g. 'sim-aws-001' or 'solar-grove-prod'
  name: string;
  provider: 'aws' | 'gcp';
  region: string; // 'ap-southeast-1' or 'asia-southeast1'
  status: 'ACTIVE' | 'DEGRADED' | 'CONFIGURING';
  credentialsStatus: 'SIMULATED';
  createdAt: number;
}

export interface CloudVpc {
  id: string; // e.g. 'vpc-solar-01'
  name: string;
  cidrBlock: string; // '10.10.0.0/16'
  provider: 'aws' | 'gcp';
  region: string;
  subnets: string[]; // Subnet IDs
  isDefault: boolean;
}

export interface CloudSubnet {
  id: string; // 'subnet-public-01', 'subnet-private-01'
  vpcId: string;
  name: string;
  cidrBlock: string; // '10.10.1.0/24' (public), '10.10.2.0/24' (private)
  type: 'public' | 'private';
  availabilityZone: string;
  routeTableId: string;
  gatewayAttached?: boolean; // IGW attached for public
}

export interface NetworkRule {
  id: string;
  name: string;
  sourceType: 'cidr' | 'security-group' | 'instance';
  source: string; // e.g. 'greenhouse-app' or '10.10.1.0/24'
  destination: string; // e.g. 'greenhouse-db' or '10.10.2.15'
  protocol: 'tcp';
  port: number; // e.g. 5432
  action: 'ALLOW' | 'DENY';
  enabled: boolean;
  description?: string;
  provider?: 'aws' | 'gcp';
}

export interface CloudComputeInstance {
  id: string; // 'i-greenhouse-01'
  name: string;
  provider: 'aws' | 'gcp';
  instanceType: string; // 't3.micro' or 'e2-micro'
  status: 'PROVISIONING' | 'RUNNING' | 'STOPPED' | 'TERMINATED' | 'FAILED';
  publicIp?: string; // '13.250.14.22'
  privateIp: string; // '10.10.1.10'
  vpcId: string;
  subnetId: string;
  securityGroups: string[]; // ['greenhouse-app']
  deployedApp?: string; // 'greenhouse-controller'
  environment: Record<string, string>;
  costPerHour: number;
  uptimeSeconds: number;
  cpuUsagePercent: number;
  memoryUsagePercent: number;
}

export interface ManagedDatabaseInstance {
  id: string; // 'db-greenhouse-pg'
  name: string;
  provider: 'aws' | 'gcp';
  engine: 'postgresql';
  version: string;
  status: 'CREATING' | 'AVAILABLE' | 'STOPPED' | 'FAILED';
  endpoint: string; // 'greenhouse-db.internal' or 'greenhouse-pg.sim-aws.rds'
  port: number; // 5432
  vpcId: string;
  subnetId: string; // private subnet
  securityGroups: string[]; // ['greenhouse-db']
  database: string;
  masterUsername: string;
  isPubliclyAccessible: boolean;
  storageGb: number;
  costPerHour: number;
}

export interface ObjectStorageObject {
  key: string;
  sizeBytes: number;
  lastModified: string;
  contentType: string;
  dataSummary?: string;
}

export interface ObjectStorageBucket {
  id: string; // 'solar-grove-telemetry-archive'
  name: string;
  provider: 'aws' | 'gcp';
  region: string;
  isPublic: boolean;
  createdAt: string;
  objects: ObjectStorageObject[];
  storageBytes: number;
  costPerHour: number;
}

export type CloudMigrationPhase =
  | 'IDLE'
  | 'PREPARING'
  | 'MIGRATING'
  | 'VERIFYING'
  | 'COMPLETE'
  | 'FAILED';

export interface CloudMigrationProgress {
  phase: CloudMigrationPhase;
  step: number; // 0..4
  totalSteps: number; // 4
  currentTask: string;
  logs: string[];
  failureReason?: string;
  completedAt?: number;
}

export type IncidentType =
  | 'process-crash'
  | 'wrong-port'
  | 'high-cpu'
  | 'memory-leak'
  | 'disk-full'
  | 'greenhouse-auth-failure'
  | 'container-crash'
  | 'bad-upstream'
  | 'cert-missing'
  | 'cloud-security-group-blocked'
  | 'cloud-wrong-db-endpoint'
  | 'cloud-public-database'
  | 'cloud-compute-stopped'
  | 'cloud-region-degraded';

export interface Incident {
  id: string;
  type: IncidentType;
  title: string;
  description: string;
  affectedBuildingId: string;
  affectedServiceName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  detectedAt: number;
  resolvedAt?: number;
  productionPenaltyPercent: number; // e.g. 50%
  remediationHint: string;
  suggestedCommand: string;
}

