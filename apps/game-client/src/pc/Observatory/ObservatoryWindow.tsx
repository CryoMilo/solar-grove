import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Cpu,
  HardDrive,
  Play,
  RefreshCw,
  Server,
  Terminal,
  XCircle,
} from 'lucide-react';
import type React from 'react';
import { useGameStore } from '../../stores/useGameStore';

export const ObservatoryWindow: React.FC = () => {
  const serviceManager = useGameStore((s) => s.serviceManager);
  const incidentEngine = useGameStore((s) => s.incidentEngine);
  const setActiveWindow = useGameStore((s) => s.setActiveWindow);
  const runTerminalCommand = useGameStore((s) => s.runTerminalCommand);

  const services = serviceManager.getAllServices();
  const incidents = incidentEngine.getActiveIncidents();

  const handleRestartService = async (name: string) => {
    await runTerminalCommand(`systemctl restart ${name}`);
  };

  const handleStartService = async (name: string) => {
    await runTerminalCommand(`systemctl start ${name}`);
  };

  return (
    <div style={{ padding: '20px', height: '100%', overflowY: 'auto', boxSizing: 'border-box' }}>
      {/* Top Telemetry Gauges */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '14px',
          marginBottom: '24px',
        }}
      >
        <div
          className="glass-panel"
          style={{ padding: '16px', background: 'rgba(15, 34, 27, 0.6)' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#ecc94b',
              marginBottom: '8px',
            }}
          >
            <Cpu size={18} />
            <span style={{ fontSize: '12px', fontWeight: 600 }}>CPU LOAD</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#f0fff4' }}>14.2%</div>
          <div style={{ fontSize: '11px', color: '#68d391', marginTop: '4px' }}>4 Cores Active</div>
        </div>

        <div
          className="glass-panel"
          style={{ padding: '16px', background: 'rgba(15, 34, 27, 0.6)' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#38b2ac',
              marginBottom: '8px',
            }}
          >
            <Activity size={18} />
            <span style={{ fontSize: '12px', fontWeight: 600 }}>RAM FOOTPRINT</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#f0fff4' }}>1.8 GB / 8 GB</div>
          <div style={{ fontSize: '11px', color: '#38b2ac', marginTop: '4px' }}>22.5% Utilized</div>
        </div>

        <div
          className="glass-panel"
          style={{ padding: '16px', background: 'rgba(15, 34, 27, 0.6)' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#48bb78',
              marginBottom: '8px',
            }}
          >
            <Server size={18} />
            <span style={{ fontSize: '12px', fontWeight: 600 }}>CLUSTER UPTIME</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#f0fff4' }}>99.98%</div>
          <div style={{ fontSize: '11px', color: '#48bb78', marginTop: '4px' }}>
            Zero Outage Drift
          </div>
        </div>

        <div
          className="glass-panel"
          style={{ padding: '16px', background: 'rgba(15, 34, 27, 0.6)' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#ed8936',
              marginBottom: '8px',
            }}
          >
            <HardDrive size={18} />
            <span style={{ fontSize: '12px', fontWeight: 600 }}>STORAGE POOL</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#f0fff4' }}>18.4 GB / 64 GB</div>
          <div style={{ fontSize: '11px', color: '#ed8936', marginTop: '4px' }}>
            Healthy Partition
          </div>
        </div>
      </div>

      {/* Incidents Warning (if any) */}
      {incidents.length > 0 && (
        <div
          style={{
            background: 'rgba(229, 62, 62, 0.15)',
            border: '1px solid rgba(229, 62, 62, 0.5)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#feb2b2',
              fontWeight: 700,
              marginBottom: '8px',
            }}
          >
            <AlertTriangle size={18} /> ACTIVE INFRASTRUCTURE INCIDENT
          </div>
          {incidents.map((inc) => (
            <div key={inc.id} style={{ fontSize: '13px', color: '#fff5f5' }}>
              <div style={{ fontWeight: 600 }}>{inc.title}</div>
              <div style={{ color: '#fed7d7', margin: '4px 0' }}>{inc.description}</div>
              <div style={{ fontSize: '12px', color: '#ecc94b', marginTop: '6px' }}>
                Hint: {inc.remediationHint}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Services Table */}
      <div className="glass-panel" style={{ padding: '20px', background: 'rgba(15, 34, 27, 0.6)' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '16px', color: '#f0fff4' }}>
          Managed Machinery Daemons (systemd)
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {services.map((s) => {
            const isRunning = s.status === 'running';
            return (
              <div
                key={s.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  background: 'rgba(10, 20, 16, 0.6)',
                  border: isRunning
                    ? '1px solid rgba(72, 187, 120, 0.3)'
                    : '1px solid rgba(229, 62, 62, 0.3)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {isRunning ? (
                    <CheckCircle size={20} color="#48bb78" />
                  ) : (
                    <XCircle size={20} color="#e53e3e" />
                  )}
                  <div>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#f0fff4',
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center',
                      }}
                    >
                      <span>{s.name}</span>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: isRunning
                            ? 'rgba(72, 187, 120, 0.2)'
                            : 'rgba(229, 62, 62, 0.2)',
                          color: isRunning ? '#68d391' : '#fc8181',
                        }}
                      >
                        {s.status.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#a0aec0', marginTop: '2px' }}>
                      Port: {s.port} | Runtime: {s.runtime} | {s.description}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#cbd5e0',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                  >
                    CPU: {s.cpu}% | RAM: {s.memoryMb}M
                  </span>

                  {isRunning ? (
                    <button
                      className="btn-solarpunk"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => handleRestartService(s.name)}
                    >
                      <RefreshCw size={14} /> Restart
                    </button>
                  ) : (
                    <button
                      className="btn-solarpunk btn-gold"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => handleStartService(s.name)}
                    >
                      <Play size={14} /> Start Service
                    </button>
                  )}

                  <button
                    className="btn-solarpunk"
                    style={{ padding: '6px 12px', fontSize: '12px', background: 'transparent' }}
                    onClick={() => setActiveWindow('terminal')}
                  >
                    <Terminal size={14} /> Logs
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
