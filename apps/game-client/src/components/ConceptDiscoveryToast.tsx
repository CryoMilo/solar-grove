import { BookOpen, ChevronRight, Lightbulb, Sparkles } from 'lucide-react';
import type React from 'react';
import { useGameStore } from '../stores/useGameStore';

export const ConceptDiscoveryToast: React.FC = () => {
  const activeConcept = useGameStore((s) => s.activeConcept);
  const dismissConcept = useGameStore((s) => s.dismissConcept);

  if (!activeConcept) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '80px',
        right: '24px',
        zIndex: 1000,
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        maxWidth: '380px',
      }}
    >
      <div
        className="glass-panel frame-solarpunk"
        style={{
          padding: '18px 20px',
          backgroundColor: 'rgba(10, 26, 20, 0.98)',
          border: '1.5px solid #ecc94b',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.8), 0 0 20px rgba(236, 201, 75, 0.25)',
          borderRadius: '8px',
          position: 'relative',
        }}
      >
        <div className="rivet rivet-tl" />
        <div className="rivet rivet-tr" />
        <div className="rivet rivet-bl" />
        <div className="rivet rivet-br" />

        {/* Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: 'rgba(236, 201, 75, 0.2)',
              border: '1px solid #ecc94b',
            }}
          >
            <Sparkles size={14} color="#ecc94b" />
          </div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: '#ecc94b',
            }}
          >
            CONCEPT DISCOVERED
          </span>
        </div>

        {/* Concept Name */}
        <h3
          style={{
            fontSize: '16px',
            fontWeight: 800,
            color: '#f0fff4',
            margin: '0 0 6px 0',
            letterSpacing: '0.04em',
          }}
        >
          {activeConcept.conceptName}
        </h3>

        {/* Summary */}
        <p
          style={{
            fontSize: '12px',
            color: '#cbd5e0',
            lineHeight: 1.5,
            margin: '0 0 8px 0',
          }}
        >
          {activeConcept.summary}
        </p>

        {/* Context Details */}
        <div
          style={{
            fontSize: '11px',
            color: '#9ae6b4',
            backgroundColor: 'rgba(20, 48, 36, 0.6)',
            borderLeft: '2px solid #48bb78',
            padding: '6px 10px',
            marginBottom: '14px',
            borderRadius: '0 4px 4px 0',
          }}
        >
          {activeConcept.details}
        </div>

        {/* Continue Action */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn-solarpunk btn-gold"
            onClick={dismissConcept}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            Continue <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
