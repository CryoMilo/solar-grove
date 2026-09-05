import type { BlueprintRequirement, CompetencyId } from './learning';

export type BuildingType =
  | 'helio-pump'
  | 'verdant-glasshouse'
  | 'sunvault-storage'
  | 'harvest-automaton';

export type BuildingStatus = 'offline' | 'starting' | 'healthy' | 'degraded' | 'failed';

export type RuntimeType = 'node' | 'python' | 'nginx' | 'binary';

export type DeploymentType =
  | 'bare-metal'
  | 'docker'
  | 'aws-ec2'
  | 'gcp-compute-engine'
  | 'aws-ecs'
  | 'gcp-cloud-run';

export interface ApplicationInstance {
  id: string;
  name: string;
  runtime: RuntimeType;
  deployment: DeploymentType;
  port: number;
  expectedPort: number;
  cpuUsage: number; // 0-100%
  memoryUsageMb: number;
  memoryLimitMb: number;
  health: 'healthy' | 'unhealthy';
  command: string;
  systemdUnit?: string;
  containerId?: string;
  containerImage?: string;
  logs: string[];
}

export interface BuildingBlueprint {
  id: BuildingType;
  solarpunkName: string;
  actualTechnology: string;
  description: string;
  constructionCost: number; // Gold
  powerConsumption: number; // kW
  waterOutputRate?: number; // Liters / tick
  productionModifier?: number; // e.g. 1.25x
  requiredCompetencies: CompetencyId[];
  requiredInfrastructure: {
    serviceName: string;
    expectedPort: number;
    runtime: RuntimeType;
    deployment: DeploymentType;
  };
}

export interface BuildingInstance {
  id: string;
  type: BuildingType;
  x: number;
  y: number;
  width: number;
  height: number;
  status: BuildingStatus;
  application?: ApplicationInstance;
  productionRate: number;
  powerConsumption: number;
  maintenanceCost: number;
  constructedAt: number;
  lastIncidentAt?: number;
}
