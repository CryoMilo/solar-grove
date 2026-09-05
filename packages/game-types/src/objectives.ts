import type { BuildingType } from './building';

export type ObjectiveId =
  | 'goal-1-first-harvest'
  | 'goal-2-flow-of-water'
  | 'goal-3-bring-pump-online'
  | 'goal-4-automate-grove'
  | 'goal-5-container-garden';

export interface ObjectiveRequirement {
  type: 'gold' | 'build' | 'service-online' | 'harvest' | 'uptime';
  description: string;
  target: number;
  current: number;
  satisfied: boolean;
  targetBuildingType?: BuildingType;
  targetServiceName?: string;
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
