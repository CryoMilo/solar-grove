import type { CompetencyId, MicroLesson } from '@solar-grove/game-types';

export const MICRO_LESSONS: Record<CompetencyId, MicroLesson> = {
  'linux.processes': {
    id: 'linux.processes',
    title: '🌿 What is a Linux Process?',
    category: 'linux',
    readTimeSeconds: 45,
    summary: 'A process is an active, running instance of a program in memory.',
    explanation:
      'When Solar Grove runs the irrigation controller, Linux assigns it a unique Process ID (PID). You can inspect all running processes to confirm whether your automation software is actually executing.',
    suggestedCommand: 'ps',
    commandExplanation: 'Runs `ps` to display all active user processes and their PIDs.',
    whyFarmNeedsIt:
      'Your Helio Pump machine is physically built on the farm, but its controller process is not running. Without the process, water valves remain closed.',
  },
  'linux.services': {
    id: 'linux.services',
    title: '⚙️ Managing Services with systemd',
    category: 'linux',
    readTimeSeconds: 60,
    summary: 'Services are background programs managed automatically by systemd.',
    explanation:
      'Starting programs manually means they stop if your terminal closes. systemd acts as a supervisor: it launches services on boot, monitors their health, and automatically restarts them if they fail.',
    suggestedCommand: 'systemctl status irrigation-controller',
    commandExplanation: 'Checks if the irrigation controller systemd unit is active or stopped.',
    whyFarmNeedsIt:
      'To guarantee continuous 95%+ water uptime for your farm, the irrigation service must run as a managed system daemon.',
  },
  'networking.ports': {
    id: 'networking.ports',
    title: '🌐 Network Ports & Service Binding',
    category: 'networking',
    readTimeSeconds: 50,
    summary: 'A port is a designated communication endpoint where network services listen.',
    explanation:
      'Just like physical cables plug into sockets, network programs bind to specific numeric ports (like 3000 or 8080) so other farm systems know where to send irrigation commands and telemetry.',
    suggestedCommand: 'curl -I http://localhost:3000',
    commandExplanation:
      'Sends an HTTP HEAD request to verify port 3000 is open and accepting traffic.',
    whyFarmNeedsIt:
      'The farm central console monitors pump water pressure over port 3000. If the service binds to the wrong port, the pump cannot communicate.',
  },
  'containers.docker': {
    id: 'containers.docker',
    title: '📦 Modern Containers with Docker',
    category: 'containers',
    readTimeSeconds: 60,
    summary:
      'Containers package application code, dependencies, and runtime into one isolated unit.',
    explanation:
      'Instead of installing complex libraries directly onto your server, Docker packages the entire greenhouse climate controller into a lightweight container that runs identically everywhere.',
    suggestedCommand: 'docker ps',
    commandExplanation: 'Lists active Docker containers, their container IDs, and port forwards.',
    whyFarmNeedsIt:
      'The Verdant Glasshouse relies on advanced climate simulation software packaged as a Docker image. Deploying the container brings the greenhouse online.',
  },
  'containers.images': {
    id: 'containers.images',
    title: '🖼️ Container Images & Registries',
    category: 'containers',
    readTimeSeconds: 45,
    summary: 'Images are the immutable blueprints from which Docker containers are launched.',
    explanation:
      'A container image contains the operating system layer, Node.js runtime, and application code. You pull images from registries like Docker Hub or AWS ECR.',
    suggestedCommand: 'docker images',
    commandExplanation: 'Lists all cached container images ready for instantiation.',
    whyFarmNeedsIt:
      'Before running the greenhouse controller, verify the `solar-grove/greenhouse-controller` image is downloaded.',
  },
  'linux.filesystem': {
    id: 'linux.filesystem',
    title: '📁 Linux Filesystem Hierarchy',
    category: 'linux',
    readTimeSeconds: 40,
    summary: 'Linux organizes all files and devices starting from the root directory `/`.',
    explanation:
      'Farm applications live in `/opt/solargrove`, system configurations in `/etc`, and rotating logs in `/var/log`. Navigating the hierarchy lets you diagnose storage and config issues.',
    suggestedCommand: 'ls -la /opt/solargrove',
    commandExplanation: 'Lists files, permissions, and directories inside the Solargrove root.',
    whyFarmNeedsIt: 'Find configuration files and binary executables needed by farm machinery.',
  },
  'linux.permissions': {
    id: 'linux.permissions',
    title: '🔒 File Permissions and chmod',
    category: 'linux',
    readTimeSeconds: 45,
    summary: 'Permissions govern who can read, write, or execute files.',
    explanation:
      'If a controller script lacks execute (`+x`) permissions, attempting to launch it results in `Permission denied`. Use `chmod +x` to make scripts executable.',
    suggestedCommand: 'chmod +x /opt/solargrove/irrigation/start.sh',
    commandExplanation: 'Grants execute permissions to the startup script.',
    whyFarmNeedsIt: 'Ensure background automation scripts can be triggered by system supervisors.',
  },
  'networking.ip': {
    id: 'networking.ip',
    title: '📡 IP Addresses & Routing',
    category: 'networking',
    readTimeSeconds: 45,
    summary: 'Every device on a network has a unique IP address identifying its location.',
    explanation:
      '`127.0.0.1` refers to your local machine (localhost). When you expand to AWS or multi-node clusters, each compute node has its own IP.',
    suggestedCommand: 'ping -c 3 127.0.0.1',
    commandExplanation: 'Pings localhost to verify network stack health.',
    whyFarmNeedsIt: 'Check connectivity between the farm master console and remote cloud nodes.',
  },
  'networking.http': {
    id: 'networking.http',
    title: '🌐 HTTP Protocols & APIs',
    category: 'networking',
    readTimeSeconds: 50,
    summary: 'HTTP is the protocol powering communication between web servers and clients.',
    explanation:
      'Services expose REST endpoints. A `200 OK` means healthy, while a `502 Bad Gateway` or `Connection Refused` indicates an offline application.',
    suggestedCommand: 'curl http://localhost:3000/health',
    commandExplanation: 'Queries the application health check endpoint.',
    whyFarmNeedsIt:
      'Automated health monitors query `/health` every 10 seconds to detect failures.',
  },
  'networking.dns': {
    id: 'networking.dns',
    title: '🌐 DNS Hostname Resolution & A-Records',
    category: 'networking',
    readTimeSeconds: 50,
    summary: 'DNS maps human-readable domain names to numerical IP addresses.',
    explanation:
      'Instead of remembering numerical IP addresses like 10.0.0.10, DNS A-records map `greenhouse.solar-grove.local` to the Helio Relay Gateway IP address. Tools like `nslookup` and `dig` query the DNS nameserver (10.0.0.1).',
    suggestedCommand: 'nslookup greenhouse.solar-grove.local',
    commandExplanation: 'Queries the simulated nameserver for the A-record of the domain.',
    whyFarmNeedsIt:
      'Allows operators and automated farm sensors to reach services via stable hostnames instead of ephemeral IPs.',
  },
  'containers.volumes': {
    id: 'containers.volumes',
    title: '💾 Persistent Docker Volumes',
    category: 'containers',
    readTimeSeconds: 55,
    summary: 'Volumes persist data outside of the container lifecycle.',
    explanation:
      'By default, files written inside a container vanish when the container stops. Volumes mount a directory on the host server into the container to preserve farm records permanently.',
    suggestedCommand: 'docker volume ls',
    commandExplanation: 'Lists active persistent Docker storage volumes.',
    whyFarmNeedsIt:
      'Prevent crop yield history and soil moisture telemetry from being erased on restart.',
  },
  'containers.networking': {
    id: 'containers.networking',
    title: '🌐 Container Networks & Bridge',
    category: 'containers',
    readTimeSeconds: 55,
    summary: 'Docker networks allow multiple isolated containers to talk to each other securely.',
    explanation:
      'The greenhouse controller container communicates with the PostgreSQL container over an internal bridge network without exposing raw database ports to the open internet.',
    suggestedCommand: 'docker network ls',
    commandExplanation: 'Lists Docker network bridges and drivers.',
    whyFarmNeedsIt: 'Connect the greenhouse API container to the PostgreSQL storage backend.',
  },
  'databases.sql': {
    id: 'databases.sql',
    title: '🗄️ Structured Query Language (SQL)',
    category: 'databases',
    readTimeSeconds: 50,
    summary: 'SQL is the standard language for querying and managing relational databases.',
    explanation:
      'Tables store structured rows of data. Commands like `SELECT * FROM harvests WHERE crop = "sunroot";` retrieve analytics on farm productivity.',
    suggestedCommand: 'echo "SELECT count(*) FROM crops;"',
    commandExplanation: 'Executes a sample query against the farm database.',
    whyFarmNeedsIt: 'Track lifetime harvest yields, market prices, and inventory balances.',
  },
  'databases.postgresql': {
    id: 'databases.postgresql',
    title: '🐘 PostgreSQL Relational Database',
    category: 'databases',
    readTimeSeconds: 60,
    summary: 'PostgreSQL is a battle-tested, ACID-compliant relational database system.',
    explanation:
      'It provides robust transaction guarantees and high performance under heavy read/write workloads from automated sensor arrays.',
    suggestedCommand: 'systemctl status postgresql',
    commandExplanation: 'Verifies the PostgreSQL database server is running.',
    whyFarmNeedsIt:
      'Required by the Verdant Glasshouse to record soil conditions and growth formulas.',
  },
  'databases.backups': {
    id: 'databases.backups',
    title: '💾 Database Backups & Recovery',
    category: 'databases',
    readTimeSeconds: 50,
    summary: 'Scheduled backups safeguard against data loss caused by hardware or power failure.',
    explanation:
      '`pg_dump` creates a snapshot of your database that can be restored in seconds if corruption occurs.',
    suggestedCommand: 'pg_dump -U solargrove solargrove > backup.sql',
    commandExplanation: 'Dumps database schema and records to a backup file.',
    whyFarmNeedsIt: 'Protects against solar storm power outages corrupting historical crop data.',
  },
  'cloud.compute': {
    id: 'cloud.compute',
    title: '☁️ Elastic Cloud Compute (EC2)',
    category: 'cloud',
    readTimeSeconds: 60,
    summary:
      'Cloud compute provides scalable virtual machines on-demand without physical hardware.',
    explanation:
      'AWS EC2 instances allow you to provision servers in Singapore, Tokyo, or Frankfurt in seconds to run farm workloads with guaranteed uptime SLAs.',
    suggestedCommand: 'aws ec2 describe-instances',
    commandExplanation: 'Lists cloud virtual machine instances and their operational state.',
    whyFarmNeedsIt:
      'Scale beyond your single local farm server to support regional crop distribution hubs.',
  },
  'cloud.storage': {
    id: 'cloud.storage',
    title: '🪣 Cloud Object Storage (S3)',
    category: 'cloud',
    readTimeSeconds: 50,
    summary: 'Object storage provides virtually unlimited, durable storage for unstructured data.',
    explanation:
      'Amazon S3 stores camera snapshots, sensor logs, and firmware binaries with 99.999999999% durability.',
    suggestedCommand: 'aws s3 ls',
    commandExplanation: 'Lists S3 storage buckets.',
    whyFarmNeedsIt: 'Archive high-resolution multispectral farm satellite imagery.',
  },
  'cloud.monitoring': {
    id: 'cloud.monitoring',
    title: '📊 Cloud Observability & Metrics',
    category: 'cloud',
    readTimeSeconds: 55,
    summary: 'Monitoring systems aggregate metrics, logs, and traces into actionable dashboards.',
    explanation:
      'CloudWatch and Prometheus track CPU, memory, and error rates in real-time, firing alarms before incidents cascade into farm-wide outages.',
    suggestedCommand: 'aws cloudwatch get-metric-data',
    commandExplanation: 'Queries live infrastructure telemetry.',
    whyFarmNeedsIt:
      'Receive instant alerts when irrigation pump memory leaks or disk space runs low.',
  },
  'linux.env': {
    id: 'linux.env',
    title: '🌱 Environment Variables',
    category: 'linux',
    readTimeSeconds: 50,
    summary:
      'Environment variables configure applications externally without hardcoding secrets in code.',
    explanation:
      'Twelve-Factor applications store config in environment variables. Settings like DATABASE_URL, PORT, and NODE_ENV are injected at runtime, allowing the same container image to run in development, testing, and production.',
    suggestedCommand: 'env',
    commandExplanation: 'Prints all active environment variables in the current session.',
    whyFarmNeedsIt:
      'The Greenhouse Controller needs DATABASE_URL and PORT configured so it knows how to authenticate with PostgreSQL.',
  },
  'containers.compose': {
    id: 'containers.compose',
    title: '🎼 Multi-Container Orchestration with Docker Compose',
    category: 'containers',
    readTimeSeconds: 60,
    summary:
      'Docker Compose defines and runs multi-container Docker applications from a single YAML file.',
    explanation:
      'Instead of starting databases and backend services with separate, error-prone `docker run` flags, Docker Compose links services, virtual networks, and environment variables declaratively in `docker-compose.yml`.',
    suggestedCommand: 'docker compose up -d',
    commandExplanation: 'Builds, (re)creates, and starts all services in the background.',
    whyFarmNeedsIt:
      'The Verdant Glasshouse requires both PostgreSQL and the greenhouse-controller running together on an isolated network.',
  },
  'containers.logs': {
    id: 'containers.logs',
    title: '📜 Container Logging & Triage',
    category: 'containers',
    readTimeSeconds: 50,
    summary: 'Container logs capture stdout and stderr streams emitted by containerized processes.',
    explanation:
      'When a container fails or returns 502 Bad Gateway, inspecting its logs reveals uncaught exceptions, stack traces, and database authentication rejections.',
    suggestedCommand: 'docker logs greenhouse-controller',
    commandExplanation:
      'Fetches stdout and stderr streams from the greenhouse-controller container.',
    whyFarmNeedsIt:
      'Diagnose why the Greenhouse Controller is failing health checks without guessing.',
  },
  'containers.health': {
    id: 'containers.health',
    title: '🩺 Container Health Checks',
    category: 'containers',
    readTimeSeconds: 55,
    summary:
      'Health checks verify whether a running container is actually healthy and ready to serve traffic.',
    explanation:
      'A container process can be active while its internal logic is broken or disconnected from backing services. Health checks periodically query an endpoint (like `/health`) to verify genuine readiness.',
    suggestedCommand: 'docker ps',
    commandExplanation:
      'Displays container status alongside health state: (healthy), (unhealthy), or (starting).',
    whyFarmNeedsIt:
      'Prevents routing agricultural automation commands to broken containers and triggers incident alarms.',
  },
  'databases.connection': {
    id: 'databases.connection',
    title: '🔌 Database Connection Strings & Authentication',
    category: 'databases',
    readTimeSeconds: 60,
    summary:
      'Connection strings format protocol, user, credentials, host, port, and database name into a unified URI.',
    explanation:
      'A PostgreSQL connection string follows the format `postgresql://<user>:<password>@<host>:<port>/<dbname>`. If credentials do not match the database instance, connections are rejected with code 28P01 (invalid password).',
    suggestedCommand: 'docker inspect greenhouse-controller',
    commandExplanation:
      'Inspects container configuration, including injected environment variables.',
    whyFarmNeedsIt:
      'The greenhouse controller needs the correct database password in DATABASE_URL to record crop telemetry.',
  },
  'networking.reverse-proxy': {
    id: 'networking.reverse-proxy',
    title: '🔀 Nginx Reverse Proxy & Edge Gateways',
    category: 'networking',
    readTimeSeconds: 60,
    summary: 'A reverse proxy sits in front of backend servers, routing client requests based on hostname and path.',
    explanation:
      'Nginx listens on public ports 80 and 443. When a request arrives, Nginx examines the `Host` HTTP header and dispatches the request to the designated upstream application running in private subnets or Docker containers.',
    suggestedCommand: 'systemctl status helio-relay',
    commandExplanation: 'Checks if the Nginx reverse proxy daemon is active and listening.',
    whyFarmNeedsIt:
      'Helio Relay consolidates single-port public access across the irrigation and greenhouse systems without exposing raw container ports to the open network.',
  },
  'networking.upstream': {
    id: 'networking.upstream',
    title: '⚡ Upstream Services & 502 Bad Gateway',
    category: 'networking',
    readTimeSeconds: 55,
    summary: 'An upstream is the target backend server where the reverse proxy forwards traffic.',
    explanation:
      'If the proxy configuration specifies a typo in the upstream hostname or port (e.g. `greenhouse-app:4000` instead of `greenhouse-controller:4000`), Nginx cannot establish a TCP connection and returns `502 Bad Gateway`.',
    suggestedCommand: 'journalctl -u helio-relay',
    commandExplanation: 'Inspects Nginx error logs to find connection refused messages to upstream targets.',
    whyFarmNeedsIt:
      'Understanding the difference between a broken gateway route and an application crash is vital for triage.',
  },
  'networking.tls': {
    id: 'networking.tls',
    title: '🔒 TLS Encryption & HTTPS Port 443',
    category: 'networking',
    readTimeSeconds: 60,
    summary: 'Transport Layer Security encrypts web traffic and verifies server cryptographic identity.',
    explanation:
      'HTTPS uses TLS to encrypt requests and responses over port 443. Without a valid TLS certificate, web browsers block navigation with `Your connection is not private`.',
    suggestedCommand: 'openssl s_client -connect greenhouse.solar-grove.local:443 -servername greenhouse.solar-grove.local',
    commandExplanation: 'Initiates a diagnostic TLS handshake to inspect certificates and validation status.',
    whyFarmNeedsIt:
      'Secures agricultural telemetry and sensor control commands from tampering across the farm network.',
  },
  'networking.certificates': {
    id: 'networking.certificates',
    title: '📜 TLS Certificates & Automated ACME',
    category: 'networking',
    readTimeSeconds: 55,
    summary: 'Digital certificates bind cryptographic public keys to verified domain names.',
    explanation:
      'Automated Certificate Management Environment (ACME) protocols—used by Let’s Encrypt—automatically prove domain control, sign certificates, and install them into Nginx without manual key generation.',
    suggestedCommand: 'curl -I https://greenhouse.solar-grove.local',
    commandExplanation: 'Tests an encrypted HTTPS connection through the edge gateway.',
    whyFarmNeedsIt:
      'Allows issuing valid 90-day certificates to eliminate browser privacy warnings and enable production HTTPS.',
  },
  'networking.http-redirect': {
    id: 'networking.http-redirect',
    title: '↪️ HTTP to HTTPS 301 Redirects',
    category: 'networking',
    readTimeSeconds: 45,
    summary: '301 Moved Permanently redirects plain HTTP traffic on port 80 to secure HTTPS on port 443.',
    explanation:
      'When users type `http://...` or omit the protocol, Nginx responds with `301 Moved Permanently` and a `Location: https://...` header, instructing clients to upgrade their connection automatically.',
    suggestedCommand: 'curl -I http://greenhouse.solar-grove.local',
    commandExplanation: 'Inspects HTTP response headers to verify the 301 redirect response.',
    whyFarmNeedsIt:
      'Guarantees all farm operators are transparently routed to encrypted channels.',
  },
};
