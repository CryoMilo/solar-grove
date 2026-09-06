import { Activity, Cpu } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { activePhaserGame } from '../game/PhaserGame';
import { useGameStore } from '../stores/useGameStore';

export const PerfOverlay: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [metrics, setMetrics] = useState({
    fps: 30,
    frameTime: 16,
    renderStatus: 'Active',
    buildingCount: 0,
    cropCount: 0,
  });

  const pcOpen = useGameStore((s) => s.pcOpen);
  const buildings = useGameStore((s) => s.buildings);
  const crops = useGameStore((s) => s.farmState.crops);

  // Poll performance metrics every 500ms when visible
  useEffect(() => {
    if (!visible) return;

    const interval = setInterval(() => {
      let currentFps = 30;
      let frameMs = 16;
      let status = 'Active';

      if (activePhaserGame) {
        currentFps = Math.round(activePhaserGame.loop.actualFps) || 30;
        frameMs = Math.round(activePhaserGame.loop.delta) || 16;
        if (pcOpen) status = 'Paused (PC Open)';
        else if (document.hidden) status = 'Paused (Tab Hidden)';
      }

      setMetrics({
        fps: currentFps,
        frameTime: frameMs,
        renderStatus: status,
        buildingCount: buildings.length,
        cropCount: crops.length,
      });
    }, 500);

    return () => clearInterval(interval);
  }, [visible, pcOpen, buildings.length, crops.length]);

  return (
    <div style={{ position: 'absolute', bottom: '16px', right: '16px', zIndex: 120 }}>
      {visible ? (
        <div
          className="glass-panel frame-solarpunk"
          style={{
            padding: '12px 16px',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: '#e2e8f0',
            minWidth: '220px',
            lineHeight: 1.6,
          }}
        >
          <div className="rivet rivet-tl" />
          <div className="rivet rivet-tr" />
          <div className="rivet rivet-bl" />
          <div className="rivet rivet-br" />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px',
              borderBottom: '1px solid rgba(214,158,46,0.3)',
              paddingBottom: '4px',
            }}
          >
            <span
              style={{
                color: '#ecc94b',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Cpu size={14} /> SYSTEM PERF (PRD §58)
            </span>
            <button
              type="button"
              onClick={() => setVisible(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#a0aec0',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#a0aec0' }}>Render Target:</span>
            <span style={{ color: '#48bb78', fontWeight: 700 }}>{metrics.fps} FPS / 30 MAX</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#a0aec0' }}>Frame Delta:</span>
            <span>{metrics.frameTime} ms</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#a0aec0' }}>Simulation Rate:</span>
            <span style={{ color: '#ecc94b' }}>1 Hz (1 tick/s)</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#a0aec0' }}>Render State:</span>
            <span
              style={{
                color: metrics.renderStatus.startsWith('Active') ? '#68d391' : '#f6ad55',
              }}
            >
              {metrics.renderStatus}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#a0aec0' }}>Entities:</span>
            <span>
              {metrics.buildingCount} bld / {metrics.cropCount} crops
            </span>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="btn-solarpunk"
          onClick={() => setVisible(true)}
          style={{
            padding: '5px 10px',
            fontSize: '11px',
            opacity: 0.8,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
          title="Toggle Performance & Heat Monitor (PRD Section 58)"
        >
          <Activity size={13} color="#ecc94b" /> 30 FPS
        </button>
      )}
    </div>
  );
};
