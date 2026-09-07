export type CloudProviderType = 'local' | 'aws' | 'gcp';

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

export type IncidentType =
  | 'process-crash'
  | 'wrong-port'
  | 'high-cpu'
  | 'memory-leak'
  | 'disk-full'
  | 'greenhouse-auth-failure'
  | 'container-crash'
  | 'bad-upstream'
  | 'cert-missing';

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
