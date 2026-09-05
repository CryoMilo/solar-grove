export type CloudProviderType = 'local' | 'aws' | 'gcp';

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
