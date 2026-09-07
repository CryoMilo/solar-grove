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
    description: 'Internal hostname resolution, A-records, and domain routing.',
    prerequisites: ['networking.ip'],
  },
  {
    id: 'networking.reverse-proxy',
    name: 'Reverse Proxy & Gateway',
    category: 'networking',
    description: 'Edge gateways, virtual hosts, and dispatching public requests to internal services.',
    prerequisites: ['networking.dns', 'networking.ports'],
  },
  {
    id: 'networking.upstream',
    name: 'Upstream Services',
    category: 'networking',
    description: 'Configuring backend service targets, socket paths, and diagnosing 502 Bad Gateway errors.',
    prerequisites: ['networking.reverse-proxy'],
  },
  {
    id: 'networking.tls',
    name: 'TLS & HTTPS Security',
    category: 'networking',
    description: 'Transport Layer Security encryption, port 443 termination, and handshake verification.',
    prerequisites: ['networking.http', 'networking.reverse-proxy'],
  },
  {
    id: 'networking.certificates',
    name: 'Certificates & ACME',
    category: 'networking',
    description: 'X.509 TLS certificate management, Let’s Encrypt automated ACME issuance, and validation.',
    prerequisites: ['networking.tls'],
  },
  {
    id: 'networking.http-redirect',
    name: 'HTTP to HTTPS Redirects',
    category: 'networking',
    description: 'Automatic 301 Moved Permanently redirects upgrading plain HTTP traffic to secure HTTPS.',
    prerequisites: ['networking.http', 'networking.tls'],
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
  {
    id: 'cloud.computing',
    name: 'Cloud Computing Fundamentals',
    category: 'cloud',
    description: 'On-demand computing resources, shared responsibility model, and cloud elasticity.',
    prerequisites: ['linux.services'],
  },
  {
    id: 'cloud.aws',
    name: 'Amazon Web Services (AWS)',
    category: 'cloud',
    description: 'Global cloud infrastructure, regions, availability zones, and AWS CLI.',
    prerequisites: ['cloud.computing'],
  },
  {
    id: 'cloud.gcp',
    name: 'Google Cloud Platform (GCP)',
    category: 'cloud',
    description: 'Google Cloud projects, regions, and the gcloud CLI tool.',
    prerequisites: ['cloud.computing'],
  },
  {
    id: 'cloud.vpc',
    name: 'Virtual Private Cloud (VPC)',
    category: 'cloud',
    description: 'Isolated virtual networks, CIDR block allocation, and cloud routing tables.',
    prerequisites: ['networking.ip', 'cloud.computing'],
  },
  {
    id: 'cloud.subnet',
    name: 'Subnets & CIDR Blocks',
    category: 'cloud',
    description: 'IP subnetting (/24), address ranges, and network segmentation.',
    prerequisites: ['cloud.vpc'],
  },
  {
    id: 'cloud.public-subnet',
    name: 'Public Subnets & Internet Gateways',
    category: 'cloud',
    description: 'Routing public inbound/outbound internet traffic to compute workloads.',
    prerequisites: ['cloud.subnet'],
  },
  {
    id: 'cloud.private-subnet',
    name: 'Private Subnets & Isolation',
    category: 'cloud',
    description: 'Shielding sensitive workloads and databases from direct internet exposure.',
    prerequisites: ['cloud.subnet'],
  },
  {
    id: 'cloud.ec2',
    name: 'Amazon EC2 Compute',
    category: 'cloud',
    description: 'Provisioning, lifecycle (start/stop), and instance types in AWS.',
    prerequisites: ['cloud.aws', 'cloud.public-subnet'],
  },
  {
    id: 'cloud.compute-engine',
    name: 'Google Compute Engine',
    category: 'cloud',
    description: 'Virtual machines and gcloud compute management on GCP.',
    prerequisites: ['cloud.gcp', 'cloud.public-subnet'],
  },
  {
    id: 'cloud.object-storage',
    name: 'Cloud Object Storage',
    category: 'cloud',
    description: 'Unstructured data storage outside VPC hierarchy for archives and backups.',
    prerequisites: ['cloud.computing'],
  },
  {
    id: 'cloud.s3',
    name: 'Amazon S3 Buckets',
    category: 'cloud',
    description: 'Bucket policies, object keys, and telemetry archiving via AWS CLI.',
    prerequisites: ['cloud.object-storage', 'cloud.aws'],
  },
  {
    id: 'cloud.cloud-storage',
    name: 'Google Cloud Storage',
    category: 'cloud',
    description: 'gs:// buckets, access control, and telemetry storage in GCP.',
    prerequisites: ['cloud.object-storage', 'cloud.gcp'],
  },
  {
    id: 'cloud.managed-database',
    name: 'Managed Relational Databases',
    category: 'cloud',
    description: 'Automated backups, patching, high availability, and database engine maintenance.',
    prerequisites: ['databases.postgresql', 'cloud.private-subnet'],
  },
  {
    id: 'cloud.rds',
    name: 'Amazon RDS PostgreSQL',
    category: 'cloud',
    description: 'PostgreSQL RDS instances, endpoints, and subnet group placement.',
    prerequisites: ['cloud.managed-database', 'cloud.aws'],
  },
  {
    id: 'cloud.cloud-sql',
    name: 'Google Cloud SQL',
    category: 'cloud',
    description: 'Managed PostgreSQL instances and connections on GCP.',
    prerequisites: ['cloud.managed-database', 'cloud.gcp'],
  },
  {
    id: 'cloud.security-group',
    name: 'Cloud Security Groups',
    category: 'cloud',
    description: 'Stateful virtual firewalls filtering compute-to-database TCP traffic.',
    prerequisites: ['networking.ports', 'cloud.vpc'],
  },
  {
    id: 'cloud.cloud-firewall',
    name: 'VPC Firewall Rules',
    category: 'cloud',
    description: 'Network-level ingress and egress filtering rules with priorities.',
    prerequisites: ['cloud.security-group'],
  },
  {
    id: 'cloud.cloud-costs',
    name: 'Cloud Cost Optimization & FinOps',
    category: 'cloud',
    description: 'Tracking hourly and daily compute, database, and storage operational expenses.',
    prerequisites: ['cloud.computing'],
  },
  {
    id: 'cloud.cloud-migration',
    name: 'Cloud Migration Lifecycle',
    category: 'cloud',
    description: 'Step-by-step workload transition (Preparing, Migrating, Verifying, Complete).',
    prerequisites: ['cloud.ec2', 'cloud.rds', 'cloud.security-group'],
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
  'networking.dns': {
    id: 'networking.dns',
    name: 'DNS A-Records',
    conceptName: 'DNS RESOLUTION',
    summary:
      'Domain Name System translates human-friendly hostnames into machine-routable IP addresses.',
    details:
      'A-records map greenhouse.solar-grove.local and irrigation.solar-grove.local to the Helio Relay Gateway IP (10.0.0.10). Query with nslookup or dig.',
  },
  'networking.reverse-proxy': {
    id: 'networking.reverse-proxy',
    name: 'Reverse Proxy & Gateway',
    conceptName: 'REVERSE PROXY',
    summary:
      'An intermediary server that terminates client requests and forwards them to private internal backends.',
    details:
      'Helio Relay runs Nginx listening on port 80 and 443, inspecting the Host header to route traffic to the appropriate farm microservice.',
  },
  'networking.upstream': {
    id: 'networking.upstream',
    name: 'Upstream Services',
    conceptName: 'UPSTREAM SERVICE',
    summary:
      'Backend servers that the reverse proxy forwards requests to. Misconfigurations cause 502 Bad Gateway.',
    details:
      'When the Relay tries to connect to greenhouse-app:4000 instead of greenhouse-controller:4000, the upstream connection fails and Nginx returns 502 Bad Gateway.',
  },
  'networking.tls': {
    id: 'networking.tls',
    name: 'TLS / HTTPS Security',
    conceptName: 'TLS ENCRYPTION',
    summary:
      'Cryptographic protocol that authenticates servers and encrypts communication over TCP port 443.',
    details:
      'TLS terminates at the Helio Relay gateway, protecting credentials and farm sensor telemetry from eavesdropping and tampering.',
  },
  'networking.certificates': {
    id: 'networking.certificates',
    name: 'Certificates & ACME',
    conceptName: 'TLS CERTIFICATE',
    summary:
      'Digitally signed identity documents issued by Certificate Authorities like Let’s Encrypt via ACME.',
    details:
      'Use Certificate Manager to perform automated ACME challenges and install signed certificates onto the Helio Relay.',
  },
  'networking.http-redirect': {
    id: 'networking.http-redirect',
    name: 'HTTP to HTTPS Redirect',
    conceptName: '301 REDIRECT',
    summary:
      'HTTP status code 301 informs clients to permanently upgrade their connection from plain HTTP to secure HTTPS.',
    details:
      'Visiting http://greenhouse.solar-grove.local responds with 301 Moved Permanently and Location: https://greenhouse.solar-grove.local.',
  },
  'cloud.computing': {
    id: 'cloud.computing',
    name: 'Cloud Computing',
    conceptName: 'CLOUD COMPUTING',
    summary: 'On-demand delivery of compute, database storage, and IT resources over the network.',
    details: 'Moving farm workloads from local containers to cloud infrastructure provides high durability and automated scaling.',
  },
  'cloud.vpc': {
    id: 'cloud.vpc',
    name: 'Virtual Private Cloud',
    conceptName: 'VPC',
    summary: 'A logically isolated section of the cloud where you launch resources in a virtual network you define.',
    details: 'solar-vpc-prod uses CIDR block 10.10.0.0/16 to securely house farm compute and database tiers.',
  },
  'cloud.subnet': {
    id: 'cloud.subnet',
    name: 'Subnets',
    conceptName: 'SUBNET',
    summary: 'A range of IP addresses in your VPC, segregated into public and private tiers.',
    details: 'Public subnets route through internet gateways; private subnets have no direct public internet route.',
  },
  'cloud.ec2': {
    id: 'cloud.ec2',
    name: 'EC2 Virtual Machine',
    conceptName: 'CLOUD COMPUTE',
    summary: 'Resizable compute capacity in the cloud running Linux virtual machines.',
    details: 'i-greenhouse-01 executes the Greenhouse Controller node process on a t3.micro virtual instance.',
  },
  'cloud.rds': {
    id: 'cloud.rds',
    name: 'Managed Relational Database',
    conceptName: 'MANAGED DATABASE',
    summary: 'Cloud-managed PostgreSQL service handling automated backups, patching, and hardware management.',
    details: 'greenhouse-db runs on port 5432 in a private subnet, reachable only by authorized compute security groups.',
  },
  'cloud.s3': {
    id: 'cloud.s3',
    name: 'Object Storage',
    conceptName: 'OBJECT STORAGE',
    summary: 'Highly scalable managed storage for objects and files, positioned outside VPC subnets.',
    details: 'solar-grove-telemetry-archive holds historical JSON sensor recordings for long-term farm analytics.',
  },
  'cloud.security-group': {
    id: 'cloud.security-group',
    name: 'Security Groups',
    conceptName: 'SECURITY GROUP',
    summary: 'A virtual firewall that controls inbound and outbound network traffic to cloud instances.',
    details: 'Rule allow-compute-to-postgres authorizes TCP 5432 traffic from greenhouse-app to greenhouse-db.',
  },
  'cloud.cloud-migration': {
    id: 'cloud.cloud-migration',
    name: 'Cloud Migration',
    conceptName: 'CLOUD MIGRATION',
    summary: 'Structured pipeline moving on-premise local farm workloads into production cloud infrastructure.',
    details: 'Follows PREPARING -> MIGRATING -> VERIFYING -> COMPLETE, updating edge ingress routing to cloud endpoints.',
  },
};

