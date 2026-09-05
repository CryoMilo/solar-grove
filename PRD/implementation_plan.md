# Solar Grove - Master Implementation Plan

> **Solarpunk Pixel-Art Farming Game powered by Real Cloud & Infrastructure Simulation**
>
> Synthesized from:
> - `PRD/foundation_idea.md`
> - `PRD/implementation_trajectory.md`
> - `PRD/gameplay_tutorial_mechanic.md`

---

## 1. Architectural Philosophy & Principles

1. **The Farm Game is First-Class**: The player plays a farming simulation (`BUILD -> HOST -> OPERATE -> PRODUCE -> SELL -> EARN GOLD -> EXPAND`). Infrastructure is the underlying machinery that empowers the farm.
2. **Simulation as Single Source of Truth**: The simulation engine lives in framework-independent TypeScript packages. Phaser 4 is strictly the visual viewport. React is the "Helios OS" Pixel PC interface. State flows deterministically at 1 tick/second.
3. **The Building is the Curriculum (3-Layer Learning Loop)**:
   - *Layer 1: Discovery* — The building Blueprint displays requirement badges (🟢 Learned, 🟡 In Progress, 🔴 Not Learned).
   - *Layer 2: Micro-Lesson* — 30–90 second contextual primer with one-click terminal command launch (e.g. `ps`, `docker ps`).
   - *Layer 3: Mission / Task* — Practical hands-on remediation (e.g. `systemctl start irrigation-controller`) that immediately restores machine operation and boosts economic farm output.
4. **Transferable Knowledge Matrix**: Technical competencies persist across buildings; once Docker is mastered for the Glasshouse, it remains mastered for future industrial facilities.
5. **Modern Monorepo Stack**: `pnpm` workspaces + `@biomejs/biome` for linting/formatting + TypeScript + Vite + Phaser 4 + React 19 + xterm.js + Fastify + Socket.IO + Drizzle.

---

## 2. Monorepo Structure

```text
solar-grove/
├── apps/
│   ├── game-client/              # Phaser 4 + React 19 + Vite + xterm.js + Zustand
│   │   ├── src/
│   │   │   ├── game/             # Phaser 4 2D farm (scenes, entities, systems)
│   │   │   ├── pc/               # Helios OS Pixel PC (Terminal, Observatory, Cloud, Blueprints)
│   │   │   └── stores/           # Zustand client store bridge
│   └── game-server/              # Fastify + Socket.IO + Drizzle ORM
│       └── src/
│           ├── simulation/       # Authoritative tick simulation runner
│           └── db/               # PostgreSQL schema & migration definitions
├── packages/
│   ├── game-types/               # Domain interfaces (FarmState, Building, Learning, etc.)
│   ├── infrastructure-model/     # ComputeProvider, ServiceManager, Incident engine
│   ├── content/                  # Crops, Buildings, Blueprints, Micro-Lessons, Objectives
│   └── command-engine/           # Simulated Linux shell (ps, top, systemctl, docker, etc.)
├── pnpm-workspace.yaml
├── biome.json
├── tsconfig.base.json
├── docker-compose.yml
└── package.json
```

---

## 3. Detailed Component Plan

### Shared Packages (`packages/*`)

#### `@solar-grove/game-types`
- `FarmState`, `Crop`, `CropDefinition`, `CropStage`, `TileType`
- `Building`, `BuildingType`, `BuildingStatus`, `ApplicationInstance`, `BuildingBlueprint`
- `ComputeInstance`, `Metrics`, `Incident`, `CloudProviderType`
- `KnowledgeStatus`, `CompetencyId`, `CompetencyCategory`, `MicroLesson`, `PlayerKnowledgeMap`
- `Objective`, `ProgressionGoal`, `TerminalCommandContext`, `CommandResult`

#### `@solar-grove/infrastructure-model`
- `ComputeProvider` abstraction (`SimulatedLocalProvider`, `SimulatedAwsProvider`)
- `ServiceManager`: Systemd lifecycle (`systemctl start/stop/status`), container runtime (`docker run/ps/logs`)
- `IncidentEngine`: 5 MVP failures (process crash, wrong port, high CPU, memory leak, disk full) with causal triggers and remediation hooks

#### `@solar-grove/content`
- **Crops**: Sunroot, Glowberry, Verdant Grain
- **Buildings & Blueprints**:
  - *Helio Pump*: Requires Linux process, HTTP service, Port config
  - *Verdant Glasshouse*: Requires Docker, container networking, PostgreSQL
  - *Sunvault Storage*: Requires filesystem mount, persistent storage
  - *Harvest Automaton*: Requires background workers, queues
- **Micro-Lessons**:
  - `linux.processes` (`ps`, process ID concept)
  - `networking.ports` (HTTP service, port binding)
  - `docker.containers` (`docker ps`, container lifecycle)
  - `docker.logs` (troubleshooting degraded containers)
- **Objectives**: Goals 1–5 from PRD
- **Competency Taxonomy**: Solarpunk capability matrix

#### `@solar-grove/command-engine`
- Simulated shell parser and dispatcher
- Commands: `ps`, `top`, `systemctl`, `docker`, `curl`, `ping`, `cat`, `ls`, `help`, `status`, `journalctl`, `clear`
- Direct binding to `ServiceManager` and `PlayerKnowledgeMap`

---

### Applications (`apps/*`)

#### `apps/game-client`
- **Vite + React 19 + TypeScript + Phaser 4 + Zustand + @xterm/xterm**
- **Aesthetic**: Rich Solarpunk visual design (vibrant emerald foliage, solar amber warmth, glassmorphic Helios OS desktop, retro phosphor terminal scanlines).
- **Phaser Viewport**:
  - 40×40 tilemap grid with interactive player movement (WASD/arrows)
  - Procedural Solarpunk sprite/texture generation (crisp pixel art for player, crops, solar panels, water pumps, greenhouse)
  - Smooth animation, crop growth stages, building status indicators, harvest notifications
- **Helios OS (Pixel PC)**:
  - Toggle via `TAB` key or floating HUD button
  - Desktop environment with draggable, resizable windows:
    - `TerminalWindow`: xterm.js powered shell with autocomplete
    - `ObservatoryWindow`: Real-time CPU, RAM, Uptime, Latency gauges and error charts
    - `CloudConsoleWindow`: AWS EC2 / GCP simulated instance console
    - `BlueprintModal`: Building deployment requirements (🟢 Learned, 🟡 In Progress, 🔴 Not Learned)
    - `MicroLessonDrawer`: 30–90 second contextual tutorials with executable command triggers
    - `KnowledgeMapWindow`: Competency matrix visualization
    - `ObjectivesWindow`: Progress checklist (Goals 1–5)
- **Zustand Bridge**:
  - Deterministic 1-tick/sec client loop
  - Coordinates Phaser canvas events with Helios OS React state

#### `apps/game-server`
- **Fastify + Socket.IO + Drizzle ORM**
- Authoritative simulation tick runner
- Database schema for users, farms, buildings, competencies, incidents
- REST / WebSocket APIs for state sync and persistence

---

## 4. Verification Strategy

1. **Linting & Formatting**: `pnpm run check` (Biome)
2. **TypeScript Types & Builds**: `pnpm run build`
3. **Interactive Testing**:
   - Verify farm loop (planting, growing, harvesting Sunroots, gold increments)
   - Verify building loop (placing Helio Pump, encountering offline state)
   - Verify learning loop (inspecting Blueprint, opening Micro-Lesson, running `ps` and `systemctl start irrigation-controller`)
   - Verify economic feedback (Helio Pump online -> irrigation activates -> crop growth accelerates)
