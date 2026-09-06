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
  {
    id: 'linux.env',
    name: 'Environment Variables',
    category: 'linux',
    description:
      'Configuring application parameters, credentials, and runtime ports via env and inspect.',
    prerequisites: ['linux.processes'],
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
  {
    id: 'containers.compose',
    name: 'Docker Compose',
    category: 'containers',
    description: 'Multi-container orchestration, coordinated deployment, and service linking.',
    prerequisites: ['containers.docker', 'containers.networking'],
  },
  {
    id: 'containers.logs',
    name: 'Container Logs & Diagnostics',
    category: 'containers',
    description: 'Stream inspection, stderr output, and containerized service triage.',
    prerequisites: ['containers.docker'],
  },
  {
    id: 'containers.health',
    name: 'Container Health Checks',
    category: 'containers',
    description: 'Health status lifecycle (starting, healthy, unhealthy) and failure probes.',
    prerequisites: ['containers.docker'],
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
    id: 'databases.connection',
    name: 'Database Connection Strings',
    category: 'databases',
    description:
      'DATABASE_URL format, host networking, authentication, and connection failure triage.',
    prerequisites: ['databases.postgresql', 'linux.env'],
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
  'linux.env': {
    id: 'linux.env',
    name: 'Environment Variables',
    conceptName: 'ENVIRONMENT VARIABLES',
    summary:
      'Dynamic key-value pairs that configure application behavior and database credentials at runtime.',
    details:
      'DATABASE_URL, PORT, and NODE_ENV configure containerized applications without modifying source code. Inspect with docker inspect or env.',
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
  'containers.images': {
    id: 'containers.images',
    name: 'Container Images',
    conceptName: 'DOCKER IMAGE',
    summary:
      'Read-only templates containing code, runtime, system libraries, and settings required to run an application.',
    details:
      'Images like solar-grove/greenhouse-controller:1.0 and postgres:16 are pulled from registries using docker pull and listed with docker images.',
  },
  'containers.docker': {
    id: 'containers.docker',
    name: 'Docker Containers',
    conceptName: 'CONTAINER',
    summary:
      'Isolated, lightweight runtime environments sharing the host OS kernel while encapsulating binaries and dependencies.',
    details:
      'Docker containers are created from images using docker run or docker compose up. Query running containers with docker ps.',
  },
  'containers.networking': {
    id: 'containers.networking',
    name: 'Container Networking',
    conceptName: 'CONTAINER NETWORK',
    summary:
      'Virtual software-defined networks that allow containers to discover and reach each other by container name.',
    details:
      'The greenhouse-network bridge network allows greenhouse-controller to reach greenhouse-db:5432 using internal DNS resolution.',
  },
  'databases.postgresql': {
    id: 'databases.postgresql',
    name: 'PostgreSQL Database',
    conceptName: 'POSTGRESQL',
    summary:
      'An enterprise-grade open-source relational database providing ACID compliance and persistent structured tables.',
    details:
      'The greenhouse database stores telemetry, crop growth cycles, and yields. Runs containerized on port 5432 in greenhouse-db.',
  },
  'databases.connection': {
    id: 'databases.connection',
    name: 'Database Connections',
    conceptName: 'DATABASE CONNECTION',
    summary:
      'Standardized URI connection strings specifying protocol, credentials, network hostname, and target database.',
    details:
      'postgresql://greenhouse:greenhouse@greenhouse-db:5432/greenhouse routes requests to the database container with secure authentication.',
  },
  'containers.compose': {
    id: 'containers.compose',
    name: 'Docker Compose',
    conceptName: 'DOCKER COMPOSE',
    summary:
      'A multi-container orchestration tool that defines, networks, and launches coordinated application stacks with one command.',
    details:
      'docker compose up initializes the greenhouse-network, starts greenhouse-db, and links greenhouse-controller automatically.',
  },
  'containers.logs': {
    id: 'containers.logs',
    name: 'Container Logs',
    conceptName: 'CONTAINER LOGS',
    summary:
      'Real-time aggregation of standard output (stdout) and error streams (stderr) from inside containerized processes.',
    details:
      'docker logs greenhouse-controller reveals initialization messages, database connection attempts, and authentication errors.',
  },
  'containers.health': {
    id: 'containers.health',
    name: 'Container Health Checks',
    conceptName: 'CONTAINER HEALTH',
    summary:
      'Automated probes that monitor whether a running container is functioning correctly or degraded.',
    details:
      'Health checks differentiate between a container that is merely running and one that is healthy. If the database connection fails, health becomes UNHEALTHY.',
  },
};
