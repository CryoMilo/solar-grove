Yes. I’d revise the spec in two major ways:

- Remove the controllable player entirely. The farm becomes an **isometric management/simulation view**, much closer to the reference image.
- Treat rendering/performance as a first-class architectural concern, especially because the game already caused noticeable heat on your MacBook.

Below is the rewritten full implementation document.

# Solar Grove

## Solarpunk Farming Simulation + Real-World Infrastructure Learning Game

### Full Implementation Specification for IDE AI

---

## 1. Project Vision

Build a browser-based **16-bit retro pixel-art solarpunk farming and economic simulation** called **Solar Grove**.

Solar Grove is first and foremost a farming, automation, and economic management game.

The visual direction should resemble classic isometric browser and PC farming games:

- 16-bit retro pixel graphics
- Isometric or elevated three-quarter perspective
- Dense farm layouts
- Bright natural colors
- Detailed buildings
- Crops and orchards
- Paths, fences, water systems
- Machines and utility structures
- Small environmental animations
- Solarpunk technology integrated naturally into the farm
- Solar panels, wind systems, water collectors, batteries, greenhouses, robotics, sensor stations, and sustainable infrastructure

Use the supplied screenshot as a **visual density, framing, scale, and composition reference**, while creating an original solarpunk visual identity.

There is **no movable player character**.

The player interacts with the world as a farm manager/operator through clicking, selecting, placing, upgrading, configuring, and inspecting buildings.

The core fantasy is:

> Build a beautiful automated solarpunk farm whose physical machinery depends on real software and infrastructure that you must deploy and maintain.

The player starts with simple agricultural systems and gradually operates a complex network of software-powered farming facilities.

The infrastructure exists because the farm needs it.

The player should not feel like they are completing a DevOps course.

They should feel like:

> "My farm needs this system to work, so I need to understand and operate the technology underneath it."

---

# 2. Core Gameplay Loop

The farming loop is:

```text
BUILD
↓
HOST
↓
OPERATE
↓
PRODUCE
↓
SELL
↓
EARN GOLD
↓
EXPAND
↓
AUTOMATE
↓
BUILD MORE
```

The infrastructure loop is:

```text
DEPLOY
↓
CONFIGURE
↓
CONNECT
↓
MONITOR
↓
MAINTAIN
↓
TROUBLESHOOT
↓
IMPROVE
↓
SCALE
```

These loops must directly affect each other.

Example:

```text
Build Helio Irrigation Station
        ↓
Physical station exists
        ↓
Irrigation Controller software is not hosted
        ↓
Station remains OFFLINE
        ↓
Automatic irrigation unavailable
        ↓
Player opens Controller PC
        ↓
Deploys Irrigation Controller
        ↓
Configures service + networking
        ↓
Tests application
        ↓
Station becomes HEALTHY
        ↓
Water reaches crop fields
        ↓
Crop yield increases
        ↓
Player earns more Gold
```

Infrastructure must create economic leverage.

---

# 3. Primary Design Principle

The most important design rule is:

> Never introduce technical knowledge without first creating a gameplay reason to need it.

Do not create traditional course progression such as:

```text
Linux Lesson 1
Linux Lesson 2
Docker Lesson 1
AWS Lesson 1
```

Instead:

```text
PLAYER WANTS NEW FARM CAPABILITY
↓
BUILDING UNLOCKS
↓
BUILDING REQUIRES SOFTWARE
↓
SOFTWARE REQUIRES INFRASTRUCTURE
↓
PLAYER ENCOUNTERS SOMETHING THEY DO NOT KNOW
↓
PLAYER INVESTIGATES / LEARNS
↓
PLAYER CONFIGURES THE SYSTEM
↓
SYSTEM WORKS
↓
FARM BENEFITS
```

Learning must emerge from necessity.

---

# 4. Game Presentation

Solar Grove has two primary interaction spaces:

```text
FARM WORLD
+
CONTROLLER PC
```

The farm is the primary visual experience.

The Controller PC is the technical operations environment.

The player switches between them.

There is no player avatar walking around the farm.

---

# 5. Farm World

The Farm World is an isometric management view rendered using Phaser.

The visual composition should feel similar to classic farming management games.

Example world composition:

```text
┌──────────────────────────────────────────┐
│ 🌳      ☀️ Solar Array      🌳            │
│                                          │
│      ┌───────────────┐                   │
│      │ Greenhouse    │    Orchard        │
│      └───────────────┘   🌳 🌳 🌳         │
│                                          │
│ 💧 Pump ───── Fields ───── Storage       │
│                                          │
│      Crops            Harvest Robot      │
│ █ █ █ █ █ █                🤖             │
│ █ █ █ █ █ █                               │
│                                          │
│     Controller Hub        Delivery Bay   │
└──────────────────────────────────────────┘
```

The player interacts through:

- Clicking buildings
- Selecting crops
- Placing buildings
- Moving structures if allowed
- Inspecting machines
- Opening infrastructure details
- Managing resources
- Viewing production
- Opening the Controller PC
- Responding to alerts
- Building roads/utilities
- Expanding land

Do not implement keyboard character movement.

---

# 6. Visual Style

Use an original **16-bit retro pixel-art solarpunk aesthetic**.

Visual qualities:

- Pixel-perfect sprites
- Small tile sizes
- Isometric buildings
- Strong silhouettes
- Warm natural materials
- Timber
- Stone
- Glass
- Copper
- Terracotta
- Green roofing
- Solar technology
- Water channels
- Wind turbines
- Greenhouses
- Dense vegetation
- Fruit trees
- Flowers
- Crop patches
- Sustainable machinery

