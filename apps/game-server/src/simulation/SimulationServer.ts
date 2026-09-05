import { BUILDINGS, CROPS } from '@solar-grove/content';
import type { BuildingInstance, CropInstance, FarmState } from '@solar-grove/game-types';
import { IncidentEngine, ServiceManager } from '@solar-grove/infrastructure-model';

export class SimulationServer {
  public farmState: FarmState;
  public buildings: BuildingInstance[] = [];
  public serviceManager: ServiceManager;
  public incidentEngine: IncidentEngine;
  private intervalId: NodeJS.Timeout | null = null;
  private tickCount = 0;

  constructor() {
    this.serviceManager = new ServiceManager();
    this.incidentEngine = new IncidentEngine();

    this.farmState = {
      gold: 50, // Starting gold
      power: 100,
      maxPower: 200,
      water: 50,
      maxWater: 200,
      storage: 0,
      maxStorage: 100,
      gridWidth: 40,
      gridHeight: 40,
      crops: [],
      inventory: {
        sunroot: 0,
        glowberry: 0,
        'verdant-grain': 0,
      },
    };
  }

  start() {
    if (this.intervalId) return;
    // 1 tick per second
    this.intervalId = setInterval(() => this.tick(), 1000);
    console.log('[SimulationServer] Authoritative simulation loop started (1 tick/sec)');
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  tick() {
    this.tickCount++;

    // 1. Power & Water Generation from Buildings
    let totalWaterGen = 0;
    let _totalPowerConsumption = 0;

    for (const b of this.buildings) {
      const blueprint = BUILDINGS[b.type];
      if (!blueprint) continue;

      // Check linked service status
      if (b.type === 'helio-pump') {
        const service = this.serviceManager.getService('irrigation-controller');
        if (service?.status === 'running') {
          b.status = 'healthy';
          totalWaterGen += blueprint.waterOutputRate || 5;
          _totalPowerConsumption += blueprint.powerConsumption;
        } else {
          b.status = 'offline';
        }
      } else if (b.type === 'verdant-glasshouse') {
        const service = this.serviceManager.getService('greenhouse-api');
        if (service?.status === 'running') {
          b.status = 'healthy';
          _totalPowerConsumption += blueprint.powerConsumption;
        } else {
          b.status = 'offline';
        }
      }
    }

    // Update farm water reserves
    this.farmState.water = Math.min(this.farmState.maxWater, this.farmState.water + totalWaterGen);

    // 2. Crop Growth Processing
    const _cropsToRemove: string[] = [];

    for (const crop of this.farmState.crops) {
      if (crop.stage === 'mature') continue;

      const def = CROPS[crop.cropType];
      if (!def) continue;

      // Hydration consumption
      if (this.farmState.water >= def.waterPerTick) {
        this.farmState.water -= def.waterPerTick;
        crop.hydration = Math.min(100, crop.hydration + 10);
      } else {
        crop.hydration = Math.max(0, crop.hydration - 5);
      }

      // Growth progress rate influenced by hydration and buildings
      let growthIncrement = 1 / def.growthDurationSeconds;
      if (crop.hydration > 50) {
        growthIncrement *= 1.25; // Irrigation bonus
      }

      // Glasshouse bonus
      const hasGlasshouse = this.buildings.some(
        (b) => b.type === 'verdant-glasshouse' && b.status === 'healthy'
      );
      if (hasGlasshouse) {
        growthIncrement *= 1.4;
      }

      crop.growthProgress = Math.min(1.0, crop.growthProgress + growthIncrement);

      if (crop.growthProgress >= 1.0) {
        crop.stage = 'mature';
      } else if (crop.growthProgress >= 0.5) {
        crop.stage = 'growing';
      } else if (crop.growthProgress >= 0.2) {
        crop.stage = 'sprout';
      }
    }

    // Clean up or snapshot
  }

  addBuilding(type: BuildingInstance['type'], x: number, y: number): BuildingInstance {
    const instance: BuildingInstance = {
      id: `bld-${Date.now().toString(36)}`,
      type,
      x,
      y,
      width: 2,
      height: 2,
      status: 'offline',
      productionRate: 1.0,
      powerConsumption: 2,
      maintenanceCost: 1,
      constructedAt: Date.now(),
    };
    this.buildings.push(instance);
    return instance;
  }

  plantCrop(cropType: CropInstance['cropType'], x: number, y: number): CropInstance {
    const crop: CropInstance = {
      id: `crop-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      cropType,
      x,
      y,
      stage: 'seed',
      growthProgress: 0,
      hydration: 60,
      plantedAt: Date.now(),
      lastTick: Date.now(),
    };
    this.farmState.crops.push(crop);
    return crop;
  }

  harvestCrop(cropId: string): { success: boolean; goldEarned: number } {
    const index = this.farmState.crops.findIndex((c) => c.id === cropId);
    if (index === -1) return { success: false, goldEarned: 0 };

    const crop = this.farmState.crops[index];
    if (crop.stage !== 'mature') return { success: false, goldEarned: 0 };

    const def = CROPS[crop.cropType];
    const earned = def ? def.outputAmount * def.salePrice : 20;

    this.farmState.crops.splice(index, 1);
    this.farmState.gold += earned;
    this.farmState.inventory[crop.cropType] =
      (this.farmState.inventory[crop.cropType] || 0) + (def?.outputAmount || 4);

    return { success: true, goldEarned: earned };
  }
}
