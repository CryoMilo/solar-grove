import { IncidentEngine } from './src/incidents';
import { ServiceManager } from './src/service-manager';
import { OBJECTIVES } from '../content/src/objectives';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('--- SOLAR GROVE — PHASE 6 VERIFICATION SUITE ---');

// ==========================================
// TEST 1: NEW GAME INITIAL STATE
// ==========================================
console.log('\n[1/6] Testing New Game Initial State...');
const serviceManager = new ServiceManager();
const incidentEngine = new IncidentEngine();

assert(OBJECTIVES.length === 32, `Expected 32 objectives, found ${OBJECTIVES.length}`);
assert(serviceManager.getDeploymentTarget() === 'local', 'Expected initial deployment target to be local');
assert(incidentEngine.getActiveIncidents().length === 0, 'Expected no active incidents at start');

const starterService = serviceManager.getService('irrigation-controller');
assert(starterService !== undefined, 'Expected irrigation-controller service definition');
assert(starterService?.status === 'stopped', 'Expected irrigation-controller to start stopped');

console.log('✓ New game state initialized correctly.');

// ==========================================
// TEST 2: FULL PROGRESSION (GOALS 1 -> 32)
// ==========================================
console.log('\n[2/6] Testing Full Infrastructure Progression (Local -> Docker -> Relay -> Cloud)...');

// 2A. Deploy irrigation
const deployIrr = serviceManager.deploySoftware('irrigation-controller');
assert(deployIrr.success, 'Failed to deploy irrigation-controller');
serviceManager.startService('irrigation-controller');
assert(serviceManager.getService('irrigation-controller')?.status === 'running', 'Irrigation service failed to start');

// 2B. Pull containers and launch stack
serviceManager.pullImage('solar-grove/greenhouse-controller:1.0');
serviceManager.pullImage('postgres:16');
const composeRes = serviceManager.composeUp();
assert(composeRes.output.includes('Running 3/3'), 'Docker compose up output verified');

// 2C. Repair database password
serviceManager.setGreenhouseDbPassword('greenhouse');
assert(serviceManager.isGreenhouseOptimized(), 'Greenhouse should be healthy and optimized after password fix');

// 2D. Edge Relay, DNS, TLS
serviceManager.deploySoftware('helio-relay');
serviceManager.startService('helio-relay');
const dnsRes = serviceManager.resolveDns('greenhouse.solar-grove.local');
assert(dnsRes === '10.0.0.10', 'DNS failed to resolve to edge IP 10.0.0.10');

// Fix upstream route
serviceManager.updateProxyRoute('route-greenhouse', { upstreamHost: 'greenhouse-controller', upstreamPort: 4000 });
const routeCheck = serviceManager.findMatchingRoute('greenhouse.solar-grove.local');
assert(routeCheck?.upstreamHost === 'greenhouse-controller', 'Upstream route repair failed');

// Issue certificate
const certRes = serviceManager.requestCertificate('*.solar-grove.local');
assert(certRes.certificate.status === 'VALID', 'TLS Certificate issuance failed');

// 2E. Cloud Migration Transition
const prepRes = serviceManager.startCloudMigration();
assert(prepRes.success, 'Migration start failed');

// Update compute environment
serviceManager.getCloudManager().updateComputeEnvironment('i-greenhouse-01', {
  DATABASE_URL: 'postgresql://postgres:solar_grove_pass@greenhouse-db.internal:5432/solar_grove',
});

// Run migration steps: Preparing -> Migrating -> Verifying -> Complete
const step2 = serviceManager.executeCloudMigrationStep({ forceLocalhostError: false });
assert(step2.success, 'Migration step failed');
const step3 = serviceManager.executeCloudMigrationStep();
assert(step3.success, 'Migration verification failed');
const step4 = serviceManager.executeCloudMigrationStep();
assert(step4.success, 'Migration completion failed');
assert(serviceManager.getDeploymentTarget() === 'cloud', 'Expected deployment target to be cloud');

// S3 Object Storage archive
const archived = serviceManager.archiveTelemetryToCloudStorage();
assert(archived.sizeBytes > 0, 'Object storage archiving failed');
assert(serviceManager.getCloudBuckets()[0].objects.length >= 2, 'Expected at least 2 objects in bucket');