Technology should appear embedded into nature.

Examples:

Traditional farmhouse:

```text
Wood + stone + vines + roof solar panels
```

Irrigation station:

```text
Water tank + pipes + photovoltaic controller + sensor mast
```

Server facility:

```text
Small climate-controlled utility shed
surrounded by vegetation and solar panels
```

Monitoring building:

```text
Observatory-like structure
with antennas and environmental sensors
```

Avoid sterile cyberpunk imagery.

Avoid neon-heavy dystopian visuals.

Avoid overly modern flat UI aesthetics in the farm view.

---

# 7. Camera

Use an isometric or approximately isometric camera.

Recommended interaction:

- Click and drag to pan
- Mouse-wheel zoom
- Touchpad pinch where possible
- Optional edge scrolling
- Building selection
- Smooth but restrained camera movement

Do not continuously move the camera unnecessarily.

The camera should support several zoom levels.

At distant zoom:

- Reduce animation detail
- Reduce particle effects
- Hide tiny decorations if necessary

This is important for performance.

---

# 8. Pixel PC

The farm contains a **Controller Terminal / Operations Computer**.

Clicking it opens the Pixel PC.

The PC is the player's infrastructure workstation.

Applications include:

```text
Terminal
Browser
Software Catalog
Machine Monitor
Cloud Console
Network Console
Database Console
Container Manager
Logs
Objectives
Architecture Viewer
File Manager
Knowledge
```

It should resemble a fictional retro operating system but use real technical terminology.

Example:

```text
SOLAR GROVE OS

┌───────────┬──────────────┬─────────────┐
│ Terminal  │ Browser      │ Software    │
├───────────┼──────────────┼─────────────┤
│ Machines  │ Network      │ Containers  │
├───────────┼──────────────┼─────────────┤
│ Cloud     │ Objectives   │ Knowledge   │
└───────────┴──────────────┴─────────────┘
```

---

# 9. Software Is a First-Class Game Entity

Every important automated building should have associated software.

A physical building is not simply purchased and activated.

It has:

```text
PHYSICAL SYSTEM
+
SOFTWARE SYSTEM
+
INFRASTRUCTURE
```

Example:

```text
HELIO IRRIGATION STATION
        │
        ├── Physical pump
        ├── Water tank
        ├── Sensors
        │
        └── Irrigation Controller software
                    │
                    ├── Runtime
                    ├── Process/container
                    ├── HTTP API
                    ├── Database
                    └── Networking
```

---

# 10. Software Catalog

Implement an application called:

## Software Catalog

This acts like an internal software registry/search tool.

The player can search for software associated with farm buildings.

Example:

```text
SOFTWARE CATALOG

Search...

Irrigation Controller
v1.4.2
Required by: Helio Irrigation Station
Status: NOT DEPLOYED

Greenhouse Controller
v2.1.0
Required by: Verdant Glasshouse
Status: RUNNING

Harvest Scheduler
v1.0.3
Required by: Harvest Automaton
Status: OFFLINE
```

Selecting software displays:

```text
IRRIGATION CONTROLLER v1.4.2

Runtime:
Node.js

Protocol:
HTTP

Application Port:
8080

Health Endpoint:
/health

Database:
PostgreSQL

Supported Deployment:
Bare Linux
Docker
AWS EC2

Current Deployment:
NONE

Status:
NOT HOSTED
```

---

# 11. Example Software Architecture by Building

## Helio Irrigation Station

Software:

```text
Irrigation Controller
```

Architecture:

```text
Node.js
HTTP
Linux process
PostgreSQL later
Docker later
```

Primary learning:

- Processes
- Services
- Ports
- HTTP
- Logs

---

## Verdant Glasshouse

Software:

```text
Greenhouse Controller
```

Architecture:

```text
Node.js
Docker
PostgreSQL
HTTP
```

Primary learning:

- Containers
- Images
- Environment variables
- Databases
- Container networking

---

## Sunvault Storage

Software:

```text
Storage Controller
```

Architecture:

```text
Node.js API
PostgreSQL
Filesystem/Object Storage
Backup service
```

Primary learning:

- Storage
- Disk usage
- Persistence
- Backups
- Database storage

---

## Harvest Automaton

Software:

```text
Harvest Scheduler
```

Architecture:

```text
Worker process
Redis
Job queue
Docker
```

Primary learning:

- Background workers
- Queues
- Caching
- Asynchronous systems

---

# 12. Hosting Must Resemble Real-World Hosting

The hosting workflow should be simplified but structurally accurate.

Example bare Linux deployment:

```text
Acquire server
↓
Connect to server
↓
Inspect filesystem
↓
Install runtime
↓
Download/clone application
↓
Install dependencies
↓
Configure environment
↓
Start process
↓
Configure service
↓
Open required port
↓
Test endpoint
↓
Monitor
```

Example Docker deployment:

```text
Acquire server
↓
Install Docker
↓
Pull/build image
↓
Create container
↓
Configure environment variables
↓
Configure port mapping
↓
Start container
↓
Connect database
↓
Test health endpoint
↓
Monitor
```

Example future cloud deployment:

```text
AWS EC2
↓
Docker
↓
Application container
↓
RDS PostgreSQL
↓
Security Group
↓
CloudWatch
```

Do not reduce deployment to:

```text
[HOST SOFTWARE]
```

with no technical interaction.

The player should perform meaningful operations.

---

# 13. Simulated Terminal

Use xterm.js for the terminal UI.

For MVP, implement a simulated shell and command engine.

Commands should behave consistently with game state.

Examples:

```bash
pwd
ls
cd
cat
ps
top
curl
ping
ss
systemctl
journalctl
docker ps
docker logs
docker start
docker stop
docker restart
git
ssh
```

