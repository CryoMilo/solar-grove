import { MICRO_LESSONS } from '@solar-grove/content';
import type { BuildingBlueprint, CompetencyId, KnowledgeStatus } from '@solar-grove/game-types';
import {
  BookOpen,
  CheckCircle,
  ChevronRight,
  Cpu,
  ExternalLink,
  HardDrive,
  Terminal,
  X,
  Zap,
} from 'lucide-react';
import type React from 'react';
import { useGameStore } from '../../stores/useGameStore';

interface BlueprintModalProps {
  blueprint: BuildingBlueprint;
  onClose: () => void;
}

export const BlueprintModal: React.FC<BlueprintModalProps> = ({ blueprint, onClose }) => {
  const knowledgeMap = useGameStore((s) => s.knowledgeMap);
  const openMicroLesson = useGameStore((s) => s.openMicroLesson);
  const startPlacement = useGameStore((s) => s.startPlacement);
  const setActiveWindow = useGameStore((s) => s.setActiveWindow);
  const togglePc = useGameStore((s) => s.togglePc);
  const gold = useGameStore((s) => s.farmState.gold);

  const getStatusBadge = (comp: CompetencyId) => {
    const k = knowledgeMap[comp];
    const status: KnowledgeStatus = k?.status || 'not-learned';

    switch (status) {
      case 'learned':
        return {
          icon: <CheckCircle size={16} color="#48bb78" />,
          label: 'Mastered',
          color: '#48bb78',
          bg: 'rgba(72, 187, 120, 0.15)',
        };
      case 'not-mastered':
        return {
          icon: <BookOpen size={16} color="#ecc94b" />,
          label: 'In Progress',
          color: '#ecc94b',
          bg: 'rgba(236, 201, 75, 0.15)',
        };
      case 'not-learned':
      default:
        return {
          icon: <HardDrive size={16} color="#fc8181" />,
          label: 'Not Learned',
          color: '#fc8181',
          bg: 'rgba(229, 62, 62, 0.15)',
        };
    }
  };

  const handleRequirementClick = (comp: CompetencyId) => {
    const lesson = MICRO_LESSONS[comp];
    if (lesson) {
      openMicroLesson(lesson);
    }
  };

  const handleBuild = () => {
    startPlacement(blueprint.id);
    onClose();
  };

  const handleOpenTerminal = () => {
    togglePc(true);
    setActiveWindow('terminal');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
      }}
    >
      <div
        className="glass-panel glass-panel-glow"
        style={{
          width: '560px',
          maxWidth: '90%',
          backgroundColor: '#0e1f18',
          padding: '24px',
          borderRadius: '16px',
          color: '#f0fff4',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'none',
            border: 'none',
            color: '#a0aec0',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{ fontSize: '12px', color: '#ecc94b', fontWeight: 600, letterSpacing: '0.05em' }}
          >
            INFRASTRUCTURE BLUEPRINT
          </div>
          <h2 style={{ fontSize: '24px', margin: '4px 0 2px 0' }}>{blueprint.solarpunkName}</h2>
          <div
            style={{ fontSize: '13px', color: '#38b2ac', fontFamily: 'JetBrains Mono, monospace' }}
          >
            Architecture: {blueprint.actualTechnology}
          </div>
        </div>

        <p style={{ fontSize: '14px', color: '#cbd5e0', lineHeight: 1.5, marginBottom: '20px' }}>
          {blueprint.description}
        </p>

        {/* Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '12px',
            marginBottom: '24px',
            padding: '12px',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '10px',
            border: '1px solid rgba(72,187,120,0.2)',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: '#a0aec0' }}>Cost</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#ecc94b' }}>
              {blueprint.constructionCost} Gold
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#a0aec0' }}>Energy Draw</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#38b2ac' }}>
              {blueprint.powerConsumption} kW
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#a0aec0' }}>Output Bonus</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#48bb78' }}>
              {blueprint.productionModifier
                ? `+${Math.round((blueprint.productionModifier - 1) * 100)}%`
                : 'Water +5L'}
            </div>
          </div>
        </div>

        {/* Competencies Requirements (Learning Loop) */}
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#9ae6b4',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>Technical Deployment Prerequisites</span>
            <span style={{ fontSize: '11px', color: '#a0aec0' }}>Click concept to learn</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {blueprint.requiredCompetencies.map((comp) => {
              const badge = getStatusBadge(comp);
              const lesson = MICRO_LESSONS[comp];
              return (
                <div
                  key={comp}
                  onClick={() => handleRequirementClick(comp)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(15, 34, 27, 0.6)',
                    border: '1px solid rgba(72, 187, 120, 0.2)',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(28, 68, 54, 0.7)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(15, 34, 27, 0.6)')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {badge.icon}
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#f0fff4' }}>
                        {lesson ? lesson.title : comp}
                      </div>
                      <div style={{ fontSize: '11px', color: '#a0aec0' }}>
                        {lesson?.summary || comp}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: badge.bg,
                        color: badge.color,
                        fontWeight: 600,
                      }}
                    >
                      {badge.label}
                    </span>
                    <ChevronRight size={14} color="#718096" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            className="btn-solarpunk"
            onClick={handleOpenTerminal}
            style={{
              background: 'transparent',
              borderColor: 'rgba(72, 187, 120, 0.4)',
            }}
          >
            <Terminal size={16} /> Open Terminal
          </button>

          <button
            className="btn-solarpunk btn-gold"
            onClick={handleBuild}
            disabled={gold < blueprint.constructionCost}
            style={{
              opacity: gold < blueprint.constructionCost ? 0.5 : 1,
              cursor: gold < blueprint.constructionCost ? 'not-allowed' : 'pointer',
            }}
          >
            <Cpu size={16} /> Build Structure ({blueprint.constructionCost} G)
          </button>
        </div>
      </div>
    </div>
  );
};
