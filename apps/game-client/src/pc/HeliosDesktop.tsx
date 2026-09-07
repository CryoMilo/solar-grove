import {
  Activity,
  BookOpen,
  Cloud,
  Coins,
  Droplets,
  Globe,
  HardDrive,
  Layers,
  Monitor,
  Sparkles,
  Sun,
  Terminal,
  X,
  Zap,
} from 'lucide-react';
import type React from 'react';
import { useEffect } from 'react';
import type { HeliosWindowId } from '../stores/useGameStore';
import { useGameStore } from '../stores/useGameStore';
import { BlueprintModal } from './BlueprintModal/BlueprintModal';
import { BrowserWindow } from './Browser/BrowserWindow';
import { CertificateManagerWindow } from './CertificateManager/CertificateManagerWindow';
import { CloudConsoleWindow } from './CloudConsole/CloudConsoleWindow';
import { KnowledgeMapWindow } from './KnowledgeMap/KnowledgeMapWindow';
import { MicroLessonDrawer } from './MicroLesson/MicroLessonDrawer';
import { NetworkConsoleWindow } from './NetworkConsole/NetworkConsoleWindow';
import { ObjectivesWindow } from './Objectives/ObjectivesWindow';
import { ObservatoryWindow } from './Observatory/ObservatoryWindow';
import { SoftwareCatalogWindow } from './SoftwareCatalog/SoftwareCatalogWindow';
import { TerminalWindow } from './Terminal/TerminalWindow';

export const HeliosDesktop: React.FC = () => {
  const activeWindow = useGameStore((s) => s.activeWindow);
  const setActiveWindow = useGameStore((s) => s.setActiveWindow);
  const togglePc = useGameStore((s) => s.togglePc);
  const activeBlueprint = useGameStore((s) => s.activeBlueprint);
  const closeBlueprint = useGameStore((s) => s.closeBlueprint);
  const activeMicroLesson = useGameStore((s) => s.activeMicroLesson);
  const closeMicroLesson = useGameStore((s) => s.closeMicroLesson);
  const activeIncidents = useGameStore((s) => s.activeIncidents);

  const farmState = useGameStore((s) => s.farmState);

  const navItems: { id: HeliosWindowId; label: string; icon: React.ReactNode }[] = [
    { id: 'observatory', label: 'Observatory', icon: <Activity size={16} /> },
    { id: 'software', label: 'Software Catalog', icon: <Layers size={16} /> },
    { id: 'network', label: 'Network', icon: <Globe size={16} /> },
    { id: 'certs', label: 'Certificates', icon: <Zap size={16} /> },
    { id: 'browser', label: 'Browser', icon: <Droplets size={16} /> },
    { id: 'terminal', label: 'Terminal', icon: <Terminal size={16} /> },
    { id: 'cloud', label: 'Cloud Manager', icon: <Cloud size={16} /> },
    { id: 'objectives', label: 'Objectives', icon: <Sparkles size={16} /> },
    { id: 'knowledge', label: 'Knowledge Map', icon: <BookOpen size={16} /> },
  ];

  return (
    <div
      className="scanlines"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#0c1a15',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
      }}
    >
      {/* Top Solarpunk Taskbar */}
      <div
        style={{
          height: '52px',
          backgroundColor: '#07100d',
          borderBottom: '1px solid rgba(72, 187, 120, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          boxSizing: 'border-box',
        }}
      >
        {/* Brand & Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#ecc94b',
              fontWeight: 800,
              fontSize: '15px',
            }}
          >
            <Sun size={20} color="#ecc94b" />
            <span>HELIOS OS</span>
            <span
              style={{
                fontSize: '10px',
                color: '#68d391',
                background: 'rgba(56, 161, 105, 0.2)',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
            >
              SOLAR GROVE v1.0
            </span>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {navItems.map((item) => {
              const isActive = activeWindow === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveWindow(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    background: isActive ? 'rgba(56, 161, 105, 0.3)' : 'transparent',
                    color: isActive ? '#f0fff4' : '#a0aec0',
                    boxShadow: isActive ? 'inset 0 0 0 1px rgba(72, 187, 120, 0.5)' : 'none',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                  }}
                >
                  {item.icon}
                  {item.label}
                  {item.id === 'terminal' && activeIncidents.length > 0 && (
                    <span
                      style={{
                        backgroundColor: '#e53e3e',
                        color: '#fff',
                        fontSize: '10px',
                        padding: '1px 5px',
                        borderRadius: '999px',
                        fontWeight: 800,
                        animation: 'pulse 1.2s infinite',
                      }}
                    >
                      {activeIncidents.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Telemetry & Exit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          {/* Farm metrics */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '13px' }}>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                color: '#ecc94b',
                fontWeight: 700,
              }}
            >
              <Coins size={15} /> {farmState.gold} G
            </span>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                color: '#38b2ac',
                fontWeight: 600,
              }}
            >
              <Zap size={15} /> {farmState.power} kWh
            </span>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                color: '#4299e1',
                fontWeight: 600,
              }}
            >
              <Droplets size={15} /> {farmState.water} L
            </span>
          </div>

          {/* Toggle back to Farm View */}
          <button
            className="btn-solarpunk btn-gold"
            onClick={() => togglePc(false)}
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            🌾 Pixel Farm View (TAB)
          </button>
        </div>
      </div>

      {/* Active Incident Warning Ribbon */}
      {activeIncidents.length > 0 && (
        <div
          style={{
            backgroundColor: '#4a1515',
            borderBottom: '1px solid #e53e3e',
            color: '#fed7d7',
            padding: '7px 20px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 999,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#fc8181', fontWeight: 800 }}>⚠️ INCIDENT ACTIVE:</span>
            <span>
              {activeIncidents[0].title} — {activeIncidents[0].description}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              className="btn-solarpunk"
              onClick={() => useGameStore.getState().setActiveIncidentModal(activeIncidents[0])}
              style={{
                padding: '3px 12px',
                fontSize: '11px',
                background: 'linear-gradient(135deg, #c53030, #9b2c2c)',
                color: '#fff',
                borderColor: '#feb2b2',
                fontWeight: 700,
              }}
            >
              Investigate Incident
            </button>
          </div>
        </div>
      )}

      {/* Main Window Workspace */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {activeWindow === 'observatory' && <ObservatoryWindow />}
        {activeWindow === 'software' && <SoftwareCatalogWindow />}
        {activeWindow === 'network' && <NetworkConsoleWindow />}
        {activeWindow === 'certs' && <CertificateManagerWindow />}
        {activeWindow === 'browser' && <BrowserWindow />}
        {activeWindow === 'terminal' && <TerminalWindow />}
        {activeWindow === 'cloud' && <CloudConsoleWindow />}
        {activeWindow === 'objectives' && <ObjectivesWindow />}
        {activeWindow === 'knowledge' && <KnowledgeMapWindow />}
      </div>

      {/* Active Blueprint Modal */}
      {activeBlueprint && <BlueprintModal blueprint={activeBlueprint} onClose={closeBlueprint} />}

      {/* Active Micro-Lesson Drawer */}
      {activeMicroLesson && (
        <MicroLessonDrawer lesson={activeMicroLesson} onClose={closeMicroLesson} />
      )}
    </div>
  );
};
