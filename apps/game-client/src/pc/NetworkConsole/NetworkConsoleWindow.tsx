import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Edit3,
  ExternalLink,
  Globe,
  Plus,
  RefreshCw,
  Server,
  ShieldCheck,
  Terminal,
  Wifi,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import type { ProxyRoute } from '@solar-grove/game-types';
import { useGameStore } from '../../stores/useGameStore';

export const NetworkConsoleWindow: React.FC = () => {
  const serviceManager = useGameStore((s) => s.serviceManager);
  const setActiveWindow = useGameStore((s) => s.setActiveWindow);
  const setBrowserUrl = useGameStore((s) => s.setBrowserUrl);
  const checkMilestones = useGameStore((s) => s.checkMilestones);

  const [activeTab, setActiveTab] = useState<'routes' | 'dns' | 'hosts'>('routes');
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
  const [editUpstreamHost, setEditUpstreamHost] = useState('');
  const [editUpstreamPort, setEditUpstreamPort] = useState(4000);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHostname, setNewHostname] = useState('irrigation.solar-grove.local');
  const [newUpstreamHost, setNewUpstreamHost] = useState('10.0.0.30');
  const [newUpstreamPort, setNewUpstreamPort] = useState(8080);
  const [nginxTestOutput, setNginxTestOutput] = useState<string | null>(null);

  const hosts = serviceManager.getHosts ? serviceManager.getHosts() : [];
  const dnsRecords = serviceManager.getDnsRecords ? serviceManager.getDnsRecords() : [];
  const proxyRoutes = serviceManager.getProxyRoutes ? serviceManager.getProxyRoutes() : [];
  const proxyState = serviceManager.getReverseProxyState
    ? serviceManager.getReverseProxyState()
    : {
        serviceName: 'helio-relay',
        status: 'STOPPED' as const,
        listeners: [80, 443],
        routes: [],
        httpRedirectHttps: true,
        activeConnections: 0,
        requestsPerSecond: 0,
        tlsTerminatedRequests: 0,
        upstreamFailures: 0,
      };
  const certificates = serviceManager.getCertificates ? serviceManager.getCertificates() : [];

  const handleStartEdit = (route: ProxyRoute) => {
    setEditingRouteId(route.id);
    setEditUpstreamHost(route.upstreamHost);
    setEditUpstreamPort(route.upstreamPort);
  };

  const handleSaveEdit = (routeId: string) => {
    serviceManager.updateProxyRoute(routeId, {
      upstreamHost: editUpstreamHost.trim(),
      upstreamPort: editUpstreamPort,
    });
    setEditingRouteId(null);
    checkMilestones();
  };

  const handleQuickRepairGreenhouse = () => {
    serviceManager.updateProxyRoute('route-greenhouse', {
      upstreamHost: 'greenhouse-controller',
      upstreamPort: 4000,
    });
    checkMilestones();
  };

  const handleAddRoute = (e: React.FormEvent) => {
    e.preventDefault();
    serviceManager.addProxyRoute({
      hostname: newHostname.trim(),
      path: '/',
      upstreamHost: newUpstreamHost.trim(),
      upstreamPort: newUpstreamPort,
      enabled: true,
      tlsRequired: true,
    });
    setShowAddModal(false);
    checkMilestones();
  };

  const handleTestNginx = () => {
    const res = serviceManager.testNginxConfig ? serviceManager.testNginxConfig() : { valid: true, output: 'Syntax OK' };
    setNginxTestOutput(res.output);
    setTimeout(() => setNginxTestOutput(null), 5000);
  };

  const hasBadUpstream = proxyRoutes.some((r) => r.upstreamHost === 'greenhouse-app');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#0a1410',
        color: '#e2e8f0',
        fontFamily: 'var(--font-display)',
        overflowY: 'auto',
      }}
    >
      {/* Header Banner */}
      <div
        style={{
          backgroundColor: '#07100d',
          borderBottom: '1px solid rgba(72,187,120,0.35)',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              backgroundColor: 'rgba(56,161,105,0.2)',
              border: '1px solid rgba(72,187,120,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Globe size={24} color="#68d391" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#f0fff4' }}>
              NETWORK CONSOLE — EDGE GATEWAY & DNS
            </h1>
            <span style={{ fontSize: '12px', color: '#a0aec0', fontFamily: 'var(--font-mono)' }}>
              Subnet: 10.0.0.0/24 • Relay Ingress: 10.0.0.10:80/443 • Nameserver: 10.0.0.1:53
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            className="btn-solarpunk"
            onClick={handleTestNginx}
            style={{ padding: '6px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <CheckCircle2 size={14} color="#68d391" /> nginx -t
          </button>
          <button
            type="button"
            className="btn-solarpunk btn-gold"
            onClick={() => setActiveWindow('certs')}
            style={{ padding: '6px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ShieldCheck size={14} /> Certificate Manager
          </button>
        </div>
      </div>

      {/* Quick Nginx Test Banner */}
      {nginxTestOutput && (
        <div
          style={{
            backgroundColor: '#1a202c',
            borderBottom: '1px solid #4a5568',
            padding: '10px 24px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: '#68d391',
            whiteSpace: 'pre-wrap',
          }}
        >
          {nginxTestOutput}
        </div>
      )}

      {/* Quick Status Metrics Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          padding: '16px 24px',
          backgroundColor: '#0c1a15',
          borderBottom: '1px solid rgba(72,187,120,0.2)',
        }}
      >
        <div
          style={{
            backgroundColor: '#07100d',
            padding: '12px 16px',
            borderRadius: '6px',
            border: '1px solid rgba(72,187,120,0.25)',
          }}
        >
          <div style={{ fontSize: '11px', color: '#a0aec0', textTransform: 'uppercase' }}>Reverse Proxy</div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: proxyState.status === 'RUNNING' ? '#68d391' : '#fc8181', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <Server size={14} /> {proxyState.status === 'RUNNING' ? 'ACTIVE (Port 80/443)' : 'STOPPED'}
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#07100d',
            padding: '12px 16px',
            borderRadius: '6px',
            border: '1px solid rgba(72,187,120,0.25)',
          }}
        >
          <div style={{ fontSize: '11px', color: '#a0aec0', textTransform: 'uppercase' }}>DNS Resolution</div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#ecc94b', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <Wifi size={14} /> {dnsRecords.length} A-Records
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#07100d',
            padding: '12px 16px',
            borderRadius: '6px',
            border: '1px solid rgba(72,187,120,0.25)',
          }}
        >
          <div style={{ fontSize: '11px', color: '#a0aec0', textTransform: 'uppercase' }}>Upstream Routing</div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: hasBadUpstream ? '#fc8181' : '#68d391', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            {hasBadUpstream ? <AlertTriangle size={14} color="#fc8181" /> : <CheckCircle2 size={14} color="#68d391" />}
            {hasBadUpstream ? '1 Route Degraded (502)' : `${proxyRoutes.length} Routes Healthy`}
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#07100d',
            padding: '12px 16px',
            borderRadius: '6px',
            border: '1px solid rgba(72,187,120,0.25)',
          }}
        >
          <div style={{ fontSize: '11px', color: '#a0aec0', textTransform: 'uppercase' }}>TLS Encryption</div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: certificates.some((c) => c.status === 'VALID') ? '#68d391' : '#fbd38d', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <ShieldCheck size={14} />
            {certificates.some((c) => c.status === 'VALID') ? 'TLS 1.3 Active' : 'Cert Missing / Untrusted'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          padding: '0 24px',
          borderBottom: '1px solid rgba(72,187,120,0.25)',
          backgroundColor: '#07100d',
          gap: '8px',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('routes')}
          style={{
            padding: '12px 18px',
            fontSize: '13px',
            fontWeight: 700,
            border: 'none',
            borderBottom: activeTab === 'routes' ? '2px solid #68d391' : '2px solid transparent',
            background: 'transparent',
            color: activeTab === 'routes' ? '#f0fff4' : '#a0aec0',
            cursor: 'pointer',
          }}
        >
          Reverse Proxy Routes ({proxyRoutes.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('dns')}
          style={{
            padding: '12px 18px',
            fontSize: '13px',
            fontWeight: 700,
            border: 'none',
            borderBottom: activeTab === 'dns' ? '2px solid #68d391' : '2px solid transparent',
            background: 'transparent',
            color: activeTab === 'dns' ? '#f0fff4' : '#a0aec0',
            cursor: 'pointer',
          }}
        >
          DNS Nameserver (10.0.0.1)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('hosts')}
          style={{
            padding: '12px 18px',
            fontSize: '13px',
            fontWeight: 700,
            border: 'none',
            borderBottom: activeTab === 'hosts' ? '2px solid #68d391' : '2px solid transparent',
            background: 'transparent',
            color: activeTab === 'hosts' ? '#f0fff4' : '#a0aec0',
            cursor: 'pointer',
          }}
        >
          Subnet Hosts ({hosts.length})
        </button>
      </div>

      {/* TAB 1: REVERSE PROXY ROUTES */}
      {activeTab === 'routes' && (
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '16px', color: '#f0fff4' }}>Nginx Edge Ingress Virtual Hosts</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#a0aec0' }}>
                Traffic arriving at the Helio Relay (10.0.0.10) is matched against domain hostnames and forwarded to private upstreams.
              </p>
            </div>
            <button
              type="button"
              className="btn-solarpunk btn-gold"
              onClick={() => setShowAddModal(true)}
              style={{ padding: '6px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} /> Add Proxy Route
            </button>
          </div>

          {/* Upstream Misconfiguration Alert */}
          {hasBadUpstream && (
            <div
              style={{
                backgroundColor: 'rgba(229,62,62,0.15)',
                border: '1px solid #e53e3e',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <AlertTriangle size={24} color="#fc8181" />
                <div>
                  <div style={{ fontWeight: 800, color: '#fed7d7', fontSize: '13px' }}>
                    502 BAD GATEWAY DETECTED: Upstream Host Misconfiguration
                  </div>
                  <div style={{ fontSize: '12px', color: '#cbd5e0', marginTop: '2px' }}>
                    Route <code style={{ color: '#ecc94b' }}>greenhouse.solar-grove.local</code> is pointing to <code style={{ color: '#fc8181' }}>greenhouse-app:4000</code>, which refuses connections. The container is named <code style={{ color: '#68d391' }}>greenhouse-controller:4000</code>.
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn-solarpunk btn-gold"
                onClick={handleQuickRepairGreenhouse}
                style={{ padding: '6px 14px', fontSize: '12px' }}
              >
                🛠️ Quick Repair Upstream
              </button>
            </div>
          )}

          {/* Routes Table */}
          <div
            style={{
              backgroundColor: '#07100d',
              borderRadius: '8px',
              border: '1px solid rgba(72,187,120,0.3)',
              overflow: 'hidden',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(56,161,105,0.15)', color: '#68d391', borderBottom: '1px solid rgba(72,187,120,0.3)' }}>
                  <th style={{ padding: '12px 16px' }}>Public Domain</th>
                  <th style={{ padding: '12px 16px' }}>Path</th>
                  <th style={{ padding: '12px 16px' }}>Upstream Target</th>
                  <th style={{ padding: '12px 16px' }}>TLS</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {proxyRoutes.map((route) => {
                  const isDegraded = route.upstreamHost === 'greenhouse-app';
                  const isEditing = editingRouteId === route.id;

                  return (
                    <tr
                      key={route.id}
                      style={{
                        borderBottom: '1px solid rgba(72,187,120,0.15)',
                        backgroundColor: isDegraded ? 'rgba(229,62,62,0.08)' : 'transparent',
                      }}
                    >
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#f0fff4', fontFamily: 'var(--font-mono)' }}>
                        {route.hostname}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#a0aec0', fontFamily: 'var(--font-mono)' }}>
                        {route.path}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {isEditing ? (
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <input
                              type="text"
                              value={editUpstreamHost}
                              onChange={(e) => setEditUpstreamHost(e.target.value)}
                              style={{
                                backgroundColor: '#0a1813',
                                border: '1px solid #68d391',
                                borderRadius: '4px',
                                color: '#fff',
                                padding: '4px 8px',
                                fontSize: '12px',
                                fontFamily: 'var(--font-mono)',
                                width: '150px',
                              }}
                            />
                            <span>:</span>
                            <input
                              type="number"
                              value={editUpstreamPort}
                              onChange={(e) => setEditUpstreamPort(Number.parseInt(e.target.value, 10))}
                              style={{
                                backgroundColor: '#0a1813',
                                border: '1px solid #68d391',
                                borderRadius: '4px',
                                color: '#fff',
                                padding: '4px 8px',
                                fontSize: '12px',
                                fontFamily: 'var(--font-mono)',
                                width: '60px',
                              }}
                            />
                            <button
                              type="button"
                              className="btn-solarpunk btn-gold"
                              onClick={() => handleSaveEdit(route.id)}
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              color: isDegraded ? '#fc8181' : '#ecc94b',
                              fontWeight: 600,
                            }}
                          >
                            http://{route.upstreamHost}:{route.upstreamPort}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '11px', color: route.tlsRequired ? '#68d391' : '#a0aec0' }}>
                          {route.tlsRequired ? 'HTTPS (Port 443)' : 'HTTP (Port 80)'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {isDegraded ? (
                          <span
                            style={{
                              backgroundColor: 'rgba(229,62,62,0.2)',
                              color: '#fc8181',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700,
                            }}
                          >
                            502 Bad Gateway
                          </span>
                        ) : (
                          <span
                            style={{
                              backgroundColor: 'rgba(72,187,120,0.2)',
                              color: '#68d391',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700,
                            }}
                          >
                            Forwarding OK
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="btn-solarpunk"
                            onClick={() => handleStartEdit(route)}
                            style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Edit3 size={12} /> Edit
                          </button>
                          <button
                            type="button"
                            className="btn-solarpunk"
                            onClick={() => {
                              setBrowserUrl(`https://${route.hostname}`);
                              setActiveWindow('browser');
                            }}
                            style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <ExternalLink size={12} /> Test
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DNS RECORDS */}
      {activeTab === 'dns' && (
        <div style={{ padding: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '16px', color: '#f0fff4' }}>Simulated DNS Nameserver (10.0.0.1#53)</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#a0aec0' }}>
              Maps human-readable farm hostnames to static numerical IP addresses. Query in terminal with <code style={{ color: '#68d391' }}>nslookup &lt;domain&gt;</code> or <code style={{ color: '#68d391' }}>dig &lt;domain&gt;</code>.
            </p>
          </div>

          <div
            style={{
              backgroundColor: '#07100d',
              borderRadius: '8px',
              border: '1px solid rgba(72,187,120,0.3)',
              overflow: 'hidden',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(56,161,105,0.15)', color: '#68d391', borderBottom: '1px solid rgba(72,187,120,0.3)' }}>
                  <th style={{ padding: '12px 16px' }}>Domain / Hostname</th>
                  <th style={{ padding: '12px 16px' }}>Record Type</th>
                  <th style={{ padding: '12px 16px' }}>Resolved IPv4 Address</th>
                  <th style={{ padding: '12px 16px' }}>TTL</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Target Destination</th>
                </tr>
              </thead>
              <tbody>
                {dnsRecords.map((rec) => (
                  <tr key={rec.hostname} style={{ borderBottom: '1px solid rgba(72,187,120,0.15)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#f0fff4', fontFamily: 'var(--font-mono)' }}>
                      {rec.hostname}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#ecc94b', fontWeight: 700 }}>{rec.type}</td>
                    <td style={{ padding: '14px 16px', color: '#68d391', fontFamily: 'var(--font-mono)' }}>{rec.value}</td>
                    <td style={{ padding: '14px 16px', color: '#a0aec0' }}>{rec.ttl}s</td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', color: '#cbd5e0', fontSize: '12px' }}>
                      {rec.value === '10.0.0.10'
                        ? 'Helio Relay Edge Gateway (Nginx)'
                        : rec.value === '10.0.0.20'
                        ? 'Verdant Glasshouse Container Host'
                        : rec.value === '10.0.0.30'
                        ? 'Helio Irrigation Station'
                        : 'Local Network Node'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SUBHOSTS */}
      {activeTab === 'hosts' && (
        <div style={{ padding: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '16px', color: '#f0fff4' }}>Subnet Hosts (10.0.0.0/24)</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#a0aec0' }}>
              Connected nodes on the farm local area network. Inspect interfaces via <code style={{ color: '#68d391' }}>ip addr</code> or <code style={{ color: '#68d391' }}>cat /etc/hosts</code>.
            </p>
          </div>

          <div
            style={{
              backgroundColor: '#07100d',
              borderRadius: '8px',
              border: '1px solid rgba(72,187,120,0.3)',
              overflow: 'hidden',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(56,161,105,0.15)', color: '#68d391', borderBottom: '1px solid rgba(72,187,120,0.3)' }}>
                  <th style={{ padding: '12px 16px' }}>IP Address</th>
                  <th style={{ padding: '12px 16px' }}>Hostname</th>
                  <th style={{ padding: '12px 16px' }}>Role</th>
                  <th style={{ padding: '12px 16px' }}>Open Ports</th>
                  <th style={{ padding: '12px 16px' }}>Description</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {hosts.map((host) => (
                  <tr key={host.ip} style={{ borderBottom: '1px solid rgba(72,187,120,0.15)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#68d391', fontFamily: 'var(--font-mono)' }}>
                      {host.ip}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#f0fff4', fontFamily: 'var(--font-mono)' }}>
                      {host.hostname}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          backgroundColor: 'rgba(214,158,46,0.15)',
                          color: '#ecc94b',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                        }}
                      >
                        {host.role.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', color: '#a0aec0' }}>
                      {host.ports.length > 0 ? host.ports.join(', ') : 'none'}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#cbd5e0', fontSize: '12px' }}>{host.description}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <span
                        style={{
                          backgroundColor: 'rgba(72,187,120,0.2)',
                          color: '#68d391',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                        }}
                      >
                        {host.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Route Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
          }}
        >
          <div
            style={{
              backgroundColor: '#07100d',
              border: '1px solid rgba(72,187,120,0.5)',
              borderRadius: '8px',
              padding: '24px',
              width: '460px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.8)',
            }}
          >
            <h3 style={{ margin: '0 0 16px 0', color: '#f0fff4', fontSize: '16px' }}>Add Reverse Proxy Route</h3>
            <form onSubmit={handleAddRoute} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#a0aec0', marginBottom: '4px' }}>
                  Public Domain (Server Name)
                </label>
                <input
                  type="text"
                  value={newHostname}
                  onChange={(e) => setNewHostname(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#0a1813',
                    border: '1px solid rgba(72,187,120,0.4)',
                    color: '#fff',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono)',
                    boxSizing: 'border-box',
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#a0aec0', marginBottom: '4px' }}>
                  Upstream Host / Container / IP
                </label>
                <input
                  type="text"
                  value={newUpstreamHost}
                  onChange={(e) => setNewUpstreamHost(e.target.value)}
                  placeholder="e.g. 10.0.0.30 or irrigation-controller"
                  style={{
                    width: '100%',
                    backgroundColor: '#0a1813',
                    border: '1px solid rgba(72,187,120,0.4)',
                    color: '#fff',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono)',
                    boxSizing: 'border-box',
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#a0aec0', marginBottom: '4px' }}>
                  Upstream Port
                </label>
                <input
                  type="number"
                  value={newUpstreamPort}
                  onChange={(e) => setNewUpstreamPort(Number.parseInt(e.target.value, 10))}
                  style={{
                    width: '100%',
                    backgroundColor: '#0a1813',
                    border: '1px solid rgba(72,187,120,0.4)',
                    color: '#fff',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono)',
                    boxSizing: 'border-box',
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  className="btn-solarpunk"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '6px 14px', fontSize: '12px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-solarpunk btn-gold"
                  style={{ padding: '6px 14px', fontSize: '12px' }}
                >
                  Create Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
