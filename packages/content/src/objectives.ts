import type { ProgressionObjective } from '@solar-grove/game-types';

export const OBJECTIVES: ProgressionObjective[] = [
  {
    id: 'goal-1-first-harvest',
    index: 1,
    title: 'Goal 1 — First Harvest',
    solarpunkTitle: '🌱 Soil and Sun',
    description:
      'Plant Sunroot seeds in the farm soil, wait for them to mature under natural sunlight, and harvest them to establish initial funds.',
    requirements: [
      {
        type: 'gold',
        description: 'Earn 100 Gold from crop harvests',
        target: 100,
        current: 0,
        satisfied: false,
      },
    ],
    completed: false,
    rewardGold: 50,
    unlocksBlueprintId: 'helio-pump',
  },
  {
    id: 'goal-2-flow-of-water',
    index: 2,
    title: 'Goal 2 — Flow of Water',
    solarpunkTitle: '💧 Mechanized Aquifers',
    description:
      'Expand farm infrastructure by placing a physical Helio Pump near your crops. Manual watering is no longer sustainable.',
    requirements: [
      {
        type: 'gold',
        description: 'Amass 500 Gold for equipment acquisition',
        target: 500,
        current: 0,
        satisfied: false,
      },
      {
        type: 'build',
        description: 'Construct the physical Helio Pump structure',
        target: 1,
        current: 0,
        satisfied: false,
        targetBuildingType: 'helio-pump',
      },
    ],
    completed: false,
    rewardGold: 100,
  },
  {
    id: 'goal-3-bring-pump-online',
    index: 3,
    title: 'Goal 3 — Bring the Pump Online',
    solarpunkTitle: '⚡ Digital Arteries',
    description:
      'The pump is installed but offline! Access the Pixel PC terminal, inspect processes, and start the `irrigation-controller` service on port 3000.',
    requirements: [
      {
        type: 'service-online',
        description: 'Activate irrigation-controller service on port 3000',
        target: 1,
        current: 0,
        satisfied: false,
        targetServiceName: 'irrigation-controller',
      },
    ],
    completed: false,
    rewardGold: 200,
  },
  {
    id: 'goal-4-automate-grove',
    index: 4,
    title: 'Goal 4 — Automate the Grove',
    solarpunkTitle: '☀️ Solar Equilibrium',
    description:
      'With automated irrigation active, scale production: reach 1,000 Gold, harvest 50 Sunroots, and maintain 95% irrigation uptime.',
    requirements: [
      {
        type: 'gold',
        description: 'Reach a treasury balance of 1,000 Gold',
        target: 1000,
        current: 0,
        satisfied: false,
      },
      {
        type: 'harvest',
        description: 'Harvest 50 units of Sunroot',
        target: 50,
        current: 0,
        satisfied: false,
      },
      {
        type: 'uptime',
        description: 'Maintain 95% irrigation service uptime',
        target: 95,
        current: 0,
        satisfied: false,
      },
    ],
    completed: false,
    rewardGold: 500,
    unlocksBlueprintId: 'verdant-glasshouse',
  },
  {
    id: 'goal-5-container-garden',
    index: 5,
    title: 'Goal 5 — Container Garden',
    solarpunkTitle: '🌿 Microclimates in Docker',
    description:
      'Construct the Verdant Glasshouse and deploy its containerized climate control engine using Docker to unlock higher-tier crops.',
    requirements: [
      {
        type: 'build',
        description: 'Construct the Verdant Glasshouse',
        target: 1,
        current: 0,
        satisfied: false,
        targetBuildingType: 'verdant-glasshouse',
      },
      {
        type: 'service-online',
        description: 'Deploy greenhouse-api container via Docker',
        target: 1,
        current: 0,
        satisfied: false,
        targetServiceName: 'greenhouse-api',
      },
    ],
    completed: false,
    rewardGold: 1000,
  },
];
