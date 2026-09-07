import type { Incident } from '@solar-grove/game-types';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  Lightbulb,
  Search,
  Terminal,
  X,
} from 'lucide-react';
import type React from 'react';
import { useGameStore } from '../stores/useGameStore';
import { INCIDENT_GUIDES } from '../utils/incident-hints';

export const IncidentDetailsModal: React.FC = () => {
  const activeIncident = useGameStore((s) => s.activeIncidentModal);
  const setActiveIncident = useGameStore((s) => s.setActiveIncidentModal);
  const unlockedHints = useGameStore((s) => s.unlockedHints);
  const unlockNextHint = useGameStore((s) => s.unlockNextHint);
  const setActiveWindow = useGameStore((s) => s.setActiveWindow);
  const togglePc = useGameStore((s) => s.togglePc);

  if (!activeIncident) return null;

  const guide = INCIDENT_GUIDES[activeIncident.type] || {
    farmImpact: 'Infrastructure subsystem malfunction impacting farm production.',
    observedSymptom: 'Telemetry disruption or service unresponsive.',
    investigationChecklist: [
      'Is the underlying service or container running?',
      'What errors are logged in the journal or container output?',
      'Are network ports and connectivity paths open?',
    ],
    hints: [
      'Inspect service and process status in the Terminal.',
      'Check recent error logs for diagnostic traces.',
      'Review configuration and environment settings.',
      activeIncident.remediationHint || 'Restart the service or container.',
    ],
    relevantTool: 'terminal' as const,
  };

  const currentHintLevel = unlockedHints[activeIncident.id] || 0; // 0 to 4

  const handleOpenTool = () => {
    setActiveIncident(null);
    setActiveWindow(guide.relevantTool);
    togglePc(true);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 4, 4, 0.82)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2200,
      }}
      onClick={() => setActiveIncident(null)}
    >
      <div
        className="glass-panel frame-solarpunk"
        style={{
          width: '640px',
          maxWidth: '92vw',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px',
          backgroundColor: '#120808',
          border: '2px solid #e53e3e',
          boxShadow: '0 0 35px rgba(229, 62, 62, 0.4), 0 20px 45px rgba(0,0,0,0.85)',
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
            borderBottom: '1px solid rgba(229, 62, 62, 0.3)',
            paddingBottom: '14px',
            marginBottom: '18px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                background: 'rgba(229, 62, 62, 0.2)',
                border: '1px solid #e53e3e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertCircle size={24} color="#fc8181" />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#fc8181', fontWeight: 800, letterSpacing: '0.06em' }}>
                ACTIVE INFRASTRUCTURE INCIDENT
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fed7d7', margin: 0 }}>
                {activeIncident.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            className="btn-solarpunk"
            onClick={() => setActiveIncident(null)}
            style={{ padding: '6px', borderRadius: '50%' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Farm Impact & Observed Symptom */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '6px',
              background: 'rgba(197, 48, 48, 0.15)',
              border: '1px solid rgba(229, 62, 62, 0.35)',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#feb2b2', marginBottom: '2px' }}>
              FARM PRODUCTION IMPACT:
            </div>
            <div style={{ fontSize: '13px', color: '#fff5f5' }}>
              {guide.farmImpact}
            </div>
          </div>

          <div
            style={{
              padding: '12px 14px',
              borderRadius: '6px',
              background: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(214, 158, 46, 0.25)',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#ecc94b', marginBottom: '2px' }}>
              OBSERVED SYMPTOM:
            </div>
            <div style={{ fontSize: '13px', color: '#fefcbf' }}>
              {guide.observedSymptom}
            </div>
          </div>
        </div>

        {/* Investigation Checklist */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#cbd5e0', marginBottom: '8px' }}>
            INVESTIGATION CHECKLIST:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {guide.investigationChecklist.map((question, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  color: '#e2e8f0',
                  padding: '6px 10px',
                  borderRadius: '4px',
                  background: 'rgba(0,0,0,0.2)',
                }}
              >
                <Search size={14} color="#63b3ed" />
                <span>{question}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Progressive Hints */}
        <div
          style={{
            marginBottom: '20px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#ecc94b' }}>
              <Lightbulb size={16} />
              <span>PROGRESSIVE HINTS ({currentHintLevel} / 4)</span>
            </div>

            {currentHintLevel < 4 && (
              <button
                type="button"
                className="btn-solarpunk"
                onClick={() => unlockNextHint(activeIncident.id)}
                style={{
                  fontSize: '11px',
                  padding: '4px 10px',
                  background: 'rgba(236, 201, 75, 0.15)',
                  borderColor: '#ecc94b',
                  color: '#fbd38d',
                }}
              >
                Reveal Hint {currentHintLevel + 1}
              </button>
            )}
          </div>

          {currentHintLevel === 0 ? (
            <div style={{ fontSize: '12px', color: '#a0aec0', fontStyle: 'italic', padding: '6px 0' }}>
              No hints revealed yet. Try investigating with the checklist first, or click "Reveal Hint" if you get stuck!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {guide.hints.slice(0, currentHintLevel).map((hintText, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'rgba(236, 201, 75, 0.08)',
                    border: '1px solid rgba(236, 201, 75, 0.25)',
                    fontSize: '12px',
                    color: '#fefcbf',
                  }}
                >
                  <strong style={{ color: '#ecc94b', marginRight: '6px' }}>Hint {idx + 1}:</strong>
                  {hintText}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer & Triage Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(229, 62, 62, 0.3)',
            paddingTop: '16px',
          }}
        >
          <div style={{ fontSize: '11px', color: '#a0aec0' }}>
            Recommended Tool:{' '}
            <strong style={{ color: '#fed7d7', textTransform: 'capitalize' }}>
              {guide.relevantTool}
            </strong>
          </div>

          <button
            type="button"
            className="btn-solarpunk"
            onClick={handleOpenTool}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              fontSize: '13px',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #c53030, #9b2c2c)',
              borderColor: '#feb2b2',
              color: '#fff',
            }}
          >
            <Terminal size={14} /> Open {guide.relevantTool.toUpperCase()} in Pixel PC (TAB)
          </button>
        </div>
      </div>
    </div>
  );
};
