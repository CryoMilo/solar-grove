import { COMPETENCIES, MICRO_LESSONS } from '@solar-grove/content';
import type { CompetencyCategory, CompetencyId } from '@solar-grove/game-types';
import {
  Award,
  BookOpen,
  CheckCircle,
  ChevronRight,
  Cloud,
  Database,
  HardDrive,
  Network,
  Terminal,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useGameStore } from '../../stores/useGameStore';

export const KnowledgeMapWindow: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<CompetencyCategory>('linux');
  const knowledgeMap = useGameStore((s) => s.knowledgeMap);
  const openMicroLesson = useGameStore((s) => s.openMicroLesson);

  const categories: { id: CompetencyCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'linux', label: 'Linux OS', icon: <Terminal size={16} /> },
    { id: 'networking', label: 'Networking', icon: <Network size={16} /> },
    { id: 'containers', label: 'Containers & Docker', icon: <HardDrive size={16} /> },
    { id: 'databases', label: 'Databases & SQL', icon: <Database size={16} /> },
    { id: 'cloud', label: 'Cloud Infrastructure', icon: <Cloud size={16} /> },
  ];

  const filteredCompetencies = COMPETENCIES.filter((c) => c.category === selectedCategory);

  const getCategoryStats = (cat: CompetencyCategory) => {
    const list = COMPETENCIES.filter((c) => c.category === cat);
    const learnedCount = list.filter((c) => knowledgeMap[c.id]?.status === 'learned').length;
    return {
      total: list.length,
      learned: learnedCount,
      percent: Math.round((learnedCount / list.length) * 100),
    };
  };

  return (
    <div
      style={{
        padding: '20px',
        height: '100%',
        display: 'flex',
        gap: '20px',
        boxSizing: 'border-box',
      }}
    >
      {/* Category Sidebar */}
      <div style={{ width: '220px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: '#ecc94b',
            letterSpacing: '0.05em',
            marginBottom: '8px',
          }}
        >
          CAPABILITY DOMAINS
        </div>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const stats = getCategoryStats(cat.id);
          return (
            <div
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '12px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                background: isSelected ? 'rgba(56, 161, 105, 0.25)' : 'rgba(15, 34, 27, 0.5)',
                border: isSelected
                  ? '1px solid rgba(72, 187, 120, 0.6)'
                  : '1px solid rgba(72, 187, 120, 0.15)',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: '#f0fff4',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {cat.icon} {cat.label}
                </span>
                <span style={{ fontSize: '11px', color: '#ecc94b' }}>{stats.percent}%</span>
              </div>

              {/* Progress bar */}
              <div
                style={{
                  width: '100%',
                  height: '4px',
                  background: 'rgba(0,0,0,0.4)',
                  borderRadius: '2px',
                  marginTop: '8px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${stats.percent}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #38a169, #ecc94b)',
                    borderRadius: '2px',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Competencies List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: '#a0aec0',
            letterSpacing: '0.05em',
            marginBottom: '6px',
          }}
        >
          TECHNICAL CAPABILITY ROADMAP — {selectedCategory.toUpperCase()}
        </div>

        {filteredCompetencies.map((comp) => {
          const k = knowledgeMap[comp.id];
          const isLearned = k?.status === 'learned';
          const lesson = MICRO_LESSONS[comp.id];

          return (
            <div
              key={comp.id}
              onClick={() => lesson && openMicroLesson(lesson)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: '10px',
                background: 'rgba(15, 34, 27, 0.6)',
                border: isLearned
                  ? '1px solid rgba(72, 187, 120, 0.4)'
                  : '1px solid rgba(72, 187, 120, 0.15)',
                cursor: lesson ? 'pointer' : 'default',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(24, 55, 44, 0.7)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(15, 34, 27, 0.6)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {isLearned ? (
                  <CheckCircle size={20} color="#48bb78" />
                ) : (
                  <BookOpen size={20} color="#ecc94b" />
                )}
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#f0fff4' }}>
                    {comp.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#a0aec0', marginTop: '2px' }}>
                    {comp.description}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: isLearned ? 'rgba(72, 187, 120, 0.2)' : 'rgba(236, 201, 75, 0.2)',
                    color: isLearned ? '#68d391' : '#ecc94b',
                  }}
                >
                  {isLearned ? 'MASTERED' : 'UNLEARNED'}
                </span>
                {lesson && <ChevronRight size={16} color="#a0aec0" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
