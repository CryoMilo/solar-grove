import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Droplets,
  ExternalLink,
  Globe,
  Layers,
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

  const irrService = serviceManager.getService('irrigation-controller');
  const telemetry = serviceManager.getIrrigationTelemetry();
  const isRunning = irrService?.status === 'running';
  const isCrashed = irrService?.status === 'failed';
  const isPumping = serviceManager.isIrrigationActivelyPumping();

  const softwareStatus = isRunning
    ? 'RUNNING'
    : isCrashed
      ? 'CRASHED'
      : irrService?.deploymentStatus || 'NOT_DEPLOYED';

  const buildingStatus = isRunning ? 'HEALTHY' : isCrashed ? 'OFFLINE (ALERT)' : 'OFFLINE';

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

  const handleOpenBrowser = () => {
    onClose();
    setBrowserUrl('http://irrigation.local:8080');
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
          width: '560px',
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
              <Droplets size={20} color="#ecc94b" />
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
                HELIO IRRIGATION STATION
              </h2>
              <div style={{ fontSize: '11px', color: '#9ae6b4' }}>
                Deep Aquifer Solar Pumping Array (ID: {building.id})
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
          {/* Status */}
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
              {isRunning ? (
                <>
                  <CheckCircle2 size={16} color="#48bb78" />
                  <span style={{ fontWeight: 700, color: '#48bb78' }}>HEALTHY</span>
                </>
              ) : isCrashed ? (
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

          {/* Software Status */}
          <div
            style={{
              padding: '12px',
              backgroundColor: 'rgba(12, 28, 22, 0.8)',
              border: '1px solid rgba(214, 158, 46, 0.2)',
              borderRadius: '6px',
            }}
          >
            <div style={{ fontSize: '11px', color: '#a0aec0', marginBottom: '4px' }}>
              SOFTWARE DAEMON
            </div>
            <div style={{ fontWeight: 700, fontSize: '13px' }}>
              <span style={{ color: '#ecc94b' }}>Irrigation Controller</span>{' '}
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor:
                    softwareStatus === 'RUNNING'
                      ? 'rgba(72,187,120,0.2)'
                      : softwareStatus === 'CRASHED'
                        ? 'rgba(229,62,62,0.2)'
                        : 'rgba(160,174,192,0.2)',
                  color:
                    softwareStatus === 'RUNNING'
                      ? '#68d391'
                      : softwareStatus === 'CRASHED'
                        ? '#fc8181'
                        : '#cbd5e0',
                }}
              >
                {softwareStatus}
              </span>
            </div>
          </div>

          {/* Network */}
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
              http://irrigation.local:8080
            </div>
          </div>

          {/* Irrigation Delivery */}
          <div
            style={{
              padding: '12px',
              backgroundColor: 'rgba(12, 28, 22, 0.8)',
              border: '1px solid rgba(214, 158, 46, 0.2)',
              borderRadius: '6px',
            }}
          >
            <div style={{ fontSize: '11px', color: '#a0aec0', marginBottom: '4px' }}>
              WATER DELIVERY
            </div>
            <div
              style={{
                fontWeight: 700,
                fontSize: '13px',
                color: isPumping ? '#4fd1c5' : '#a0aec0',
              }}
            >
              {isPumping ? '🌊 PUMPING ACTIVE (+4%/s)' : '⏸️ IDLE / STOPPED'}
            </div>
          </div>

          {/* Reservoir & Power */}
          <div
            style={{
              padding: '12px',
              backgroundColor: 'rgba(12, 28, 22, 0.8)',
              border: '1px solid rgba(214, 158, 46, 0.2)',
              borderRadius: '6px',
            }}
          >
            <div style={{ fontSize: '11px', color: '#a0aec0', marginBottom: '4px' }}>
              AQUIFER RESERVOIR
            </div>
            <div style={{ fontWeight: 700, fontSize: '13px', color: '#ecc94b' }}>
              {telemetry.reservoirPct}% Capacity ({telemetry.soilMoisturePct}% Soil Saturation)
            </div>
          </div>

          {/* Production Impact */}
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
              +40% Crop Growth Acceleration
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
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
            onClick={handleOpenBrowser}
            style={{ flex: 1.2, padding: '10px', fontSize: '12px', justifyContent: 'center' }}
          >
            <Globe size={15} /> Web Console
          </button>
        </div>
      </div>
    </div>
  );
};
