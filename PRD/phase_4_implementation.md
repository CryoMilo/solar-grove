# Solar Grove — Phase 4 Implementation Log
## The Solar Relay — DNS, Reverse Proxy, TLS & Production Networking

**Phase Status**: COMPLETED  
**Target Milestone**: IP addressing (`10.0.0.0/24`), farm DNS resolution, Nginx reverse proxy edge gateway (`Helio Relay Station`), virtual host routing, HTTP to HTTPS 301 redirects, automated ACME TLS certificate lifecycle, 502 Bad Gateway triage, and public vs. private ingress exposure.

---

## 1. Objectives & Architectural Concepts

Phase 4 introduces production networking, ingress architecture, and transport layer security as core playable systems. The player builds the **Helio Relay Station** to manage farm traffic through a unified edge gateway terminating TLS and reverse-proxying internal services.

### Technical Concepts Integrated into Gameplay
1. **IP Addressing & Network Interfaces**: Static private subnet allocation (`10.0.0.0/24`) with hosts:
   - `10.0.0.1`: `farm-dns` (CoreDNS)
   - `10.0.0.2`: `pixel-pc` (Player workstation)
   - `10.0.0.10`: `helio-relay` (Public edge gateway / Nginx)
   - `10.0.0.20`: `greenhouse-host` (Verdant Glasshouse host)
   - `10.0.0.30`: `irrigation-host` (Helio Irrigation pump host)
2. **Authoritative Farm DNS**: Domain-to-IP resolution mapping both direct internal hosts (`greenhouse.local` -> `10.0.0.20`) and public edge domains (`*.solar-grove.local` -> `10.0.0.10`).
3. **Edge Reverse Proxy (Nginx Gateway)**: Reverse proxy routing on ports 80 and 443 with master and worker processes, virtual host routing blocks, and upstream targets.
4. **HTTP to HTTPS 301 Redirects**: Automated redirection sending `301 Moved Permanently` with `Location: https://<host>/` header when insecure HTTP requests hit port 80.
5. **TLS Encryption & Certificates**: Simulated public key cryptography, X.509 certificates, Let's Encrypt / ACME issuance protocol, domain validation, and certificate status states (`VALID`, `EXPIRED`, `UNTRUSTED`, `REVOKED`, `MISSING`).
6. **Public vs. Private Service Access**: Direct private access (`http://greenhouse.local:4000`) remains internal, while public ingress requires secure edge routing (`https://greenhouse.solar-grove.local`).
7. **Playable Failure Scenarios**:
   - **Failure 1: 502 Bad Gateway**: Upstream proxy configured to `greenhouse-app:4000` while container is named `greenhouse-controller:4000`. Connection refused log in Nginx error log (`111: Connection refused`), triaged via `journalctl -u helio-relay` or `nginx -t` and repaired via Network Console.
   - **Failure 2: TLS Certificate Failure**: Missing/expired certificate causes `495 SSL Certificate Error` (`NET::ERR_CERT_COMMON_NAME_INVALID`) in the Browser and TLS alert in `openssl s_client`, fixed via Certificate Manager or `certbot`.
8. **New Pixel PC Applications**:
   - **Network Console (`network`)**: Visual routing table, DNS lookup table, `/etc/hosts` inspection, upstream configuration, and route addition.
   - **Certificate Manager (`certs`)**: X.509 certificate vault, automated ACME Let's Encrypt issuance flow, and renewal management.

---

## 2. Architecture & Domain Flow

```text
SIMULATION / DOMAIN STATE
        │
        ├── Farm (Crops, Soil Moisture, Accelerated Photosynthesis Boost +50%)
        ├── Buildings (Helio Irrigation, Verdant Glasshouse, Helio Relay Station)
        ├── SimulatedHost / ServiceManager
        │       ├── Network Topology (10.0.0.0/24 subnet, hosts table, network interfaces)
        │       ├── DNS Engine (A-records, wildcard *.solar-grove.local -> 10.0.0.10)
        │       ├── Reverse Proxy Model (Nginx virtual hosts, upstream mappings, proxy rules)
        │       ├── TLS Certificate Manager (Let's Encrypt ACME automated issuance & verification)
        │       ├── Systemd & Container Runtime (Irrigation controller + Docker containers)
        │       └── HTTP Dispatcher (DNS -> Relay IP -> 301 Redirect / TLS Check -> Upstream Proxy)
        └── Incidents (bad-upstream, cert-missing)
                │
       ┌────────┴────────┐
       ↓                 ↓
    Phaser             React
    Renderer            UI
       │                 │
    Farm View         Pixel PC (Helios OS)
                      ├── Network Console (routing table, DNS records, upstream config)
                      ├── Certificate Manager (ACME issuance, TLS status, validity)
                      ├── Terminal (ip, nslookup, dig, nginx, openssl, certbot, curl -I)
                      ├── Browser (301 redirects, SSL error screens, 502 bad gateway)
                      ├── Software Catalog (helio-relay Nginx package)
                      └── Building Inspection Modal (Relay gateway telemetry)
```

