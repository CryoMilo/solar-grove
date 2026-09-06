import {
  Activity,
  CheckCircle2,
  Cpu,
  Database,
  ExternalLink,
  Globe,
  Layers,
  Search,
  Server,
  Terminal,
  XCircle,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useGameStore } from '../../stores/useGameStore';

interface SoftwareItem {
  id: string;
  name: string;
  version: string;
  buildingName: string;
  buildingType: string;
  description: string;
  runtime: string;
  port: number;
  healthEndpoint: string;
  database: string;
  deployments: string[];
  serviceName: string;
}

const CATALOG_ITEMS: SoftwareItem[] = [
  {
    id: 'irrigation-controller',
    name: 'Irrigation Controller',
    version: '1.4.2',
    buildingName: 'Helio Irrigation Station',
    buildingType: 'helio-pump',
    description:
      'Coordinates solar-powered deep aquifer pump telemetry, pressure sensors, and automated furrow valves.',
    runtime: 'Node.js 22',
    port: 8080,
    healthEndpoint: '/health',
    database: 'PostgreSQL (telemetry)',
    deployments: ['Bare Linux (systemd)', 'Docker', 'AWS EC2'],
    serviceName: 'irrigation-controller',
  },
  {
    id: 'greenhouse-controller',
    name: 'Greenhouse Controller',
    version: '2.1.0',
    buildingName: 'Verdant Glasshouse',
    buildingType: 'verdant-glasshouse',
    description:
      'Regulates microclimate aeration, temperature, and humidity sensors for hyper-accelerated photosynthesis.',
    runtime: 'Node.js (Docker Container)',
    port: 4000,
    healthEndpoint: '/health',
    database: 'PostgreSQL (environment logs)',
    deployments: ['Docker Container', 'Kubernetes'],
    serviceName: 'greenhouse-api',
  },
  {
    id: 'storage-controller',
    name: 'Storage Controller',
    version: '1.0.0',
    buildingName: 'Sunvault Storage',
    buildingType: 'sunvault-storage',
    description:
      'Inventory tracking, atmospheric moisture control, and automated crop spoilage prevention.',
    runtime: 'Node.js 22',
    port: 5000,
    healthEndpoint: '/health',
    database: 'PostgreSQL / Object Storage',
    deployments: ['Bare Linux (systemd)', 'AWS S3'],
    serviceName: 'storage-controller',
  },
  {
    id: 'harvest-scheduler',
    name: 'Harvest Scheduler',
    version: '1.0.3',
    buildingName: 'Harvest Automaton',
    buildingType: 'harvest-automaton',
    description:
      'Autonomous queue worker and pathfinding dispatcher for harvesting ripe crops automatically.',
    runtime: 'Worker Process',
    port: 6379,
    healthEndpoint: '/metrics',
    database: 'Redis (job queue)',
    deployments: ['Docker Worker', 'Redis Queue'],
    serviceName: 'harvest-scheduler',
  },
];

export const SoftwareCatalogWindow: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'running' | 'offline' | 'unhosted'>('all');
  const [selectedId, setSelectedId] = useState<string>('irrigation-controller');

  const serviceManager = useGameStore((s) => s.serviceManager);
  const setActiveWindow = useGameStore((s) => s.setActiveWindow);
  const setBrowserUrl = useGameStore((s) => s.setBrowserUrl);

  const getItemStatus = (item: SoftwareItem): 'running' | 'offline' | 'unhosted' => {
    const svc = serviceManager.getService(item.serviceName);
    if (!svc) return 'unhosted';
    return svc.status === 'running' ? 'running' : 'offline';
  };

  const filteredItems = CATALOG_ITEMS.filter((item) => {
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

  const selectedItem = CATALOG_ITEMS.find((item) => item.id === selectedId) || CATALOG_ITEMS[0];
  const selectedStatus = getItemStatus(selectedItem);

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        backgroundColor: '#07100d',
        color: '#e2e8f0',
        fontFamily: 'var(--font-display)',
      }}
    >
      {/* Left Column: Software Registry List */}
      <div
        style={{
          width: '380px',
          borderRight: '1px solid rgba(214,158,46,0.25)',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'rgba(10, 22, 17, 0.85)',
        }}
      >
        {/* Header & Search */}
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(214,158,46,0.2)' }}>
          <div
            style={{
              fontSize: '15px',
              fontWeight: 800,
              color: '#ecc94b',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px',
            }}
          >
            <Layers size={18} />
            <span>SOFTWARE CATALOG (PRD §10)</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#07100d',
              border: '1px solid rgba(72,187,120,0.3)',
              borderRadius: '6px',
              padding: '6px 10px',
              marginBottom: '10px',
            }}
          >
            <Search size={14} color="#718096" />
            <input
              type="text"
              placeholder="Search software catalog..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '12px',
                outline: 'none',
                width: '100%',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Filter Pills */}
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
                          : status === 'offline'
                            ? '#fc8181'
                            : '#ecc94b',
                    }}
                  >
                    {status === 'running' && <CheckCircle2 size={11} />}
                    {status === 'offline' && <XCircle size={11} />}
                    {status === 'unhosted' && <Server size={11} />}
                    {status.toUpperCase()}
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

            {/* Hosting Status Badge */}
            <div
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontWeight: 800,
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor:
                  selectedStatus === 'running'
                    ? 'rgba(72,187,120,0.2)'
                    : selectedStatus === 'offline'
                      ? 'rgba(229,62,62,0.2)'
                      : 'rgba(236,201,75,0.2)',
                border: `1px solid ${
                  selectedStatus === 'running'
                    ? '#48bb78'
                    : selectedStatus === 'offline'
                      ? '#e53e3e'
                      : '#ecc94b'
                }`,
                color:
                  selectedStatus === 'running'
                    ? '#68d391'
                    : selectedStatus === 'offline'
                      ? '#fc8181'
                      : '#ecc94b',
              }}
            >
              <Activity size={14} />
              <span>STATUS: {selectedStatus.toUpperCase()}</span>
            </div>
          </div>

          {/* Technical Specifications Matrix */}
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
                <Cpu size={13} color="#4fd1c5" /> RUNTIME & COMPUTE
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
                <Globe size={13} color="#ecc94b" /> PORT & HEALTH ENDPOINT
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
          <div style={{ marginBottom: '24px' }}>
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

          {/* Interactive Actions for Vertical Slice Loop */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              borderTop: '1px solid rgba(214,158,46,0.3)',
              paddingTop: '18px',
            }}
          >
            <button
              type="button"
              className="btn-solarpunk btn-gold"
              onClick={() => setActiveWindow('terminal')}
              style={{ padding: '8px 16px', fontSize: '12px' }}
            >
              <Terminal size={15} /> Manage in Terminal
            </button>

            {selectedItem.id === 'irrigation-controller' && (
              <button
                type="button"
                className="btn-solarpunk"
                onClick={() => {
                  setBrowserUrl('http://irrigation.local:8080');
                  setActiveWindow('browser');
                }}
                style={{ padding: '8px 16px', fontSize: '12px' }}
              >
                <Globe size={15} /> Open Web Interface (PRD §15)
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
