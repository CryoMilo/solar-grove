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
  | 'software'
  | 'network'
  | 'certs';

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
  checkMilestones: () => void;
}

const initialServiceManager = new ServiceManager();
const initialIncidentEngine = new IncidentEngine();
const initialCommandEngine = new CommandEngine(initialServiceManager);

const initialKnowledge: PlayerKnowledgeMap = {
  'linux.filesystem': { status: 'PRACTICED', timesUsed: 1 },
  'linux.processes': { status: 'UNKNOWN', timesUsed: 0 },
  'linux.services': { status: 'UNKNOWN', timesUsed: 0 },
  'linux.permissions': { status: 'UNKNOWN', timesUsed: 0 },
  'linux.env': { status: 'UNKNOWN', timesUsed: 0 },
  'networking.ip': { status: 'PRACTICED', timesUsed: 1 },
  'networking.ports': { status: 'UNKNOWN', timesUsed: 0 },
  'networking.http': { status: 'UNKNOWN', timesUsed: 0 },
  'networking.dns': { status: 'UNKNOWN', timesUsed: 0 },
  'networking.reverse-proxy': { status: 'UNKNOWN', timesUsed: 0 },
  'networking.upstream': { status: 'UNKNOWN', timesUsed: 0 },
  'networking.tls': { status: 'UNKNOWN', timesUsed: 0 },
  'networking.certificates': { status: 'UNKNOWN', timesUsed: 0 },
  'networking.http-redirect': { status: 'UNKNOWN', timesUsed: 0 },
  'containers.docker': { status: 'UNKNOWN', timesUsed: 0 },
  'containers.images': { status: 'UNKNOWN', timesUsed: 0 },
  'containers.volumes': { status: 'UNKNOWN', timesUsed: 0 },
  'containers.networking': { status: 'UNKNOWN', timesUsed: 0 },
  'containers.compose': { status: 'UNKNOWN', timesUsed: 0 },
  'containers.logs': { status: 'UNKNOWN', timesUsed: 0 },
  'containers.health': { status: 'UNKNOWN', timesUsed: 0 },
  'databases.sql': { status: 'UNKNOWN', timesUsed: 0 },
  'databases.postgresql': { status: 'UNKNOWN', timesUsed: 0 },
  'databases.connection': { status: 'UNKNOWN', timesUsed: 0 },
  'databases.backups': { status: 'UNKNOWN', timesUsed: 0 },
  'cloud.compute': { status: 'UNKNOWN', timesUsed: 0 },
  'cloud.storage': { status: 'UNKNOWN', timesUsed: 0 },
  'cloud.monitoring': { status: 'UNKNOWN', timesUsed: 0 },
  'cloud.computing': { status: 'UNKNOWN', timesUsed: 0 },
  'cloud.aws': { status: 'UNKNOWN', timesUsed: 0 },
  'cloud.gcp': { status: 'UNKNOWN', timesUsed: 0 },
  'cloud.vpc': { status: 'UNKNOWN', timesUsed: 0 },
  'cloud.subnet': { status: 'UNKNOWN', timesUsed: 0 },
  'cloud.public-subnet': { status: 'UNKNOWN', timesUsed: 0 },
  'cloud.private-subnet': { status: 'UNKNOWN', timesUsed: 0 },
  'cloud.ec2': { status: 'UNKNOWN', timesUsed: 0 },
  'cloud.compute-engine': { status: 'UNKNOWN', timesUsed: 0 },
  'cloud.object-storage': { status: 'UNKNOWN', timesUsed: 0 },
  'cloud.s3': { status: 'UNKNOWN', timesUsed: 0 },
  'cloud.cloud-storage': { status: 'UNKNOWN', timesUsed: 0 },
  'cloud.managed-database': { status: 'UNKNOWN', timesUsed: 0 },
  'cloud.rds': { status: 'UNKNOWN', timesUsed: 0 },
  'cloud.cloud-sql': { status: 'UNKNOWN', timesUsed: 0 },
  'cloud.security-group': { status: 'UNKNOWN', timesUsed: 0 },
  'cloud.cloud-firewall': { status: 'UNKNOWN', timesUsed: 0 },
  'cloud.cloud-costs': { status: 'UNKNOWN', timesUsed: 0 },
  'cloud.cloud-migration': { status: 'UNKNOWN', timesUsed: 0 },
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
          if (!req.targetBuildingType || req.targetBuildingType === type) {
            req.current += 1;
            if (req.current >= req.target) req.satisfied = true;
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

    set({
      farmState: {
        ...farmState,
        gold: farmState.gold - blueprint.constructionCost,
      },
      buildings: [...buildings, newBuilding],
      objectives: updatedObjectives,
      placementMode: { active: false, buildingType: null },
    });

    if (type === 'verdant-glasshouse') {
      get().discoverConcept('containers.docker');
      get().discoverConcept('containers.images');
      get().discoverConcept('databases.postgresql');
    } else if (type === 'helio-relay') {
      get().discoverConcept('networking.reverse-proxy');
      get().discoverConcept('networking.upstream');
      get().discoverConcept('networking.tls');
    } else {
      get().discoverConcept('linux.services');
      get().discoverConcept('networking.ports');
    }

    get().checkMilestones();

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
          (softwareId === 'irrigation-controller' && b.type === 'helio-pump') ||
          (softwareId === 'helio-relay' && b.type === 'helio-relay')
        ) {
          return { ...b, softwareStatus: 'DEPLOYED' as const };
        }
        return b;
      });

      get().practiceConcept('linux.services');
      get().discoverConcept('networking.ports');
      if (softwareId === 'helio-relay') {
        get().practiceConcept('networking.reverse-proxy');
        get().discoverConcept('networking.upstream');
        get().discoverConcept('networking.tls');
      }

      set({ buildings: updatedBuildings });
      get().checkMilestones();
    }

    return res;
  },

  dispatchHttp: (url, options = {}) => {
    const { serviceManager, practiceConcept, objectives } = get();
    const res = serviceManager.dispatchHttp(url, options);

    if (res.statusCode === 301) {
      practiceConcept('networking.http-redirect');
    }

    if (url.includes('solar-grove.local')) {
      practiceConcept('networking.reverse-proxy');
      if (url.startsWith('https://')) {
        practiceConcept('networking.tls');
      }
    }

    if (res.statusCode === 200) {
      practiceConcept('networking.http');

      // If user navigated to greenhouse.local:4000 or greenhouse.solar-grove.local successfully
      if (url.includes('greenhouse.local') || url.includes(':4000') || url.includes('greenhouse.solar-grove.local')) {
        practiceConcept('databases.postgresql');
        practiceConcept('databases.connection');
        practiceConcept('containers.health');

        // Fulfill Objective #14 (greenhouse-browser)
        const updatedObjectives = objectives.map((obj) => {
          const reqs = obj.requirements.map((req) => {
            if (req.type === 'greenhouse-browser') {
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

    get().checkMilestones();

    return res;
  },

  triggerIncident: (type = 'process-crash') => {
    const { incidentEngine, serviceManager, buildings } = get();

    if (type === 'greenhouse-auth-failure') {
      const ghBuilding = buildings.find((b) => b.type === 'verdant-glasshouse') || buildings[0];
      const buildingId = ghBuilding ? ghBuilding.id : 'bld-gh-1';
      const serviceName = 'greenhouse-controller';

      incidentEngine.triggerIncident(type, buildingId, serviceName);

      const updatedBuildings = buildings.map((b) => {
        if (b.type === 'verdant-glasshouse') {
          return {
            ...b,
            status: 'failed' as const,
            softwareStatus: 'UNHEALTHY' as const,
          };
        }
        return b;
      });

      set({
        activeIncidents: incidentEngine.getActiveIncidents(),
        buildings: updatedBuildings,
      });
      return;
    }

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

    if (inc.affectedServiceName === 'greenhouse-controller') {
      serviceManager.setGreenhouseDbPassword('greenhouse');
      const updatedBuildings = buildings.map((b) => {
        if (b.type === 'verdant-glasshouse') {
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
      return;
    }

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
      discoverConcept,
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
    } else if (lower.startsWith('docker pull')) {
      practiceConcept('containers.images');
    } else if (lower.startsWith('docker run')) {
      practiceConcept('containers.docker');
    } else if (lower.startsWith('docker compose') || lower.startsWith('docker-compose')) {
      practiceConcept('containers.compose');
    } else if (lower.startsWith('docker logs')) {
      practiceConcept('containers.logs');
    } else if (lower.startsWith('docker inspect')) {
      practiceConcept('linux.env');
    } else if (lower.startsWith('docker network')) {
      practiceConcept('containers.networking');
    } else if (lower.startsWith('env')) {
      practiceConcept('linux.env');
    }

    const result = await commandEngine.execute(cmd);

    if (result.unlockedCompetency) {
      learnCompetency(result.unlockedCompetency);
    }

    let extraOutput = '';

    // 1. Check Docker Pull objective (#10)
    if (
      serviceManager.hasLocalImage('solar-grove/greenhouse-controller:1.0') &&
      serviceManager.hasLocalImage('postgres:16')
    ) {
      const updatedObjectives = objectives.map((obj) => {
        const reqs = obj.requirements.map((req) => {
          if (req.type === 'docker-pull') {
            req.current = 2;
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

    // 2. Check Docker Compose Launch objective (#11) & trigger initial failure
    if (lower.includes('compose up') || lower.includes('compose start')) {
      const ghContainer = serviceManager.findContainer('greenhouse-controller');
      if (ghContainer && ghContainer.health === 'UNHEALTHY') {
        // Trigger initial failure incident (wrong password)
        const ghBuilding = buildings.find((b) => b.type === 'verdant-glasshouse') || buildings[0];
        const buildingId = ghBuilding ? ghBuilding.id : 'bld-gh-1';
        incidentEngine.triggerIncident(
          'greenhouse-auth-failure',
          buildingId,
          'greenhouse-controller'
        );

        const updatedBuildings = buildings.map((b) => {
          if (b.type === 'verdant-glasshouse') {
            return {
              ...b,
              status: 'failed' as const,
              softwareStatus: 'UNHEALTHY' as const,
            };
          }
          return b;
        });

        // Fulfill Objective #11 (docker-compose)
        const updatedObjectives = objectives.map((obj) => {
          const reqs = obj.requirements.map((req) => {
            if (req.type === 'docker-compose') {
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
          activeIncidents: incidentEngine.getActiveIncidents(),
          buildings: updatedBuildings,
          objectives: updatedObjectives,
        });

        discoverConcept('containers.health');
        discoverConcept('containers.logs');
      }
    }

    // 3. Check Diagnosis objective (#12)
    if (
      lower.includes('logs greenhouse-controller') ||
      lower.includes('inspect greenhouse-controller') ||
      lower === 'docker ps'
    ) {
      const updatedObjectives = objectives.map((obj) => {
        const reqs = obj.requirements.map((req) => {
          if (req.type === 'docker-diagnose') {
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

    // 4. Check Container Recovery & Incident Resolution (#13)
    const ghContainer = serviceManager.findContainer('greenhouse-controller');
    if (ghContainer && ghContainer.status === 'RUNNING' && ghContainer.health === 'HEALTHY') {
      const resolved = incidentEngine.resolveIncidentsForService('greenhouse-controller');
      if (resolved.length > 0) {
        extraOutput +=
          '\n\x1b[38;2;72;187;120m[GREENHOUSE CONTROLLER HEALTHY]\x1b[0m PostgreSQL linked. Accelerated Photosynthesis ACTIVE (+50% crop speed)!\n';

        const updatedBuildings = buildings.map((b) => {
          if (b.type === 'verdant-glasshouse') {
            return {
              ...b,
              status: 'healthy' as const,
              softwareStatus: 'HEALTHY' as const,
            };
          }
          return b;
        });

        const updatedObjectives = objectives.map((obj) => {
          const reqs = obj.requirements.map((req) => {
            if (req.type === 'greenhouse-healthy') {
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

        practiceConcept('databases.connection');
        practiceConcept('containers.health');

        set({
          activeIncidents: incidentEngine.getActiveIncidents(),
          buildings: updatedBuildings,
          objectives: updatedObjectives,
        });
      }
    }

    // 5. Check if command resolved native service incidents (Phase 2)
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
        } else if (b.type === 'helio-relay' && result.affectedService === 'helio-relay') {
          const svc = serviceManager.getService('helio-relay');
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

    // Phase 4: Check DNS lookup objective (#17)
    if (lower.includes('nslookup') || lower.includes('dig')) {
      if (lower.includes('solar-grove.local') || lower.includes('greenhouse') || lower.includes('irrigation')) {
        get().practiceConcept('networking.dns');
        const updatedObjectives = objectives.map((obj) => {
          const reqs = obj.requirements.map((req) => {
            if (req.type === 'dns-lookup') {
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

    if (lower.includes('certbot') || lower.includes('openssl')) {
      get().practiceConcept('networking.tls');
      get().practiceConcept('networking.certificates');
    }

    if (lower.includes('nginx')) {
      get().practiceConcept('networking.reverse-proxy');
      get().practiceConcept('networking.upstream');
    }

    // Phase 5: Cloud CLI tracking
    if (lower.startsWith('aws')) {
      get().practiceConcept('cloud.aws');
      if (lower.includes('ec2')) get().practiceConcept('cloud.ec2');
      if (lower.includes('rds')) get().practiceConcept('cloud.rds');
      if (lower.includes('s3')) get().practiceConcept('cloud.s3');
      if (lower.includes('security-groups')) get().practiceConcept('cloud.security-group');
    }

    if (lower.startsWith('gcloud')) {
      get().practiceConcept('cloud.gcp');
      if (lower.includes('compute')) get().practiceConcept('cloud.compute-engine');
      if (lower.includes('sql')) get().practiceConcept('cloud.cloud-sql');
      if (lower.includes('storage')) get().practiceConcept('cloud.cloud-storage');
      if (lower.includes('firewall-rules')) get().practiceConcept('cloud.cloud-firewall');
    }

    get().checkMilestones();

    return result.stdout + extraOutput;
  },

  checkMilestones: () => {
    const { serviceManager, buildings, objectives, farmState } = get();
    let anyChanged = false;
    let goldReward = 0;

    const proxyState = serviceManager.getReverseProxyState();
    const relayService = serviceManager.getService('helio-relay');
    const hasRelayBuilding = buildings.some((b) => b.type === 'helio-relay');

    const updatedObjectives = objectives.map((obj) => {
      let objChanged = false;
      const reqs = obj.requirements.map((req) => {
        if (req.satisfied) return req;

        let satisfied = false;
        if (req.type === 'build' && req.targetBuildingType === 'helio-relay') {
          satisfied = hasRelayBuilding;
        } else if (req.type === 'relay-deploy') {
          satisfied = relayService?.status === 'running';
        } else if (req.type === 'route-repair') {
          const ghRoute = proxyState.routes.find(
            (r) => r.id === 'route-greenhouse' || r.hostname.includes('greenhouse')
          );
          satisfied =
            ghRoute?.upstreamHost === 'greenhouse-controller' && ghRoute?.upstreamPort === 4000;
        } else if (req.type === 'cert-install') {
          const certs = serviceManager.getCertificates();
          satisfied = certs.some(
            (c) =>
              (c.domain === '*.solar-grove.local' || c.domain.includes('solar-grove.local')) &&
              c.status === 'VALID'
          );
        } else if (req.type === 'public-irrigation') {
          satisfied = proxyState.routes.some(
            (r) =>
              r.hostname === 'irrigation.solar-grove.local' &&
              r.upstreamPort === 8080 &&
              r.tlsRequired
          );
        } else if (req.type === 'cloud-account') {
          satisfied = serviceManager.getCloudAccounts().length > 0;
        } else if (req.type === 'cloud-vpc') {
          satisfied = serviceManager.getCloudVpcs().length > 0;
        } else if (req.type === 'cloud-subnets') {
          const subnets = serviceManager.getCloudSubnets();
          const pub = subnets.some((s) => s.type === 'public');
          const priv = subnets.some((s) => s.type === 'private');
          req.current = (pub ? 1 : 0) + (priv ? 1 : 0);
          satisfied = pub && priv;
        } else if (req.type === 'cloud-compute') {
          const instances = serviceManager.getCloudComputeInstances();
          satisfied = instances.some((i) => i.status === 'RUNNING');
        } else if (req.type === 'cloud-workload') {
          const instances = serviceManager.getCloudComputeInstances();
          satisfied = instances.some((i) => i.deployedApp === 'greenhouse-controller');
        } else if (req.type === 'cloud-database') {
          const dbs = serviceManager.getCloudDatabases();
          satisfied = dbs.some((d) => d.status === 'AVAILABLE' && d.engine === 'postgresql');
        } else if (req.type === 'cloud-db-endpoint') {
          const compute = serviceManager.getCloudComputeInstance('i-greenhouse-01');
          satisfied = !!compute?.environment.DATABASE_URL?.includes('greenhouse-db.internal');
        } else if (req.type === 'cloud-private-isolation') {
          const dbs = serviceManager.getCloudDatabases();
          satisfied = dbs.some((d) => !d.isPubliclyAccessible);
        } else if (req.type === 'cloud-security-group') {
          const reachability = serviceManager.getCloudManager().evaluateConnectivity('greenhouse-app', 'greenhouse-db', 5432);
          satisfied = reachability.allowed;
        } else if (req.type === 'cloud-migration') {
          const prog = serviceManager.getCloudMigrationProgress();
          satisfied = prog.phase === 'COMPLETE';
        } else if (req.type === 'cloud-storage') {
          const buckets = serviceManager.getCloudBuckets();
          satisfied = buckets.some((b) => b.objects.length >= 2);
        } else if (req.type === 'production-cloud') {
          const isCloud = serviceManager.getDeploymentTarget() === 'cloud';
          const isOptimized = serviceManager.isGreenhouseOptimized();
          const noIncidents = get().activeIncidents.length === 0;
          satisfied = isCloud && isOptimized && noIncidents;
        }

        if (satisfied) {
          req.current = req.target;
          req.satisfied = true;
          objChanged = true;
        }
        return req;
      });

      const isComplete = reqs.every((r) => r.satisfied);
      if (isComplete && !obj.completed) {
        objChanged = true;
        goldReward += obj.rewardGold;
        return {
          ...obj,
          requirements: reqs,
          completed: true,
        };
      }

      if (objChanged) {
        anyChanged = true;
        return {
          ...obj,
          requirements: reqs,
        };
      }
      return obj;
    });

    if (anyChanged || goldReward > 0) {
      set({
        farmState: {
          ...farmState,
          gold: farmState.gold + goldReward,
        },
        objectives: updatedObjectives,
      });
    }
  },

  tick: () => {
    const { farmState, buildings, serviceManager } = get();

    // 1. Check if Irrigation is actively delivering water (service running + pumping command)
    const isActivelyIrrigating =
      serviceManager.isIrrigationActivelyPumping() &&
      buildings.some((b) => b.type === 'helio-pump' && b.status === 'healthy');

    // 2. Check if Verdant Glasshouse is healthy & growth optimization is active
    const isGreenhouseOptimized =
      serviceManager.isGreenhouseOptimized() &&
      buildings.some((b) => b.type === 'verdant-glasshouse' && b.status === 'healthy');

    // 3. Check if Helio Relay Station is running
    const isRelayRunning = buildings.some(
      (b) => b.type === 'helio-relay' && b.status === 'healthy'
    );

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
      } else if (b.type === 'verdant-glasshouse') {
        if (serviceManager.getDeploymentTarget() === 'cloud') {
          const isOpt = serviceManager.isGreenhouseOptimized();
          b.status = isOpt ? 'healthy' : 'failed';
          b.softwareStatus = isOpt ? 'HEALTHY' : 'UNHEALTHY';
        } else {
          const c = serviceManager.findContainer('greenhouse-controller');
          if (c?.status === 'RUNNING' && c.health === 'HEALTHY') {
            b.status = 'healthy';
            b.softwareStatus = 'HEALTHY';
          } else if (c?.status === 'RUNNING' && c.health === 'UNHEALTHY') {
            b.status = 'failed';
            b.softwareStatus = 'UNHEALTHY';
          } else if (c?.status === 'STOPPED') {
            b.status = 'offline';
            b.softwareStatus = 'STOPPED';
          } else {
            b.status = 'offline';
            b.softwareStatus = 'NOT_DEPLOYED';
          }
        }
      } else if (b.type === 'helio-relay') {
        const s = serviceManager.getService('helio-relay');
        if (s?.status === 'running') {
          b.status = 'healthy';
          b.softwareStatus = 'HEALTHY';
        } else if (s?.status === 'failed') {
          b.status = 'failed';
          b.softwareStatus = 'CRASHED';
        } else {
          b.status = 'offline';
          b.softwareStatus = s?.deploymentStatus || 'NOT_DEPLOYED';
        }
      }
    }

    // 4. Water & Power consumption / generation
    let waterChange = 0;
    let powerChange = 0;

    if (isActivelyIrrigating) {
      waterChange -= 2; // Irrigation consumes 2 L / sec
      powerChange -= 1; // Consumes 1 kWh / sec
    } else {
      waterChange += 1; // Natural groundwater recharge
    }

    if (isGreenhouseOptimized) {
      powerChange -= 1; // Climate aerators consume power
    }

    if (isRelayRunning) {
      powerChange -= 3; // Solarpunk communications array consumes 3 kWh / sec
    }

    const newWater = Math.max(0, Math.min(farmState.maxWater, farmState.water + waterChange));
    const newPower = Math.max(0, Math.min(farmState.maxPower, farmState.power + powerChange));

    // 5. Crop Growth & Hydration
    const updatedCrops = farmState.crops.map((crop) => {
      if (crop.stage === 'mature') return crop;

      const def = CROPS[crop.cropType];
      if (!def) return crop;

      let growthRate = 1 / def.growthDurationSeconds;
      if (crop.hydration >= 50) growthRate *= 1.25;
      if (crop.hydration >= 80) growthRate *= 1.4;

      // Section 24: Phase 3 Greenhouse accelerated photosynthesis (+50% growth rate)
      if (isGreenhouseOptimized) {
        growthRate *= 1.5;
      }

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

    get().checkMilestones();
  },
}));
