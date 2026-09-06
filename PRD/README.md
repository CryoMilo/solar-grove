# Solar Grove — Product Requirements & Implementation Documents

This directory contains the core specifications, architecture definitions, and phase-by-phase implementation logs for **Solar Grove**.

---

## Document Index

1. **[Foundation Specification (`foundation_idea.md`)](./foundation_idea.md)**
   - Core vision: 16-bit retro pixel-art solarpunk farming & cloud infrastructure simulation.
   - Core rules: No movable character, isometric management perspective, 30 FPS rendering limit, 1 Hz deterministic simulation tick, domain state decoupling.
   - Helios OS Pixel PC architecture (Terminal, Browser, Software Catalog, Observatory, Objectives, Knowledge Map).

2. **[Phase 2 Implementation Log (`phase_2_implementation.md`)](./phase_2_implementation.md)**
   - **First Complete Gameplay Loop / Vertical Slice**.
   - Helio Irrigation Station physical building on the farm.
   - Simulated Linux host model: Process table (`HostProcess`), socket table (`HostPort`), and systemd unit management (`irrigation-controller.service`).
   - Browser irrigation controller (`http://irrigation.local:8080`) driving real farm hydration (+4%/s) and crop growth boosts (+40%).
   - Terminal diagnostic commands: `ps`, `top`, `systemctl`, `journalctl`, `ss`, `netstat`, `curl`.
   - Incident triage and recovery loop.

3. **[Phase 3 Implementation Log (`phase_3_implementation.md`)](./phase_3_implementation.md)**
   - **Verdant Glasshouse — Containers, Environment Variables & PostgreSQL**.
   - Docker image registry and layer pull simulation (`docker pull`, `docker images`).
   - Multi-container Docker Compose orchestration (`docker compose up`, `down`, `ps`, `logs`).
   - Isolated virtual networks (`greenhouse-network`) and inter-container DNS resolution.
   - Simulated PostgreSQL database persistence and credentials authentication (`28P01` error).
   - Twelve-Factor environment variable injection (`DATABASE_URL`, `PORT`, `NODE_ENV`).
   - Container health monitoring (`HEALTHY`, `UNHEALTHY`, `STARTING`).
   - Simulated HTTP gateway: `502 Bad Gateway` on upstream database connection failure vs `200 OK` on health.
   - Live interactive Verdant Glasshouse Solarpunk Dashboard and `+50%` Accelerated Photosynthesis crop growth boost.
