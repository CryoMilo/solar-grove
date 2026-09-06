# Solar Grove — Phase 3 Implementation Log
## Verdant Glasshouse — Containers, Environment Variables & PostgreSQL

**Phase Status**: COMPLETED  
**Target Milestone**: Multi-container Docker orchestration, environment variables, container health checks, PostgreSQL backing database, and incident triage required to operate the Verdant Glasshouse.

---

## 1. Objectives & Architectural Concepts

Phase 3 introduces modern containerization and database infrastructure as core farming gameplay mechanics. The player must manage, diagnose, and recover containerized services to unlock the agricultural benefits of the **Verdant Glasshouse** (Controlled Growth Habitat).

### Technical Concepts Integrated into Gameplay
1. **Container Images & Registries**: Immutable image blueprints (`solar-grove/greenhouse-controller:1.0`, `postgres:16`) pulled from simulated remote registries with layer verification and digest tracking.
2. **Container Isolation & Lifecycle**: Containers instantiated from images with independent virtual filesystems, port bindings (`-p 4000:4000`), and lifecycle states (`CREATED`, `RUNNING`, `STOPPED`, `CRASHED`).
3. **Multi-Container Orchestration (Docker Compose)**: Declarative multi-tier stacks defined in `/etc/greenhouse/docker-compose.yml`, managing both the web application and its backing database.
4. **Isolated Virtual Networks**: Bridged container networks (`greenhouse-network`) enabling inter-container DNS resolution (resolving `greenhouse-db` to internal container IP).
5. **Environment Variable Injection**: Runtime Twelve-Factor configuration (`PORT`, `NODE_ENV`, `DATABASE_URL`) passed into container runtime environments.
6. **Container Health Checks**: Periodic readiness probes evaluating application health (`HEALTHY`, `UNHEALTHY`, `STARTING`) independent of raw process execution.
7. **PostgreSQL Backing Service**: Relational database persistence storing crop telemetry, enforcing connection authentication (`28P01` error on password mismatch).
8. **Gateway & Infrastructure Errors**: Reverse proxy and HTTP dispatcher returning `502 Bad Gateway` upon upstream database failure and `200 OK` upon healthy operation.

---

## 2. Architecture & Domain Flow

```
SIMULATION / DOMAIN STATE
        │
        ├── Farm (Crops, Soil Moisture, Accelerated Photosynthesis Boost +50%)
        ├── Buildings (Helio Irrigation Station, Verdant Glasshouse)
        ├── SimulatedHost / ServiceManager
        │       ├── Native Linux Processes & Systemd Services (Phase 2)
        │       ├── Container Engine (Simulated Docker Daemon)
        │       │       ├── Remote Image Registry (pullImage, localImages)
        │       │       ├── Container Lifecycle (create, start, stop, restart, inspect, logs)
        │       │       ├── Container Health Monitor (health checks, DATABASE_URL evaluation)
        │       │       └── Virtual Networks (greenhouse-network, DNS mapping)
        │       ├── PostgreSQL Database State (schemas, greenhouse_telemetry table, auth)
        │       ├── Docker Compose Orchestrator (composeUp, composeDown, composePs, composeLogs)
        │       └── HTTP Dispatcher (routes greenhouse.local:4000)
        └── Incidents (greenhouse-auth-failure, container-crash)
                │
       ┌────────┴────────┐
       ↓                 ↓
    Phaser             React
    Renderer            UI
       │                 │
    Farm View         Pixel PC (Helios OS)
                      ├── Terminal (docker, docker compose, env)
                      ├── Browser (http://greenhouse.local:4000)
                      ├── Software Catalog (requirements, env vars)
                      └── Building Inspection Modal
```

---

## 3. Implementation Across System Layers

