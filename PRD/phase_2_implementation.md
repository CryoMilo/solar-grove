# Solar Grove — Phase 2 Implementation Log
## First Complete Gameplay Loop / Vertical Slice

**Phase Status**: COMPLETED  
**Target Milestone**: Vertical Slice linking agricultural gameplay directly to Linux processes, systemd services, simulated network sockets, and incident troubleshooting.

---

## 1. Objectives & Overview

The goal of Phase 2 was to implement the first end-to-end playable vertical slice where the physical farm state is strictly driven by underlying infrastructure simulation.

### Core Principles Enforced
1. **Domain State Decoupling**: UI elements never mutate farm state directly. Farm mechanics (such as irrigation hydration) depend on software running on a simulated host.
2. **Deterministic Simulation**: All processes, sockets, services, and HTTP flows run deterministically in TypeScript at 1 Hz tick without real OS processes or node-pty.
3. **No Character Walking**: Pure isometric management simulation with pan, zoom, click-to-plant, click-to-harvest, and building placement.
4. **Performance Protection**: Strict 30 FPS Phaser limit with pause on PC open and tab hide.

---

## 2. Architecture & Domain Flow

```
SIMULATION / DOMAIN STATE
        │
        ├── Farm (Plots, Crops, Soil Hydration 0-100%, Yields)
        ├── Economy (Gold, Water, Energy)
        ├── Buildings (Helio Irrigation Station)
        ├── SimulatedHost / ServiceManager
        │       ├── Process Table (PIDs, CPU, Memory, Status)
        │       ├── Port/Socket Table (0.0.0.0:8080 LISTEN)
        │       ├── Service Registry (irrigation-controller.service)
        │       ├── Journal Logs (stdout, stderr, systemd events)
        │       └── HTTP Dispatcher (dispatchHttp routes)
        └── Incidents (process-crash)
                │
       ┌────────┴────────┐
       ↓                 ↓
    Phaser             React
    Renderer            UI
       │                 │
    Farm View         Pixel PC (Helios OS)
                      ├── Terminal (systemctl, ps, ss, netstat, curl, journalctl)
                      ├── Browser (http://irrigation.local:8080)
                      ├── Software Catalog
                      └── Building Inspection Modal
```

---

## 3. Implementation Steps & Deliverables

### Layer 1: Simulated Host & Service Lifecycle (`@solar-grove/infrastructure-model`)
- **Process Table Management**:
  - Implemented `HostProcess` tracking `pid`, `name`, `command`, `status` (`RUNNING` | `STOPPED` | `CRASHED`), `cpuPercent`, and `memoryMb`.
  - Process lifecycle: Allocated on `systemctl start`, cleaned on `systemctl stop` or crash.
- **Network Socket Table**:
  - Implemented `HostPort` tracking protocol (`tcp`), host IP (`0.0.0.0`), port (`8080`), and state (`LISTEN`).
  - When the service crashes or stops, port 8080 is unmapped.
- **HTTP Dispatcher**:
  - Routes simulated HTTP requests to `http://irrigation.local:8080`:
    - `GET /health` -> `200 OK` or `ERR_CONNECTION_REFUSED`
    - `GET /api/irrigation/state` -> returns pump status, telemetry, water pressure
    - `POST /api/irrigation/start` -> activates automated pump valve
    - `POST /api/irrigation/stop` -> deactivates pump valve
- **Service Journal Logging**:
  - Captures realistic boot traces, process allocations, runtime heartbeats, uncaught exception stack traces on crash, and systemd supervisor restarts.

### Layer 2: Command Engine Integration (`@solar-grove/command-engine`)
- Integrated real diagnostic commands inspecting the simulated host:
  - `ps` / `top`: Lists active PIDs and process statuses.
  - `systemctl status <service>`: Detailed systemd status with active duration, PID, memory, and recent log entries.
  - `systemctl start <service>`: Starts unit and binds socket.
  - `systemctl stop <service>`: Stops unit and terminates PID.
  - `systemctl restart <service>`: Supervises recovery, clearing failure state.
  - `journalctl -u <service>`: Views systemd journal logs (supports `-n <count>` and `-f`).
  - `ss -tulpn` / `netstat -tulpn`: Shows listening TCP sockets.
  - `curl <url>`: Makes simulated HTTP requests; returns HTTP response headers and JSON body or connection refused.

### Layer 3: Interactive UI & Windows (`@solar-grove/game-client`)
- **Building Inspection Modal (`BuildingInspectModal.tsx`)**:
  - Displays physical machine state, required software, deployment status, and listening socket.
  - Quick action shortcuts to Software Catalog, Terminal, and Browser.
- **Simulated Browser (`BrowserWindow.tsx`)**:
  - Address bar supporting `http://irrigation.local:8080`.
  - Realistic `ERR_CONNECTION_REFUSED` screen when service is offline.
  - Live Solarpunk Irrigation Control Dashboard when service is active:
    - Real-time water pressure gauge and flow telemetry.
    - Start/Stop Irrigation pump controls.
- **Software Catalog (`SoftwareCatalogWindow.tsx`)**:
  - Data-driven package repository showing runtime specification, port binding, and deployment actions.
- **Incident System (`App.tsx` & `useGameStore.ts`)**:
  - Dynamic red alert banner in Farm HUD when an incident occurs.
  - One-click `[Troubleshoot (TAB)]` button transitioning into Helios OS terminal.

---

## 4. First Complete Gameplay Loop Verification

1. **Start Farm**: Starter farm with 4 Sunroot plots.
2. **Accumulate 100 Gold**: Harvest and sell mature Sunroot crops.
3. **Build Helio Irrigation Station**: Placed on farm for 100 G; starts `OFFLINE` and `NOT DEPLOYED`.
4. **Deploy Software**: Opened Software Catalog; deployed `irrigation-controller` package (`DEPLOYED`).
5. **Start Service**: In Terminal, ran `systemctl start irrigation-controller` -> allocated PID 1042 on port 8080.
6. **Activate Automated Irrigation**:
   - In Browser at `http://irrigation.local:8080`, clicked **Activate Irrigation**.
   - Farm plots began hydrating at **+4% moisture per tick**.
   - Crops grew **+40% faster** when hydrated.
7. **Simulate & Triage Incident**:
   - Triggered `process-crash` incident -> controller crashed, port 8080 unmapped.
   - Farm HUD displayed warning banner: automated irrigation halted.
   - Browser displayed `ERR_CONNECTION_REFUSED`.
   - Diagnosed via `systemctl status`, `journalctl -u irrigation-controller`, and `ss -tulpn`.
   - Recovered via `systemctl restart irrigation-controller`.
   - Hydration resumed, incident resolved, farm restored.

---

## 5. Learning Competencies Unlocked
- `linux.processes`: Process IDs and memory inspection (`ps`).
- `linux.services`: systemd daemon supervisor (`systemctl`).
- `networking.ports`: Socket binding and port connectivity (`ss`, `netstat`, `curl`).
