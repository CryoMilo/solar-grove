export type KnowledgeStatus =
  | 'UNKNOWN'
  | 'DISCOVERED'
  | 'PRACTICED'
  | 'COMPETENT'
  | 'learned'
  | 'not-mastered'
  | 'not-learned'
  | 'locked';

export type CompetencyCategory = 'linux' | 'networking' | 'containers' | 'databases' | 'cloud';

export type CompetencyId =
  | 'linux.filesystem'
  | 'linux.processes'
  | 'linux.services'
  | 'linux.permissions'
  | 'linux.env'
  | 'networking.ip'
  | 'networking.ports'
  | 'networking.http'
  | 'networking.dns'
  | 'networking.reverse-proxy'
  | 'networking.upstream'
  | 'networking.tls'
  | 'networking.certificates'
  | 'networking.http-redirect'
  | 'containers.docker'
  | 'containers.images'
  | 'containers.volumes'
  | 'containers.networking'
  | 'containers.compose'
  | 'containers.logs'
  | 'containers.health'
  | 'databases.sql'
  | 'databases.postgresql'
  | 'databases.connection'
  | 'databases.backups'
  | 'cloud.compute'
  | 'cloud.storage'
  | 'cloud.monitoring'
  | 'cloud.computing'
  | 'cloud.aws'
  | 'cloud.gcp'
  | 'cloud.vpc'
  | 'cloud.subnet'
  | 'cloud.public-subnet'
  | 'cloud.private-subnet'
  | 'cloud.ec2'
  | 'cloud.compute-engine'
  | 'cloud.object-storage'
  | 'cloud.s3'
  | 'cloud.cloud-storage'
  | 'cloud.managed-database'
  | 'cloud.rds'
  | 'cloud.cloud-sql'
  | 'cloud.security-group'
  | 'cloud.cloud-firewall'
  | 'cloud.cloud-costs'
  | 'cloud.cloud-migration';

export interface ConceptDiscovery {
  id: CompetencyId;
  name: string;
  conceptName: string;
  summary: string;
  details: string;
  listenPort?: number;
}

export interface CompetencyDefinition {
  id: CompetencyId;
  name: string;
  category: CompetencyCategory;
  description: string;
  prerequisites: CompetencyId[];
}

export interface MicroLesson {
  id: CompetencyId;
  title: string;
  category: CompetencyCategory;
  readTimeSeconds: number; // e.g. 45 seconds
  summary: string;
  explanation: string;
  suggestedCommand: string;
  commandExplanation: string;
  whyFarmNeedsIt: string;
}

export interface BlueprintRequirement {
  competencyId: CompetencyId;
  title: string;
  category: CompetencyCategory;
  status: KnowledgeStatus;
  lessonAvailable: boolean;
}

export type PlayerKnowledgeMap = Record<
  CompetencyId,
  {
    status: KnowledgeStatus;
    masteredAt?: number;
    timesUsed: number;
  }
>;