### Layer 1: Core Types & Content Packages
- **`packages/game-types`**:
  - Defined container structures: `DockerImage`, `SimulatedContainer`, `ContainerStatus`, `ContainerHealth`, `DockerNetwork`.
  - Defined PostgreSQL structures: `PostgresState`, `PostgresTelemetryRecord`.
  - Added Phase 3 competencies: `linux.env`, `containers.compose`, `containers.logs`, `containers.health`, `databases.connection`.
  - Expanded `ObjectiveRequirement` types: `docker-pull`, `docker-compose`, `docker-diagnose`, `greenhouse-healthy`, `greenhouse-browser`.
- **`packages/content`**:
  - Configured `verdant-glasshouse`: 150 G construction cost, 4 kW baseline power, `+50%` crop growth acceleration modifier.
  - Configured `greenhouse-controller` software: Node.js 20 runtime, port 4000, requirements (`Docker`, `PostgreSQL`, `Environment Variables`, `Container Network`), and environment variables (`PORT=4000`, `NODE_ENV=production`, `DATABASE_URL`).
  - Added Objectives 9–14 detailing the Glasshouse deployment progression.
  - Added Phase 3 micro-lessons in `micro-lessons.ts` explaining Twelve-Factor environment configuration, multi-container orchestration, logging, health probes, and database connection strings.

### Layer 2: Infrastructure Simulation (`packages/infrastructure-model`)
- **Docker Simulation Engine**:
  - Remote Registry caching `solar-grove/greenhouse-controller:1.0` (142 MB) and `postgres:16` (380 MB).
  - Virtual Network model with subnet allocation (`172.28.0.0/16`) and DNS resolution for inter-container communication.
  - Container health check evaluating `DATABASE_URL`:
    - Checks for user `greenhouse`, database `greenhouse`, host `greenhouse-db`, and password.
    - If password is `wrong-password`: marks container `UNHEALTHY`, logs `[FATAL] password authentication failed for user "greenhouse" (code 28P01)`.
    - If valid: marks container `HEALTHY`, logs successful connection and telemetry sync.
- **PostgreSQL Simulation Model**:
  - Maintains tables (`greenhouse_telemetry`, `growth_cycles`, `harvests`).
  - Accepts simulated telemetry inserts from the controller.
- **Docker Compose Orchestrator**:
  - Implemented `docker compose up -d`, `down`, `ps`, and `logs` reading virtual compose definitions.
- **HTTP Gateway Routing**:
  - Dispatches `http://greenhouse.local:4000`:
    - Returns `0 ERR_CONNECTION_REFUSED` if container is stopped/offline.
    - Returns `502 Bad Gateway` if container is running but `UNHEALTHY`.
    - Returns `200 OK` with telemetry payload if container is `HEALTHY`.

### Layer 3: Command Engine (`packages/command-engine`)
- Integrated full `docker` and `docker compose` command suite:
  - `docker pull <image>`
  - `docker images`
  - `docker run -d --name <name> -p <host:container> -e <KEY=VAL> --network <net> <image>`
  - `docker ps` (displays status and health: `Up X minutes (healthy)` vs `Up X minutes (unhealthy)`)
  - `docker stop <container>` / `docker start <container>` / `docker restart <container>`
  - `docker rm <container>`
  - `docker logs <container>`
  - `docker inspect <container>` (outputs formatted JSON with Config, Env, and NetworkSettings)
  - `docker network ls` / `docker network inspect <net>`
  - `docker compose` / `docker-compose` (`up`, `down`, `ps`, `logs`)
  - `env` (displays host environment variables)

### Layer 4: Client State & UI Experience (`apps/game-client`)
- **Building Inspection Modal**:
  - Specialized view for `verdant-glasshouse` displaying physical status, container health, backing database container, and network connectivity.
- **Software Catalog**:
  - Displays runtime requirements pills (`Docker`, `PostgreSQL`, `Environment Variables`, `Container Network`).
  - Displays environment variable table.
  - Action buttons supporting Docker terminal deployment and dynamic web links.