Example:

```bash
docker ps
```

must query actual simulated container state.

Do not hardcode terminal outputs independently from infrastructure state.

---

# 14. Command Engine

Implement a reusable command registry.

Example conceptual structure:

```ts
interface CommandDefinition {
  name: string;
  description: string;
  syntax: string;
  handler: CommandHandler;
}
```

Example:

```text
docker ps
        ↓
ContainerCommandHandler
        ↓
InfrastructureSimulation
        ↓
List current containers
```

Terminal commands must operate on the same state used by the rest of the game.

---

# 15. Simulated Browser

Add a functional browser application inside the Controller PC.

This browser must understand the simulated Solar Grove network.

Example URL:

```text
http://irrigation.local:8080
```

Possible result:

```text
IRRIGATION CONTROLLER

System Status: ONLINE

Reservoir:
78%

Average Soil Moisture:
43%

Active Irrigation Zones:
3 / 5

[Start Irrigation]

[Stop Irrigation]
```

This is not just a static UI screen.

It should issue a simulated request through the networking layer.

---

# 16. Simulated Request Pipeline

Model requests such as:

```text
Browser
↓
DNS resolution
↓
Network route
↓
Host
↓
Port
↓
Application
↓
Endpoint
↓
Response
```

Example:

```text
http://irrigation.local:8080
```

should require:

- `irrigation.local` resolves
- host is reachable
- port 8080 is exposed
- application is running
- service is listening
- endpoint responds

If any layer fails, provide realistic symptoms.

---

# 17. Mistakes Are Learning Mechanics

Player mistakes are intentional gameplay.

Do not immediately correct mistakes.

Provide evidence.

Example configuration:

```text
Application listens:
8080

Container:
8080

Mapped host port:
8081
```

Player opens:

```text
http://irrigation.local:8080
```

Result:

```text
ERR_CONNECTION_REFUSED
```

The player investigates:

```bash
docker ps
```

Result:

```text
PORTS
0.0.0.0:8081 -> 8080/tcp
```

Then:

```bash
curl http://localhost:8081
```

works.

The player learns port mapping by troubleshooting.

---

# 18. Learning System

Use knowledge/capability progression instead of traditional XP.

Categories:

```text
Linux
Networking
Containers
Databases
Cloud
DevOps
Monitoring
Security
Distributed Systems
```

Example:

```text
Networking

IP Addresses         COMPETENT
Ports                PRACTICED
HTTP                 PRACTICED
DNS                  DISCOVERED
TLS                  UNKNOWN
Routing              UNKNOWN
```

---

# 19. Knowledge States

Use meaningful states:

```text
UNKNOWN
DISCOVERED
LEARNING
PRACTICED
COMPETENT
MASTERED
```

Avoid arbitrary stats such as:

```text
Docker XP: 482
```

The system should represent capabilities, not RPG experience.

---

# 20. Learning Modes

Technical concepts can appear through three modes.

## Guided

For first exposure.

Example:

```text
The irrigation controller is a running Linux process.

Use:

ps

to inspect running processes.
```

---

## Discovery

The game gives evidence.

Example:

```text
Irrigation Station
STATUS: OFFLINE

System message:
controller process unavailable
```

Player investigates.

---

## Mastery

No direct guidance.

Example:

```text
INCIDENT

Irrigation production dropped to 0%.

Restore the service.
```

The player diagnoses independently.

---

# 21. Hint System

Hints should be progressive.

Example:

Hint 1:

```text
Check whether the application is running.
```

Hint 2:

```text
Inspect active processes.
```

Hint 3:

```text
Try ps.
```

Hint 4:

```text
The irrigation-controller process is missing.
```

Hint 5:

```text
Start irrigation-controller using systemctl.
```

Do not reveal the final answer immediately.

---

# 22. Incident System

Infrastructure failures are core gameplay.

Possible incidents:

- Process crash
- Wrong port
- Service unavailable
- Missing environment variable
- Database offline
- Wrong credentials
- High CPU
- Memory leak
- Disk full
- DNS failure
- Firewall rule
- TLS certificate issue
- Cache unavailable
- Queue backlog
- Bad deployment
- Broken software version

Failures should be deterministic or explainable.

Avoid arbitrary randomness without evidence.

---

# 23. Incident Structure

Conceptually:

```ts
interface Incident {
  id: string;
  affectedResourceId: string;
  severity: IncidentSeverity;
  symptoms: Symptom[];
  rootCause: RootCause;
  evidence: Evidence[];
  possibleActions: string[];
  learningConcepts: string[];
}
```

The player should initially see symptoms, not root causes.

---

# 24. Physical Impact of Infrastructure

Software failure must visibly affect the farm.

Example irrigation:

```text
HEALTHY
100% irrigation output

DEGRADED
50% irrigation output

OFFLINE
0% automatic irrigation
```

Example greenhouse:

```text
HEALTHY
+40% crop growth

DEGRADED
+15%

OFFLINE
0% bonus
```

Example storage:

```text
HEALTHY
0% excess spoilage

DEGRADED
2% spoilage/day

OFFLINE
5% spoilage/day
```

---

# 25. Visual Failure Feedback

Farm buildings should visibly communicate infrastructure state.

Healthy:

- Normal animation
- Active lights
- Water flowing
- Robots moving
- Fans spinning

Degraded:

- Slower animation
- Warning light
- Reduced activity

Offline:

- Machinery stops
- Water stops
- Screens dark
- Warning marker
- Workers/robots idle

Do not require opening the PC simply to know something is wrong.

---

# 26. Software Lifecycle

