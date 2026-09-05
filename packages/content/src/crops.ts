import type { CropDefinition } from '@solar-grove/game-types';

export const CROPS: Record<string, CropDefinition> = {
  sunroot: {
    id: 'sunroot',
    name: 'Sunroot',
    description:
      'A hardy, golden root vegetable that thrives under solar irrigation arrays. Foundation of early grove income.',
    growthDurationSeconds: 12,
    waterPerTick: 1,
    energyPerTick: 1,
    outputAmount: 4,
    salePrice: 5,
  },
  glowberry: {
    id: 'glowberry',
    name: 'Glowberry',
    description:
      'Bioluminescent berries engineered for maximum photovoltaic resonance. High commercial value in clean energy markets.',
    growthDurationSeconds: 24,
    waterPerTick: 2,
    energyPerTick: 2,
    outputAmount: 6,
    salePrice: 12,
  },
  'verdant-grain': {
    id: 'verdant-grain',
    name: 'Verdant Grain',
    description:
      'Dense photosynthetic grain designed for automated greenhouse microclimates and bulk regional export.',
    growthDurationSeconds: 40,
    waterPerTick: 3,
    energyPerTick: 3,
    outputAmount: 10,
    salePrice: 25,
  },
};
