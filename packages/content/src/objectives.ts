import type { ProgressionObjective } from '@solar-grove/game-types';

export const OBJECTIVES: ProgressionObjective[] = [
  {
    id: 'obj-1-earn-100-gold',
    index: 1,
    title: 'Goal 1 — Establish Capital',
    solarpunkTitle: '🌱 Soil and Seedlings',
    description:
      'Plant, grow, and harvest Sunroot crops from the farm soil to amass 100 Gold in farm reserves.',
    requirements: [
      {
        type: 'gold',
        description: 'Earn 100 Gold in treasury',
        target: 100,
        current: 0,
        satisfied: false,
      },
    ],
    completed: false,
    rewardGold: 25,
    unlocksBlueprintId: 'helio-pump',
  },
  {
    id: 'obj-2-plant-10-crops',
    index: 2,
    title: 'Goal 2 — Cultivate the Terraces',
    solarpunkTitle: '🌾 Verdant Canopy',
    description: 'Click on empty farm soil plots to sow seeds across the terraced grove.',
    requirements: [
      {
        type: 'plant',
        description: 'Plant 10 crops in soil',
        target: 10,
        current: 3, // 3 starter crops
        satisfied: false,
      },
    ],
    completed: false,
    rewardGold: 30,
  },
  {
    id: 'obj-3-harvest-10-crops',
    index: 3,
    title: 'Goal 3 — Bountiful Harvest',
    solarpunkTitle: '☀️ Solar Abundance',
    description:
      'Wait for crops to reach maturity (100% growth) and harvest them for direct market sale.',
    requirements: [
      {
        type: 'harvest',
        description: 'Harvest 10 mature crops',
        target: 10,
        current: 0,
        satisfied: false,
      },
    ],
    completed: false,
    rewardGold: 50,
  },
  {
    id: 'obj-4-build-irrigation-station',
    index: 4,
    title: 'Goal 4 — Construct Irrigation Station',
    solarpunkTitle: '💧 Deep Aquifer Rig',
    description:
      'Purchase and place the Helio Irrigation Station on the farm. Note: physical installation begins in an OFFLINE state until software is deployed!',
    requirements: [
      {
        type: 'build',
        description: 'Build Helio Irrigation Station (100 G)',
        target: 1,
        current: 0,
        satisfied: false,
        targetBuildingType: 'helio-pump',
      },
    ],
    completed: false,
    rewardGold: 50,
  },
  {
    id: 'obj-5-deploy-controller',
    index: 5,
    title: 'Goal 5 — Deploy Irrigation Controller',
    solarpunkTitle: '⚡ Digital Arteries',
    description:
      'Access the Pixel PC, open the Software Catalog to inspect requirements, and start the `irrigation-controller` service on port 8080.',
    requirements: [
      {
        type: 'service-online',
        description: 'Start irrigation-controller service on port 8080',
        target: 1,
        current: 0,
        satisfied: false,
        targetServiceName: 'irrigation-controller',
      },
    ],
    completed: false,
    rewardGold: 75,
  },
  {
    id: 'obj-6-irrigate-field',
    index: 6,
    title: 'Goal 6 — Activate Automated Irrigation',
    solarpunkTitle: '🌊 Furrow Saturation',
    description:
      'Open the simulated Browser in Pixel PC, navigate to http://irrigation.local:8080, and click [Start Irrigation] to begin water delivery.',
    requirements: [
      {
        type: 'irrigate',
        description: 'Activate irrigation from web console (http://irrigation.local:8080)',
        target: 1,
        current: 0,
        satisfied: false,
      },
    ],
    completed: false,
    rewardGold: 100,
  },
  {
    id: 'obj-7-earn-500-gold',
    index: 7,
    title: 'Goal 7 — Commercial Scale',
    solarpunkTitle: '🏛️ Grove Enterprise',
    description:
      'Leverage accelerated growth from automated irrigation (+40% speed) to reach a reserve of 500 Gold.',
    requirements: [
      {
        type: 'gold',
        description: 'Accumulate 500 Gold in treasury',
        target: 500,
        current: 0,
        satisfied: false,
      },
    ],
    completed: false,
    rewardGold: 150,
  },
  {
    id: 'obj-8-recover-incident',
    index: 8,
    title: 'Goal 8 — Incident Remediation',
    solarpunkTitle: '🛠️ Systems Resilience',
    description:
      'Investigate infrastructure anomalies using ps, systemctl, and journalctl, restart failed services, and verify recovery with curl.',
    requirements: [
      {
        type: 'incident-resolved',
        description: 'Diagnose and remediate a service crash in the Terminal',
        target: 1,
        current: 0,
        satisfied: false,
      },
    ],
    completed: false,
    rewardGold: 200,
    unlocksBlueprintId: 'verdant-glasshouse',
  },
  {
    id: 'obj-9-build-glasshouse',
    index: 9,
    title: 'Goal 9 — Build Verdant Glasshouse',
    solarpunkTitle: '🌿 Controlled Growth Habitat',
    description:
      'Purchase and place the Verdant Glasshouse on the farm grid (150 G). It provides climate regulation but requires containerized infrastructure.',
    requirements: [
      {
        type: 'build',
        description: 'Construct Verdant Glasshouse (150 G)',
        target: 1,
        current: 0,
        satisfied: false,
        targetBuildingType: 'verdant-glasshouse',
      },
    ],
    completed: false,
    rewardGold: 50,
  },
  {
    id: 'obj-10-pull-docker-images',
    index: 10,
    title: 'Goal 10 — Pull Docker Images',
    solarpunkTitle: '📦 Layered Blueprints',
    description:
      'Open the Terminal and pull both the application and database images: `docker pull solar-grove/greenhouse-controller:1.0` and `docker pull postgres:16`.',
    requirements: [
      {
        type: 'docker-pull',
        description: 'Pull greenhouse-controller and postgres:16 images',
        target: 2,
        current: 0,
        satisfied: false,
      },
    ],
    completed: false,
    rewardGold: 75,
  },
  {
    id: 'obj-11-docker-compose-up',
    index: 11,
    title: 'Goal 11 — Launch Container Stack',
    solarpunkTitle: '🧩 Stack Orchestration',
    description:
      'Execute `docker compose up` to create `greenhouse-network` and launch both `greenhouse-db` and `greenhouse-controller`.',
    requirements: [
      {
        type: 'docker-compose',
        description: 'Launch application stack via docker compose up',
        target: 1,
        current: 0,
        satisfied: false,
      },
    ],
    completed: false,
    rewardGold: 100,
  },
  {
    id: 'obj-12-diagnose-failure',
    index: 12,
    title: 'Goal 12 — Diagnose Controller Failure',
    solarpunkTitle: '🔍 Log & Config Triage',
    description:
      'The controller is unhealthy. Inspect running status with `docker ps`, inspect logs with `docker logs greenhouse-controller`, and check environment variables with `docker inspect greenhouse-controller`.',
    requirements: [
      {
        type: 'docker-diagnose',
        description: 'Inspect logs and environment to identify bad DATABASE_URL',
        target: 1,
        current: 0,
        satisfied: false,
      },
    ],
    completed: false,
    rewardGold: 100,
  },
  {
    id: 'obj-13-recover-controller',
    index: 13,
    title: 'Goal 13 — Correct Environment & Recover',
    solarpunkTitle: '⚡ Environmental Synthesis',
    description:
      'Provide the correct password in DATABASE_URL (`postgresql://greenhouse:greenhouse@greenhouse-db:5432/greenhouse`) and restart or run the container so both containers report HEALTHY.',
    requirements: [
      {
        type: 'greenhouse-healthy',
        description: 'Recover greenhouse-controller with valid DATABASE_URL',
        target: 1,
        current: 0,
        satisfied: false,
      },
    ],
    completed: false,
    rewardGold: 150,
  },
  {
    id: 'obj-14-verify-greenhouse-browser',
    index: 14,
    title: 'Goal 14 — Engage Accelerated Photosynthesis',
    solarpunkTitle: '☀️ Hyper-Growth Active',
    description:
      'Open the simulated Browser at http://greenhouse.local:4000 to verify connected telemetry. Growth Optimization is now boosting crop growth by +50%!',
    requirements: [
      {
        type: 'greenhouse-browser',
        description: 'Verify operational status at http://greenhouse.local:4000',
        target: 1,
        current: 0,
        satisfied: false,
      },
    ],
    completed: false,
    rewardGold: 200,
    unlocksBlueprintId: 'helio-relay',
  },
  {
    id: 'obj-15-build-relay',
    index: 15,
    title: 'Goal 15 — Construct Helio Relay Station',
    solarpunkTitle: '📡 Edge Gateway Infrastructure',
    description:
      'Purchase and place the Helio Relay Station on the farm grid (200 G). It acts as our public edge gateway, terminating TLS and routing ingress traffic.',
    requirements: [
      {
        type: 'build',
        description: 'Construct Helio Relay Station (200 G)',
        target: 1,
        current: 0,
        satisfied: false,
        targetBuildingType: 'helio-relay',
      },
    ],
    completed: false,
    rewardGold: 100,
  },
  {
    id: 'obj-16-deploy-gateway',
    index: 16,
    title: 'Goal 16 — Deploy Reverse Proxy Service',
    solarpunkTitle: '🌐 Public Traffic Routing',
    description:
      'Start the `helio-relay` Nginx reverse proxy gateway via `systemctl start helio-relay` or the Software Catalog.',
    requirements: [
      {
        type: 'relay-deploy',
        description: 'Deploy helio-relay edge proxy service',
        target: 1,
        current: 0,
        satisfied: false,
      },
    ],
    completed: false,
    rewardGold: 100,
  },
  {
    id: 'obj-17-dns-resolution',
    index: 17,
    title: 'Goal 17 — Verify Edge DNS Resolution',
    solarpunkTitle: '🗺️ Network Domain Resolution',
    description:
      'Use `nslookup` or `dig` in the Terminal to verify `greenhouse.solar-grove.local` resolves to edge relay IP `10.0.0.10`.',
    requirements: [
      {
        type: 'dns-lookup',
        description: 'Resolve greenhouse.solar-grove.local to 10.0.0.10',
        target: 1,
        current: 0,
        satisfied: false,
      },
    ],
    completed: false,
    rewardGold: 100,
  },
  {
    id: 'obj-18-upstream-repair',
    index: 18,
    title: 'Goal 18 — Triage and Repair Bad Upstream',
    solarpunkTitle: '🔄 Upstream Route Convergence',
    description:
      'Diagnose the 502 Bad Gateway error on greenhouse.solar-grove.local using `journalctl -u helio-relay` or `nginx -t`. Reconfigure the upstream host to `greenhouse-controller:4000` via Network Console.',
    requirements: [
      {
        type: 'route-repair',
        description: 'Correct upstream route to greenhouse-controller:4000',
        target: 1,
        current: 0,
        satisfied: false,
      },
    ],
    completed: false,
    rewardGold: 150,
  },
  {
    id: 'obj-19-tls-certificate',
    index: 19,
    title: 'Goal 19 — Secure Gateway with TLS',
    solarpunkTitle: '🔒 Cryptographic Handshake',
    description:
      'Request and install an automated ACME TLS certificate for *.solar-grove.local in Certificate Manager or Terminal, resolving browser privacy warnings and enabling HTTPS.',
    requirements: [
      {
        type: 'cert-install',
        description: 'Issue and install valid TLS certificate for solar-grove.local',
        target: 1,
        current: 0,
        satisfied: false,
      },
    ],
    completed: false,
    rewardGold: 200,
  },
  {
    id: 'obj-20-expose-irrigation',
    index: 20,
    title: 'Goal 20 — Expose Unified Farm Ingress',
    solarpunkTitle: '🌿 Solarpunk Production Ingress',
    description:
      'Add a proxy route for `irrigation.solar-grove.local` forwarding to `10.0.0.30:8080` and verify HTTPS access across the entire farm.',
    requirements: [
      {
        type: 'public-irrigation',
        description: 'Expose irrigation.solar-grove.local through edge proxy',
        target: 1,
        current: 0,
        satisfied: false,
      },
    ],
    completed: false,
    rewardGold: 250,
  },
];

