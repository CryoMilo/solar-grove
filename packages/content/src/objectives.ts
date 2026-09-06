import type { ProgressionObjective } from '@solar-grove/game-types';

export const OBJECTIVES: ProgressionObjective[] = [
  {
    id: 'obj-1-earn-100-gold',
    index: 1,
    title: 'Goal 1 — Establish Capital',
    solarpunkTitle: '🌱 Soil and Seedlings',
    description:
      'Plant, grow, and harvest Sunroot crops from the farm soil to amass 100 Gold in farm reserves.',
    requirements: [
      {
        type: 'gold',
        description: 'Earn 100 Gold in treasury',
        target: 100,
        current: 0,
        satisfied: false,
      },
    ],
    completed: false,
    rewardGold: 25,
    unlocksBlueprintId: 'helio-pump',
  },
  {
    id: 'obj-2-plant-10-crops',
    index: 2,
    title: 'Goal 2 — Cultivate the Terraces',
    solarpunkTitle: '🌾 Verdant Canopy',
    description: 'Click on empty farm soil plots to sow seeds across the terraced grove.',
    requirements: [
      {
        type: 'plant',
        description: 'Plant 10 crops in soil',
        target: 10,
        current: 3, // 3 starter crops
        satisfied: false,
      },
    ],
    completed: false,
    rewardGold: 30,
  },
  {
    id: 'obj-3-harvest-10-crops',
    index: 3,
    title: 'Goal 3 — Bountiful Harvest',
    solarpunkTitle: '☀️ Solar Abundance',
    description:
      'Wait for crops to reach maturity (100% growth) and harvest them for direct market sale.',
    requirements: [
      {
        type: 'harvest',
        description: 'Harvest 10 mature crops',
        target: 10,
        current: 0,
        satisfied: false,
      },
    ],
    completed: false,
    rewardGold: 50,
  },
  {
    id: 'obj-4-build-irrigation-station',
    index: 4,
    title: 'Goal 4 — Construct Irrigation Station',
    solarpunkTitle: '💧 Deep Aquifer Rig',
    description:
      'Purchase and place the Helio Irrigation Station on the farm. Note: physical installation begins in an OFFLINE state until software is deployed!',
    requirements: [
      {
        type: 'build',
        description: 'Build Helio Irrigation Station (100 G)',
        target: 1,
        current: 0,
        satisfied: false,
        targetBuildingType: 'helio-pump',
      },
    ],
    completed: false,
    rewardGold: 50,
  },
  {
    id: 'obj-5-deploy-controller',
    index: 5,
    title: 'Goal 5 — Deploy Irrigation Controller',
    solarpunkTitle: '⚡ Digital Arteries',
    description:
      'Access the Pixel PC, open the Software Catalog to inspect requirements, and start the `irrigation-controller` service on port 8080.',
    requirements: [
      {
        type: 'service-online',
        description: 'Start irrigation-controller service on port 8080',
        target: 1,
        current: 0,
        satisfied: false,
        targetServiceName: 'irrigation-controller',
      },
    ],
    completed: false,
    rewardGold: 75,
  },
  {
    id: 'obj-6-irrigate-field',
    index: 6,
    title: 'Goal 6 — Activate Automated Irrigation',
    solarpunkTitle: '🌊 Furrow Saturation',
    description:
      'Open the simulated Browser in Pixel PC, navigate to http://irrigation.local:8080, and click [Start Irrigation] to begin water delivery.',
    requirements: [
      {
        type: 'irrigate',
        description: 'Activate irrigation from web console (http://irrigation.local:8080)',
        target: 1,
        current: 0,
        satisfied: false,
      },
    ],
    completed: false,
    rewardGold: 100,
  },
  {
    id: 'obj-7-earn-500-gold',
    index: 7,
    title: 'Goal 7 — Commercial Scale',
    solarpunkTitle: '🏛️ Grove Enterprise',
    description:
      'Leverage accelerated growth from automated irrigation (+40% speed) to reach a reserve of 500 Gold.',
    requirements: [
      {
        type: 'gold',
        description: 'Accumulate 500 Gold in treasury',
        target: 500,
        current: 0,
        satisfied: false,
      },
    ],
    completed: false,
    rewardGold: 150,
  },
  {
    id: 'obj-8-recover-incident',
    index: 8,
    title: 'Goal 8 — Incident Remediation',
    solarpunkTitle: '🛠️ Systems Resilience',
    description:
      'Investigate infrastructure anomalies using ps, systemctl, and journalctl, restart failed services, and verify recovery with curl.',
    requirements: [
      {
        type: 'incident-resolved',
        description: 'Diagnose and remediate a service crash in the Terminal',
        target: 1,
        current: 0,
        satisfied: false,
      },
    ],
    completed: false,
    rewardGold: 200,
  },
];