Software should have versions.

Example:

```text
Irrigation Controller

v1.4.2
v1.5.0
v1.5.1
```

Updates may introduce:

- Features
- Performance improvements
- Bug fixes
- New configuration
- Breaking changes
- Vulnerabilities
- Regressions

This enables later gameplay around:

- Updates
- Rollbacks
- Release management
- Deployment strategies

---

# 27. Goals Instead of Character Levels

Do not use:

```text
Player Level 12
```

Use objectives.

Examples:

```text
Earn 100 Gold

Grow 50 Sunroot

Automate irrigation

Maintain irrigation uptime above 95%

Operate 3 automated buildings

Deploy first Docker container

Store 500 units of produce

Build backup system

Operate multiple farms
```

Goals unlock opportunities.

Knowledge enables execution.

---

# 28. Economy

Initial resources:

```text
Gold
Energy
Water
Produce
Storage
```

Example crops:

```text
Sunroot
Glowberry
Verdant Grain
```

Example:

```text
Sunroot

Growth:
60 sec

Sell price:
5 Gold

Water:
Medium

Greenhouse modifier:
+40%
```

Infrastructure should make the farm economically stronger.

---

# 29. Power Is a Core Solarpunk Mechanic

Energy should matter.

Possible sources:

- Solar panels
- Wind turbines
- Battery storage
- Bio-energy later

Infrastructure consumes power.

Example:

```text
Irrigation Station
8 kW

Greenhouse Controller
4 kW

Cold Storage
16 kW

Compute Cluster
12 kW
```

If energy becomes insufficient:

```text
Infrastructure throttles
Machines degrade
Production drops
```

This connects solarpunk worldbuilding directly to systems gameplay.

---

# 30. Data-Driven Buildings

Buildings should be defined in content files rather than hardcoded components.

Example:

```ts
interface BuildingDefinition {
  id: string;
  name: string;
  constructionCost: number;

  softwareId?: string;

  powerConsumption: number;
  waterConsumption: number;

  productionEffects: ProductionEffect[];

  requirements: string[];
}
```

Example:

```ts
const verdantGlasshouse = {
  id: "verdant-glasshouse",
  name: "Verdant Glasshouse",

  constructionCost: 2500,

  softwareId: "greenhouse-controller",

  powerConsumption: 12,

  requirements: [
    "linux.processes",
    "docker.basics",
    "networking.ports",
    "postgres.basics",
  ],
};
```

---

# 31. Software Model

Software should also be data-driven.

Example:

```ts
interface SoftwareDefinition {
  id: string;
  name: string;
  version: string;

  runtime: "node" | "python" | "nginx";

  ports: number[];

  healthEndpoint?: string;

  dependencies: {
    database?: string;
    cache?: string;
    queue?: string;
  };

  deploymentOptions: DeploymentType[];

  learningRequirements: string[];
}
```

---

# 32. Infrastructure Model

Infrastructure should contain real concepts.

Represent:

```text
Compute
Operating System
Process
Service
Container
Container Image
Port
Network
DNS
HTTP
TLS
Database
Cache
Queue
Storage
Monitoring
Load Balancer
Firewall
Cloud Resource
```

Each is simulated but technically meaningful.

---

# 33. Real Technical Terminology

Solapunk names apply to fictional buildings.

Real names apply to technology.

Example:

```text
VERDANT GLASSHOUSE

Infrastructure

Application:
Node.js

Container Runtime:
Docker

Database:
PostgreSQL

Compute:
AWS EC2

Networking:
HTTP / HTTPS

Monitoring:
CloudWatch
```

Do not rename Docker into something fictional like:

```text
Seed Capsule Engine
```

This would reduce educational value.

---

# 34. Cloud Providers

Use real providers later.

AWS:

```text
EC2
S3
RDS
CloudWatch
VPC
Route 53
ECS
ECR
```

Google Cloud:

```text
Compute Engine
Cloud Storage
Cloud SQL
Cloud Monitoring
VPC
Artifact Registry
Cloud Run
```

Normal gameplay uses simulated resources.

No real billing is required.

---

# 35. Provider Abstraction

Create interfaces such as:

```ts
interface ComputeProvider {
  createInstance(config: ComputeInstanceConfig): Promise<ComputeInstance>;

  stopInstance(id: string): Promise<void>;

  restartInstance(id: string): Promise<void>;

  getMetrics(id: string): Promise<Metrics>;
}
```

Implement initially:

```text
SimulatedLocalProvider
SimulatedAwsProvider
SimulatedGcpProvider
```

Real cloud integrations come much later.

---

# 36. Monitoring

The Controller PC should provide monitoring.

Metrics:

```text
CPU
Memory
Disk
Network
Latency
Uptime
Requests
Errors
Application health
Container health
Database health
```

Example:

```text
IRRIGATION CONTROLLER

Status:
HEALTHY

CPU:
21%

Memory:
384 MB

Uptime:
13h 21m

Requests:
2,417

Error rate:
0.4%

Latency:
38ms
```

---

# 37. Game Architecture

Recommended technologies:

## Client

```text
React
TypeScript
Vite
Phaser
Zustand
xterm.js
```

React handles:

- Main shell
- Pixel PC
- UI overlays
- Menus
- Terminal
- Browser
- Monitoring
- Objectives

Phaser handles:

- Isometric farm
- Sprites
- Buildings
- Crops
- Decorations
- Visual animations
- Camera
- Interaction zones

---

## Backend

```text
Node.js
TypeScript
Fastify or Express
Socket.IO
PostgreSQL
Drizzle ORM
```

Add Redis only when required.

---

# 38. Repository Structure

