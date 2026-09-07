import { ServiceManager } from './src/service-manager';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${msg}`);
}

console.log('--- Phase 5: Cloud Architecture Simulation Verification ---\n');

const mgr = new ServiceManager();

// Test 1: Accounts & Provider switching
console.log('Test 1: Cloud accounts and provider management');
const accounts = mgr.getCloudAccounts();
assert(accounts.length >= 2, 'At least 2 cloud accounts configured (AWS and GCP)');
assert(accounts.some((a) => a.provider === 'aws'), 'AWS account present');
assert(accounts.some((a) => a.provider === 'gcp'), 'GCP project present');
assert(mgr.getActiveCloudProvider() === 'aws', 'Default provider is AWS');
mgr.setActiveCloudProvider('gcp');
assert(mgr.getActiveCloudProvider() === 'gcp', 'Provider switched to GCP');
mgr.setActiveCloudProvider('aws');
assert(mgr.getActiveCloudProvider() === 'aws', 'Provider switched back to AWS');

// Test 2: VPC and Subnets
console.log('\nTest 2: VPC and Subnet network topology');
const vpcs = mgr.getCloudVpcs();
assert(vpcs.length >= 1, 'At least 1 VPC created');
const vpc = vpcs[0];
assert(vpc.cidrBlock === '10.10.0.0/16', 'VPC CIDR block is 10.10.0.0/16');

const subnets = mgr.getCloudSubnets();
assert(subnets.length >= 2, 'Both public and private subnets exist');
const pubSubnet = subnets.find((s) => s.type === 'public');
const privSubnet = subnets.find((s) => s.type === 'private');
assert(pubSubnet !== undefined && pubSubnet.cidrBlock === '10.10.1.0/24', 'Public subnet is 10.10.1.0/24');
assert(privSubnet !== undefined && privSubnet.cidrBlock === '10.10.2.0/24', 'Private subnet is 10.10.2.0/24');

// Test 3: Managed Services & Object Storage outside VPC
console.log('\nTest 3: Object storage outside VPC');
const buckets = mgr.getCloudBuckets();
assert(buckets.length >= 1, 'Telemetry archive bucket exists');
const bucket = buckets[0];
assert(bucket.id === 'solar-grove-telemetry-archive', 'Bucket ID matches expected archive bucket');

// Archive telemetry
const archivedObj = mgr.archiveTelemetryToCloudStorage();
assert(archivedObj.key.startsWith('telemetry/archive-'), 'Archived object generated with proper key');
assert(bucket.objects.length >= 2, 'Object count in bucket increased');

// Test 4: Security Group / Firewall Rules
console.log('\nTest 4: Security Group reachability semantics');
const cloud = mgr.getCloudManager();
const checkAllowed = cloud.evaluateConnectivity('greenhouse-app', 'greenhouse-db', 5432);
assert(checkAllowed.allowed === true, 'Default security group rule allows greenhouse-app to reach greenhouse-db on 5432');

// Disable rule to simulate blocked DB access
mgr.setCloudRuleEnabled('rule-app-to-db', false);
const checkBlocked = cloud.evaluateConnectivity('greenhouse-app', 'greenhouse-db', 5432);
assert(checkBlocked.allowed === false, 'Blocked when security group rule is disabled');

// Re-enable rule
mgr.setCloudRuleEnabled('rule-app-to-db', true);
const checkRestored = cloud.evaluateConnectivity('greenhouse-app', 'greenhouse-db', 5432);
assert(checkRestored.allowed === true, 'Restored when security group rule is re-enabled');

// Test 5: Real Multi-Step Migration Transition with localhost failure
console.log('\nTest 5: Migration transition workflow');
assert(mgr.getDeploymentTarget() === 'local', 'Initial deployment target is local');

const prepRes = mgr.startCloudMigration();
assert(prepRes.success === true, 'Migration successfully prepared');
let progress = mgr.getCloudMigrationProgress();
assert(progress.phase === 'PREPARING' && progress.step === 1, 'Phase is PREPARING at step 1');

// Execute Step 2 with deliberate localhost:5432 misconfiguration
console.log('Testing deliberate localhost:5432 database endpoint failure...');
const failRes = mgr.executeCloudMigrationStep({ forceLocalhostError: true });
assert(failRes.success === false, 'Step 2 failed as expected with localhost DATABASE_URL');
progress = mgr.getCloudMigrationProgress();
assert(progress.phase === 'FAILED', 'Progress phase is FAILED');
assert(progress.failureReason?.includes('localhost'), 'Failure reason explains localhost mistake on cloud compute');

// Fix compute environment DATABASE_URL
cloud.updateComputeEnvironment('i-greenhouse-01', {
  DATABASE_URL: 'postgresql://postgres:solar_grove_pass@greenhouse-db.internal:5432/solar_grove',
});

// Re-run migration step (should succeed past Step 2 to Step 3: VERIFYING)
console.log('Retrying migration after updating DATABASE_URL to greenhouse-db.internal...');
const step2Retry = mgr.executeCloudMigrationStep();
assert(step2Retry.success === true, 'Workload deployment now succeeded');
progress = mgr.getCloudMigrationProgress();
assert(progress.phase === 'VERIFYING' && progress.step === 3, 'Phase advanced to VERIFYING at step 3');

// Run Step 3 verification -> Step 4 COMPLETE
const completeRes = mgr.executeCloudMigrationStep();
assert(completeRes.success === true, 'Verification and completion succeeded');
progress = mgr.getCloudMigrationProgress();
assert(progress.phase === 'COMPLETE' && progress.step === 4, 'Phase is COMPLETE at step 4');
assert(mgr.getDeploymentTarget() === 'cloud', 'Deployment target is now CLOUD');

// Test 6: Ingress Routing to Cloud Compute
console.log('\nTest 6: Helio Relay routing to Cloud Compute');
mgr.deploySoftware('helio-relay');
mgr.startService('helio-relay');
// Issue certificate
mgr.requestCertificate('*.solar-grove.local');

const cloudHttpRes = mgr.dispatchHttp('https://greenhouse.solar-grove.local/health');
assert(cloudHttpRes.statusCode === 200, `Cloud HTTPS health check returned 200 OK (got ${cloudHttpRes.statusCode}: ${cloudHttpRes.error})`);
assert(cloudHttpRes.jsonData?.deploymentTarget === 'cloud', 'Response indicates deploymentTarget is cloud');

// Test 7: Cloud Failure Scenario: Block security group in Cloud deployment
console.log('\nTest 7: Cloud Failure Scenario (TCP 5432 blocked in cloud deployment)');
mgr.setCloudRuleEnabled('rule-app-to-db', false);
const blockedHttpRes = mgr.dispatchHttp('https://greenhouse.solar-grove.local/health');
assert(blockedHttpRes.statusCode === 502, 'HTTP 502 Bad Gateway returned when security group is blocked');
assert(blockedHttpRes.body.includes('Security group blocked TCP 5432'), 'Error body explains security group block');
assert(mgr.isGreenhouseOptimized() === false, 'Farm optimization disabled while DB is blocked');

// Repair rule
mgr.setCloudRuleEnabled('rule-app-to-db', true);
const recoveredHttpRes = mgr.dispatchHttp('https://greenhouse.solar-grove.local/health');
assert(recoveredHttpRes.statusCode === 200, 'HTTP 200 OK after repairing security group rule');
assert(mgr.isGreenhouseOptimized() === true, 'Farm optimization restored (+50% boost active)');

// Test 8: Cloud Cost Calculation
console.log('\nTest 8: Cloud cost calculation');
const costs = mgr.getCloudCostSummary();
assert(costs.hourlyCostGold > 0, 'Hourly cloud cost is computed');
assert(costs.dailyCostGold === costs.hourlyCostGold * 24, 'Daily cost is 24 * hourly');
assert(costs.breakdown.compute > 0, 'Compute cost included');
assert(costs.breakdown.database > 0, 'Database cost included');
assert(costs.breakdown.storage > 0, 'Storage cost included');

console.log('\n🎉 ALL 8 PHASE 5 DOMAIN ENGINE TESTS PASSED PERFECTLY!\n');
