import type { BuildingType } from './building';

export type ObjectiveId =
  | 'obj-1-earn-100-gold'
  | 'obj-2-plant-10-crops'
  | 'obj-3-harvest-10-crops'
  | 'obj-4-build-irrigation-station'
  | 'obj-5-deploy-controller'
  | 'obj-6-irrigate-field'
  | 'obj-7-earn-500-gold'
  | 'obj-8-recover-incident'
  | string;

export interface ObjectiveRequirement {
  type:
    | 'gold'
    | 'build'
    | 'service-online'
    | 'harvest'
    | 'plant'
    | 'irrigate'
    | 'deploy'
    | 'incident-resolved'
    | 'uptime';
  description: string;
  target: number;
  current: number;
  satisfied: boolean;
  targetBuildingType?: BuildingType;
  targetServiceName?: string;
  targetSoftwareId?: string;
}

export interface ProgressionObjective {
  id: ObjectiveId;
  index: number;
  title: string;
  solarpunkTitle: string;
  description: string;
  requirements: ObjectiveRequirement[];
  completed: boolean;
  completedAt?: number;
  rewardGold: number;
  unlocksBlueprintId?: BuildingType;
}