```text
solar-grove/

├── apps/
│
│   ├── game-client/
│   │
│   │   └── src/
│   │
│   │       ├── game/
│   │       │   ├── scenes/
│   │       │   ├── world/
│   │       │   ├── buildings/
│   │       │   ├── crops/
│   │       │   ├── rendering/
│   │       │   ├── interaction/
│   │       │   └── effects/
│   │       │
│   │       ├── pc/
│   │       │   ├── Terminal/
│   │       │   ├── Browser/
│   │       │   ├── SoftwareCatalog/
│   │       │   ├── Monitoring/
│   │       │   ├── CloudConsole/
│   │       │   ├── Objectives/
│   │       │   └── Knowledge/
│   │       │
│   │       ├── components/
│   │       └── stores/
│   │
│   └── game-server/
│       │
│       └── src/
│           ├── simulation/
│           ├── economy/
│           ├── infrastructure/
│           ├── software/
│           ├── networking/
│           ├── terminal/
│           ├── browser/
│           ├── incidents/
│           ├── learning/
│           └── persistence/
│
├── packages/
│
│   ├── game-types/
│   ├── content/
│   ├── command-engine/
│   ├── infrastructure-model/
│   └── simulation-engine/
│
├── docker-compose.yml
└── package.json
```

---

# 39. Architecture Rule: Phaser Does Not Own Game Logic

Critical requirement:

> Phaser is a renderer, not the simulation engine.

Do not place economy, infrastructure, crop progression, or objective logic inside Phaser scenes.

Correct architecture:

```text
Simulation Engine
        │
        ├──────────────→ Phaser Farm Renderer
        │
        ├──────────────→ React UI
        │
        └──────────────→ Controller PC
```

The simulation engine is the source of truth.

---

# 40. Simulation Frequency

Do not calculate full game simulation on every rendering frame.

Use separate loops.

Example:

```text
VISUAL RENDER LOOP
30–60 FPS

SIMULATION LOOP
1 tick / second
```

Simulation may update:

```ts
updatePower();
updateWater();
updateCrops();
updateBuildings();
updateSoftware();
updateInfrastructure();
updateProduction();
updateStorage();
updateEconomy();
updateIncidents();
updateObjectives();
```

The renderer displays the resulting state.

---

# 41. Performance and MacBook Overheating Requirements

Performance is a first-class requirement.

The current development build has already caused significant MacBook heat.

Do not assume the application needs continuous maximum-rate rendering.

The architecture must minimize unnecessary:

```text
CPU usage
GPU usage
React renders
Phaser redraws
JavaScript timers
Object allocations
WebSocket traffic
Background updates
```

---

# 42. Frame Rate Strategy

Do not default blindly to unrestricted 60 FPS.

Solar Grove is primarily a management simulation.

It does not require high-frequency action rendering.

Target:

```text
Normal farm:
30 FPS

Animation-heavy moment:
Up to 60 FPS if justified

Pixel PC:
Prefer low/no Phaser rendering activity
```

Consider configuring Phaser with an appropriate target FPS.

For example conceptually:

```ts
fps: {
  target: 30;
}
```

Test 30 FPS first.

For this type of game, 30 FPS is likely sufficient.

---

# 43. Pause Rendering When Appropriate

The game should not continuously render the entire farm when the player cannot see it.

When the Pixel PC occupies the main view:

```text
Pause or throttle Phaser rendering.
```

When the browser tab becomes hidden:

```text
Pause or heavily throttle rendering.
```

Use browser visibility events such as:

```text
document.visibilityState
visibilitychange
```

When hidden:

```text
Rendering:
pause

Simulation:
continue at low frequency if needed
```

Do not run full animation in a background tab.

---

# 44. Simulation vs Animation

Never implement growth using frame-by-frame operations.

Bad:

```ts
update() {
  everyCrop.updateGrowth()
  everyBuilding.updateProduction()
  everyMachine.updateInfrastructure()
}
```

This may run 60 times per second.

Instead:

```text
simulation tick
every 1000 ms
```

and calculate logical state only once per tick.

Rendering interpolates only visual properties where necessary.

---

# 45. Avoid Full-Map Updates

Do not update every visible farm entity every frame.

Static objects include:

- Houses
- Fences
- Paths
- Rocks
- Trees without animation
- Soil
- Decorations
- Inactive buildings

These should require essentially no per-frame game logic.

Only actively animated entities should update.

---

# 46. Prefer Event-Driven Updates

Use state changes rather than constant polling.

Bad:

```text
Every frame:

Check if irrigation status changed.
Check if greenhouse status changed.
Check if storage status changed.
```

Better:

```text
Infrastructure state changes
        ↓
emit event
        ↓
affected farm entity updates visual state
```

Example:

```text
irrigation-controller

HEALTHY → OFFLINE
        ↓
Infrastructure event
        ↓
Helio Pump receives update
        ↓
Stop water animation
        ↓
Show warning indicator
```

---

# 47. React Rendering Optimization

Avoid subscribing large React trees to the entire game state.

Bad:

```ts
const game = useGameStore();
```

in many components.

Prefer narrow Zustand selectors:

```ts
const gold = useGameStore((state) => state.economy.gold);
```

or:

```ts
const machineStatus = useGameStore((state) => state.machines[id].status);
```

Do not cause the entire PC interface to rerender whenever the farm simulation ticks.

---

# 48. Separate High-Frequency and Low-Frequency State

Do not put everything into one giant reactive state object.

Separate:

```text
Simulation state
UI state
Rendering state
Infrastructure state
Transient animation state
```

High-frequency visual animation should not trigger React renders.

Phaser should own visual animation.

