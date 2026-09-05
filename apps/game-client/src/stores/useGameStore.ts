import { CommandEngine } from '@solar-grove/command-engine';
import { BUILDINGS, CROPS, MICRO_LESSONS, OBJECTIVES } from '@solar-grove/content';
import type {
  BuildingBlueprint,
  BuildingInstance,
  BuildingType,
  CompetencyId,
  CropInstance,
  CropStage,
  CropType,
  FarmState,
  MicroLesson,
  PlayerKnowledgeMap,
  ProgressionObjective,
} from '@solar-grove/game-types';
import { IncidentEngine, ServiceManager } from '@solar-grove/infrastructure-model';
import { create } from 'zustand';

export type HeliosWindowId =
  | 'terminal'
  | 'observatory'
  | 'cloud'
  | 'blueprints'
  | 'knowledge'
  | 'objectives';

export interface PlacementState {
  active: boolean;
  buildingType: BuildingType | null;
}

interface GameStore {
  farmState: FarmState;
  buildings: BuildingInstance[];
  objectives: ProgressionObjective[];
  knowledgeMap: PlayerKnowledgeMap;
  pcOpen: boolean;
  activeWindow: HeliosWindowId;
  activeBlueprint: BuildingBlueprint | null;
  activeMicroLesson: MicroLesson | null;
  placementMode: PlacementState;

  serviceManager: ServiceManager;
  incidentEngine: IncidentEngine;
  commandEngine: CommandEngine;

  tick: () => void;
  togglePc: (forced?: boolean) => void;
  setActiveWindow: (w: HeliosWindowId) => void;
  openBlueprint: (b: BuildingBlueprint) => void;
  closeBlueprint: () => void;
  openMicroLesson: (m: MicroLesson) => void;
  closeMicroLesson: () => void;
  startPlacement: (type: BuildingType) => void;
  cancelPlacement: () => void;
  plantCrop: (cropType: CropType, x: number, y: number) => boolean;
  harvestCrop: (cropId: string) => { success: boolean; goldEarned: number };
  constructBuilding: (
    type: BuildingType,
    x: number,
    y: number
  ) => { success: boolean; message: string };
  runTerminalCommand: (cmd: string) => Promise<string>;
  learnCompetency: (id: CompetencyId) => void;
}

const initialServiceManager = new ServiceManager();
const initialIncidentEngine = new IncidentEngine();
const initialCommandEngine = new CommandEngine(initialServiceManager);

const initialKnowledge: PlayerKnowledgeMap = {
  'linux.filesystem': { status: 'learned', timesUsed: 1 },
  'linux.processes': { status: 'not-mastered', timesUsed: 0 },
  'linux.services': { status: 'not-learned', timesUsed: 0 },
  'linux.permissions': { status: 'not-learned', timesUsed: 0 },
  'networking.ip': { status: 'learned', timesUsed: 1 },
  'networking.ports': { status: 'not-learned', timesUsed: 0 },
  'networking.http': { status: 'not-learned', timesUsed: 0 },
  'networking.dns': { status: 'not-learned', timesUsed: 0 },
  'containers.docker': { status: 'not-learned', timesUsed: 0 },
  'containers.images': { status: 'not-learned', timesUsed: 0 },
  'containers.volumes': { status: 'not-learned', timesUsed: 0 },
  'containers.networking': { status: 'not-learned', timesUsed: 0 },
  'databases.sql': { status: 'not-learned', timesUsed: 0 },
  'databases.postgresql': { status: 'not-learned', timesUsed: 0 },
  'databases.backups': { status: 'not-learned', timesUsed: 0 },
  'cloud.compute': { status: 'not-learned', timesUsed: 0 },
  'cloud.storage': { status: 'not-learned', timesUsed: 0 },
  'cloud.monitoring': { status: 'not-learned', timesUsed: 0 },
};

// Initial starter crops planted in farm plot
const starterCrops: CropInstance[] = [
  {
    id: 'crop-seed-1',
    cropType: 'sunroot',
    x: 18,
    y: 19,
    stage: 'growing',
    growthProgress: 0.6,
    hydration: 80,
    plantedAt: Date.now() - 6000,
    lastTick: Date.now(),
  },
  {
    id: 'crop-seed-2',
    cropType: 'sunroot',
    x: 19,
    y: 19,
    stage: 'sprout',
    growthProgress: 0.3,
    hydration: 75,
    plantedAt: Date.now() - 3000,
    lastTick: Date.now(),
  },
  {
    id: 'crop-seed-3',
    cropType: 'sunroot',
    x: 20,
    y: 19,
    stage: 'mature',
    growthProgress: 1.0,
    hydration: 90,
    plantedAt: Date.now() - 12000,
    lastTick: Date.now(),
  },
];

