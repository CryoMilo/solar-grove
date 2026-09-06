import { CommandEngine } from '@solar-grove/command-engine';
import {
  BUILDINGS,
  CONCEPT_DISCOVERIES,
  CROPS,
  type ConceptDiscovery,
  MICRO_LESSONS,
  OBJECTIVES,
} from '@solar-grove/content';
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
  SimulatedHttpResponse,
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
  inspectingBuilding: BuildingInstance | null;
  activeConcept: ConceptDiscovery | null;
  placementMode: PlacementState;
  browserUrl: string;

  serviceManager: ServiceManager;
  incidentEngine: IncidentEngine;
  commandEngine: CommandEngine;

  tick: () => void;
  togglePc: (forced?: boolean) => void;
  setActiveWindow: (w: HeliosWindowId) => void;
  setBrowserUrl: (url: string) => void;
  openBlueprint: (b: BuildingBlueprint) => void;
  closeBlueprint: () => void;
  openMicroLesson: (m: MicroLesson) => void;
  closeMicroLesson: () => void;
  setInspectingBuilding: (b: BuildingInstance | null) => void;
  dismissConcept: () => void;
  discoverConcept: (id: CompetencyId) => void;
  practiceConcept: (id: CompetencyId) => void;

  startPlacement: (type: BuildingType) => void;
  cancelPlacement: () => void;
  plantCrop: (cropType: CropType, x: number, y: number) => boolean;
  harvestCrop: (cropId: string) => { success: boolean; goldEarned: number };
  constructBuilding: (
    type: BuildingType,
    x: number,
    y: number
  ) => { success: boolean; message: string };
  deploySoftware: (softwareId: string) => { success: boolean; message: string };
  dispatchHttp: (
    url: string,
    options?: { method?: 'GET' | 'POST'; body?: unknown }
  ) => SimulatedHttpResponse;
  runTerminalCommand: (cmd: string) => Promise<string>;
  learnCompetency: (id: CompetencyId) => void;
  triggerIncident: (type?: IncidentType) => void;
  resolveIncident: (id: string) => void;
}

const initialServiceManager = new ServiceManager();
const initialIncidentEngine = new IncidentEngine();
const initialCommandEngine = new CommandEngine(initialServiceManager);