React should own UI state.

---

# 49. Sprite Optimization

For pixel graphics:

- Use texture atlases
- Batch sprites where possible
- Reuse textures
- Avoid loading duplicate assets
- Avoid huge PNGs for small sprites
- Keep sprites close to their display resolution
- Use nearest-neighbor filtering
- Avoid unnecessary image scaling

For pixel art:

```text
pixelArt: true
antialias: false
```

where appropriate.

Avoid expensive smoothing.

---

# 50. Avoid Excessive Animated Objects

Do not animate everything continuously.

A farm with:

```text
100 trees
200 crops
50 machines
500 decorations
```

does not need 850 independent animation updates.

Use restrained animations.

Examples:

Trees:

```text
Mostly static
Occasional subtle animation
```

Water:

```text
Small loop
```

Wind turbine:

```text
Slow loop
```

Machines:

```text
Animate only while active
```

---

# 51. Particle Effects

Use particles carefully.

Avoid:

- Continuous hundreds of particles
- Full-screen bloom
- Heavy shader effects
- Large transparent overlays
- Constant dust effects everywhere

For pixel graphics, simple sprite animations are usually enough.

---

# 52. Lighting and Effects

Avoid expensive dynamic lighting during MVP.

Do not implement:

- Per-pixel dynamic light maps
- Heavy WebGL post-processing
- Large blur filters
- Multiple realtime shaders

Use simple visual techniques:

```text
sprite overlays
pre-rendered shadows
small glow sprites
palette changes
```

The game's 16-bit style should help performance.

---

# 53. Tilemap Optimization

Use tilemaps for:

- Ground
- Paths
- Water
- Soil
- Basic terrain
- Repeated decorations

Avoid representing every terrain tile as a complex GameObject.

Use Phaser tile layers where appropriate.

---

# 54. Camera Culling

Only process/render entities reasonably near the current camera.

Entities far outside the viewport should not require full rendering work.

Use Phaser's built-in camera/display culling where practical.

Large future farms should be chunked into regions.

---

# 55. Animation Distance LOD

Implement simple animation-level-of-detail rules.

Example:

Close zoom:

```text
Water moving
Fans rotating
Small lights blinking
Leaves subtly animated
```

Far zoom:

```text
Water simplified
Fans lower frame rate
Tiny details static
```

This will matter when farms become large.

---

# 56. PC Mode Rendering Optimization

When Controller PC is open full-screen:

```text
Farm rendering should be paused
or reduced dramatically.
```

For example:

```text
Phaser render rate:
5 FPS or paused

Simulation:
1 Hz

React PC:
Normal UI interaction
```

The user does not need the full farm GPU load while viewing a terminal.

---

# 57. Idle Mode

If no input occurs for a period:

```text
Lower farm rendering rate
```

Example:

```text
Active:
30 FPS

Idle after 30 seconds:
15 FPS

Background tab:
0–5 FPS
```

Return to normal immediately when the player interacts.

---

# 58. Development Performance Monitoring

During development, add an optional debug performance overlay.

Show:

```text
FPS
Frame time
Simulation tick time
Number of sprites
Number of animated entities
React render count where useful
Memory
Network events/sec
```

Example:

```text
SOLAR GROVE DEBUG

FPS             30
Frame           12 ms
Simulation      1.7 ms
Sprites         438
Animated        27
Visible         183
Socket events   2/sec
```

This helps catch performance regressions early.

---

# 59. Investigating Existing MacBook Heat

Before blindly optimizing, profile the existing application.

Check:

```text
Activity Monitor
Chrome/Safari CPU
Node CPU
WindowServer
VS Code/Cursor
```

Also inspect browser performance tools.

Look for:

- Infinite Phaser update loops
- Excessive React rerenders
- Thousands of timers
- Unbounded object creation
- Multiple Phaser instances
- Multiple running game loops
- Excessive hot-module-reload work
- Duplicate dev servers
- WebGL running continuously in hidden views

Important:

> Port 3000 is not responsible for heat. The process using the CPU/GPU behind that port is.

---

# 60. Phaser Lifecycle Safety

Ensure React development mode does not accidentally instantiate Phaser multiple times.

This is especially important if Phaser is mounted from React.

Implement lifecycle protection.

Conceptually:

```text
React mounts
↓
Create one Phaser.Game
↓
Store instance
↓
Component unmounts
↓
game.destroy(true)
↓
clear reference
```

Do not leave orphaned Phaser game instances running.

This is a likely source of unnecessary CPU/GPU use in development.

---

# 61. Timer Safety

Centralize simulation timers.

Avoid scattered:

```ts
setInterval(...)
setTimeout(...)
```

throughout components and systems.

Use one controlled simulation scheduler.

Ensure timers are cleaned up.

React components must not accidentally create duplicate intervals after rerenders.

---

# 62. Offline Progression

Record:

```text
lastSimulationTimestamp
```

When returning:

```text
elapsed =
currentTime - lastSimulationTimestamp
```

Calculate progression mathematically where possible rather than replaying every missing second.

Bad:

```text
Player offline 8 hours
→ execute 28,800 simulation ticks
```

Better:

```text
calculate production from elapsed interval
account for incident windows
apply aggregated result
```

---

# 63. Save System

Persist:

```text
Farm layout
Buildings
Crops
Economy
Power
Water
Infrastructure
Software
Deployments
Knowledge
Objectives
Incidents
Configuration
Last simulation timestamp
```

Use local saves initially.

Add PostgreSQL persistence later.

---

# 64. First MVP World

Build one relatively small farm.

Target:

```text
40 × 40 logical map
```

No movable player.

Interaction is entirely management based.