export const useGameStore = create<GameStore>((set, get) => ({
  farmState: {
    gold: 85, // Friendly starter balance towards Goal 1 (100 gold)
    power: 100,
    maxPower: 200,
    water: 60,
    maxWater: 200,
    storage: 0,
    maxStorage: 100,
    gridWidth: 40,
    gridHeight: 40,
    crops: starterCrops,
    inventory: {
      sunroot: 0,
      glowberry: 0,
      'verdant-grain': 0,
    },
  },
  buildings: [],
  objectives: JSON.parse(JSON.stringify(OBJECTIVES)),
  knowledgeMap: initialKnowledge,
  pcOpen: false,
  activeWindow: 'observatory',
  activeBlueprint: null,
  activeMicroLesson: null,
  placementMode: { active: false, buildingType: null },

  serviceManager: initialServiceManager,
  incidentEngine: initialIncidentEngine,
  commandEngine: initialCommandEngine,

  togglePc: (forced) =>
    set((state) => ({
      pcOpen: forced !== undefined ? forced : !state.pcOpen,
    })),

  setActiveWindow: (w) => set({ activeWindow: w }),

  openBlueprint: (b) => set({ activeBlueprint: b }),
  closeBlueprint: () => set({ activeBlueprint: null }),

  openMicroLesson: (m) => set({ activeMicroLesson: m }),
  closeMicroLesson: () => set({ activeMicroLesson: null }),

  startPlacement: (type) =>
    set({
      placementMode: { active: true, buildingType: type },
      pcOpen: false, // Return to farm view immediately
      activeBlueprint: null,
    }),

  cancelPlacement: () =>
    set({
      placementMode: { active: false, buildingType: null },
    }),

  learnCompetency: (id) =>
    set((state) => {
      const existing = state.knowledgeMap[id];
      return {
        knowledgeMap: {
          ...state.knowledgeMap,
          [id]: {
            status: 'learned',
            masteredAt: Date.now(),
            timesUsed: (existing?.timesUsed || 0) + 1,
          },
        },
      };
    }),

  plantCrop: (cropType, x, y) => {
    const { farmState } = get();
    // Check if space already occupied
    const occupied = farmState.crops.some((c) => c.x === x && c.y === y);
    if (occupied) return false;

    const newCrop: CropInstance = {
      id: `crop-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      cropType,
      x,
      y,
      stage: 'seed',
      growthProgress: 0,
      hydration: 70,
      plantedAt: Date.now(),
      lastTick: Date.now(),
    };

    set({
      farmState: {
        ...farmState,
        crops: [...farmState.crops, newCrop],
      },
    });
    return true;
  },

  harvestCrop: (cropId) => {
    const { farmState, objectives } = get();
    const index = farmState.crops.findIndex((c) => c.id === cropId);
    if (index === -1) return { success: false, goldEarned: 0 };

    const crop = farmState.crops[index];
    if (crop.stage !== 'mature') return { success: false, goldEarned: 0 };

    const def = CROPS[crop.cropType];
    const earned = def ? def.outputAmount * def.salePrice : 20;

    const newCrops = [...farmState.crops];
    newCrops.splice(index, 1);

    const newGold = farmState.gold + earned;
    const newInventory = {
      ...farmState.inventory,
      [crop.cropType]: (farmState.inventory[crop.cropType] || 0) + (def?.outputAmount || 4),
    };

    // Update objectives
    const updatedObjectives = objectives.map((obj) => {
      let _changed = false;
      const reqs = obj.requirements.map((req) => {
        if (req.type === 'gold') {
          req.current = newGold;
          if (req.current >= req.target) req.satisfied = true;
          _changed = true;
        } else if (
          req.type === 'harvest' &&
          (!req.targetBuildingType || crop.cropType === 'sunroot')
        ) {
          req.current += def?.outputAmount || 4;
          if (req.current >= req.target) req.satisfied = true;
          _changed = true;
        }
        return req;
      });

      const allSatisfied = reqs.every((r) => r.satisfied);
      return {
        ...obj,
        requirements: reqs,
        completed: allSatisfied,
      };
    });

    set({
      farmState: {
        ...farmState,
        gold: newGold,
        crops: newCrops,
        inventory: newInventory,
      },
      objectives: updatedObjectives,
    });

    return { success: true, goldEarned: earned };
  },

  constructBuilding: (type, x, y) => {
    const { farmState, buildings, objectives } = get();
    const blueprint = BUILDINGS[type];
    if (!blueprint) {
      return { success: false, message: 'Invalid building blueprint.' };
    }

    if (farmState.gold < blueprint.constructionCost) {
      return {
        success: false,
        message: `Insufficient funds. Requires ${blueprint.constructionCost} Gold (You have ${farmState.gold}).`,
      };
    }

    const newBuilding: BuildingInstance = {
      id: `bld-${Date.now().toString(36)}`,
      type,
      x,
      y,
      width: 2,
      height: 2,
      status: 'offline', // Starts offline until controller is deployed/started!
      productionRate: blueprint.productionModifier || 1.0,
      powerConsumption: blueprint.powerConsumption,
      maintenanceCost: 1,
      constructedAt: Date.now(),
    };

    // Update objectives
    const updatedObjectives = objectives.map((obj) => {
      const reqs = obj.requirements.map((req) => {
        if (req.type === 'build' && req.targetBuildingType === type) {
          req.current += 1;
          if (req.current >= req.target) req.satisfied = true;
        }
        return req;
      });
      return {
        ...obj,
        requirements: reqs,
        completed: reqs.every((r) => r.satisfied),
      };
    });

    set({
      farmState: {
        ...farmState,
        gold: farmState.gold - blueprint.constructionCost,
      },
      buildings: [...buildings, newBuilding],
      objectives: updatedObjectives,
      placementMode: { active: false, buildingType: null },
    });

    return {
      success: true,
      message: `${blueprint.solarpunkName} constructed! Physical unit is built. Deploy controller application in Pixel PC to activate.`,
    };
  },

  runTerminalCommand: async (cmd) => {
    const { commandEngine, learnCompetency, serviceManager, buildings, objectives } = get();
    const result = await commandEngine.execute(cmd);

    if (result.unlockedCompetency) {
      learnCompetency(result.unlockedCompetency);
    }

    // Sync buildings status with service manager
    if (result.affectedService) {
      const updatedBuildings = buildings.map((b) => {
        if (b.type === 'helio-pump' && result.affectedService === 'irrigation-controller') {
          const s = serviceManager.getService('irrigation-controller');
          b.status = s?.status === 'running' ? 'healthy' : 'offline';
        }
        if (b.type === 'verdant-glasshouse' && result.affectedService === 'greenhouse-api') {
          const s = serviceManager.getService('greenhouse-api');
          b.status = s?.status === 'running' ? 'healthy' : 'offline';
        }
        return b;
      });

      // Update objectives for service-online
      const updatedObjectives = objectives.map((obj) => {
        const reqs = obj.requirements.map((req) => {
          if (
            result.affectedService &&
            req.type === 'service-online' &&
            req.targetServiceName === result.affectedService
          ) {
            const s = serviceManager.getService(result.affectedService);
            if (s?.status === 'running') {
              req.current = 1;
              req.satisfied = true;
            }
          }
          return req;
        });
        return {
          ...obj,
          requirements: reqs,
          completed: reqs.every((r) => r.satisfied),
        };
      });

      set({ buildings: updatedBuildings, objectives: updatedObjectives });
    }

    return result.stdout;
  },

  tick: () => {
    const { farmState, buildings, serviceManager } = get();

    // 1. Water production from running Helio Pumps
    let waterGen = 0;
    for (const b of buildings) {
      if (b.type === 'helio-pump') {
        const s = serviceManager.getService('irrigation-controller');
        if (s?.status === 'running') {
          b.status = 'healthy';
          waterGen += 3;
        } else {
          b.status = 'offline';
        }
      }
    }

    const newWater = Math.min(farmState.maxWater, farmState.water + waterGen);

    // 2. Crop Growth
    const updatedCrops = farmState.crops.map((crop) => {
      if (crop.stage === 'mature') return crop;

      const def = CROPS[crop.cropType];
      if (!def) return crop;

      let growthRate = 1 / def.growthDurationSeconds;
      if (crop.hydration > 50) growthRate *= 1.25;

      const hasGlasshouse = buildings.some(
        (b) => b.type === 'verdant-glasshouse' && b.status === 'healthy'
      );
      if (hasGlasshouse) growthRate *= 1.4;

      const newProgress = Math.min(1.0, crop.growthProgress + growthRate);
      let newStage: CropStage = crop.stage;
      if (newProgress >= 1.0) newStage = 'mature';
      else if (newProgress >= 0.6) newStage = 'growing';
      else if (newProgress >= 0.25) newStage = 'sprout';

      return {
        ...crop,
        growthProgress: newProgress,
        stage: newStage,
        hydration: Math.max(20, crop.hydration - 1),
      };
    });

    set({
      farmState: {
        ...farmState,
        water: newWater,
        crops: updatedCrops,
      },
    });
  },
}));