---

## 3. Implementation Across System Layers

### Layer 1: Core Types & Content Packages
- **`packages/game-types`**:
  - Defined networking types: `NetworkHost`, `DnsRecord`, `ProxyRoute`, `CertificateStatus`, `TlsCertificate`, `ReverseProxyState`.
  - Added `'helio-relay'` to `BuildingType`.
  - Added Phase 4 competencies: `networking.reverse-proxy`, `networking.upstream`, `networking.tls`, `networking.certificates`, `networking.http-redirect`.
  - Added Phase 4 objective requirement types: `relay-deploy`, `dns-lookup`, `route-repair`, `cert-install`, `public-irrigation`.
- **`packages/content`**:
  - Configured `helio-relay` blueprint: 200 G construction cost, 3 kW baseline power consumption, solarpunk communications tower.
  - Configured `helio-relay` software package: Nginx 1.25 runtime, listening on ports 80 and 443.
  - Added Objectives 15–20 detailing the full production networking gameplay sequence.
  - Added Phase 4 micro-lessons in `micro-lessons.ts` covering IP routing, DNS resolution, reverse proxies, HTTP redirects, and TLS certificates.

### Layer 2: Infrastructure Simulation (`packages/infrastructure-model`)
- **Network Topology & DNS Model**:
  - Initialized static IP map (`10.0.0.1` - `10.0.0.30`).
  - Implemented `resolveDns()` supporting exact and wildcard matches (`*.solar-grove.local` -> `10.0.0.10`).
- **Nginx Reverse Proxy Model**:
  - Configured route map with default routes (`route-greenhouse` initially pointing to bad upstream `greenhouse-app:4000`).
  - Added `updateProxyRoute()`, `addProxyRoute()`, and `testNginxConfig()`.
  - Master and worker processes modeled in `getProcesses()`; ports 80 and 443 in `getListeningPorts()`.
- **TLS Certificate Model**:
  - Implemented `requestCertificate()` simulating ACME DNS-01/HTTP-01 challenge response, RSA 2048-bit keypair generation, and CA signing.
  - Added `installCertificate()` and `setCertificateStatus()`.
- **HTTP Dispatcher (`dispatchHttp`)**:
  - DNS resolution identifies `10.0.0.10` edge requests.
  - Enforces `301 Moved Permanently` on port 80 (`http://`) with `Location: https://...`.
  - On port 443 (`https://`), validates TLS certificate status; returns `495 SSL Certificate Error` (`NET::ERR_CERT_COMMON_NAME_INVALID`) if missing/untrusted.
  - Resolves upstream route: returns `502 Bad Gateway` and appends `111: Connection refused` to Nginx log if upstream host is incorrect (`greenhouse-app`).
  - Returns `200 OK` when upstream route resolves to `greenhouse-controller:4000` or `10.0.0.30:8080`.

### Layer 3: Command Engine (`packages/command-engine`)
- Registered network inspection commands:
  - `ip addr` / `ip a` / `ip route` (displays IP subnet and default gateway).
  - `nslookup <domain>` and `dig <domain>` (performs authoritative DNS lookup with TTL and answer sections).
  - `cat /etc/hosts` (displays local static host mappings).
