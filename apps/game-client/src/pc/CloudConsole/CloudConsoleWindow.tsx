import type { CloudProviderType, ComputeInstance } from '@solar-grove/game-types';
import { SimulatedAwsProvider, SimulatedLocalProvider } from '@solar-grove/infrastructure-model';
import { CheckCircle, Cloud, Play, Power, RefreshCw, Server, Square, Terminal } from 'lucide-react';
import type React from 'react';
import { useMemo, useState } from 'react';
import { useGameStore } from '../../stores/useGameStore';

export const CloudConsoleWindow: React.FC = () => {
  const [provider, setProvider] = useState<CloudProviderType>('aws');
  const setActiveWindow = useGameStore((s) => s.setActiveWindow);

  const localProvider = useMemo(() => new SimulatedLocalProvider(), []);
  const awsProvider = useMemo(() => new SimulatedAwsProvider(), []);

  const activeCompute = provider === 'aws' ? awsProvider : localProvider;
  const instances = activeCompute.listInstances();

  return (
    <div style={{ padding: '20px', height: '100%', overflowY: 'auto', boxSizing: 'border-box' }}>
      {/* Top Banner & Provider Switcher */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          borderBottom: '1px solid rgba(72, 187, 120, 0.2)',
          paddingBottom: '14px',
        }}
      >
        <div>
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
            <Cloud size={20} color="#ecc94b" /> HELIOS CLOUD MANAGER
          </h2>
          <div style={{ fontSize: '12px', color: '#a0aec0', marginTop: '2px' }}>
            Multi-cloud infrastructure control plane (Simulated Production Environment)
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`btn-solarpunk ${provider === 'aws' ? 'btn-gold' : ''}`}
            onClick={() => setProvider('aws')}
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            Amazon Web Services (AWS)
          </button>
          <button
            className={`btn-solarpunk ${provider === 'local' ? 'btn-gold' : ''}`}
            onClick={() => setProvider('local')}
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            Local Server Cluster
          </button>
        </div>
      </div>

      {/* Instance List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {instances.map((inst) => {
          const isRunning = inst.status === 'running';
          const metrics = activeCompute.getMetrics(inst.id);

          return (
            <div
              key={inst.id}
              className="glass-panel"
              style={{
                padding: '18px',
                background: 'rgba(15, 34, 27, 0.6)',
                border: isRunning
                  ? '1px solid rgba(72, 187, 120, 0.4)'
                  : '1px solid rgba(229, 62, 62, 0.3)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Server size={22} color={isRunning ? '#48bb78' : '#e53e3e'} />
                  <div>
                    <div
                      style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: '#f0fff4',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <span>{inst.name}</span>
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
                        {inst.status.toUpperCase()}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#a0aec0',
                        marginTop: '2px',
                        fontFamily: 'JetBrains Mono, monospace',
                      }}
                    >
                      ID: {inst.id} | Type: {inst.instanceType} | Region: {inst.region} | IP:{' '}
                      {inst.ipAddress}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '13px', color: '#ecc94b', fontWeight: 600 }}>
                    {inst.costGoldPerDay} Gold / Day
                  </span>

                  <button
                    className="btn-solarpunk"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                    onClick={() => setActiveWindow('terminal')}
                  >
                    <Terminal size={14} /> SSH Connect
                  </button>
                </div>
              </div>

              {/* Metrics */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '10px',
                  background: 'rgba(0,0,0,0.3)',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              >
                <div>
                  <span style={{ color: '#a0aec0' }}>CPU Load: </span>
                  <span style={{ color: '#f0fff4', fontWeight: 600 }}>
                    {metrics.cpuUsagePercent}%
                  </span>
                </div>
                <div>
                  <span style={{ color: '#a0aec0' }}>RAM Allocated: </span>
                  <span style={{ color: '#f0fff4', fontWeight: 600 }}>
                    {metrics.memoryUsagePercent}%
                  </span>
                </div>
                <div>
                  <span style={{ color: '#a0aec0' }}>Ping Latency: </span>
                  <span style={{ color: '#f0fff4', fontWeight: 600 }}>
                    {metrics.networkLatencyMs} ms
                  </span>
                </div>
                <div>
                  <span style={{ color: '#a0aec0' }}>SLA Health: </span>
                  <span style={{ color: '#48bb78', fontWeight: 600 }}>
                    {metrics.uptimePercent}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
