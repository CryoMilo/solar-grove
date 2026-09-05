import type { MicroLesson } from '@solar-grove/game-types';
import { BookOpen, Clock, Play, Terminal, X, Zap } from 'lucide-react';
import type React from 'react';
import { useGameStore } from '../../stores/useGameStore';

interface MicroLessonDrawerProps {
  lesson: MicroLesson;
  onClose: () => void;
}

export const MicroLessonDrawer: React.FC<MicroLessonDrawerProps> = ({ lesson, onClose }) => {
  const togglePc = useGameStore((s) => s.togglePc);
  const setActiveWindow = useGameStore((s) => s.setActiveWindow);
  const runTerminalCommand = useGameStore((s) => s.runTerminalCommand);
  const learnCompetency = useGameStore((s) => s.learnCompetency);

  const handleRunCommand = async () => {
    learnCompetency(lesson.id);
    togglePc(true);
    setActiveWindow('terminal');
    await runTerminalCommand(lesson.suggestedCommand);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '460px',
        maxWidth: '95%',
        height: '100%',
        backgroundColor: '#0c1a15',
        borderLeft: '1px solid rgba(72, 187, 120, 0.4)',
        boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.7)',
        zIndex: 2500,
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'rgba(56, 161, 105, 0.2)',
              color: '#68d391',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {lesson.category}
          </span>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              color: '#a0aec0',
            }}
          >
            <Clock size={12} /> {lesson.readTimeSeconds}s micro-lesson
          </span>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#a0aec0',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Title */}
      <h2 style={{ fontSize: '20px', color: '#f0fff4', marginBottom: '12px' }}>{lesson.title}</h2>
      <p
        style={{
          fontSize: '14px',
          color: '#9ae6b4',
          fontWeight: 500,
          lineHeight: 1.5,
          marginBottom: '20px',
        }}
      >
        {lesson.summary}
      </p>

      {/* Explanation Box */}
      <div
        style={{
          background: 'rgba(20, 45, 37, 0.5)',
          padding: '16px',
          borderRadius: '10px',
          border: '1px solid rgba(72, 187, 120, 0.2)',
          fontSize: '13px',
          color: '#e2e8f0',
          lineHeight: 1.6,
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            fontWeight: 600,
            color: '#ecc94b',
            marginBottom: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Zap size={14} /> Core Concept
        </div>
        {lesson.explanation}
      </div>

      {/* Why Farm Needs It */}
      <div
        style={{
          background: 'rgba(236, 201, 75, 0.08)',
          padding: '14px',
          borderRadius: '10px',
          border: '1px solid rgba(236, 201, 75, 0.25)',
          fontSize: '13px',
          color: '#feebc8',
          lineHeight: 1.5,
          marginBottom: '24px',
        }}
      >
        <div style={{ fontWeight: 600, color: '#ecc94b', marginBottom: '4px' }}>
          🌾 Why Your Farm Needs This:
        </div>
        {lesson.whyFarmNeedsIt}
      </div>

      {/* Interactive Command Try-out */}
      <div style={{ marginTop: 'auto' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#a0aec0', marginBottom: '8px' }}>
          Interactive Practice Command:
        </div>

        <div
          style={{
            background: '#050a08',
            padding: '14px',
            borderRadius: '8px',
            border: '1px solid rgba(72, 187, 120, 0.3)',
            marginBottom: '14px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '14px',
            color: '#68d391',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>$ {lesson.suggestedCommand}</span>
        </div>

        <button
          className="btn-solarpunk"
          onClick={handleRunCommand}
          style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
        >
          <Terminal size={16} /> Execute in Helios Terminal
        </button>
      </div>
    </div>
  );
};
