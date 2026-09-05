export type TileType = 'grass' | 'soil' | 'tilled' | 'path' | 'water';

export type CropType = 'sunroot' | 'glowberry' | 'verdant-grain';

export type CropStage = 'seed' | 'sprout' | 'growing' | 'mature' | 'wilted';

export interface CropDefinition {
  id: CropType;
  name: string;
  description: string;
  growthDurationSeconds: number; // Duration to grow to maturity
  waterPerTick: number;
  energyPerTick: number;
  outputAmount: number;
  salePrice: number; // Gold earned per harvest unit
}

export interface CropInstance {
  id: string;
  cropType: CropType;
  x: number; // Tile X
  y: number; // Tile Y
  stage: CropStage;
  growthProgress: number; // 0.0 to 1.0
  hydration: number; // 0 to 100
  plantedAt: number; // Timestamp
  lastTick: number;
}

export interface FarmState {
  gold: number;
  power: number; // Current kWh / energy
  maxPower: number;
  water: number; // Current Liters
  maxWater: number;
  storage: number; // Units in storage
  maxStorage: number;
  gridWidth: number; // Default 40
  gridHeight: number; // Default 40
  crops: CropInstance[];
  inventory: Record<CropType, number>;
}
