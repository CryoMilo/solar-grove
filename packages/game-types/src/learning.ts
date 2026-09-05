export type KnowledgeStatus = 'learned' | 'not-mastered' | 'not-learned' | 'locked';

export type CompetencyCategory = 'linux' | 'networking' | 'containers' | 'databases' | 'cloud';

export type CompetencyId =
  | 'linux.filesystem'
  | 'linux.processes'
  | 'linux.services'
  | 'linux.permissions'
  | 'networking.ip'
  | 'networking.ports'
  | 'networking.http'
  | 'networking.dns'
  | 'containers.docker'
  | 'containers.images'
  | 'containers.volumes'
  | 'containers.networking'
  | 'databases.sql'
  | 'databases.postgresql'
  | 'databases.backups'
  | 'cloud.compute'
  | 'cloud.storage'
  | 'cloud.monitoring';

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