Implement:

- Camera pan
- Zoom
- Select building
- Build mode
- Crop selection
- Building inspection

---

# 65. MVP Crops

Start with:

```text
Sunroot
Glowberry
Verdant Grain
```

No need for dozens of crops initially.

---

# 66. MVP Buildings

Implement:

```text
Helio Irrigation Station
Verdant Glasshouse
Sunvault Storage
Harvest Automaton
Controller Hub
```

Controller Hub provides access to the Pixel PC.

---

# 67. MVP Pixel PC Apps

Implement only:

```text
Terminal
Browser
Software Catalog
Machine Monitor
Objectives
Knowledge
```

Do not build every future PC application yet.

---

# 68. MVP Technical Curriculum

Start with:

```text
Linux processes
Linux services
Ports
HTTP
Docker
Basic PostgreSQL
```

Do not start with Kubernetes.

---

# 69. MVP Incident Types

Implement:

```text
Process crashed
Wrong port
High CPU
Memory leak
Disk full
Database unavailable
```

---

# 70. First Vertical Slice

The first playable vertical slice must be:

```text
Start small farm
↓
Plant crops
↓
Earn Gold
↓
Unlock Helio Irrigation Station
↓
Place Irrigation Station
↓
Station is OFFLINE
↓
Inspect station
↓
Discover Irrigation Controller requirement
↓
Open Controller PC
↓
Open Software Catalog
↓
Find Irrigation Controller
↓
Open Terminal
↓
Learn process/service basics
↓
Deploy simulated application
↓
Configure port
↓
Start service
↓
Open Browser
↓
Visit irrigation.local
↓
Test controller
↓
Start irrigation
↓
Return to farm
↓
See water system activate
↓
Crop growth improves
↓
Earn more Gold
```

This is the most important proof of concept.

---

# 71. First Failure Scenario

After the player understands the first deployment:

Introduce:

```text
Irrigation production unexpectedly falls to zero.
```

Do not reveal the answer.

Evidence:

```text
Station:
OFFLINE

Browser:
ERR_CONNECTION_REFUSED
```

Player investigates:

```bash
ps
systemctl status irrigation-controller
journalctl
```

They discover the process has stopped.

They restart it.

Farm recovers.

This proves the troubleshooting loop.

---

# 72. Second Failure Scenario

Later introduce incorrect port configuration.

Application:

```text
8080
```

Mapped host port:

```text
8081
```

Player attempts:

```text
http://irrigation.local:8080
```

Failure.

Player uses:

```bash
ss -tulpn
docker ps
curl
```

They diagnose the mistake.

---

# 73. Data-Driven Content Structure

Use folders similar to:

```text
content/

buildings/
software/
crops/
incidents/
objectives/
knowledge/
services/
providers/
```

New game content should mostly be addable through definitions rather than new architectural code.

---

# 74. Long-Term Progression

Solar Grove should naturally evolve through:

```text
Manual farming
↓
Basic automation
↓
Linux services
↓
Networking
↓
Docker
↓
Databases
↓
Monitoring
↓
Cloud compute
↓
Cloud storage
↓
Managed databases
↓
DNS
↓
TLS
↓
Reverse proxies
↓
Caching
↓
Queues
↓
Load balancing
↓
CI/CD
↓
Security
↓
Backups
↓
High availability
↓
Scaling
↓
Multi-region
↓
Distributed systems
```

The infrastructure becomes more sophisticated because the farm becomes more sophisticated.

---

# 75. Future Farm Scaling

Later the player can operate multiple groves.

Example:

```text
Solar Grove North
Solar Grove Riverlands
Solar Grove Highlands
```

Each region may have:

- Different climate
- Different crops
- Different latency
- Different power resources
- Different infrastructure

Eventually:

```text
Multi-region architecture
Replication
Failover
Load balancing
Disaster recovery
```

become gameplay mechanics.

---

# 76. Multiplayer

Do not implement multiplayer during MVP.

Design state cleanly enough that an authoritative multiplayer backend can be added later.

Potential technologies:

```text
Socket.IO
or
Colyseus
```

Single-player must be excellent first.

---

# 77. Real Linux Environment Later

The MVP terminal is simulated.

Later, an advanced laboratory can use real disposable Linux containers.

Architecture:

```text
xterm.js
↓
WebSocket
↓
Node backend
↓
sandbox service
↓
disposable container
↓
PTY
↓
bash
```

Never connect browser users directly to:

```text
Host shell
Docker socket
Host filesystem
Cloud credentials
```

---

# 78. Optional Real Cloud Laboratory

This is a later advanced feature.

Possible:

```text
Real AWS EC2 exercise
Real Cloud Run exercise
Real S3 exercise
```

Requirements:

- Explicit opt-in
- Server-side credentials
- Spending limits
- Resource quotas
- Automatic cleanup
- Isolated accounts/projects
- No unrestricted cloud actions

Normal progression always uses simulation.

---

# 79. Realism Principle

Aim for:

```text
REAL TECHNICAL MODEL
+
SIMPLIFIED INTERACTION
+
GAME-APPROPRIATE FEEDBACK
```

Do not attempt to recreate an entire operating system, cloud provider, or Docker daemon.

Implement the subset necessary to teach the concept accurately.

---

# 80. Solarpunk Naming Examples

Use names such as:

```text
Helio Irrigation Station
Verdant Glasshouse
Sunvault Storage
Harvest Automaton
Canopy Gateway
Memory Grove
Seed Vault
Solar Bastion
Windmill Relay
Verdant Observatory
Gaia Archive
Horizon Node
Root Network
Sunforge
```

Underlying technical concepts remain real.

