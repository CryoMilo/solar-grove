import { SOFTWARE_CATALOG } from '@solar-grove/content';
import type { SoftwareDefinition } from '@solar-grove/game-types';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Database,
  Download,
  ExternalLink,
  Globe,
  Layers,
  Play,
  Search,
  Server,
  Terminal,
  XCircle,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useGameStore } from '../../stores/useGameStore';

export const SoftwareCatalogWindow: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'running' | 'offline' | 'unhosted'>('all');
  const [selectedId, setSelectedId] = useState<string>('irrigation-controller');
  const [deployFeedback, setDeployFeedback] = useState<string | null>(null);

  const serviceManager = useGameStore((s) => s.serviceManager);
  const setActiveWindow = useGameStore((s) => s.setActiveWindow);
  const setBrowserUrl = useGameStore((s) => s.setBrowserUrl);
  const deploySoftware = useGameStore((s) => s.deploySoftware);

  const catalogItems = Object.values(SOFTWARE_CATALOG);

  const getItemStatus = (item: SoftwareDefinition): 'running' | 'offline' | 'unhosted' => {
    if (item.deployment === 'docker' || item.id === 'greenhouse-controller') {
      const container = serviceManager.findContainer('greenhouse-controller');
      if (!container) return 'unhosted';
      return container.status === 'RUNNING' && container.health === 'HEALTHY'
        ? 'running'
        : 'offline';
    }
    const svc = serviceManager.getService(item.serviceName);
    if (!svc) return 'unhosted';
    return svc.status === 'running' ? 'running' : 'offline';
  };

  const getItemDeploymentStatus = (item: SoftwareDefinition): string => {
    if (item.deployment === 'docker' || item.id === 'greenhouse-controller') {
      const c = serviceManager.findContainer('greenhouse-controller');
      if (!c) return 'NOT_DEPLOYED';
      if (c.status === 'RUNNING') return c.health === 'HEALTHY' ? 'RUNNING' : 'DEGRADED';
      return c.status;
    }
    const svc = serviceManager.getService(item.serviceName);
    return svc?.deploymentStatus || 'NOT_DEPLOYED';
  };

  const filteredItems = catalogItems.filter((item) => {
    const status = getItemStatus(item);
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.buildingName.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === 'running') return status === 'running';
    if (filter === 'offline') return status === 'offline';
    if (filter === 'unhosted') return status === 'unhosted';
    return true;
  });

  const selectedItem: SoftwareDefinition =
    SOFTWARE_CATALOG[selectedId] || SOFTWARE_CATALOG['irrigation-controller'];

  const selectedSvc = serviceManager.getService(selectedItem.serviceName);
  const selectedStatus = getItemStatus(selectedItem);
  const isDocker =
    selectedItem.deployment === 'docker' || selectedItem.id === 'greenhouse-controller';
  const selectedContainer = isDocker
    ? serviceManager.findContainer('greenhouse-controller')
    : undefined;
  const deploymentStatus = getItemDeploymentStatus(selectedItem);

  const handleDeploy = () => {
    const res = deploySoftware(selectedItem.id);
    setDeployFeedback(res.message);
    setTimeout(() => setDeployFeedback(null), 5000);
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        backgroundColor: '#0a1410',
        color: '#e2e8f0',
        fontFamily: 'var(--font-display)',
      }}
    >
      {/* Left Column: Software Registry List */}
      <div
        style={{
          width: '380px',
          borderRight: '1px solid rgba(214,158,46,0.3)',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#08110e',
        }}
      >
        {/* Search & Filter Header */}
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid rgba(72,187,120,0.2)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px',
              color: '#ecc94b',
              fontWeight: 800,
              fontSize: '14px',
              letterSpacing: '0.04em',
            }}
          >
            <Layers size={18} />
            <span>SOLAR GROVE SOFTWARE CATALOG</span>
          </div>

          <div style={{ position: 'relative', marginBottom: '10px' }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#718096',
              }}
            />
            <input
              type="text"
              placeholder="Search services or buildings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px 7px 32px',
                backgroundColor: '#050c09',
                border: '1px solid rgba(214,158,46,0.4)',
                borderRadius: '6px',
                color: '#f0fff4',
                fontSize: '12px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {(['all', 'running', 'offline', 'unhosted'] as const).map((f) => (
              <button
                key={f}
                type="button"
                className="btn-solarpunk"
                onClick={() => setFilter(f)}
                style={{
                  padding: '3px 8px',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  background: filter === f ? 'rgba(236,201,75,0.2)' : 'transparent',
                  borderColor: filter === f ? '#ecc94b' : 'rgba(72,187,120,0.3)',
                  color: filter === f ? '#ecc94b' : '#a0aec0',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* List of Applications */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {filteredItems.map((item) => {
            const status = getItemStatus(item);
            const isSelected = item.id === selectedId;
            const dStatus = getItemDeploymentStatus(item);

            return (
              <div
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  border: isSelected ? '1px solid #ecc94b' : '1px solid rgba(72,187,120,0.2)',
                  backgroundColor: isSelected ? 'rgba(236,201,75,0.12)' : 'rgba(20,44,34,0.4)',
                  transition: 'all 0.15s ease',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '4px',
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: '13px', color: '#f0fff4' }}>
                    {item.name}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      color: '#a0aec0',
                    }}
                  >
                    v{item.version}
                  </span>
                </div>

                <div style={{ fontSize: '11px', color: '#9ae6b4', marginBottom: '6px' }}>
                  Required by: {item.buildingName}
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '10px',
                  }}
                >
                  <span style={{ color: '#718096', fontFamily: 'var(--font-mono)' }}>
                    Port: {item.port}
                  </span>

                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: 700,
                      color:
                        status === 'running'
                          ? '#48bb78'
                          : dStatus === 'DEGRADED'
                            ? '#f56565'
                            : dStatus === 'DEPLOYED' || dStatus === 'RUNNING'
                              ? '#ecc94b'
                              : '#cbd5e0',
                    }}
                  >
                    {status === 'running' ? (
                      <>
                        <CheckCircle2 size={11} />
                        ONLINE
                      </>
                    ) : dStatus === 'DEGRADED' ? (
                      <>
                        <AlertTriangle size={11} />
                        UNHEALTHY
                      </>
                    ) : dStatus === 'DEPLOYED' || dStatus === 'RUNNING' ? (
                      <>
                        <Server size={11} />
                        {dStatus}
                      </>
                    ) : (
                      <>
                        <XCircle size={11} />
                        NOT DEPLOYED
                      </>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Detailed Specification & Direct Operations */}
      <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        <div
          className="glass-panel frame-solarpunk"
          style={{ padding: '24px', position: 'relative' }}
        >
          <div className="rivet rivet-tl" />
          <div className="rivet rivet-tr" />
          <div className="rivet rivet-bl" />
          <div className="rivet rivet-br" />

          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderBottom: '1px solid rgba(214,158,46,0.3)',
              paddingBottom: '16px',
              marginBottom: '20px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: '20px',
                    fontWeight: 800,
                    color: '#ecc94b',
                  }}
                >
                  {selectedItem.name}
                </h2>
                <span
                  style={{
                    backgroundColor: 'rgba(236,201,75,0.2)',
                    color: '#ecc94b',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  v{selectedItem.version}
                </span>
              </div>
              <p style={{ margin: '6px 0 0 0', color: '#cbd5e0', fontSize: '13px' }}>
                {selectedItem.description}
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '6px',
                border: '1px solid',
                borderColor:
                  selectedStatus === 'running'
                    ? '#48bb78'
                    : deploymentStatus === 'DEPLOYED'
                      ? '#ecc94b'
                      : '#cbd5e0',
                backgroundColor:
                  selectedStatus === 'running'
                    ? 'rgba(72,187,120,0.15)'
                    : deploymentStatus === 'DEPLOYED'
                      ? 'rgba(236,201,75,0.15)'
                      : 'rgba(160,174,192,0.15)',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor:
                    selectedStatus === 'running'
                      ? '#48bb78'
                      : deploymentStatus === 'DEPLOYED'
                        ? '#ecc94b'
                        : '#a0aec0',
                }}
              />
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color:
                    selectedStatus === 'running'
                      ? '#48bb78'
                      : deploymentStatus === 'DEPLOYED'
                        ? '#ecc94b'
                        : '#cbd5e0',
                  textTransform: 'uppercase',
                }}
              >
                {selectedStatus === 'running' ? 'RUNNING' : deploymentStatus}
              </span>
            </div>
          </div>

          {/* Feedback banner */}
          {deployFeedback && (
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: 'rgba(72,187,120,0.2)',
                border: '1px solid #48bb78',
                borderRadius: '6px',
                marginBottom: '16px',
                fontSize: '12px',
                color: '#68d391',
              }}
            >
              ✓ {deployFeedback}
            </div>
          )}

          {/* Technical Architecture Matrix */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                backgroundColor: '#07100d',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(72,187,120,0.2)',
              }}
            >
              <div
                style={{
                  color: '#a0aec0',
                  fontSize: '11px',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Cpu size={13} color="#4fd1c5" /> RUNTIME SPECIFICATION
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#f0fff4' }}>
                {selectedItem.runtime}
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#07100d',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(72,187,120,0.2)',
              }}
            >
              <div
                style={{
                  color: '#a0aec0',
                  fontSize: '11px',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Globe size={13} color="#63b3ed" /> NETWORK SOCKET & HEALTH
              </div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#f0fff4',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                Port {selectedItem.port} ({selectedItem.healthEndpoint})
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#07100d',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(72,187,120,0.2)',
              }}
            >
              <div
                style={{
                  color: '#a0aec0',
                  fontSize: '11px',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Database size={13} color="#b794f4" /> PERSISTENCE & DATABASE
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#f0fff4' }}>
                {selectedItem.database}
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#07100d',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(72,187,120,0.2)',
              }}
            >
              <div
                style={{
                  color: '#a0aec0',
                  fontSize: '11px',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Server size={13} color="#48bb78" /> REQUIRED BY BUILDING
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#f0fff4' }}>
                {selectedItem.buildingName}
              </div>
            </div>
          </div>

          {/* Supported Deployment Targets */}
          <div style={{ marginBottom: '20px' }}>
            <h4
              style={{
                fontSize: '12px',
                color: '#ecc94b',
                textTransform: 'uppercase',
                margin: '0 0 8px 0',
              }}
            >
              Supported Deployment Environments
            </h4>
            <div style={{ display: 'flex', gap: '8px' }}>
              {selectedItem.deployments.map((d) => (
                <span
                  key={d}
                  style={{
                    backgroundColor: 'rgba(72,187,120,0.15)',
                    border: '1px solid rgba(72,187,120,0.35)',
                    color: '#9ae6b4',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  ✓ {d}
                </span>
              ))}
            </div>
          </div>

          {/* Infrastructure & Dependency Requirements */}
          {selectedItem.requirements && selectedItem.requirements.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h4
                style={{
                  fontSize: '12px',
                  color: '#ecc94b',
                  textTransform: 'uppercase',
                  margin: '0 0 8px 0',
                }}
              >
                Runtime Dependencies & Services
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {selectedItem.requirements.map((req) => (
                  <span
                    key={req}
                    style={{
                      backgroundColor: 'rgba(99,179,237,0.15)',
                      border: '1px solid rgba(99,179,237,0.35)',
                      color: '#90cdf4',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    ⚙ {req}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Environment Variables Configuration */}
          {selectedItem.environment && Object.keys(selectedItem.environment).length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h4
                style={{
                  fontSize: '12px',
                  color: '#ecc94b',
                  textTransform: 'uppercase',
                  margin: '0 0 8px 0',
                }}
              >
                Environment Variables
              </h4>
              <div
                style={{
                  backgroundColor: '#050c09',
                  border: '1px solid rgba(72,187,120,0.2)',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                }}
              >
                {Object.entries(selectedItem.environment).map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', gap: '10px', marginBottom: '4px' }}>
                    <span style={{ color: '#ecc94b', fontWeight: 600 }}>{key}=</span>
                    <span style={{ color: '#9ae6b4', wordBreak: 'break-all' }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Actions for Vertical Slice Loop */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              borderTop: '1px solid rgba(214,158,46,0.3)',
              paddingTop: '18px',
            }}
          >
            {isDocker ? (
              selectedContainer ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    backgroundColor:
                      selectedContainer.health === 'HEALTHY'
                        ? 'rgba(72,187,120,0.15)'
                        : 'rgba(229,62,62,0.15)',
                    border: `1px solid ${
                      selectedContainer.health === 'HEALTHY' ? '#48bb78' : '#e53e3e'
                    }`,
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: selectedContainer.health === 'HEALTHY' ? '#68d391' : '#fc8181',
                  }}
                >
                  <Server size={14} />
                  <span>
                    CONTAINER: {selectedContainer.name} ({selectedContainer.status} /{' '}
                    {selectedContainer.health})
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn-solarpunk btn-gold"
                  onClick={() => setActiveWindow('terminal')}
                  style={{ padding: '8px 16px', fontSize: '12px' }}
                >
                  <Terminal size={15} /> Deploy via Docker (Terminal)
                </button>
              )
            ) : (
              deploymentStatus === 'NOT_DEPLOYED' && (
                <button
                  type="button"
                  className="btn-solarpunk btn-gold"
                  onClick={handleDeploy}
                  style={{ padding: '8px 16px', fontSize: '12px' }}
                >
                  <Download size={15} /> Deploy Software Package
                </button>
              )
            )}

            <button
              type="button"
              className="btn-solarpunk"
              onClick={() => setActiveWindow('terminal')}
              style={{ padding: '8px 16px', fontSize: '12px' }}
            >
              <Terminal size={15} /> Manage in Terminal
            </button>

            {(selectedItem.webUrl || selectedItem.id === 'irrigation-controller') && (
              <button
                type="button"
                className="btn-solarpunk"
                onClick={() => {
                  const url = selectedItem.webUrl || 'http://irrigation.local:8080';
                  setBrowserUrl(url);
                  setActiveWindow('browser');
                }}
                style={{ padding: '8px 16px', fontSize: '12px' }}
              >
                <Globe size={15} /> Open Web Interface
              </button>
            )}

            <button
              type="button"
              className="btn-solarpunk"
              onClick={() => setActiveWindow('observatory')}
              style={{ padding: '8px 16px', fontSize: '12px' }}
            >
              <Activity size={15} /> View Telemetry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
