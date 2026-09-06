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
  port: number;
  healthEndpoint: string;
  description: string;
  buildingName: string;
  buildingType: string;
  database: string;
  deployments: string[];
  serviceName: string;
  dependencies?: string[];
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

export type IncidentType =
  | 'process-crash'
  | 'wrong-port'
  | 'high-cpu'
  | 'memory-leak'
  | 'disk-full';

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
