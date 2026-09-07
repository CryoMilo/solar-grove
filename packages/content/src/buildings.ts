import type { BuildingBlueprint } from '@solar-grove/game-types';

export const BUILDINGS: Record<string, BuildingBlueprint> = {
  'helio-pump': {
    id: 'helio-pump',
    solarpunkName: '☀️ Helio Irrigation Station',
    actualTechnology: 'Linux Service (systemd) + Node.js 20 + HTTP 8080',
    description:
      'An automated solar-driven irrigation array that maintains optimal soil hydration for all adjacent crops, accelerating growth by 40%.',
    constructionCost: 100,
    powerConsumption: 2,
    waterOutputRate: 5,
    productionModifier: 1.4,
    softwareId: 'irrigation-controller',
    requiredCompetencies: ['linux.processes', 'linux.services', 'networking.ports'],
    requiredInfrastructure: {
      serviceName: 'irrigation-controller',
      expectedPort: 8080,
      runtime: 'node',
      deployment: 'bare-metal',
    },
  },
  'helio-irrigation-station': {
    id: 'helio-irrigation-station',
    solarpunkName: '☀️ Helio Irrigation Station',
    actualTechnology: 'Linux Service (systemd) + Node.js 20 + HTTP 8080',
    description:
      'An automated solar-driven irrigation array that maintains optimal soil hydration for all adjacent crops, accelerating growth by 40%.',
    constructionCost: 100,
    powerConsumption: 2,
    waterOutputRate: 5,
    productionModifier: 1.4,
    softwareId: 'irrigation-controller',
    requiredCompetencies: ['linux.processes', 'linux.services', 'networking.ports'],
    requiredInfrastructure: {
      serviceName: 'irrigation-controller',
      expectedPort: 8080,
      runtime: 'node',
      deployment: 'bare-metal',
    },
  },
  'verdant-glasshouse': {
    id: 'verdant-glasshouse',
    solarpunkName: '🌿 Verdant Glasshouse',
    actualTechnology: 'Docker Containers + PostgreSQL Database + HTTP 4000',
    description:
      'Controlled Growth Habitat optimizing temperature, humidity, and microclimate aeration. Boosts crop growth efficiency by 50%.',
    constructionCost: 150,
    powerConsumption: 4,
    productionModifier: 1.5,
    softwareId: 'greenhouse-controller',
    requiredCompetencies: ['containers.docker', 'containers.images', 'databases.postgresql'],
    requiredInfrastructure: {
      serviceName: 'greenhouse-controller',
      expectedPort: 4000,
      runtime: 'node',
      deployment: 'docker',
    },
  },
  'helio-relay': {
    id: 'helio-relay',
    solarpunkName: '📡 Helio Relay Station',
    actualTechnology: 'Nginx Reverse Proxy & TLS Gateway',
    description:
      'Central farm networking gateway providing DNS resolution, reverse proxy routing, and TLS certificate termination for all internal agricultural controllers.',
    constructionCost: 200,
    powerConsumption: 3,
    softwareId: 'helio-relay',
    requiredCompetencies: ['networking.ip', 'networking.dns', 'networking.reverse-proxy'],
    requiredInfrastructure: {
      serviceName: 'helio-relay',
      expectedPort: 443,
      runtime: 'nginx',
      deployment: 'bare-metal',
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