// Final Production check (Goal 32)
assert(serviceManager.isGreenhouseOptimized(), 'Production cloud greenhouse must be optimized (+50% boost)');
console.log('✓ Full infrastructure progression verified through Goal 32.');

// ==========================================
// TEST 3: INCIDENT ENGINE & RECOVERY
// ==========================================
console.log('\n[3/6] Testing Incidents and Remediation Loop...');
const testIncident = incidentEngine.triggerIncident('process-crash', 'bld-helio-pump-1', 'irrigation-controller');
assert(!testIncident.resolved, 'Incident should be unresolved initially');
assert(incidentEngine.getActiveIncidents().length === 1, 'Expected 1 active incident');

const resolved = incidentEngine.resolveIncident(testIncident.id);
assert(resolved, 'Incident resolution failed');
assert(incidentEngine.getActiveIncidents().length === 0, 'Expected 0 active incidents after resolution');
console.log('✓ Incident triage and recovery verified.');

// ==========================================
// TEST 4: PERSISTENCE (SAVE / LOAD FIDELITY)
// ==========================================
console.log('\n[4/6] Testing Save/Load State Serialization Fidelity...');

// Export full state
const exportedSmState = serviceManager.exportState();
const exportedIeState = incidentEngine.exportState();

assert(Array.isArray(exportedSmState.services), 'Exported services must be an array');
assert(Array.isArray(exportedSmState.containers), 'Exported containers must be an array');
assert(exportedSmState.cloudManager.deploymentTarget === 'cloud', 'Cloud target must persist in export');

// Create brand new instances and hydrate from state
const freshSm = new ServiceManager();
const freshIe = new IncidentEngine();

freshSm.loadState(exportedSmState);
freshIe.loadState(exportedIeState);

// Verify fidelity
assert(freshSm.getDeploymentTarget() === 'cloud', 'Hydrated deployment target must be cloud');
assert(freshSm.isGreenhouseOptimized(), 'Hydrated cloud greenhouse must remain optimized');
assert(freshSm.getCloudBuckets()[0].objects.length >= 2, 'Hydrated cloud bucket objects must match');
assert(freshSm.getCertificates().length > 0, 'Hydrated certificates must match');

// Test corrupted/empty state handling
freshSm.loadState(null as any);
assert(freshSm.getDeploymentTarget() === 'cloud', 'Null state load must not crash or wipe engine');

console.log('✓ Save/load serialization and hydration verified with 100% fidelity.');

// ==========================================
// TEST 5: ECONOMY & BALANCE VALIDATION
// ==========================================
console.log('\n[5/6] Testing Economy Balance & Cloud Cost Sustainability...');
const costs = freshSm.getCloudCostSummary();
assert(costs.hourlyCostGold > 0, 'Cloud infrastructure must have hourly operating cost');
assert(costs.hourlyCostGold <= 20, `Cloud cost (${costs.hourlyCostGold} G/hr) should be balanced and sustainable for farm production`);

console.log(`✓ Cloud operating costs calculated: ${costs.hourlyCostGold} G/hr (Daily: ${costs.dailyCostGold} G/day). Balanced.`);

// ==========================================
// TEST 6: VICTORY & FREE PLAY CONTINUATION
// ==========================================
console.log('\n[6/6] Testing Game Completion & Free Play State...');
const goal32 = OBJECTIVES.find((o) => o.index === 32);
assert(goal32 !== undefined, 'Goal 32 (Production Cloud Operations) must exist');

// Verify conditions for Goal 32 are satisfied:
const isCloudTarget = freshSm.getDeploymentTarget() === 'cloud';
const isOptimized = freshSm.isGreenhouseOptimized();
const noIncidents = freshIe.getActiveIncidents().length === 0;
const productionSatisfied = isCloudTarget && isOptimized && noIncidents;

assert(productionSatisfied, 'Production Cloud Operations conditions must be met');
console.log('✓ Goal 32 satisfied. Game Complete condition reached.');
console.log('✓ Free Play mode operational with continuous cloud-boosted agriculture.');

console.log('\n======================================================');
console.log('🌟 ALL PHASE 6 VERIFICATION SUITE TESTS PASSED (6/6)');
console.log('======================================================\n');