const initialKnowledge: PlayerKnowledgeMap = {
  'linux.filesystem': { status: 'PRACTICED', timesUsed: 1 },
  'linux.processes': { status: 'UNKNOWN', timesUsed: 0 },
  'linux.services': { status: 'UNKNOWN', timesUsed: 0 },
  'linux.permissions': { status: 'UNKNOWN', timesUsed: 0 },
  'networking.ip': { status: 'PRACTICED', timesUsed: 1 },
  'networking.ports': { status: 'UNKNOWN', timesUsed: 0 },
  'networking.http': { status: 'UNKNOWN', timesUsed: 0 },
  'networking.dns': { status: 'UNKNOWN', timesUsed: 0 },
  'containers.docker': { status: 'UNKNOWN', timesUsed: 0 },
  'containers.images': { status: 'UNKNOWN', timesUsed: 0 },
  'containers.volumes': { status: 'UNKNOWN', timesUsed: 0 },
  'containers.networking': { status: 'UNKNOWN', timesUsed: 0 },
  'databases.sql': { status: 'UNKNOWN', timesUsed: 0 },
  'databases.postgresql': { status: 'UNKNOWN', timesUsed: 0 },
  'databases.backups': { status: 'UNKNOWN', timesUsed: 0 },
  'cloud.compute': { status: 'UNKNOWN', timesUsed: 0 },
  'cloud.storage': { status: 'UNKNOWN', timesUsed: 0 },
  'cloud.monitoring': { status: 'UNKNOWN', timesUsed: 0 },
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
    water: 80,
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
  activeWindow: 'software',
  activeBlueprint: null,
  activeMicroLesson: null,
  inspectingBuilding: null,
  activeConcept: null,
  placementMode: { active: false, buildingType: null },
  browserUrl: 'http://irrigation.local:8080',

  serviceManager: initialServiceManager,
  incidentEngine: initialIncidentEngine,
  commandEngine: initialCommandEngine,

  togglePc: (forced) =>
    set((state) => ({
      pcOpen: forced !== undefined ? forced : !state.pcOpen,
    })),

  setActiveWindow: (w) => set({ activeWindow: w }),
  setBrowserUrl: (url) => set({ browserUrl: url }),

  openBlueprint: (b) => set({ activeBlueprint: b }),
  closeBlueprint: () => set({ activeBlueprint: null }),

  openMicroLesson: (m) => set({ activeMicroLesson: m }),
  closeMicroLesson: () => set({ activeMicroLesson: null }),

  setInspectingBuilding: (b) => set({ inspectingBuilding: b }),
  dismissConcept: () => set({ activeConcept: null }),

  discoverConcept: (id) => {
    const { knowledgeMap } = get();
    const current = knowledgeMap[id];
    if (!current || current.status === 'UNKNOWN') {
      const disc = CONCEPT_DISCOVERIES[id];
      set({
        knowledgeMap: {
          ...knowledgeMap,
          [id]: {
            status: 'DISCOVERED',
            masteredAt: undefined,
            timesUsed: (current?.timesUsed || 0) + 1,
          },
        },
        activeConcept: disc || null,
      });
    }
  },

  practiceConcept: (id) => {
    const { knowledgeMap } = get();
    const current = knowledgeMap[id];
    if (current && (current.status === 'UNKNOWN' || current.status === 'DISCOVERED')) {
      set({
        knowledgeMap: {
          ...knowledgeMap,
          [id]: {
            status: 'PRACTICED',
            masteredAt: Date.now(),
            timesUsed: (current?.timesUsed || 0) + 1,
          },
        },
      });
    }
  },

  learnCompetency: (id) => {
    get().practiceConcept(id);
  },

  startPlacement: (type) =>
    set({
      placementMode: { active: true, buildingType: type },
      pcOpen: false,
      activeBlueprint: null,
      inspectingBuilding: null,
    }),

  cancelPlacement: () =>
    set({
      placementMode: { active: false, buildingType: null },
    }),

  plantCrop: (cropType, x, y) => {
    const { farmState, objectives } = get();
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

    // Update objectives for 'plant'
    const updatedObjectives = objectives.map((obj) => {
      const reqs = obj.requirements.map((req) => {
        if (req.type === 'plant') {
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
        crops: [...farmState.crops, newCrop],
      },
      objectives: updatedObjectives,
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

    // Update objectives for gold & harvest
    const updatedObjectives = objectives.map((obj) => {
      const reqs = obj.requirements.map((req) => {
        if (req.type === 'gold') {
          req.current = newGold;
          if (req.current >= req.target) req.satisfied = true;
        } else if (req.type === 'harvest') {
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

    // Newly constructed building starts OFFLINE with software NOT DEPLOYED (Section 9)
    const newBuilding: BuildingInstance = {
      id: `bld-${Date.now().toString(36)}`,
      type,
      x,
      y,
      width: 2,
      height: 2,
      status: 'offline',
      softwareId: blueprint.softwareId || 'irrigation-controller',
      softwareStatus: 'NOT_DEPLOYED',
      irrigationActive: false,
      productionRate: blueprint.productionModifier || 1.4,
      powerConsumption: blueprint.powerConsumption,
      maintenanceCost: 1,
      constructedAt: Date.now(),
    };

    // Update objectives
    const updatedObjectives = objectives.map((obj) => {
      const reqs = obj.requirements.map((req) => {
        if (req.type === 'build') {
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

    // Automatically trigger discovery for Services & Ports
    get().discoverConcept('linux.services');
    get().discoverConcept('networking.ports');

    return {
      success: true,
      message: `${blueprint.solarpunkName} constructed! Status: OFFLINE. Required Software: ${blueprint.softwareId}. Inspect building or open Software Catalog to deploy.`,
    };
  },

  deploySoftware: (softwareId) => {
    const { serviceManager, buildings } = get();
    const res = serviceManager.deploySoftware(softwareId);

    if (res.success) {
      const updatedBuildings = buildings.map((b) => {
        if (
          b.softwareId === softwareId ||
          (softwareId === 'irrigation-controller' && b.type === 'helio-pump')
        ) {
          return { ...b, softwareStatus: 'DEPLOYED' as const };
        }
        return b;
      });

      get().practiceConcept('linux.services');
      get().discoverConcept('networking.ports');

      set({ buildings: updatedBuildings });
    }

    return res;
  },

  dispatchHttp: (url, options = {}) => {
    const { serviceManager, practiceConcept, objectives } = get();
    const res = serviceManager.dispatchHttp(url, options);

    if (res.statusCode === 200) {
      practiceConcept('networking.http');

      // If user started irrigation via HTTP POST, fulfill objective #6 (irrigate)
      if (
        options.method === 'POST' &&
        (url.includes('irrigation/start') || url.includes('/start'))
      ) {
        const updatedObjectives = objectives.map((obj) => {
          const reqs = obj.requirements.map((req) => {
            if (req.type === 'irrigate') {
              req.current = 1;
              req.satisfied = true;
            }
            return req;
          });
          return {
            ...obj,
            requirements: reqs,
            completed: reqs.every((r) => r.satisfied),
          };
        });
        set({ objectives: updatedObjectives });
      }
    }

    return res;
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
        return {
          ...b,
          status: 'failed' as const,
          softwareStatus: 'CRASHED' as const,
          irrigationActive: false,
        };
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
        return {
          ...b,
          status: 'healthy' as const,
          softwareStatus: 'HEALTHY' as const,
        };
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
      practiceConcept,
      serviceManager,
      incidentEngine,
      buildings,
      objectives,
    } = get();

    // Practice concepts based on command executed
    const lower = cmd.toLowerCase().trim();
    if (lower.startsWith('ps') || lower.startsWith('top')) {
      practiceConcept('linux.processes');
    } else if (lower.startsWith('systemctl')) {
      practiceConcept('linux.services');
    } else if (lower.startsWith('ss') || lower.startsWith('netstat')) {
      practiceConcept('networking.ports');
    } else if (lower.startsWith('curl')) {
      practiceConcept('networking.http');
    }

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

          // Fulfill Objective #8 (incident-resolved)
          const updatedObjectives = objectives.map((obj) => {
            const reqs = obj.requirements.map((req) => {
              if (req.type === 'incident-resolved') {
                req.current = 1;
                req.satisfied = true;
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
            farmState: { ...get().farmState, gold: get().farmState.gold + bounty },
            activeIncidents: incidentEngine.getActiveIncidents(),
            objectives: updatedObjectives,
          });
        }
      }

      // Sync buildings status with service manager
      const updatedBuildings = buildings.map((b) => {
        if (b.type === 'helio-pump' && result.affectedService === 'irrigation-controller') {
          const svc = serviceManager.getService('irrigation-controller');
          b.status = svc?.status === 'running' ? 'healthy' : 'failed';
          b.softwareStatus = svc?.status === 'running' ? 'HEALTHY' : 'CRASHED';
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
    const { farmState, buildings, serviceManager } = get();

    // 1. Check if Irrigation is actively delivering water (service running + pumping command)
    const isActivelyIrrigating =
      serviceManager.isIrrigationActivelyPumping() &&
      buildings.some((b) => b.type === 'helio-pump' && b.status === 'healthy');

    // Sync buildings status with service manager
    for (const b of buildings) {
      if (b.type === 'helio-pump') {
        const s = serviceManager.getService('irrigation-controller');
        if (s?.status === 'running') {
          b.status = 'healthy';
          b.softwareStatus = 'HEALTHY';
          b.irrigationActive = serviceManager.isIrrigationActivelyPumping();
        } else if (s?.status === 'failed') {
          b.status = 'failed';
          b.softwareStatus = 'CRASHED';
          b.irrigationActive = false;
        } else {
          b.status = 'offline';
          b.softwareStatus = s?.deploymentStatus || 'NOT_DEPLOYED';
          b.irrigationActive = false;
        }
      }
    }

    // 2. Water & Power consumption / generation
    let waterChange = 0;
    let powerChange = 0;

    if (isActivelyIrrigating) {
      waterChange = -2; // Irrigation consumes 2 L / sec
      powerChange = -1; // Consumes 1 kWh / sec
    } else {
      // Natural groundwater seepage recharge
      waterChange = +1;
    }

    const newWater = Math.max(0, Math.min(farmState.maxWater, farmState.water + waterChange));
    const newPower = Math.max(0, Math.min(farmState.maxPower, farmState.power + powerChange));

    // 3. Crop Growth & Hydration
    const updatedCrops = farmState.crops.map((crop) => {
      if (crop.stage === 'mature') return crop;

      const def = CROPS[crop.cropType];
      if (!def) return crop;

      let growthRate = 1 / def.growthDurationSeconds;
      if (crop.hydration >= 50) growthRate *= 1.25;
      if (crop.hydration >= 80) growthRate *= 1.4;

      const newProgress = Math.min(1.0, crop.growthProgress + growthRate);
      let newStage: CropStage = crop.stage;
      if (newProgress >= 1.0) newStage = 'mature';
      else if (newProgress >= 0.6) newStage = 'growing';
      else if (newProgress >= 0.25) newStage = 'sprout';

      const hydrationDelta = isActivelyIrrigating ? 4 : -1;
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
        power: newPower,
        crops: updatedCrops,
      },
    });
  },
}));
