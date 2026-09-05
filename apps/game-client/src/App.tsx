import { BUILDINGS } from '@solar-grove/content';
import {
  AlertCircle,
  Coins,
  Cpu,
  Droplets,
  Monitor,
  Play,
  Sparkles,
  Sun,
  Terminal,
  Zap,
} from 'lucide-react';
import type React from 'react';
import { useEffect } from 'react';
import { PhaserGame } from './game/PhaserGame';
import { BlueprintModal } from './pc/BlueprintModal/BlueprintModal';
import { HeliosDesktop } from './pc/HeliosDesktop';
import { MicroLessonDrawer } from './pc/MicroLesson/MicroLessonDrawer';
import { useGameStore } from './stores/useGameStore';

export const App: React.FC = () => {
  const farmState = useGameStore((s) => s.farmState);
  const pcOpen = useGameStore((s) => s.pcOpen);
  const togglePc = useGameStore((s) => s.togglePc);
  const tick = useGameStore((s) => s.tick);
  const objectives = useGameStore((s) => s.objectives);
  const openBlueprint = useGameStore((s) => s.openBlueprint);
  const activeBlueprint = useGameStore((s) => s.activeBlueprint);
  const closeBlueprint = useGameStore((s) => s.closeBlueprint);
  const activeMicroLesson = useGameStore((s) => s.activeMicroLesson);
  const closeMicroLesson = useGameStore((s) => s.closeMicroLesson);

  // 1. Simulation loop (1 tick per second)
  useEffect(() => {
    const timer = setInterval(() => {
      tick();
    }, 1000);
    return () => clearInterval(timer);
  }, [tick]);

  // 2. Global TAB shortcut to toggle PC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        togglePc();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePc]);

  const activeObjective = objectives.find((o) => !o.completed) || objectives[0];

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* 2D Pixel Farm Canvas */}
      <PhaserGame />

      {/* Farm HUD Overlays (Visible when PC is closed) */}
      {!pcOpen && (
        <>
          {/* Top Left: Farm Treasury & Resources */}
          <div
            className="glass-panel"
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
              zIndex: 100,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#ecc94b',
                fontWeight: 800,
              }}
            >
              <Coins size={18} />
              <span style={{ fontSize: '17px' }}>{farmState.gold}</span>
              <span style={{ fontSize: '11px', color: '#fbd38d' }}>GOLD</span>
            </div>

            <div style={{ width: '1px', height: '24px', background: 'rgba(72,187,120,0.3)' }} />

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#4fd1c5',
                fontWeight: 700,
              }}
            >
              <Zap size={16} />
              <span style={{ fontSize: '15px' }}>{farmState.power}</span>
              <span style={{ fontSize: '11px', color: '#81e6d9' }}>kWh</span>
            </div>

            <div style={{ width: '1px', height: '24px', background: 'rgba(72,187,120,0.3)' }} />

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#4299e1',
                fontWeight: 700,
              }}
            >
              <Droplets size={16} />
              <span style={{ fontSize: '15px' }}>{farmState.water}</span>
              <span style={{ fontSize: '11px', color: '#90cdf4' }}>L</span>
            </div>
          </div>

          {/* Top Right: Objective Banner & PC Switch */}
          <div
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              zIndex: 100,
            }}
          >
            {activeObjective && (
              <div
                className="glass-panel"
                style={{
                  padding: '8px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                }}
              >
                <Sparkles size={16} color="#ecc94b" />
                <span style={{ color: '#cbd5e0' }}>Goal:</span>
                <strong style={{ color: '#f0fff4' }}>{activeObjective.title}</strong>
              </div>
            )}

            <button
              className="btn-solarpunk btn-gold"
              onClick={() => togglePc(true)}
              style={{
                boxShadow: '0 4px 20px rgba(236, 201, 75, 0.35)',
                padding: '10px 18px',
              }}
            >
              <Monitor size={17} />
              <span>Pixel PC (TAB)</span>
            </button>
          </div>

          {/* Bottom Center: Quick Building Blueprints & Actions */}
          <div
            className="glass-panel"
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              zIndex: 100,
            }}
          >
            <div
              style={{ fontSize: '12px', color: '#a0aec0', marginRight: '6px', fontWeight: 600 }}
            >
              BUILD BLUEPRINTS:
            </div>

            <button
              className="btn-solarpunk"
              onClick={() => openBlueprint(BUILDINGS['helio-pump'])}
              style={{ padding: '6px 14px', fontSize: '12px' }}
            >
              <Sun size={15} color="#ecc94b" /> Helio Pump
            </button>

            <button
              className="btn-solarpunk"
              onClick={() => openBlueprint(BUILDINGS['verdant-glasshouse'])}
              style={{ padding: '6px 14px', fontSize: '12px' }}
            >
              <Cpu size={15} color="#48bb78" /> Verdant Glasshouse
            </button>

            <div style={{ width: '1px', height: '20px', background: 'rgba(72,187,120,0.3)' }} />

            <div style={{ fontSize: '11px', color: '#9ae6b4', fontStyle: 'italic' }}>
              Tip: Click soil to plant Sunroot • Click mature crops to harvest
            </div>
          </div>
        </>
      )}

      {/* Helios OS Desktop Modal View */}
      {pcOpen && <HeliosDesktop />}

      {/* Blueprint Modal (accessible in farm mode too) */}
      {!pcOpen && activeBlueprint && (
        <BlueprintModal blueprint={activeBlueprint} onClose={closeBlueprint} />
      )}

      {/* Micro-Lesson Drawer (accessible in farm mode too) */}
      {!pcOpen && activeMicroLesson && (
        <MicroLessonDrawer lesson={activeMicroLesson} onClose={closeMicroLesson} />
      )}
    </div>
  );
};
