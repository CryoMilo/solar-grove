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
  Incident,
  IncidentType,
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
  | 'objectives'
  | 'browser'
  | 'software';

export interface PlacementState {
  active: boolean;
  buildingType: BuildingType | null;
}

interface GameStore {
  farmState: FarmState;
  buildings: BuildingInstance[];
  objectives: ProgressionObjective[];
  knowledgeMap: PlayerKnowledgeMap;
  activeIncidents: Incident[];
  pcOpen: boolean;
  activeWindow: HeliosWindowId;
  activeBlueprint: BuildingBlueprint | null;
  activeMicroLesson: MicroLesson | null;
  placementMode: PlacementState;
  browserUrl: string;
  irrigationPumping: boolean;

  serviceManager: ServiceManager;
  incidentEngine: IncidentEngine;
  commandEngine: CommandEngine;

  tick: () => void;
  togglePc: (forced?: boolean) => void;
  setActiveWindow: (w: HeliosWindowId) => void;
  setBrowserUrl: (url: string) => void;
  setIrrigationPumping: (active: boolean) => void;
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
  triggerIncident: (type?: IncidentType) => void;
  resolveIncident: (id: string) => void;
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
  activeIncidents: [],
  pcOpen: false,
  activeWindow: 'observatory',
  activeBlueprint: null,
  activeMicroLesson: null,
  placementMode: { active: false, buildingType: null },
  browserUrl: 'http://irrigation.local:8080',
  irrigationPumping: true,

  serviceManager: initialServiceManager,
  incidentEngine: initialIncidentEngine,
  commandEngine: initialCommandEngine,

  togglePc: (forced) =>
    set((state) => ({
      pcOpen: forced !== undefined ? forced : !state.pcOpen,
    })),

  setActiveWindow: (w) => set({ activeWindow: w }),
  setBrowserUrl: (url) => set({ browserUrl: url }),
  setIrrigationPumping: (active) => set({ irrigationPumping: active }),

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
    const { farmState, buildings, objectives, serviceManager } = get();
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

    const s = serviceManager.getService('irrigation-controller');
    const isHealthy = type === 'helio-pump' && s?.status === 'running';

