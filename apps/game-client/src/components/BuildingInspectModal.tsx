import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Database,
  Droplets,
  ExternalLink,
  Globe,
  Layers,
  Network,
  Radio,
  Route,
  ShieldCheck,
  Terminal,
  X,
  Zap,
} from 'lucide-react';
import type React from 'react';
import { useGameStore } from '../stores/useGameStore';

export const BuildingInspectModal: React.FC = () => {
  const building = useGameStore((s) => s.inspectingBuilding);
  const onClose = () => useGameStore.getState().setInspectingBuilding(null);
  const togglePc = useGameStore((s) => s.togglePc);
  const setActiveWindow = useGameStore((s) => s.setActiveWindow);
  const setBrowserUrl = useGameStore((s) => s.setBrowserUrl);
  const serviceManager = useGameStore((s) => s.serviceManager);

  if (!building) return null;

  const isGlasshouse = building.type === 'verdant-glasshouse';
  const isRelay = building.type === 'helio-relay';

  // 1. Irrigation Station State (Phase 2)
  const irrService = serviceManager.getService('irrigation-controller');
  const irrTelemetry = serviceManager.getIrrigationTelemetry();
  const isIrrRunning = irrService?.status === 'running';
  const isIrrCrashed = irrService?.status === 'failed';
  const isIrrPumping = serviceManager.isIrrigationActivelyPumping();

  // 2. Verdant Glasshouse State (Phase 3)
  const ghContainer = serviceManager.findContainer('greenhouse-controller');
  const dbContainer = serviceManager.findContainer('greenhouse-db');
  const isGhRunning = ghContainer?.status === 'RUNNING';
  const isGhHealthy = isGhRunning && ghContainer?.health === 'HEALTHY';
  const isGhUnhealthy = isGhRunning && ghContainer?.health === 'UNHEALTHY';
  const isDbRunning = dbContainer?.status === 'RUNNING';
  const isDbHealthy = isDbRunning && dbContainer?.health === 'HEALTHY';

  // 3. Helio Relay State (Phase 4)
  const relayService = serviceManager.getService('helio-relay');
  const isRelayRunning = relayService?.status === 'running';
  const isRelayCrashed = relayService?.status === 'failed';
  const proxyState = serviceManager.getReverseProxyState();
  const certs = serviceManager.getCertificates();
  const validCertsCount = certs.filter((c) => c.status === 'VALID').length;

  const handleOpenSoftware = () => {
    onClose();
    setActiveWindow('software');
    togglePc(true);
  };

  const handleOpenTerminal = () => {
    onClose();
    setActiveWindow('terminal');
    togglePc(true);
  };

  const handleOpenNetwork = () => {
    onClose();
    setActiveWindow('network');
    togglePc(true);
  };

  const handleOpenCerts = () => {
    onClose();
    setActiveWindow('certs');
    togglePc(true);
  };

  const handleOpenBrowser = (url: string) => {
    onClose();
    setBrowserUrl(url);
    setActiveWindow('browser');
    togglePc(true);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 12, 10, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 500,
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel frame-solarpunk"
        style={{
          width: '580px',
          maxWidth: '92vw',
          padding: '24px',
          backgroundColor: '#0a1612',
          border: '1px solid #d69e2e',
          boxShadow: '0 16px 40px rgba(0,0,0,0.8)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rivet rivet-tl" />
        <div className="rivet rivet-tr" />
        <div className="rivet rivet-bl" />
        <div className="rivet rivet-br" />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(214, 158, 46, 0.3)',
            paddingBottom: '14px',
            marginBottom: '18px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(214, 158, 46, 0.15)',
                border: '1px solid #d69e2e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isRelay ? (
                <Radio size={20} color="#63b3ed" />
              ) : isGlasshouse ? (
                <Cpu size={20} color="#68d391" />
              ) : (
                <Droplets size={20} color="#ecc94b" />
              )}
            </div>
            <div>
              <h2
                style={{
                  fontSize: '17px',
                  fontWeight: 800,
                  color: '#ecc94b',
                  margin: 0,
                  letterSpacing: '0.04em',
                }}
              >
                {isRelay
                  ? 'HELIO RELAY STATION'
                  : isGlasshouse
                    ? 'VERDANT GLASSHOUSE'
                    : 'HELIO IRRIGATION STATION'}
              </h2>
              <div style={{ fontSize: '11px', color: '#9ae6b4' }}>
                {isRelay
                  ? `Edge Gateway & TLS Termination Array (ID: ${building.id})`
                  : isGlasshouse
                    ? `Controlled Growth Habitat (ID: ${building.id})`
                    : `Deep Aquifer Solar Pumping Array (ID: ${building.id})`}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn-solarpunk"
            style={{ padding: '6px' }}
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        {/* Telemetry Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '18px',
          }}
        >
          {/* Physical Status */}
          <div
            style={{
              padding: '12px',
              backgroundColor: 'rgba(12, 28, 22, 0.8)',
              border: '1px solid rgba(214, 158, 46, 0.2)',
              borderRadius: '6px',
            }}
          >
            <div style={{ fontSize: '11px', color: '#a0aec0', marginBottom: '4px' }}>
              PHYSICAL STATUS
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isRelay ? (
                isRelayRunning ? (
                  <>
                    <CheckCircle2 size={16} color="#48bb78" />
                    <span style={{ fontWeight: 700, color: '#48bb78' }}>ONLINE</span>
                  </>
                ) : isRelayCrashed ? (
                  <>
                    <AlertCircle size={16} color="#e53e3e" />
                    <span style={{ fontWeight: 700, color: '#e53e3e' }}>OFFLINE (CRASHED)</span>
                  </>
                ) : (
                  <>
                    <Activity size={16} color="#a0aec0" />
                    <span style={{ fontWeight: 700, color: '#a0aec0' }}>OFFLINE</span>
                  </>
                )
              ) : isGlasshouse ? (
                isGhHealthy ? (
                  <>
                    <CheckCircle2 size={16} color="#48bb78" />
                    <span style={{ fontWeight: 700, color: '#48bb78' }}>ONLINE</span>
                  </>
                ) : isGhUnhealthy ? (
                  <>
                    <AlertCircle size={16} color="#ecc94b" />
                    <span style={{ fontWeight: 700, color: '#ecc94b' }}>OFFLINE (DEGRADED)</span>
                  </>
                ) : (
                  <>
                    <Activity size={16} color="#a0aec0" />
                    <span style={{ fontWeight: 700, color: '#a0aec0' }}>OFFLINE</span>
                  </>
                )
              ) : isIrrRunning ? (
                <>
                  <CheckCircle2 size={16} color="#48bb78" />
                  <span style={{ fontWeight: 700, color: '#48bb78' }}>HEALTHY</span>
                </>
              ) : isIrrCrashed ? (
                <>
                  <AlertCircle size={16} color="#e53e3e" />
                  <span style={{ fontWeight: 700, color: '#e53e3e' }}>OFFLINE (CRASHED)</span>
                </>
              ) : (
                <>
                  <Activity size={16} color="#a0aec0" />
                  <span style={{ fontWeight: 700, color: '#a0aec0' }}>OFFLINE</span>
                </>
              )}
            </div>
          </div>

          {/* Software / Container Name */}
          <div
            style={{
              padding: '12px',
              backgroundColor: 'rgba(12, 28, 22, 0.8)',
              border: '1px solid rgba(214, 158, 46, 0.2)',
              borderRadius: '6px',
            }}
          >
            <div style={{ fontSize: '11px', color: '#a0aec0', marginBottom: '4px' }}>
              {isRelay
                ? 'REVERSE PROXY & GATEWAY'
                : isGlasshouse
                  ? 'REQUIRED SOFTWARE & RUNTIME'
                  : 'SOFTWARE DAEMON'}
            </div>
            <div style={{ fontWeight: 700, fontSize: '13px', color: '#ecc94b' }}>
              {isRelay
                ? 'Helio Relay (Nginx 1.25)'
                : isGlasshouse
                  ? 'Greenhouse Controller (Node.js 20)'
                  : 'Irrigation Controller'}
            </div>
            <div style={{ fontSize: '11px', color: '#a0aec0' }}>
              Deployment:{' '}
              {isRelay
                ? 'Bare Metal Daemon (Ports 80/443)'
                : isGlasshouse
                  ? 'Docker Container'
                  : 'Bare Metal (systemd)'}
            </div>
          </div>

          {/* Network & HTTP */}
          <div
            style={{
              padding: '12px',
              backgroundColor: 'rgba(12, 28, 22, 0.8)',
              border: '1px solid rgba(214, 158, 46, 0.2)',
              borderRadius: '6px',
            }}
          >
            <div style={{ fontSize: '11px', color: '#a0aec0', marginBottom: '4px' }}>
              NETWORK ENDPOINT
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '13px', color: '#63b3ed' }}>
              {isRelay
                ? 'https://greenhouse.solar-grove.local'
                : isGlasshouse
                  ? 'http://greenhouse.local:4000'
                  : 'http://irrigation.local:8080'}
            </div>
            <div style={{ fontSize: '11px', color: '#a0aec0' }}>
              {isRelay
                ? `10.0.0.10:443 (Edge Gateway)`
                : isGlasshouse
                  ? 'Docker Network: greenhouse-network'
                  : 'Host: 10.0.0.30:8080'}
            </div>
          </div>

          {/* Subsystem Telemetry */}
          <div
            style={{
              padding: '12px',
              backgroundColor: 'rgba(12, 28, 22, 0.8)',
              border: '1px solid rgba(214, 158, 46, 0.2)',
              borderRadius: '6px',
            }}
          >
            <div style={{ fontSize: '11px', color: '#a0aec0', marginBottom: '4px' }}>
              {isRelay
                ? 'GATEWAY ROUTING & TLS'
                : isGlasshouse
                  ? 'DATABASE INFRASTRUCTURE'
                  : 'WATER DELIVERY'}
            </div>
            {isRelay ? (
              <div>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#b794f4' }}>
                  {proxyState.routes.length} Virtual Hosts Configured
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: validCertsCount > 0 ? '#68d391' : '#ecc94b',
                    fontWeight: 600,
                  }}
                >
                  {validCertsCount > 0
                    ? `TLS Active: ${validCertsCount} Valid Cert(s)`
                    : 'TLS Inactive / Unsecured'}
                </div>
              </div>
            ) : isGlasshouse ? (
              <div>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#b794f4' }}>
                  PostgreSQL :5432 ({dbContainer ? 'greenhouse-db' : 'greenhouse-db (stopped)'})
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: isDbHealthy ? '#68d391' : '#fc8181',
                    fontWeight: 600,
                  }}
                >
                  DB Container: {isDbHealthy ? 'HEALTHY' : 'UNAVAILABLE'}
                </div>
              </div>
            ) : (
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '13px',
                  color: isIrrPumping ? '#4fd1c5' : '#a0aec0',
                }}
              >
                {isIrrPumping ? '🌊 PUMPING ACTIVE (+4%/s)' : '⏸️ IDLE / STOPPED'}
              </div>
            )}
          </div>

          {/* Capacity & Production Impact */}
          <div
            style={{
              padding: '12px',
              backgroundColor: 'rgba(12, 28, 22, 0.8)',
              border: '1px solid rgba(214, 158, 46, 0.2)',
              borderRadius: '6px',
            }}
          >
            <div style={{ fontSize: '11px', color: '#a0aec0', marginBottom: '4px' }}>
              {isRelay
                ? 'LISTENERS & REDIRECT'
                : isGlasshouse
                  ? 'CONTAINER HEALTH'
                  : 'AQUIFER RESERVOIR'}
            </div>
            {isRelay ? (
              <div style={{ fontSize: '12px', color: '#ecc94b', fontWeight: 600 }}>
                Port 80 (HTTP 301) ➔ Port 443 (HTTPS TLS)
              </div>
            ) : isGlasshouse ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 700,
                    backgroundColor: isGhHealthy
                      ? 'rgba(72,187,120,0.2)'
                      : isGhUnhealthy
                        ? 'rgba(229,62,62,0.2)'
                        : 'rgba(160,174,192,0.2)',
                    color: isGhHealthy ? '#68d391' : isGhUnhealthy ? '#fc8181' : '#cbd5e0',
                  }}
                >
                  {isGhHealthy
                    ? 'HEALTHY'
                    : isGhUnhealthy
                      ? 'UNHEALTHY (AUTH ERROR)'
                      : 'NOT RUNNING'}
                </span>
                <span style={{ fontSize: '11px', color: '#a0aec0' }}>
                  ({ghContainer?.name || 'no container'})
                </span>
              </div>
            ) : (
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#ecc94b' }}>
                {irrTelemetry.reservoirPct}% Capacity ({irrTelemetry.soilMoisturePct}% Soil
                Saturation)
              </div>
            )}
          </div>

          {/* Impact */}
          <div
            style={{
              padding: '12px',
              backgroundColor: 'rgba(12, 28, 22, 0.8)',
              border: '1px solid rgba(214, 158, 46, 0.2)',
              borderRadius: '6px',
            }}
          >
            <div style={{ fontSize: '11px', color: '#a0aec0', marginBottom: '4px' }}>
              PRODUCTION IMPACT
            </div>
            <div style={{ fontWeight: 700, fontSize: '13px', color: '#48bb78' }}>
              {isRelay
                ? isRelayRunning
                  ? 'Unified Edge Ingress & SSL (ACTIVE)'
                  : 'Ingress Offline: 502/SSL Warning'
                : isGlasshouse
                  ? isGhHealthy
                    ? '+50% Accelerated Photosynthesis (ACTIVE)'
                    : 'Growth Optimization: OFFLINE'
                  : '+40% Crop Growth Acceleration'}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
          {isRelay ? (
            <>
              <button
                type="button"
                className="btn-solarpunk"
                onClick={handleOpenNetwork}
                style={{ flex: 1, padding: '10px', fontSize: '12px', justifyContent: 'center' }}
              >
                <Route size={15} color="#63b3ed" /> Network Console
              </button>

              <button
                type="button"
                className="btn-solarpunk"
                onClick={handleOpenCerts}
                style={{ flex: 1, padding: '10px', fontSize: '12px', justifyContent: 'center' }}
              >
                <ShieldCheck size={15} color="#48bb78" /> Cert Manager
              </button>

              <button
                type="button"
                className="btn-solarpunk"
                onClick={handleOpenTerminal}
                style={{ flex: 1, padding: '10px', fontSize: '12px', justifyContent: 'center' }}
              >
                <Terminal size={15} color="#68d391" /> Terminal
              </button>

              <button
                type="button"
                className="btn-solarpunk btn-gold"
                onClick={() => handleOpenBrowser('https://greenhouse.solar-grove.local')}
                style={{ flex: 1.2, padding: '10px', fontSize: '12px', justifyContent: 'center' }}
              >
                <Globe size={15} /> HTTPS Portal
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn-solarpunk"
                onClick={handleOpenSoftware}
                style={{ flex: 1, padding: '10px', fontSize: '12px', justifyContent: 'center' }}
              >
                <Layers size={15} color="#ecc94b" /> Software Catalog
              </button>

              <button
                type="button"
                className="btn-solarpunk"
                onClick={handleOpenTerminal}
                style={{ flex: 1, padding: '10px', fontSize: '12px', justifyContent: 'center' }}
              >
                <Terminal size={15} color="#68d391" /> Terminal Service
              </button>

              <button
                type="button"
                className="btn-solarpunk btn-gold"
                onClick={() =>
                  handleOpenBrowser(
                    isGlasshouse ? 'http://greenhouse.local:4000' : 'http://irrigation.local:8080'
                  )
                }
                style={{ flex: 1.2, padding: '10px', fontSize: '12px', justifyContent: 'center' }}
              >
                <Globe size={15} /> Web Console
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