- Registered reverse proxy and TLS commands:
  - `nginx -t` (validates syntax of `/etc/nginx/nginx.conf`).
  - `nginx -s reload` (reloads proxy configuration).
  - `openssl s_client -connect <host:port> [-servername <domain>]` (simulates TLS handshake, certificate chain inspection, cipher negotiation, and verification codes).
  - `certbot -d <domain>` (executes automated ACME Let's Encrypt certificate issuance).
  - `curl -I` / `curl --head` (inspects HTTP response headers, 301 redirects, and server headers).

### Layer 4: Client State & UI Components (`apps/game-client`)
- **Network Console App (`NetworkConsoleWindow.tsx`)**:
  - Routing table showing virtual hosts, ports, protocols, and upstream targets.
  - In-place route editor with "Quick Fix: Update to greenhouse-controller:4000" action.
  - DNS lookup directory and `/etc/hosts` viewer.
  - Route creation form to expose new farm services (e.g. Irrigation Station).
- **Certificate Manager App (`CertificateManagerWindow.tsx`)**:
  - X.509 certificate vault with status badges (`VALID`, `EXPIRED`, `MISSING`).
  - One-click "Request ACME Certificate (Let's Encrypt)" with animated step-by-step issuance terminal logs.
- **Simulated Browser (`BrowserWindow.tsx`)**:
  - Interactive `301 Moved Permanently` animation automatically following the `Location` header to HTTPS.
  - Red security warning screen for `495 SSL Certificate Error` ("Your connection is not private / NET::ERR_CERT_COMMON_NAME_INVALID") with direct shortcut button to Certificate Manager.
  - Production `502 Bad Gateway` error screen explaining upstream connection refused with direct shortcut to Network Console.
- **Helios OS Desktop (`HeliosDesktop.tsx`)**:
  - Registered `network` (Network Console) and `certs` (Certificate Manager) in taskbar and window manager.
- **Zustand Store (`useGameStore.ts`)**:
  - Implemented `checkMilestones()` evaluating Objectives 15–20 progression.
  - Hooked building status synchronization and power consumption (-3 kW) for `helio-relay`.
- **Phaser 2.5D Isometric World (`BootScene.ts`, `FarmScene.ts`)**:
  - Procedurally generated `iso_building_helio_relay` texture: Solarpunk communications tower with brass lattice framework, stone pedestal, parabolic skyward dish, and pulsing cyan beacon.
  - Handled placement ghost, isometric depth sorting, and alarm beacon twining.
- **Building Inspection Modal (`BuildingInspectModal.tsx`)**:
  - Full telemetry panel for Helio Relay Station displaying listener ports (80/443), active virtual routes, TLS status, and shortcuts to Network Console and Cert Manager.

---

## 4. Complete Gameplay Flow

```
[Goal 15: Construct Helio Relay]
       │
       ▼
[Goal 16: Deploy helio-relay Service (systemd start)]
       │
       ▼
[Goal 17: Verify DNS via nslookup greenhouse.solar-grove.local -> 10.0.0.10]
       │
       ▼
[Browser: Visit http://greenhouse.solar-grove.local]
       │
       ├── Receives 301 Moved Permanently -> Follows to https://...
       │
       ▼
[Failure 2: TLS Certificate Missing -> Browser 495 Privacy Warning]
       │
       ├── Open Certificate Manager or run: certbot -d *.solar-grove.local
       ├── Let's Encrypt ACME issuance completes -> Certificate status VALID
       │
       ▼
[Goal 19: Secure Gateway with TLS Completed]
       │
       ▼
[Browser: Refresh https://greenhouse.solar-grove.local]
       │
       ▼
[Failure 1: 502 Bad Gateway (Upstream greenhouse-app:4000 Connection Refused)]
       │
       ├── Run: journalctl -u helio-relay -> See connect() failed error
       ├── Open Network Console -> Click "Quick Fix: Update to greenhouse-controller:4000"
       │
       ▼
[Goal 18: Upstream Route Repaired]
       │
       ▼
[Browser: Refresh -> 200 OK with Connected Greenhouse Telemetry]
       │
       ▼
[Goal 20: Add Public Route for irrigation.solar-grove.local:443 -> 10.0.0.30:8080]
       │
       ▼
[Entire Farm Unified Under Secure Solarpunk Ingress!]
```

---

## 5. Verification & Testing

- **Monorepo Compilation**: `pnpm --recursive run build` passed with zero errors across all 6 packages.
- **Automated Integration Test Suite (`packages/infrastructure-model/test-phase4.ts`)**:
  - 12 comprehensive test suites passed covering Blueprint specs, DNS resolution, service start, Nginx master/worker processes, port listeners (80/443), 301 redirects, initial 495 SSL errors, certbot issuance, openssl s_client handshake, 502 Bad Gateway triage, route repair, 200 OK verification, and irrigation route extension.
- **Hot Reload**: Verified active on Vite development server at `http://localhost:3000`.
