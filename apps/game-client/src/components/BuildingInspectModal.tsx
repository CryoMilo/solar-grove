import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Database,
  Droplets,
  ExternalLink,
  Globe,
  HardDrive,
  Layers,
  Network,
  Radio,
  Route,
  ShieldCheck,
  Terminal,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useGameStore } from '../stores/useGameStore';

export const BuildingInspectModal: React.FC = () => {
  const building = useGameStore((s) => s.inspectingBuilding);
  const onClose = () => useGameStore.getState().setInspectingBuilding(null);
  const togglePc = useGameStore((s) => s.togglePc);
  const setActiveWindow = useGameStore((s) => s.setActiveWindow);
  const setBrowserUrl = useGameStore((s) => s.setBrowserUrl);
  const serviceManager = useGameStore((s) => s.serviceManager);
  const activeIncidents = useGameStore((s) => s.activeIncidents);
  const setActiveIncidentModal = useGameStore((s) => s.setActiveIncidentModal);

  const [tab, setTab] = useState<'overview' | 'diagnostics'>('overview');

  if (!building) return null;

  const isGlasshouse = building.type === 'verdant-glasshouse';
  const isRelay = building.type === 'helio-relay';

  // 1. Irrigation Station State (Phase 2)
  const irrService = serviceManager.getService('irrigation-controller');
  const irrTelemetry = serviceManager.getIrrigationTelemetry();
  const isIrrRunning = irrService?.status === 'running';
  const isIrrCrashed = irrService?.status === 'failed';
  const isIrrPumping = serviceManager.isIrrigationActivelyPumping();

  // 2. Verdant Glasshouse State (Phase 3 & 5)
  const isCloudGh = serviceManager.getDeploymentTarget() === 'cloud';
  const ghContainer = serviceManager.findContainer('greenhouse-controller');
  const isGhHealthy = isCloudGh
    ? serviceManager.isGreenhouseOptimized()
    : ghContainer?.status === 'RUNNING' && ghContainer?.health === 'HEALTHY';
  const isGhUnhealthy = isCloudGh
    ? !serviceManager.isGreenhouseOptimized()
    : ghContainer?.status === 'RUNNING' && ghContainer?.health === 'UNHEALTHY';

  // 3. Helio Relay State (Phase 4)
  const relayService = serviceManager.getService('helio-relay');
  const isRelayRunning = relayService?.status === 'running';
  const isRelayCrashed = relayService?.status === 'failed';
  const proxyState = serviceManager.getReverseProxyState();
  const certs = serviceManager.getCertificates();
  const validCertsCount = certs.filter((c) => c.status === 'VALID').length;

  // Active Incident for this building
  const buildingIncident = activeIncidents.find(
    (i) =>
      i.affectedBuildingId === building.id ||
      (building.type === 'helio-pump' && i.affectedServiceName === 'irrigation-controller') ||
      (building.type === 'verdant-glasshouse' && i.affectedServiceName === 'greenhouse-controller')
  );

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

  const handleOpenBrowser = (url: string) => {
    onClose();
    setBrowserUrl(url);
    setActiveWindow('browser');
    togglePc(true);
  };

  const handleOpenIncident = () => {
    if (buildingIncident) {
      onClose();
      setActiveIncidentModal(buildingIncident);
    }
  };

  const getBuildingName = () => {
    if (isRelay) return 'HELIO RELAY STATION';
    if (isGlasshouse) return 'VERDANT GLASSHOUSE';
    return 'HELIO IRRIGATION STATION';
  };

  const getPurpose = () => {
    if (isRelay) return 'Public edge ingress gateway, reverse proxy, and TLS termination.';
    if (isGlasshouse) return 'Controlled growth habitat providing climate aerators for accelerated photosynthesis.';
    return 'Automates farm soil hydration through deep solar groundwater aquifer pumping.';
  };

  const getEffect = () => {
    if (isRelay) {
      return isRelayRunning ? 'Edge ingress active; proxying traffic to internal services' : 'Edge gateway offline';
    }
    if (isGlasshouse) {
      return isGhHealthy ? '+50% accelerated crop growth speed (ACTIVE)' : 'Photosynthesis boost offline';
    }
    return isIrrPumping ? '+40% crop growth speed boost (ACTIVE)' : 'Pumping standby / offline';
  };

  const getStatusBadge = () => {
    let statusText = 'OFFLINE';
    let color = '#a0aec0';
    let bg = 'rgba(160, 174, 192, 0.15)';

    if (isRelay) {
      if (isRelayRunning) {
        statusText = 'HEALTHY';
        color = '#48bb78';
        bg = 'rgba(72, 187, 120, 0.15)';
      } else if (isRelayCrashed) {
        statusText = 'CRASHED';
        color = '#e53e3e';
        bg = 'rgba(229, 62, 62, 0.15)';
      }
    } else if (isGlasshouse) {
      if (isGhHealthy) {
        statusText = 'HEALTHY';
        color = '#48bb78';
        bg = 'rgba(72, 187, 120, 0.15)';
      } else if (isGhUnhealthy) {
        statusText = 'DEGRADED';
        color = '#ecc94b';
        bg = 'rgba(236, 201, 75, 0.15)';
      }
    } else {
      if (isIrrRunning) {
        statusText = 'HEALTHY';
        color = '#48bb78';
        bg = 'rgba(72, 187, 120, 0.15)';
      } else if (isIrrCrashed) {
        statusText = 'CRASHED';
        color = '#e53e3e';
        bg = 'rgba(229, 62, 62, 0.15)';
      }
    }

    return (
      <span
        style={{
          padding: '3px 10px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: 800,
          color,
          backgroundColor: bg,
          border: `1px solid ${color}`,
        }}
      >
        ● {statusText}
      </span>
    );
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
          maxHeight: '90vh',
          overflowY: 'auto',
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
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'rgba(214, 158, 46, 0.15)',
                border: '1px solid #d69e2e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isRelay ? (
                <Radio size={22} color="#63b3ed" />
              ) : isGlasshouse ? (
                <Cpu size={22} color="#68d391" />
              ) : (
                <Droplets size={22} color="#ecc94b" />
              )}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#ecc94b', margin: 0 }}>
                  {getBuildingName()}
                </h2>
                {getStatusBadge()}
              </div>
              <div style={{ fontSize: '11px', color: '#a0aec0', marginTop: '3px' }}>
                Structure ID: {building.id}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn-solarpunk"
            style={{ padding: '6px', borderRadius: '50%' }}
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        {/* Active Incident Warning Alert */}
        {buildingIncident && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '6px',
              background: 'rgba(197, 48, 48, 0.2)',
              border: '1px solid #e53e3e',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={20} color="#fc8181" />
              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#fed7d7' }}>
                  ⚠ INCIDENT: {buildingIncident.title}
                </div>
                <div style={{ fontSize: '11px', color: '#feb2b2' }}>
                  {buildingIncident.description}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn-solarpunk"
              onClick={handleOpenIncident}
              style={{
                fontSize: '11px',
                padding: '6px 12px',
                background: 'linear-gradient(135deg, #c53030, #9b2c2c)',
                borderColor: '#feb2b2',
                color: '#fff',
                whiteSpace: 'nowrap',
              }}
            >
              Investigate
            </button>
          </div>
        )}

        {/* Progressive Disclosure Tabs: Overview vs Diagnostics */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button
            type="button"
            onClick={() => setTab('overview')}
            style={{
              padding: '6px 16px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: tab === 'overview' ? 'rgba(214, 158, 46, 0.25)' : 'rgba(0,0,0,0.25)',
              color: tab === 'overview' ? '#ecc94b' : '#cbd5e0',
              boxShadow: tab === 'overview' ? 'inset 0 0 0 1px rgba(214, 158, 46, 0.5)' : 'none',
            }}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setTab('diagnostics')}
            style={{
              padding: '6px 16px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: tab === 'diagnostics' ? 'rgba(214, 158, 46, 0.25)' : 'rgba(0,0,0,0.25)',
              color: tab === 'diagnostics' ? '#ecc94b' : '#cbd5e0',
              boxShadow: tab === 'diagnostics' ? 'inset 0 0 0 1px rgba(214, 158, 46, 0.5)' : 'none',
            }}
          >
            Diagnostics
          </button>
        </div>

        {tab === 'overview' ? (
          /* OVERVIEW TAB */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Purpose */}
            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: '6px' }}>
              <div style={{ fontSize: '11px', color: '#a0aec0', marginBottom: '2px' }}>PURPOSE:</div>
              <div style={{ fontSize: '13px', color: '#e2e8f0', lineHeight: 1.5 }}>
                {getPurpose()}
              </div>
            </div>

            {/* Operating Effect & Telemetry */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '6px' }}>
                <div style={{ fontSize: '11px', color: '#a0aec0', marginBottom: '2px' }}>FARM EFFECT:</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#48bb78' }}>
                  {getEffect()}
                </div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '6px' }}>
                <div style={{ fontSize: '11px', color: '#a0aec0', marginBottom: '2px' }}>POWER USAGE:</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#ecc94b' }}>
                  {building.powerConsumption} kWh / sec
                </div>
              </div>
            </div>

            {/* Software & Infrastructure */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '6px' }}>
                <div style={{ fontSize: '11px', color: '#a0aec0', marginBottom: '2px' }}>CONTROLLING SOFTWARE:</div>
                <div style={{ fontSize: '13px', color: '#9ae6b4', fontWeight: 600 }}>
                  {isRelay ? 'helio-relay' : isGlasshouse ? 'greenhouse-controller' : 'irrigation-controller'}
                </div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '6px' }}>
                <div style={{ fontSize: '11px', color: '#a0aec0', marginBottom: '2px' }}>INFRASTRUCTURE TIER:</div>
                <div style={{ fontSize: '13px', color: '#63b3ed', fontWeight: 600 }}>
                  {isRelay
                    ? 'Edge Ingress Proxy'
                    : isGlasshouse
                      ? isCloudGh
                        ? 'Production Cloud Compute'
                        : 'Docker Container'
                      : 'Linux Service'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* DIAGNOSTICS TAB */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '6px' }}>
              <div style={{ fontSize: '11px', color: '#a0aec0', marginBottom: '6px' }}>
                NETWORK & SOCKET BINDINGS:
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#63b3ed' }}>
                {isRelay
                  ? 'Listen: 0.0.0.0:80, 0.0.0.0:443 (Edge Relay 10.0.0.10)'
                  : isGlasshouse
                    ? isCloudGh
                      ? 'Endpoint: 10.10.1.10:4000 (VPC Public Subnet)'
                      : 'Bridge: greenhouse-network (greenhouse-controller:4000)'
                    : 'Listen: 127.0.0.1:8080 (Localhost Systemd)'}
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '6px' }}>
              <div style={{ fontSize: '11px', color: '#a0aec0', marginBottom: '6px' }}>
                SYSTEM PROCESS TELEMETRY:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                <div>
                  <span style={{ color: '#a0aec0' }}>Process Status: </span>
                  <strong style={{ color: '#9ae6b4' }}>
                    {isRelay
                      ? relayService?.status?.toUpperCase() || 'STOPPED'
                      : isGlasshouse
                        ? isCloudGh
                          ? 'CLOUD_RUNNING'
                          : ghContainer?.status || 'STOPPED'
                        : irrService?.status?.toUpperCase() || 'STOPPED'}
                  </strong>
                </div>
                <div>
                  <span style={{ color: '#a0aec0' }}>PID / Container ID: </span>
                  <strong style={{ color: '#ecc94b', fontFamily: 'monospace' }}>
                    {isRelay ? 'pid-1940' : isGlasshouse ? 'c-gh-controller' : 'pid-1421'}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(214, 158, 46, 0.3)',
            paddingTop: '16px',
            marginTop: '18px',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <button
            type="button"
            className="btn-solarpunk"
            onClick={handleOpenSoftware}
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            <Layers size={14} /> Software Catalog
          </button>

          {isRelay ? (
            <button
              type="button"
              className="btn-solarpunk"
              onClick={() => handleOpenBrowser('https://greenhouse.solar-grove.local')}
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              <Globe size={14} /> Open Edge Domain
            </button>
          ) : isGlasshouse ? (
            <button
              type="button"
              className="btn-solarpunk"
              onClick={() => handleOpenBrowser('http://greenhouse.local:4000')}
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              <ExternalLink size={14} /> Open Glasshouse Web
            </button>
          ) : (
            <button
              type="button"
              className="btn-solarpunk"
              onClick={() => handleOpenBrowser('http://irrigation.local:8080')}
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              <ExternalLink size={14} /> Open Irrigation Web
            </button>
          )}

          <button
            type="button"
            className="btn-solarpunk btn-gold"
            onClick={handleOpenTerminal}
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            <Terminal size={14} /> Inspect Terminal
          </button>
        </div>
      </div>
    </div>
  );
};
