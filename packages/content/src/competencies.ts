import type { CompetencyDefinition } from '@solar-grove/game-types';

export const COMPETENCIES: CompetencyDefinition[] = [
  // Linux
  {
    id: 'linux.filesystem',
    name: 'Linux Filesystem',
    category: 'linux',
    description: 'Mastery of directory structure, navigation, and file paths.',
    prerequisites: [],
  },
  {
    id: 'linux.processes',
    name: 'Processes & Signals',
    category: 'linux',
    description: 'Understanding execution states, PIDs, ps, and process lifecycles.',
    prerequisites: ['linux.filesystem'],
  },
  {
    id: 'linux.services',
    name: 'systemd Services',
    category: 'linux',
    description: 'Managing background units, autorestart, and systemctl status.',
    prerequisites: ['linux.processes'],
  },
  {
    id: 'linux.permissions',
    name: 'Permissions & Security',
    category: 'linux',
    description: 'User groups, chmod flags, and secure execution rights.',
    prerequisites: ['linux.filesystem'],
  },

  // Networking
  {
    id: 'networking.ip',
    name: 'IP Addressing',
    category: 'networking',
    description: 'Loopback, LAN subnets, and node reachability with ping.',
    prerequisites: [],
  },
  {
    id: 'networking.ports',
    name: 'TCP/UDP Ports',
    category: 'networking',
    description: 'Port allocation, binding collisions, and listening sockets.',
    prerequisites: ['networking.ip'],
  },
  {
    id: 'networking.http',
    name: 'HTTP & REST APIs',
    category: 'networking',
    description: 'HTTP methods, status codes, health checks, and curl diagnostics.',
    prerequisites: ['networking.ports'],
  },
  {
    id: 'networking.dns',
    name: 'DNS Resolution',
    category: 'networking',
    description: 'Internal hostname resolution and domain routing.',
    prerequisites: ['networking.ip'],
  },

  // Containers
  {
    id: 'containers.docker',
    name: 'Docker Fundamentals',
    category: 'containers',
    description: 'Container lifecycles, execution isolation, and docker CLI.',
    prerequisites: ['linux.processes'],
  },
  {
    id: 'containers.images',
    name: 'Container Images',
    category: 'containers',
    description: 'Layered filesystems, tagging, and registry management.',
    prerequisites: ['containers.docker'],
  },
  {
    id: 'containers.volumes',
    name: 'Persistent Volumes',
    category: 'containers',
    description: 'Mounting stateful data directories into ephemeral containers.',
    prerequisites: ['containers.docker', 'linux.filesystem'],
  },
  {
    id: 'containers.networking',
    name: 'Container Networks',
    category: 'containers',
    description: 'Bridge networks, port mapping, and inter-container communication.',
    prerequisites: ['containers.docker', 'networking.ports'],
  },

  // Databases
  {
    id: 'databases.sql',
    name: 'SQL Querying',
    category: 'databases',
    description: 'Structured tables, joins, aggregations, and data retrieval.',
    prerequisites: [],
  },
  {
    id: 'databases.postgresql',
    name: 'PostgreSQL Management',
    category: 'databases',
    description: 'ACID transactions, connection pools, and database maintenance.',
    prerequisites: ['databases.sql', 'linux.services'],
  },
  {
    id: 'databases.backups',
    name: 'Disaster Recovery & Backups',
    category: 'databases',
    description: 'Snapshot strategies, pg_dump, and restore verification.',
    prerequisites: ['databases.postgresql'],
  },

  // Cloud
  {
    id: 'cloud.compute',
    name: 'Cloud Virtual Machines',
    category: 'cloud',
    description: 'EC2 instance types, regions, and cost vs performance tradeoffs.',
    prerequisites: ['linux.services', 'networking.ip'],
  },
  {
    id: 'cloud.storage',
    name: 'Object Storage',
    category: 'cloud',
    description: 'S3 buckets, durability SLAs, and media asset storage.',
    prerequisites: ['networking.http'],
  },
  {
    id: 'cloud.monitoring',
    name: 'Observability & Metrics',
    category: 'cloud',
    description: 'Telemetry aggregation, thresholds, alerts, and incident response.',
    prerequisites: ['networking.http'],
  },
];

export interface ConceptDiscovery {
  id: string;
  name: string;
  conceptName: string;
  summary: string;
  details: string;
  listenPort?: number;
}

export const CONCEPT_DISCOVERIES: Record<string, ConceptDiscovery> = {
  'linux.processes': {
    id: 'linux.processes',
    name: 'Processes',
    conceptName: 'PROCESS',
    summary:
      'A process is an instance of a computer program that is being executed by one or many threads.',
    details:
      'The Irrigation Controller runs as an OS process with an assigned Process ID (PID). Commands like ps and top query active processes.',
  },
  'linux.services': {
    id: 'linux.services',
    name: 'Services',
    conceptName: 'SERVICE',
    summary:
      'A background service (daemon) is managed by systemd to keep vital infrastructure running automatically.',
    details:
      'The irrigation-controller.service unit allows starting, stopping, and auto-restarting when machine reboots or crashes occur.',
  },
  'networking.ports': {
    id: 'networking.ports',
    name: 'Ports',
    conceptName: 'PORT',
    summary: 'A network port identifies where a service accepts network connections.',
    details:
      'The Irrigation Controller listens on port 8080. When running, socket tools like ss -tulpn show 0.0.0.0:8080 LISTEN.',
    listenPort: 8080,
  },
  'networking.http': {
    id: 'networking.http',
    name: 'HTTP Protocol',
    conceptName: 'HTTP',
    summary:
      'Hypertext Transfer Protocol allows web clients and browsers to communicate with services via structured requests and responses.',
    details:
      'Web browsers and curl communicate with http://irrigation.local:8080 via HTTP GET and POST requests. HTTP 200 OK signals healthy operations.',
  },
};