---

# 81. UX Principle

Players should clearly understand:

```text
What is affected?
What stopped working?
What is the economic impact?
What evidence exists?
What can I inspect?
```

But not necessarily:

```text
What exactly caused it?
```

Finding the cause is the gameplay.

Good:

```text
Verdant Glasshouse

Status:
DEGRADED

Production:
-60%

Controller:
UNHEALTHY

Recent log:
database connection failed
```

Bad:

```text
Your DATABASE_URL is incorrect.
Change it to postgres://...
```

The second removes investigation.

---

# 82. No Movable Character

Explicit requirement:

> Do not implement a controllable player avatar.

Do not implement:

- WASD movement
- Collision for player walking
- Character pathfinding
- Character inventory
- Player walking animations
- Interaction radius

The game is an isometric management simulation.

User interactions should be based on:

```text
click
select
place
inspect
configure
build
upgrade
monitor
operate
```

This also reduces rendering and simulation complexity.

---

# 83. Rendering Priority

The visual priority is:

```text
Beautiful farm composition
>
Readable infrastructure state
>
Smooth interaction
>
High frame rate
```

Do not chase 120 FPS.

This is not an action game.

A stable, efficient 30 FPS pixel-art farm is preferable to a hot laptop rendering unnecessary 60–120 FPS.

---

# 84. Implementation Rules for IDE AI

Before making large changes:

1. Inspect the existing repository.
2. Identify current framework and dependencies.
3. Identify how Phaser is currently instantiated.
4. Check whether Phaser is being instantiated more than once.
5. Check React lifecycle behavior.
6. Identify all animation loops.
7. Identify all timers.
8. Identify state subscriptions.
9. Identify current CPU-heavy systems.
10. Preserve working functionality.
11. Do not rewrite everything unnecessarily.
12. Keep TypeScript strict.
13. Keep logic outside Phaser scenes.
14. Prefer data-driven systems.
15. Implement incrementally.
16. Measure performance before and after rendering changes.
17. Keep the game playable throughout development.

---

# 85. Initial Repository Audit

Before implementing the new systems, produce a report containing:

```text
Current Architecture
Current Phaser Setup
Current React Setup
Current State Management
Current Render Loop
Current Simulation Logic
Current Timers
Current Asset Strategy
Current CPU/GPU Risk Areas
Potential Duplicate Phaser Instances
Current FPS Configuration
Current Backend
Current Persistence
```

Then provide:

```text
Recommended migration plan
Files to modify
Files to create
Dependencies to add
Performance fixes
Architecture risks
```

Do not begin a major rewrite until the architecture audit is complete.

---

# 86. Immediate Performance Audit

Because the current game causes noticeable MacBook heat, specifically inspect:

```text
Phaser FPS
requestAnimationFrame loops
Scene update()
React StrictMode behavior
Duplicate Phaser.Game creation
Uncleaned component effects
setInterval usage
setTimeout loops
Zustand subscriptions
Asset sizes
Animated sprite counts
Particles
WebGL effects
Background rendering
Hidden-tab rendering
Dev hot reload behavior
```

Implement the safest obvious fixes before expanding the farm.

---

# 87. Performance Target

For the MVP farm:

```text
Target rendering:
30 FPS

Simulation:
1 Hz

Background tab rendering:
Paused or near-zero

PC mode:
Farm render paused/throttled

React:
No global rerender every simulation tick
```

The laptop should remain reasonably cool during normal development/play compared with unrestricted rendering.

Do not promise zero heat because WebGL and development tooling still use hardware resources, but avoid unnecessary sustained CPU/GPU load.

---

# 88. First Implementation Milestone

After repository analysis and necessary performance corrections, implement this exact vertical slice:

```text
ISOMETRIC SOLARPUNK FARM
↓
PLANT SUNROOT
↓
PRODUCE AND SELL
↓
EARN 100 GOLD
↓
UNLOCK HELIO IRRIGATION STATION
↓
PLACE BUILDING
↓
BUILDING REPORTS SOFTWARE OFFLINE
↓
OPEN CONTROLLER PC
↓
SEARCH SOFTWARE CATALOG
↓
FIND IRRIGATION CONTROLLER
↓
OPEN TERMINAL
↓
DEPLOY SIMULATED SERVICE
↓
CONFIGURE PORT
↓
START SERVICE
↓
OPEN SIMULATED BROWSER
↓
VISIT http://irrigation.local
↓
START IRRIGATION
↓
RETURN TO FARM
↓
WATER VISUALLY ACTIVATES
↓
CROP PRODUCTIVITY INCREASES
↓
PLAYER EARNS MORE GOLD
```

Then create one failure:

```text
Controller process crashes
↓
Irrigation stops
↓
Farm visibly reacts
↓
Player investigates
↓
Player diagnoses
↓
Player restarts service
↓
Farm recovers
```

Do not expand to additional complicated infrastructure until this loop feels satisfying.

---

# 89. Final Product Principle

Solar Grove should ultimately feel like:

> **A beautiful 16-bit solarpunk farming management game where every advanced machine is powered by real software infrastructure that the player learns to deploy, operate, troubleshoot, and scale.**

The technical systems should exist because the farm depends on them.

The player should gradually learn real-world infrastructure skills almost accidentally through operating their farm.

The central relationship is:

```text
SOFTWARE HEALTH
        ↓
MACHINE HEALTH
        ↓
FARM PRODUCTION
        ↓
ECONOMY
        ↓
EXPANSION
        ↓
MORE SOPHISTICATED SOFTWARE
```

And the central implementation rule is:

> **Build the farming game first, then make infrastructure indispensable to operating it.**