- **Simulated Browser**:
  - Navigating to `http://greenhouse.local:4000` renders:
    - **502 Bad Gateway Screen**: Displays upstream database failure explanation with Phase 3 diagnostic workflow suggestions (`docker ps`, `docker logs`, `docker inspect`).
    - **Solarpunk Verdant Glasshouse Dashboard**: Displays live aeroponic temperature (24.5°C), humidity (71%), soil moisture (82%), and **Growth Optimization: ACTIVE (+50%)**.
- **Farm Canvas & HUD**:
  - Construction bar features `Build Verdant Glasshouse (150 G)`.
  - Dynamic incident alert banner: `⚠ GREENHOUSE CONTROLLER UNAVAILABLE — The greenhouse controller cannot provide growth optimization...` with direct `[Troubleshoot (TAB)]` action.
  - Farm simulation loop automatically applies `+50%` growth boost to crops when the greenhouse controller is healthy.

---

## 4. End-to-End Gameplay & Diagnostic Walkthrough

1. **Construct Glasshouse**:
   - Player clicks **Build Verdant Glasshouse (150 G)** and places building on farm.
   - Building starts `OFFLINE`; unlocks `containers.docker` and `containers.images`.
2. **Inspect Catalog & Pull Images**:
   - In Helios OS, player views Greenhouse Controller in Software Catalog.
   - In Terminal, player runs:
     ```bash
     docker pull solar-grove/greenhouse-controller:1.0
     docker pull postgres:16
     docker images
     ```
3. **Launch Multi-Container Stack**:
   - Player runs `docker compose up -d`.
   - `greenhouse-network` is created; `greenhouse-db` and `greenhouse-controller` start.
4. **Observe Initial Failure**:
   - Player runs `docker ps`:
     - `greenhouse-db` is `Up 2 minutes (healthy)`
     - `greenhouse-controller` is `Up 2 minutes (unhealthy)`
   - Browser at `http://greenhouse.local:4000` returns `502 Bad Gateway`.
   - Farm HUD sounds incident alarm: `⚠ GREENHOUSE CONTROLLER UNAVAILABLE`.
5. **Diagnose**:
   - Player runs `docker logs greenhouse-controller` -> observes PostgreSQL password authentication error (`code 28P01`).
   - Player runs `docker inspect greenhouse-controller` -> observes `DATABASE_URL` contains `wrong-password`.
   - Player inspects `greenhouse-db` or environment variables to find valid credentials (`greenhouse:greenhouse`).
6. **Recover Container**:
   - Player stops, removes, and relaunches the container with the corrected environment:
     ```bash
     docker stop greenhouse-controller && docker rm greenhouse-controller
     docker run -d --name greenhouse-controller --network greenhouse-network -p 4000:4000 -e DATABASE_URL=postgresql://greenhouse:greenhouse@greenhouse-db:5432/greenhouse solar-grove/greenhouse-controller:1.0
     ```
   - Terminal outputs: `[GREENHOUSE CONTROLLER HEALTHY] PostgreSQL linked. Accelerated Photosynthesis ACTIVE (+50% crop speed)!`.
   - `docker ps` confirms both containers are `(healthy)`.
7. **Verify & Farm Acceleration**:
   - In Browser, `http://greenhouse.local:4000` renders the live Solarpunk Glasshouse Dashboard (200 OK).
   - Incident alert automatically clears from Farm HUD.
   - Farm crops grow at **1.5x speed**; power consumption increases by 1 kWh/tick.
   - Phase 2 Helio Irrigation Station (`irrigation.local:8080`) continues running concurrently.

---

## 5. Quality & Engineering Verification

- **Workspace Build**: All 6 packages compiled with exit code 0 (`pnpm --recursive run build`).
- **Linter & Formatting**: Biome passed with exit code 0 (`pnpm run check`).
- **Framerate & Performance**: Strict 30 FPS target maintained; Phaser game loop sleeps when Helios OS is open.
- **Simulation Frequency**: Centralized deterministic 1 Hz simulation tick.
