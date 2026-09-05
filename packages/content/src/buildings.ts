import type { BuildingBlueprint } from '@solar-grove/game-types';

export const BUILDINGS: Record<string, BuildingBlueprint> = {
  'helio-pump': {
    id: 'helio-pump',
    solarpunkName: '☀️ Helio Pump',
    actualTechnology: 'Linux Service (systemd) + Node.js + HTTP 3000',
    description:
      'An automated solar-driven irrigation array that maintains optimal soil hydration for all adjacent crops, accelerating growth by 30%.',
    constructionCost: 250,
    powerConsumption: 2,
    waterOutputRate: 5,
    productionModifier: 1.3,
    requiredCompetencies: ['linux.processes', 'linux.services', 'networking.ports'],
    requiredInfrastructure: {
      serviceName: 'irrigation-controller',
      expectedPort: 3000,
      runtime: 'node',
      deployment: 'bare-metal',
    },
  },
  'verdant-glasshouse': {
    id: 'verdant-glasshouse',
    solarpunkName: '🌿 Verdant Glasshouse',
    actualTechnology: 'Docker Container + PostgreSQL Database + HTTP 8080',
    description:
      'A climate-regulated solarpunk greenhouse optimizing ambient humidity and photosynthetic efficiency. Boosts crop yield by 40%.',
    constructionCost: 1000,
    powerConsumption: 8,
    productionModifier: 1.4,
    requiredCompetencies: ['containers.docker', 'containers.images', 'databases.postgresql'],
    requiredInfrastructure: {
      serviceName: 'greenhouse-api',
      expectedPort: 8080,
      runtime: 'node',
      deployment: 'docker',
    },
  },
  'sunvault-storage': {
    id: 'sunvault-storage',
    solarpunkName: '📦 Sunvault Storage',
    actualTechnology: 'Persistent Storage & Disk Partitioning',
    description:
      'Refrigerated, climate-controlled silo that expands farm harvest holding capacity by 200 units and reduces product spoilage.',
    constructionCost: 500,
    powerConsumption: 3,
    requiredCompetencies: ['linux.filesystem', 'linux.permissions'],
    requiredInfrastructure: {
      serviceName: 'storage-daemon',
      expectedPort: 9000,
      runtime: 'binary',
      deployment: 'bare-metal',
    },
  },
  'harvest-automaton': {
    id: 'harvest-automaton',
    solarpunkName: '⚙️ Harvest Automaton',
    actualTechnology: 'Background Worker Daemon & Message Queue',
    description:
      'Autonomous rover that continuously surveys the farm grid, harvesting mature crops immediately and depositing products into storage.',
    constructionCost: 2500,
    powerConsumption: 12,
    productionModifier: 1.5,
    requiredCompetencies: ['linux.services', 'cloud.compute'],
    requiredInfrastructure: {
      serviceName: 'harvest-worker',
      expectedPort: 4200,
      runtime: 'python',
      deployment: 'bare-metal',
    },
  },
};
