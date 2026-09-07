import {
  Award,
  BookOpen,
  CheckCircle2,
  Coins,
  Cpu,
  Droplets,
  ExternalLink,
  Globe,
  HardDrive,
  Layers,
  RotateCcw,
  Sparkles,
  Sun,
  X,
  Zap,
} from 'lucide-react';
import type React from 'react';
import { useGameStore } from '../stores/useGameStore';

export const GameCompleteModal: React.FC = () => {
  const open = useGameStore((s) => s.gameCompleteModalOpen);
  const setOpen = useGameStore((s) => s.setGameCompleteModalOpen);
  const setFreePlayMode = useGameStore((s) => s.setFreePlayMode);
  const setActiveWindow = useGameStore((s) => s.setActiveWindow);
  const togglePc = useGameStore((s) => s.togglePc);
  const resetGame = useGameStore((s) => s.resetGameToDefault);
  const farmState = useGameStore((s) => s.farmState);
  const objectives = useGameStore((s) => s.objectives);
  const buildings = useGameStore((s) => s.buildings);

  if (!open) return null;

  const completedCount = objectives.filter((o) => o.completed).length;

  const handleContinueFreePlay = () => {
    setFreePlayMode(true);
    setOpen(false);
  };

  const handleReviewKnowledge = () => {
    setFreePlayMode(true);
    setOpen(false);
    setActiveWindow('knowledge');
    togglePc(true);
  };

  const handleNewFarm = () => {
    if (window.confirm('Start a brand new farm? This will reset all current farm infrastructure and progress.')) {
      resetGame();
      setOpen(false);
    }
  };

  const systems = [
    { name: 'Terraced Farm & Soil Plots', icon: <Sun size={16} color="#ecc94b" />, status: 'ACTIVE' },
    { name: 'Automated Helio Irrigation (Port 8080)', icon: <Droplets size={16} color="#4fd1c5" />, status: 'ONLINE' },
    { name: 'Verdant Glasshouse Climate Aerators', icon: <Cpu size={16} color="#48bb78" />, status: 'BOOSTING +50%' },
    { name: 'Helio Edge Relay (TLS & DNS)', icon: <Globe size={16} color="#63b3ed" />, status: 'ENCRYPTED' },
    { name: 'Production Cloud VPC (10.10.0.0/16)', icon: <Layers size={16} color="#b794f4" />, status: 'PROVISIONED' },
    { name: 'Managed PostgreSQL (Private Subnet)', icon: <HardDrive size={16} color="#9ae6b4" />, status: 'ISOLATED' },
    { name: 'Cloud Compute Instance (EC2 / Compute Engine)', icon: <Zap size={16} color="#f6e05e" />, status: 'RUNNING' },
    { name: 'Telemetry Archive (Cloud Object Storage)', icon: <Award size={16} color="#f6ad55" />, status: 'ARCHIVING' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(4, 10, 8, 0.88)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2500,
      }}
    >
      <div
        className="glass-panel frame-solarpunk"
        style={{
          width: '680px',
          maxWidth: '92vw',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '32px',
          backgroundColor: '#0a1612',
          border: '2px solid #ecc94b',
          boxShadow: '0 0 50px rgba(236, 201, 75, 0.4), 0 25px 60px rgba(0,0,0,0.9)',
          position: 'relative',
        }}
      >
        <div className="rivet rivet-tl" />
        <div className="rivet rivet-tr" />
        <div className="rivet rivet-bl" />
        <div className="rivet rivet-br" />

        {/* Victory Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 16px',
              borderRadius: '20px',
              background: 'rgba(236, 201, 75, 0.15)',
              border: '1px solid #ecc94b',
              color: '#ecc94b',
              fontWeight: 800,
              fontSize: '12px',
              letterSpacing: '0.08em',
              marginBottom: '12px',
            }}
          >
            <Sparkles size={16} /> GAME COMPLETE • AUTONOMOUS PRODUCTION REACHED
          </div>

          <h1
            style={{
              fontSize: '26px',
              fontWeight: 900,
              color: '#f0fff4',
              margin: '0 0 6px 0',
              letterSpacing: '0.04em',
            }}
          >
            SOLAR GROVE — AUTONOMOUS FARM ONLINE
          </h1>
          <p style={{ fontSize: '14px', color: '#cbd5e0', maxWidth: '520px', margin: '0 auto', lineHeight: '1.5' }}>
            Congratulations, Systems Architect. Your grove is now operating on a resilient, high-availability production cloud architecture.
          </p>
        </div>

        {/* Infrastructure Mastered Banner */}
        <div
          style={{
            padding: '12px 18px',
            background: 'linear-gradient(90deg, rgba(56, 161, 105, 0.2), rgba(66, 153, 225, 0.2))',
            borderRadius: '8px',
            border: '1px solid rgba(72, 187, 120, 0.35)',
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '11px', color: '#a0aec0', letterSpacing: '0.05em', marginBottom: '6px' }}>
            INFRASTRUCTURE JOURNEY MASTERED
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              fontWeight: 800,
              fontSize: '14px',
              color: '#f0fff4',
            }}
          >
            <span style={{ color: '#ecc94b' }}>Local Systemd</span>
            <span style={{ color: '#a0aec0' }}>→</span>
            <span style={{ color: '#48bb78' }}>Docker Containers</span>
            <span style={{ color: '#a0aec0' }}>→</span>
            <span style={{ color: '#63b3ed' }}>Edge Reverse Proxy & TLS</span>
            <span style={{ color: '#a0aec0' }}>→</span>
            <span style={{ color: '#b794f4' }}>Production Cloud</span>
          </div>
        </div>

        {/* Operational Statistics */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginBottom: '22px',
          }}
        >
          <div
            style={{
              background: 'rgba(0,0,0,0.3)',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid rgba(214,158,46,0.2)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '11px', color: '#cbd5e0' }}>TREASURY RESERVES</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#ecc94b', marginTop: '2px' }}>
              {farmState.gold} G
            </div>
          </div>
          <div
            style={{
              background: 'rgba(0,0,0,0.3)',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid rgba(214,158,46,0.2)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '11px', color: '#cbd5e0' }}>SYSTEMS ERECTED</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#48bb78', marginTop: '2px' }}>
              {buildings.length} Structures
            </div>
          </div>
          <div
            style={{
              background: 'rgba(0,0,0,0.3)',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid rgba(214,158,46,0.2)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '11px', color: '#cbd5e0' }}>OBJECTIVES FULFILLED</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#63b3ed', marginTop: '2px' }}>
              {completedCount} / {objectives.length}
            </div>
          </div>
        </div>

        {/* System Checklist */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#ecc94b', marginBottom: '8px', letterSpacing: '0.04em' }}>
            OPERATIONAL SYSTEMS STATUS:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {systems.map((sys, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: 'rgba(0,0,0,0.25)',
                  fontSize: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={15} color="#48bb78" />
                  <span style={{ color: '#e2e8f0' }}>{sys.name}</span>
                </div>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#9ae6b4', padding: '2px 6px', borderRadius: '4px', background: 'rgba(72,187,120,0.15)' }}>
                  {sys.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(214, 158, 46, 0.3)',
            paddingTop: '20px',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <button
            type="button"
            className="btn-solarpunk"
            onClick={handleNewFarm}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              fontSize: '13px',
              color: '#fc8181',
              borderColor: 'rgba(229, 62, 62, 0.4)',
              background: 'rgba(197, 48, 48, 0.15)',
            }}
          >
            <RotateCcw size={15} /> New Farm
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn-solarpunk"
              onClick={handleReviewKnowledge}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                fontSize: '13px',
              }}
            >
              <BookOpen size={15} /> Review Knowledge
            </button>

            <button
              type="button"
              className="btn-solarpunk btn-gold"
              onClick={handleContinueFreePlay}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 22px',
                fontSize: '13px',
                fontWeight: 700,
              }}
            >
              <Sun size={15} /> Continue Free Play
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