    const newBuilding: BuildingInstance = {
      id: `bld-${Date.now().toString(36)}`,
      type,
      x,
      y,
      width: 2,
      height: 2,
      status: isHealthy ? 'healthy' : 'offline',
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

  triggerIncident: (type = 'process-crash') => {
    const { incidentEngine, serviceManager, buildings } = get();
    const targetBuilding = buildings.find((b) => b.type === 'helio-pump') || buildings[0];
    const buildingId = targetBuilding ? targetBuilding.id : 'bld-helio-pump-1';
    const serviceName = 'irrigation-controller';

    serviceManager.simulateCrash(serviceName);
    incidentEngine.triggerIncident(type, buildingId, serviceName);

    const updatedBuildings = buildings.map((b) => {
      if (b.id === buildingId || b.type === 'helio-pump') {
        return { ...b, status: 'failed' as const };
      }
      return b;
    });

    set({
      activeIncidents: incidentEngine.getActiveIncidents(),
      buildings: updatedBuildings,
    });
  },

  resolveIncident: (id) => {
    const { incidentEngine, serviceManager, buildings, farmState } = get();
    const inc = incidentEngine.getAllIncidents().find((i) => i.id === id);
    if (!inc) return;

    incidentEngine.resolveIncident(id);
    serviceManager.startService(inc.affectedServiceName);

    const updatedBuildings = buildings.map((b) => {
      if (
        b.id === inc.affectedBuildingId ||
        (inc.affectedServiceName === 'irrigation-controller' && b.type === 'helio-pump')
      ) {
        return { ...b, status: 'healthy' as const };
      }
      return b;
    });

    set({
      farmState: { ...farmState, gold: farmState.gold + 100 },
      activeIncidents: incidentEngine.getActiveIncidents(),
      buildings: updatedBuildings,
    });
  },

  runTerminalCommand: async (cmd) => {
    const {
      commandEngine,
      learnCompetency,
      serviceManager,
      incidentEngine,
      buildings,
      objectives,
    } = get();
    const result = await commandEngine.execute(cmd);

    if (result.unlockedCompetency) {
      learnCompetency(result.unlockedCompetency);
    }

    let extraOutput = '';

    // Check if command resolved any incidents
    if (result.affectedService) {
      const s = serviceManager.getService(result.affectedService);
      if (s?.status === 'running') {
        const resolved = incidentEngine.resolveIncidentsForService(result.affectedService);
        if (resolved.length > 0) {
          const bounty = resolved.length * 100;
          extraOutput += `\n\x1b[38;2;72;187;120m[EMERGENCY TELEMETRY RESTORED]\x1b[0m ${result.affectedService} operational! Active incidents remediated.\n\x1b[38;2;236;201;75m[TRIAGE BOUNTY GRANTED]\x1b[0m +${bounty} Gold credited to farm reserve.\n`;
          set({
            farmState: { ...get().farmState, gold: get().farmState.gold + bounty },
            activeIncidents: incidentEngine.getActiveIncidents(),
          });
        }
      }

      // Sync buildings status with service manager
      const updatedBuildings = buildings.map((b) => {
        if (b.type === 'helio-pump' && result.affectedService === 'irrigation-controller') {
          const svc = serviceManager.getService('irrigation-controller');
          b.status = svc?.status === 'running' ? 'healthy' : 'failed';
        }
        if (b.type === 'verdant-glasshouse' && result.affectedService === 'greenhouse-api') {
          const svc = serviceManager.getService('greenhouse-api');
          b.status = svc?.status === 'running' ? 'healthy' : 'failed';
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
            const svc = serviceManager.getService(result.affectedService);
            if (svc?.status === 'running') {
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

    return result.stdout + extraOutput;
  },

  tick: () => {
    const { farmState, buildings, serviceManager, irrigationPumping } = get();

    // 1. Water production from running Helio Pumps
    let waterGen = 0;
    for (const b of buildings) {
      if (b.type === 'helio-pump') {
        const s = serviceManager.getService('irrigation-controller');
        if (s?.status === 'running' && b.status !== 'failed') {
          b.status = 'healthy';
          waterGen += 3;
        } else if (s?.status !== 'running') {
          b.status = 'failed';
        }
      }
    }

    const newWater = Math.min(farmState.maxWater, farmState.water + waterGen);

    // 2. Crop Growth & Hydration
    const isPumping =
      irrigationPumping && buildings.some((b) => b.type === 'helio-pump' && b.status === 'healthy');

    const updatedCrops = farmState.crops.map((crop) => {
      if (crop.stage === 'mature') return crop;

      const def = CROPS[crop.cropType];
      if (!def) return crop;

      let growthRate = 1 / def.growthDurationSeconds;
      if (crop.hydration > 50) growthRate *= 1.25;
      if (crop.hydration >= 85) growthRate *= 1.4;

      const hasGlasshouse = buildings.some(
        (b) => b.type === 'verdant-glasshouse' && b.status === 'healthy'
      );
      if (hasGlasshouse) growthRate *= 1.4;

      const newProgress = Math.min(1.0, crop.growthProgress + growthRate);
      let newStage: CropStage = crop.stage;
      if (newProgress >= 1.0) newStage = 'mature';
      else if (newProgress >= 0.6) newStage = 'growing';
      else if (newProgress >= 0.25) newStage = 'sprout';

      const hydrationDelta = isPumping ? 4 : -1;
      const newHydration = Math.min(100, Math.max(15, crop.hydration + hydrationDelta));

      return {
        ...crop,
        growthProgress: newProgress,
        stage: newStage,
        hydration: newHydration,
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
