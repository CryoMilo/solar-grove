import { BUILDINGS } from '@solar-grove/content';
import {
  AlertCircle,
  Coins,
  Cpu,
  Droplets,
  HelpCircle,
  Monitor,
  Move,
  Play,
  Radio,
  RotateCcw,
  Save,
  Settings,
  Sparkles,
  Sun,
  Terminal,
  Volume2,
  VolumeX,
  X,
  Zap,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { BuildingInspectModal } from './components/BuildingInspectModal';
import { ConceptDiscoveryToast } from './components/ConceptDiscoveryToast';
import { GameCompleteModal } from './components/GameCompleteModal';
import { IncidentDetailsModal } from './components/IncidentDetailsModal';
import { OnboardingModal } from './components/OnboardingModal';
import { PerfOverlay } from './components/PerfOverlay';
import { PhaserGame } from './game/PhaserGame';
import { BlueprintModal } from './pc/BlueprintModal/BlueprintModal';
import { HeliosDesktop } from './pc/HeliosDesktop';
import { MicroLessonDrawer } from './pc/MicroLesson/MicroLessonDrawer';
import { useGameStore } from './stores/useGameStore';
import { soundEngine } from './utils/audio';

export const App: React.FC = () => {
  const farmState = useGameStore((s) => s.farmState);
  const pcOpen = useGameStore((s) => s.pcOpen);
  const togglePc = useGameStore((s) => s.togglePc);
  const tick = useGameStore((s) => s.tick);
  const objectives = useGameStore((s) => s.objectives);
  const activeBlueprint = useGameStore((s) => s.activeBlueprint);
  const closeBlueprint = useGameStore((s) => s.closeBlueprint);
  const activeMicroLesson = useGameStore((s) => s.activeMicroLesson);
  const closeMicroLesson = useGameStore((s) => s.closeMicroLesson);
  const activeIncidents = useGameStore((s) => s.activeIncidents);
  const triggerIncident = useGameStore((s) => s.triggerIncident);
  const setActiveWindow = useGameStore((s) => s.setActiveWindow);

  const placementMode = useGameStore((s) => s.placementMode);
  const startPlacement = useGameStore((s) => s.startPlacement);
  const cancelPlacement = useGameStore((s) => s.cancelPlacement);

  const setOnboardingModalOpen = useGameStore((s) => s.setOnboardingModalOpen);
  const setActiveIncidentModal = useGameStore((s) => s.setActiveIncidentModal);
  const saveGameToStorage = useGameStore((s) => s.saveGameToStorage);
  const loadGameFromStorage = useGameStore((s) => s.loadGameFromStorage);
  const resetGameToDefault = useGameStore((s) => s.resetGameToDefault);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const [isMuted, setIsMuted] = useState(soundEngine.isMuted());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2400);
  };

  const handleToggleMute = () => {
    const nextMuted = soundEngine.toggleMute();
    setIsMuted(nextMuted);
    showToast(nextMuted ? 'Sound Muted' : 'Sound Enabled');
  };

  const handleManualSave = () => {
    const ok = saveGameToStorage();
    showToast(ok ? 'Game Saved Locally! ✓' : 'Save Failed');
    setSettingsOpen(false);
  };

  const handleManualLoad = () => {
    const ok = loadGameFromStorage();
    showToast(ok ? 'Game Loaded! ✓' : 'No Save Data Found');
    setSettingsOpen(false);
  };

  const handleResetGame = () => {
    if (window.confirm('Reset farm to starting state? All current buildings and progress will be cleared.')) {
      resetGameToDefault();
      showToast('Farm Reset to Beginning');
      setSettingsOpen(false);
    }
  };

  // 1. Simulation loop (1 tick per second)
  useEffect(() => {
    const timer = setInterval(() => {
      tick();
    }, 1000);
    return () => clearInterval(timer);
  }, [tick]);

  // 2. Global TAB shortcut to toggle PC & Escape to cancel placement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        togglePc();
      } else if (e.key === 'Escape') {
        cancelPlacement();
        setSettingsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePc, cancelPlacement]);

  const activeObjective = objectives.find((o) => !o.completed) || objectives[0];
  const placingBlueprint = placementMode.buildingType
    ? BUILDINGS[placementMode.buildingType]
    : null;

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* 2.5D Isometric Bird's-Eye Farm Canvas */}
      <PhaserGame />

      {/* Farm HUD Overlays (Visible when PC is closed) */}
      {!pcOpen && (
        <>
          {/* Top Left: Farm Treasury & Resources with Fantasy Solarpunk Brass Frame */}
          <div
            className="glass-panel frame-solarpunk"
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
              zIndex: 100,
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
                gap: '6px',
                color: '#ecc94b',
                fontWeight: 800,
              }}
            >
              <Coins size={18} />
              <span style={{ fontSize: '17px' }}>{farmState.gold}</span>
              <span style={{ fontSize: '11px', color: '#fbd38d' }}>GOLD</span>
            </div>

            <div style={{ width: '1px', height: '24px', background: 'rgba(214,158,46,0.3)' }} />

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

            <div style={{ width: '1px', height: '24px', background: 'rgba(214,158,46,0.3)' }} />

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

          {/* Active Incident Alert Banner */}
          {activeIncidents.length > 0 && (
            <div
              className="glass-panel incident-alarm-bar frame-solarpunk"
              style={{
                position: 'absolute',
                top: '78px',
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '10px 22px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                zIndex: 200,
                backgroundColor: 'rgba(50, 15, 15, 0.95)',
                borderColor: '#e53e3e',
                boxShadow: '0 0 25px rgba(229, 62, 62, 0.45)',
                cursor: 'pointer',
              }}
              onClick={() => setActiveIncidentModal(activeIncidents[0])}
            >
              <div className="rivet rivet-tl" />
              <div className="rivet rivet-tr" />
              <div className="rivet rivet-bl" />
              <div className="rivet rivet-br" />

              <AlertCircle size={22} color="#fc8181" />
              <div>
                <div
                  style={{
                    fontWeight: 800,
                    color: '#fed7d7',
                    fontSize: '13px',
                    letterSpacing: '0.04em',
                  }}
                >
                  ⚠ {activeIncidents[0].title.toUpperCase()}
                </div>
                <div style={{ fontSize: '12px', color: '#feb2b2' }}>
                  {activeIncidents[0].description} (Click to Investigate)
                </div>
              </div>
              <button
                type="button"
                className="btn-solarpunk"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIncidentModal(activeIncidents[0]);
                }}
                style={{
                  background: 'linear-gradient(135deg, #c53030, #9b2c2c)',
                  borderColor: '#feb2b2',
                  color: '#fff',
                  padding: '6px 14px',
                  fontWeight: 700,
                  fontSize: '12px',
                }}
              >
                <Terminal size={14} /> Troubleshoot
              </button>
            </div>
          )}

          {/* Top Center: Active Placement Mode Banner */}
          {placementMode.active && placingBlueprint && (
            <div
              className="glass-panel glass-panel-glow"
              style={{
                position: 'absolute',
                top: '16px',
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '10px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                zIndex: 150,
                backgroundColor: 'rgba(20, 45, 37, 0.95)',
                border: '1px solid #48bb78',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#ecc94b',
                  fontWeight: 700,
                }}
              >
                <Sun size={18} />
                <span>Placing: {placingBlueprint.solarpunkName}</span>
              </div>
              <span style={{ fontSize: '12px', color: '#cbd5e0' }}>
                Click on the farm to construct ({placingBlueprint.constructionCost} G)
              </span>
              <button
                type="button"
                className="btn-solarpunk"
                onClick={cancelPlacement}
                style={{
                  padding: '4px 10px',
                  fontSize: '11px',
                  background: 'rgba(229, 62, 62, 0.25)',
                  borderColor: '#e53e3e',
                  color: '#fc8181',
                }}
              >
                <X size={13} /> Cancel (ESC)
              </button>
            </div>
          )}

          {/* Top Right: Objective Banner, Sound, Guide, Settings & PC Switch */}
          <div
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              zIndex: 100,
            }}
          >
            {activeObjective && (
              <div
                className="glass-panel frame-solarpunk"
                style={{
                  padding: '9px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setActiveWindow('objectives');
                  togglePc(true);
                }}
                title="Click to view all progression objectives"
              >
                <div className="rivet rivet-tl" />
                <div className="rivet rivet-tr" />
                <div className="rivet rivet-bl" />
                <div className="rivet rivet-br" />
                <Sparkles size={16} color="#ecc94b" />
                <span style={{ color: '#cbd5e0' }}>Goal:</span>
                <strong style={{ color: '#f0fff4' }}>{activeObjective.title}</strong>
              </div>
            )}

            {/* Audio Toggle */}
            <button
              type="button"
              className="btn-solarpunk"
              onClick={handleToggleMute}
              style={{ padding: '9px', borderRadius: '8px' }}
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {isMuted ? <VolumeX size={16} color="#fc8181" /> : <Volume2 size={16} color="#48bb78" />}
            </button>

            {/* Onboarding Guide Button */}
            <button
              type="button"
              className="btn-solarpunk"
              onClick={() => setOnboardingModalOpen(true)}
              style={{ padding: '8px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}
              title="Open Player Manual & Onboarding Guide"
            >
              <HelpCircle size={15} color="#ecc94b" /> Guide
            </button>

            {/* Settings & Save Menu */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="btn-solarpunk"
                onClick={() => setSettingsOpen(!settingsOpen)}
                style={{ padding: '9px', borderRadius: '8px' }}
                title="Settings & Save Menu"
              >
                <Settings size={16} color="#cbd5e0" />
              </button>

              {settingsOpen && (
                <div
                  className="glass-panel frame-solarpunk"
                  style={{
                    position: 'absolute',
                    top: '42px',
                    right: 0,
                    width: '200px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    backgroundColor: '#0a1612',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.85)',
                    zIndex: 300,
                  }}
                >
                  <button
                    type="button"
                    className="btn-solarpunk"
                    onClick={handleManualSave}
                    style={{ justifyContent: 'flex-start', padding: '8px 12px', fontSize: '12px' }}
                  >
                    <Save size={14} color="#ecc94b" /> Save Game
                  </button>
                  <button
                    type="button"
                    className="btn-solarpunk"
                    onClick={handleManualLoad}
                    style={{ justifyContent: 'flex-start', padding: '8px 12px', fontSize: '12px' }}
                  >
                    <RotateCcw size={14} color="#63b3ed" /> Load Game
                  </button>
                  <button
                    type="button"
                    className="btn-solarpunk"
                    onClick={handleResetGame}
                    style={{ justifyContent: 'flex-start', padding: '8px 12px', fontSize: '12px', color: '#fc8181' }}
                  >
                    <X size={14} /> New Farm (Reset)
                  </button>

                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '11px',
                      color: '#a0aec0',
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={devMode}
                      onChange={(e) => setDevMode(e.target.checked)}
                    />
                    <span>Developer Mode</span>
                  </label>

                  {devMode && (
                    <button
                      type="button"
                      className="btn-solarpunk"
                      onClick={() => {
                        triggerIncident('process-crash');
                        setSettingsOpen(false);
                      }}
                      style={{
                        padding: '6px 10px',
                        fontSize: '11px',
                        color: '#fc8181',
                        borderColor: 'rgba(229,62,62,0.4)',
                      }}
                    >
                      ⚡ Dev: Trigger Incident
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Pixel PC Button */}
            <button
              type="button"
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

          {/* Bottom Center: Quick Building Blueprints & Controls (Prototype incident button removed) */}
          <div
            className="glass-panel frame-solarpunk"
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '10px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              zIndex: 100,
            }}
          >
            <div className="rivet rivet-tl" />
            <div className="rivet rivet-tr" />
            <div className="rivet rivet-bl" />
            <div className="rivet rivet-br" />

            <div
              style={{
                fontSize: '12px',
                color: '#ecc94b',
                fontWeight: 700,
                letterSpacing: '0.04em',
              }}
            >
              CONSTRUCT:
            </div>

            <button
              type="button"
              className="btn-solarpunk"
              onClick={() => startPlacement('helio-pump')}
              style={{ padding: '7px 14px', fontSize: '12px' }}
            >
              <Sun size={15} color="#ecc94b" /> Build Helio Irrigation Station (100 G)
            </button>

            <button
              type="button"
              className="btn-solarpunk"
              onClick={() => startPlacement('verdant-glasshouse')}
              style={{ padding: '7px 14px', fontSize: '12px' }}
            >
              <Cpu size={15} color="#48bb78" /> Build Verdant Glasshouse (150 G)
            </button>

            <button
              type="button"
              className="btn-solarpunk"
              onClick={() => startPlacement('helio-relay')}
              style={{ padding: '7px 14px', fontSize: '12px' }}
            >
              <Radio size={15} color="#63b3ed" /> Build Helio Relay Station (200 G)
            </button>

            <div style={{ width: '1px', height: '24px', background: 'rgba(214,158,46,0.3)' }} />

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '11px',
                color: '#9ae6b4',
              }}
            >
              <span>🖱️ Drag to Pan</span>
              <span>•</span>
              <span>🔍 Scroll to Zoom</span>
              <span>•</span>
              <span>🌱 Click Soil to Plant</span>
              <span>•</span>
              <span>🌾 Click Mature Crop to Harvest</span>
            </div>
          </div>
        </>
      )}

      {/* Helios OS Desktop Modal View */}
      {pcOpen && <HeliosDesktop />}

      {/* Building Inspection Modal (accessible by clicking building on farm) */}
      {!pcOpen && <BuildingInspectModal />}

      {/* Incident Details Modal with Progressive Hints */}
      <IncidentDetailsModal />

      {/* First-Time Player Onboarding & Guide Modal */}
      <OnboardingModal />

      {/* Game Complete Victory Modal */}
      <GameCompleteModal />

      {/* Concept Discovery Toast */}
      <ConceptDiscoveryToast />

      {/* Toast notification message */}
      {toastMessage && (
        <div
          className="glass-panel"
          style={{
            position: 'absolute',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '8px 18px',
            background: 'rgba(10, 24, 18, 0.95)',
            border: '1px solid #48bb78',
            color: '#f0fff4',
            fontSize: '13px',
            fontWeight: 700,
            borderRadius: '20px',
            zIndex: 9999,
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Blueprint Modal */}
      {!pcOpen && activeBlueprint && (
        <BlueprintModal blueprint={activeBlueprint} onClose={closeBlueprint} />
      )}

      {/* Micro-Lesson Drawer */}
      {!pcOpen && activeMicroLesson && (
        <MicroLessonDrawer lesson={activeMicroLesson} onClose={closeMicroLesson} />
      )}

      {/* Performance & Heat Monitor */}
      <PerfOverlay />
    </div>
  );
};
