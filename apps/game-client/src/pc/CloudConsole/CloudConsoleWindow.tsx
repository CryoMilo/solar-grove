import type {
  CloudAccount,
  CloudComputeInstance,
  CloudProvider,
  CloudSubnet,
  CloudVpc,
  ManagedDatabaseInstance,
  NetworkRule,
  ObjectStorageBucket,
} from '@solar-grove/game-types';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Cloud,
  Coins,
  Cpu,
  Database,
  ExternalLink,
  FolderArchive,
  Layers,
  Network,
  Play,
  Power,
  RefreshCw,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Square,
  Terminal,
  UploadCloud,
  Wifi,
  XCircle,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useGameStore } from '../../stores/useGameStore';

export const CloudConsoleWindow: React.FC = () => {
  const serviceManager = useGameStore((s) => s.serviceManager);
  const setActiveWindow = useGameStore((s) => s.setActiveWindow);
  const setBrowserUrl = useGameStore((s) => s.setBrowserUrl);
  const checkMilestones = useGameStore((s) => s.checkMilestones);

  const [activeTab, setActiveTab] = useState<
    'topology' | 'vpc' | 'compute' | 'database' | 'security' | 'storage' | 'migration' | 'costs'
  >('topology');
  const [provider, setProvider] = useState<CloudProvider>('aws');
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const cloud = serviceManager.getCloudManager();
  const terminology = cloud.getProviderTerminology(provider);
  const deploymentTarget = serviceManager.getDeploymentTarget();
  const accounts = serviceManager.getCloudAccounts();
  const activeAccount = accounts.find((a) => a.provider === provider) || accounts[0];
  const vpcs = serviceManager.getCloudVpcs();
  const subnets = serviceManager.getCloudSubnets();
  const computeInstances = serviceManager.getCloudComputeInstances();
  const databases = serviceManager.getCloudDatabases();
  const buckets = serviceManager.getCloudBuckets();
  const networkRules = serviceManager.getNetworkRules();
  const migrationProgress = serviceManager.getCloudMigrationProgress();
  const costSummary = serviceManager.getCloudCostSummary();

  const handleToggleCompute = (instanceId: string, currentStatus: string) => {
    if (currentStatus === 'RUNNING') {
      cloud.stopComputeInstance(instanceId);
      setStatusMessage(`Stopped ${terminology.computeLabel} (${instanceId})`);
    } else {
      cloud.startComputeInstance(instanceId);
      setStatusMessage(`Started ${terminology.computeLabel} (${instanceId})`);
    }
    setRefreshNonce((n) => n + 1);
    checkMilestones();
  };

  const handleToggleRule = (ruleId: string, currentEnabled: boolean) => {
    serviceManager.setCloudRuleEnabled(ruleId, !currentEnabled);
    setStatusMessage(`Security rule '${ruleId}' ${!currentEnabled ? 'ENABLED' : 'DISABLED'}`);
    setRefreshNonce((n) => n + 1);
    checkMilestones();
  };

  const handleArchiveTelemetry = () => {
    const archived = serviceManager.archiveTelemetryToCloudStorage();
    setStatusMessage(`Successfully archived telemetry to ${archived.key} (${archived.sizeBytes} bytes)`);
    setRefreshNonce((n) => n + 1);
    checkMilestones();
  };

  const handleStartMigration = () => {
    const res = serviceManager.startCloudMigration();
    setStatusMessage(res.message);
    setRefreshNonce((n) => n + 1);
    checkMilestones();
  };

  const handleNextMigrationStep = () => {
    // Deliberate failure on initial Step 2 run if not yet deployed
    const compute = serviceManager.getCloudComputeInstance('i-greenhouse-01');
    const isFirstMigrate =
      migrationProgress.phase === 'PREPARING' &&
      compute?.environment.DATABASE_URL?.includes('greenhouse-db.internal');

    const res = serviceManager.executeCloudMigrationStep({
      forceLocalhostError: isFirstMigrate,
    });
    setStatusMessage(res.message);
    setRefreshNonce((n) => n + 1);
    checkMilestones();
  };

  const handleFixDatabaseUrl = () => {
    cloud.updateComputeEnvironment('i-greenhouse-01', {
      DATABASE_URL: 'postgresql://postgres:solar_grove_pass@greenhouse-db.internal:5432/solar_grove',
    });
    setStatusMessage('Updated DATABASE_URL to managed database endpoint (greenhouse-db.internal:5432)');
    setRefreshNonce((n) => n + 1);
    checkMilestones();
  };

  return (
    <div style={{ padding: '20px', height: '100%', overflowY: 'auto', boxSizing: 'border-box' }}>
      {/* Top Banner & Control Plane Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          borderBottom: '1px solid rgba(72, 187, 120, 0.25)',
          paddingBottom: '14px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2
              style={{
                fontSize: '18px',
                color: '#f0fff4',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Cloud size={22} color="#ecc94b" /> HELIOS CLOUD MANAGER
            </h2>
            <span
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '4px',
                background:
                  deploymentTarget === 'cloud'
                    ? 'rgba(72, 187, 120, 0.2)'
                    : 'rgba(237, 137, 54, 0.2)',
                color: deploymentTarget === 'cloud' ? '#68d391' : '#fbd38d',
                border:
                  deploymentTarget === 'cloud'
                    ? '1px solid rgba(72, 187, 120, 0.4)'
                    : '1px solid rgba(237, 137, 54, 0.4)',
                fontWeight: 600,
              }}
            >
              {deploymentTarget === 'cloud'
                ? `PRODUCTION CLOUD (${activeAccount?.region})`
                : 'LOCAL FARM DEPLOYMENT'}
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#a0aec0', marginTop: '3px' }}>
            Solarpunk Multi-Cloud Infrastructure Control Plane • {terminology.providerName}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className={`btn-solarpunk ${provider === 'aws' ? 'btn-gold' : ''}`}
            onClick={() => {
              setProvider('aws');
              serviceManager.setActiveCloudProvider('aws');
            }}
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            Amazon Web Services (AWS)
          </button>
          <button
            className={`btn-solarpunk ${provider === 'gcp' ? 'btn-gold' : ''}`}
            onClick={() => {
              setProvider('gcp');
              serviceManager.setActiveCloudProvider('gcp');
            }}
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            Google Cloud Platform (GCP)
          </button>
        </div>
      </div>

      {/* Status Notice */}
      {statusMessage && (
        <div
          style={{
            marginBottom: '14px',
            padding: '10px 14px',
            background: 'rgba(49, 130, 206, 0.15)',
            border: '1px solid rgba(49, 130, 206, 0.4)',
            borderRadius: '6px',
            color: '#90cdf4',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{statusMessage}</span>
          <button
            onClick={() => setStatusMessage(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#a0aec0',
              cursor: 'pointer',
              fontSize: '11px',
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '18px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: '8px',
          overflowX: 'auto',
        }}
      >
        {[
          { id: 'topology', label: 'Architecture Topology', icon: Layers },
          { id: 'vpc', label: 'VPC & Subnets', icon: Network },
          { id: 'compute', label: terminology.computeLabel, icon: Server },
          { id: 'database', label: terminology.databaseLabel, icon: Database },
          { id: 'security', label: terminology.firewallLabel, icon: Shield },
          { id: 'storage', label: terminology.storageLabel, icon: FolderArchive },
          { id: 'migration', label: 'Migration Wizard', icon: UploadCloud },
          { id: 'costs', label: 'FinOps & Costs', icon: Coins },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                background: isActive ? 'rgba(72, 187, 120, 0.25)' : 'transparent',
                color: isActive ? '#68d391' : '#a0aec0',
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ARCHITECTURE TOPOLOGY */}
      {activeTab === 'topology' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            className="glass-panel"
            style={{
              padding: '16px',
              background: 'rgba(15, 34, 27, 0.65)',
              border: '1px solid rgba(72, 187, 120, 0.3)',
              borderRadius: '8px',
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#f0fff4', marginBottom: '8px' }}>
              Cloud Network Topology (Zero-Trust Solarpunk Architecture)
            </div>
            <div style={{ fontSize: '12px', color: '#a0aec0', marginBottom: '16px' }}>
              Object Storage is positioned outside the VPC subnet hierarchy as a managed regional cloud service. Public compute connects to isolated private database via explicit security group rule.
            </div>

            {/* Visual Topology Diagram */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '12px',
              }}
            >
              {/* VPC Hierarchy */}
              <div
                style={{
                  border: '1px solid rgba(66, 153, 225, 0.4)',
                  borderRadius: '8px',
                  padding: '14px',
                  background: 'rgba(26, 32, 44, 0.6)',
                }}
              >
                <div
                  style={{
                    color: '#63b3ed',
                    fontWeight: 700,
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Network size={16} /> VPC: solar-vpc-prod (10.10.0.0/16)
                </div>

                {/* Public Subnet */}
                <div
                  style={{
                    border: '1px solid rgba(72, 187, 120, 0.4)',
                    borderRadius: '6px',
                    padding: '10px',
                    marginBottom: '12px',
                    background: 'rgba(15, 34, 27, 0.5)',
                  }}
                >
                  <div style={{ color: '#68d391', fontWeight: 600, marginBottom: '6px' }}>
                    🌐 Public Subnet: public-subnet-1a (10.10.1.0/24)
                  </div>
                  <div style={{ color: '#cbd5e0', paddingLeft: '12px' }}>
                    └── Compute: i-greenhouse-01
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;├ IP: 10.10.1.10 (Public: 13.250.14.22)
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;└ Security Group: greenhouse-app
                  </div>
                </div>

                {/* Private Subnet */}
                <div
                  style={{
                    border: '1px solid rgba(237, 137, 54, 0.4)',
                    borderRadius: '6px',
                    padding: '10px',
                    background: 'rgba(45, 26, 15, 0.5)',
                  }}
                >
                  <div style={{ color: '#fbd38d', fontWeight: 600, marginBottom: '6px' }}>
                    🔒 Private Subnet: private-subnet-1a (10.10.2.0/24)
                  </div>
                  <div style={{ color: '#cbd5e0', paddingLeft: '12px' }}>
                    └── Database: greenhouse-db (RDS PostgreSQL)
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;├ Endpoint: greenhouse-db.internal:5432
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;├ Public Access: DISABLED (Private Only)
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;└ Security Group: greenhouse-db
                  </div>
                </div>
              </div>

              {/* Managed Cloud Services (Outside VPC) */}
              <div
                style={{
                  border: '1px solid rgba(159, 122, 234, 0.4)',
                  borderRadius: '8px',
                  padding: '14px',
                  background: 'rgba(30, 25, 45, 0.6)',
                }}
              >
                <div
                  style={{
                    color: '#b794f4',
                    fontWeight: 700,
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Cloud size={16} /> Regional Managed Services (Outside VPC Hierarchy)
                </div>

                <div
                  style={{
                    border: '1px solid rgba(159, 122, 234, 0.3)',
                    borderRadius: '6px',
                    padding: '10px',
                    marginBottom: '12px',
                    background: 'rgba(40, 32, 60, 0.5)',
                  }}
                >
                  <div style={{ color: '#d6bcfa', fontWeight: 600, marginBottom: '6px' }}>
                    📦 Object Storage: {terminology.storageLabel}
                  </div>
                  <div style={{ color: '#cbd5e0', paddingLeft: '12px' }}>
                    └── Bucket: solar-grove-telemetry-archive
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;├ Region: {activeAccount?.region}
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;├ Accessibility: S3 API / HTTPS endpoint
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;└ Objects: {buckets[0]?.objects.length || 0} telemetry archives
                  </div>
                </div>

                {/* Edge Ingress Link */}
                <div
                  style={{
                    border: '1px solid rgba(236, 201, 75, 0.3)',
                    borderRadius: '6px',
                    padding: '10px',
                    background: 'rgba(45, 40, 15, 0.5)',
                  }}
                >
                  <div style={{ color: '#ecc94b', fontWeight: 600, marginBottom: '6px' }}>
                    ⚡ Edge Gateway Ingress
                  </div>
                  <div style={{ color: '#cbd5e0', paddingLeft: '12px' }}>
                    └── Helio Relay Gateway (10.0.0.10)
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;└ Routes to: {deploymentTarget === 'cloud' ? '10.10.1.10:4000 (Cloud Compute)' : '10.0.0.20:4000 (Local Container)'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VPC & SUBNETS */}
      {activeTab === 'vpc' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '16px', background: 'rgba(15, 34, 27, 0.6)' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#f0fff4', marginBottom: '12px' }}>
              Virtual Private Cloud (VPC) Instances
            </div>
            {vpcs.map((v) => (
              <div
                key={v.id}
                style={{
                  padding: '12px',
                  background: 'rgba(26, 32, 44, 0.5)',
                  borderRadius: '6px',
                  border: '1px solid rgba(66, 153, 225, 0.3)',
                  marginBottom: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ color: '#63b3ed', fontWeight: 700, fontSize: '14px' }}>
                    {v.name} ({v.id})
                  </div>
                  <span style={{ fontSize: '11px', color: '#a0aec0', fontFamily: 'monospace' }}>
                    CIDR: {v.cidrBlock} | Region: {v.region}
                  </span>
                </div>
              </div>
            ))}

            <div style={{ fontSize: '15px', fontWeight: 600, color: '#f0fff4', margin: '20px 0 12px' }}>
              Subnet Segregation
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {subnets.map((s) => (
                <div
                  key={s.id}
                  style={{
                    padding: '12px',
                    borderRadius: '6px',
                    border:
                      s.type === 'public'
                        ? '1px solid rgba(72, 187, 120, 0.4)'
                        : '1px solid rgba(237, 137, 54, 0.4)',
                    background:
                      s.type === 'public'
                        ? 'rgba(15, 34, 27, 0.4)'
                        : 'rgba(45, 26, 15, 0.4)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600, color: s.type === 'public' ? '#68d391' : '#fbd38d' }}>
                      {s.name}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background:
                          s.type === 'public'
                            ? 'rgba(72, 187, 120, 0.2)'
                            : 'rgba(237, 137, 54, 0.2)',
                        color: s.type === 'public' ? '#68d391' : '#fbd38d',
                      }}
                    >
                      {s.type.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#a0aec0', marginTop: '6px', fontFamily: 'monospace' }}>
                    CIDR: {s.cidrBlock} | AZ: {s.availabilityZone}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COMPUTE */}
      {activeTab === 'compute' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {computeInstances.map((inst) => {
            const isRunning = inst.status === 'RUNNING';
            return (
              <div
                key={inst.id}
                className="glass-panel"
                style={{
                  padding: '16px',
                  background: 'rgba(15, 34, 27, 0.6)',
                  border: isRunning
                    ? '1px solid rgba(72, 187, 120, 0.4)'
                    : '1px solid rgba(229, 62, 62, 0.3)',
                  borderRadius: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Server size={18} color={isRunning ? '#68d391' : '#fc8181'} />
                      <span style={{ fontSize: '15px', fontWeight: 700, color: '#f0fff4' }}>
                        {inst.name}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: isRunning ? 'rgba(72, 187, 120, 0.2)' : 'rgba(229, 62, 62, 0.2)',
                          color: isRunning ? '#68d391' : '#fc8181',
                        }}
                      >
                        {inst.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#a0aec0', marginTop: '4px', fontFamily: 'monospace' }}>
                      ID: {inst.id} | Type: {inst.instanceType} | Private IP: {inst.privateIp} | Public IP: {inst.publicIp || 'None'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#ecc94b', fontWeight: 600 }}>
                      {inst.costPerHour} Gold / hr
                    </span>
                    <button
                      className="btn-solarpunk"
                      onClick={() => handleToggleCompute(inst.id, inst.status)}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      {isRunning ? <Power size={14} color="#fc8181" /> : <Play size={14} color="#68d391" />}
                      {isRunning ? 'Stop' : 'Start'}
                    </button>
                    <button
                      className="btn-solarpunk"
                      onClick={() => setActiveWindow('terminal')}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      <Terminal size={14} /> SSH
                    </button>
                  </div>
                </div>

                {/* Environment Variables */}
                <div
                  style={{
                    marginTop: '12px',
                    padding: '8px 12px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    borderRadius: '6px',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    color: '#e2e8f0',
                  }}
                >
                  <div style={{ color: '#ecc94b', marginBottom: '4px' }}>Environment Variables:</div>
                  <div>DATABASE_URL: {inst.environment.DATABASE_URL}</div>
                  <div>PORT: {inst.environment.PORT}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 4: MANAGED DATABASE */}
      {activeTab === 'database' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {databases.map((db) => (
            <div
              key={db.id}
              className="glass-panel"
              style={{
                padding: '16px',
                background: 'rgba(15, 34, 27, 0.6)',
                border: '1px solid rgba(237, 137, 54, 0.4)',
                borderRadius: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Database size={20} color="#fbd38d" />
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#f0fff4' }}>
                      {db.name} ({terminology.databaseLabel})
                    </div>
                    <div style={{ fontSize: '11px', color: '#a0aec0', fontFamily: 'monospace', marginTop: '3px' }}>
                      Engine: {db.engine} v{db.version} | Status: {db.status} | Port: {db.port}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: '#ecc94b', fontWeight: 600 }}>
                  {db.costPerHour} Gold / hr
                </div>
              </div>

              <div
                style={{
                  marginTop: '14px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                }}
              >
                <div style={{ padding: '8px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '4px' }}>
                  <div style={{ color: '#a0aec0' }}>Private Endpoint:</div>
                  <div style={{ color: '#68d391', fontWeight: 600 }}>{db.endpoint}</div>
                </div>
                <div style={{ padding: '8px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '4px' }}>
                  <div style={{ color: '#a0aec0' }}>Public Internet Exposure:</div>
                  <div style={{ color: db.isPubliclyAccessible ? '#fc8181' : '#68d391', fontWeight: 600 }}>
                    {db.isPubliclyAccessible ? 'PUBLIC (UNSECURED)' : 'PRIVATE (ZERO-TRUST)'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: SECURITY GROUPS & RULES */}
      {activeTab === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '16px', background: 'rgba(15, 34, 27, 0.6)' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#f0fff4', marginBottom: '8px' }}>
              {terminology.firewallLabel} Configuration
            </div>
            <div style={{ fontSize: '12px', color: '#a0aec0', marginBottom: '14px' }}>
              Model database reachability via explicit compute security groups. Disabling TCP 5432 rule simulates the primary cloud triage incident.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {networkRules.map((rule) => (
                <div
                  key={rule.id}
                  style={{
                    padding: '12px',
                    borderRadius: '6px',
                    border: rule.enabled
                      ? '1px solid rgba(72, 187, 120, 0.3)'
                      : '1px solid rgba(229, 62, 62, 0.3)',
                    background: 'rgba(0, 0, 0, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, color: '#f0fff4', fontSize: '13px' }}>
                        {rule.name}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background:
                            rule.action === 'ALLOW'
                              ? 'rgba(72, 187, 120, 0.2)'
                              : 'rgba(229, 62, 62, 0.2)',
                          color: rule.action === 'ALLOW' ? '#68d391' : '#fc8181',
                          fontWeight: 600,
                        }}
                      >
                        {rule.action} {rule.protocol.toUpperCase()}:{rule.port}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#a0aec0',
                        marginTop: '4px',
                        fontFamily: 'monospace',
                      }}
                    >
                      Source ({rule.sourceType}): {rule.source} ➔ Destination: {rule.destination}
                    </div>
                    {rule.description && (
                      <div style={{ fontSize: '11px', color: '#718096', marginTop: '2px' }}>
                        {rule.description}
                      </div>
                    )}
                  </div>

                  <button
                    className={`btn-solarpunk ${rule.enabled ? 'btn-gold' : ''}`}
                    onClick={() => handleToggleRule(rule.id, rule.enabled)}
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    {rule.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: OBJECT STORAGE */}
      {activeTab === 'storage' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '16px', background: 'rgba(15, 34, 27, 0.6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#f0fff4' }}>
                  Bucket: {buckets[0]?.name}
                </div>
                <div style={{ fontSize: '11px', color: '#a0aec0', marginTop: '3px' }}>
                  Positioned outside VPC subnet hierarchy under regional Managed Services
                </div>
              </div>
              <button
                className="btn-solarpunk btn-gold"
                onClick={handleArchiveTelemetry}
                style={{ padding: '6px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <UploadCloud size={14} /> Archive Current Telemetry
              </button>
            </div>

            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', marginBottom: '8px' }}>
                Stored Telemetry Archives:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {buckets[0]?.objects.map((obj) => (
                  <div
                    key={obj.key}
                    style={{
                      padding: '10px 14px',
                      background: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: '6px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontFamily: 'monospace',
                      fontSize: '11px',
                    }}
                  >
                    <div>
                      <div style={{ color: '#68d391', fontWeight: 600 }}>{obj.key}</div>
                      <div style={{ color: '#a0aec0', marginTop: '2px' }}>{obj.dataSummary}</div>
                    </div>
                    <div style={{ textAlign: 'right', color: '#cbd5e0' }}>
                      <div>{obj.sizeBytes} bytes</div>
                      <div style={{ color: '#718096' }}>{obj.lastModified.substring(0, 19).replace('T', ' ')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: MIGRATION WIZARD */}
      {activeTab === 'migration' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '16px', background: 'rgba(15, 34, 27, 0.6)' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#f0fff4', marginBottom: '8px' }}>
              Live Cloud Migration Pipeline
            </div>
            <div style={{ fontSize: '12px', color: '#a0aec0', marginBottom: '16px' }}>
              Moves the Greenhouse Controller workload and data from local container infrastructure to the cloud.
            </div>

            {/* Stepper Header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px',
                marginBottom: '18px',
              }}
            >
              {[
                { step: 1, label: 'PREPARING', desc: 'Verify Infrastructure' },
                { step: 2, label: 'MIGRATING', desc: 'Deploy Workload' },
                { step: 3, label: 'VERIFYING', desc: 'Check Connectivity' },
                { step: 4, label: 'COMPLETE', desc: 'Switch Ingress' },
              ].map((s) => {
                const isCurrent = migrationProgress.step === s.step;
                const isPassed = migrationProgress.step > s.step || migrationProgress.phase === 'COMPLETE';
                const isFailed = isCurrent && migrationProgress.phase === 'FAILED';

                return (
                  <div
                    key={s.step}
                    style={{
                      padding: '10px',
                      borderRadius: '6px',
                      background: isCurrent
                        ? isFailed
                          ? 'rgba(229, 62, 62, 0.2)'
                          : 'rgba(236, 201, 75, 0.2)'
                        : isPassed
                        ? 'rgba(72, 187, 120, 0.2)'
                        : 'rgba(0, 0, 0, 0.25)',
                      border: isCurrent
                        ? isFailed
                          ? '1px solid #fc8181'
                          : '1px solid #ecc94b'
                        : isPassed
                        ? '1px solid #68d391'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: isFailed ? '#fc8181' : isPassed ? '#68d391' : '#f0fff4',
                      }}
                    >
                      Step {s.step}: {s.label}
                    </div>
                    <div style={{ fontSize: '10px', color: '#a0aec0', marginTop: '2px' }}>{s.desc}</div>
                  </div>
                );
              })}
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'center' }}>
              {migrationProgress.phase === 'IDLE' && (
                <button className="btn-solarpunk btn-gold" onClick={handleStartMigration}>
                  Start Migration Pipeline
                </button>
              )}
              {migrationProgress.phase !== 'IDLE' && migrationProgress.phase !== 'COMPLETE' && (
                <button className="btn-solarpunk" onClick={handleNextMigrationStep}>
                  Execute Next Step ({migrationProgress.currentTask})
                </button>
              )}
              {migrationProgress.failureReason && (
                <button className="btn-solarpunk btn-gold" onClick={handleFixDatabaseUrl}>
                  Fix DATABASE_URL ➔ greenhouse-db.internal:5432
                </button>
              )}
            </div>

            {/* Failure Box */}
            {migrationProgress.failureReason && (
              <div
                style={{
                  padding: '12px',
                  background: 'rgba(229, 62, 62, 0.15)',
                  border: '1px solid rgba(229, 62, 62, 0.4)',
                  borderRadius: '6px',
                  color: '#fc8181',
                  fontSize: '12px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: '4px' }}>Migration Stalled:</div>
                <div>{migrationProgress.failureReason}</div>
              </div>
            )}

            {/* Migration Logs */}
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.6)',
                borderRadius: '6px',
                padding: '12px',
                fontFamily: 'monospace',
                fontSize: '11px',
                maxHeight: '160px',
                overflowY: 'auto',
                color: '#a0aec0',
              }}
            >
              <div style={{ color: '#e2e8f0', marginBottom: '6px' }}>Migration Logs:</div>
              {migrationProgress.logs.map((log, idx) => (
                <div key={idx} style={{ color: log.includes('[error]') ? '#fc8181' : '#a0aec0' }}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: FINOPS & COSTS */}
      {activeTab === 'costs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '16px', background: 'rgba(15, 34, 27, 0.6)' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#f0fff4', marginBottom: '12px' }}>
              Simulated Infrastructure FinOps & Cost Breakdown
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div style={{ padding: '14px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '6px' }}>
                <div style={{ fontSize: '11px', color: '#a0aec0' }}>Total Hourly Cloud Expense:</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#ecc94b', marginTop: '4px' }}>
                  {costSummary.hourlyCostGold} Gold / hour
                </div>
              </div>
              <div style={{ padding: '14px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '6px' }}>
                <div style={{ fontSize: '11px', color: '#a0aec0' }}>Projected Daily Run Rate:</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#ecc94b', marginTop: '4px' }}>
                  {costSummary.dailyCostGold} Gold / day
                </div>
              </div>
            </div>

            <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', marginBottom: '8px' }}>
              Cost per Service Category:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#cbd5e0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Compute ({terminology.computeLabel}):</span>
                <span style={{ color: '#ecc94b' }}>{costSummary.breakdown.compute} Gold/hr</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Database ({terminology.databaseLabel}):</span>
                <span style={{ color: '#ecc94b' }}>{costSummary.breakdown.database} Gold/hr</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Storage ({terminology.storageLabel}):</span>
                <span style={{ color: '#ecc94b' }}>{costSummary.breakdown.storage} Gold/hr</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
