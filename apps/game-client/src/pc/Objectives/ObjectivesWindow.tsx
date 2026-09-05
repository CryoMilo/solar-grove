import { BUILDINGS } from '@solar-grove/content';
import { Award, CheckCircle2, ChevronRight, Circle, Coins, Lock, Sparkles } from 'lucide-react';
import type React from 'react';
import { useGameStore } from '../../stores/useGameStore';

export const ObjectivesWindow: React.FC = () => {
  const objectives = useGameStore((s) => s.objectives);
  const openBlueprint = useGameStore((s) => s.openBlueprint);

  return (
    <div style={{ padding: '20px', height: '100%', overflowY: 'auto', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', color: '#f0fff4', margin: 0 }}>FARM PROGRESSION GOALS</h2>
        <p style={{ fontSize: '13px', color: '#a0aec0', marginTop: '4px' }}>
          Milestones unlock infrastructure blueprints and grant gold treasury rewards.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {objectives.map((obj) => {
          const isCompleted = obj.completed;
          const unlockedBlueprint = obj.unlocksBlueprintId
            ? BUILDINGS[obj.unlocksBlueprintId]
            : null;

          return (
            <div
              key={obj.id}
              className="glass-panel"
              style={{
                padding: '18px',
                background: isCompleted ? 'rgba(15, 34, 27, 0.4)' : 'rgba(20, 45, 37, 0.65)',
                border: isCompleted
                  ? '1px solid rgba(72, 187, 120, 0.3)'
                  : '1px solid rgba(236, 201, 75, 0.3)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {isCompleted ? (
                    <CheckCircle2 size={22} color="#48bb78" />
                  ) : (
                    <Circle size={22} color="#ecc94b" />
                  )}
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#f0fff4' }}>
                      {obj.title}{' '}
                      <span style={{ color: '#ecc94b', fontSize: '13px' }}>
                        ({obj.solarpunkTitle})
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#cbd5e0', marginTop: '2px' }}>
                      {obj.description}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(0,0,0,0.3)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                  }}
                >
                  <Coins size={16} color="#ecc94b" />
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#ecc94b' }}>
                    +{obj.rewardGold} G
                  </span>
                </div>
              </div>

              {/* Requirements Checklist */}
              <div
                style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}
              >
                {obj.requirements.map((req, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      color: req.satisfied ? '#9ae6b4' : '#e2e8f0',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      background: 'rgba(0,0,0,0.2)',
                    }}
                  >
                    <span>{req.description}</span>
                    <span style={{ fontWeight: 600, color: req.satisfied ? '#48bb78' : '#ecc94b' }}>
                      {req.current} / {req.target} {req.satisfied ? '✓' : ''}
                    </span>
                  </div>
                ))}
              </div>

              {/* Unlocks badge */}
              {unlockedBlueprint && (
                <div
                  style={{
                    marginTop: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(56, 161, 105, 0.15)',
                    border: '1px solid rgba(72, 187, 120, 0.25)',
                    fontSize: '12px',
                  }}
                >
                  <span
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9ae6b4' }}
                  >
                    <Sparkles size={14} color="#ecc94b" /> Unlocks Blueprint:{' '}
                    <strong>{unlockedBlueprint.solarpunkName}</strong>
                  </span>

                  <button
                    className="btn-solarpunk"
                    style={{ padding: '4px 10px', fontSize: '11px' }}
                    onClick={() => openBlueprint(unlockedBlueprint)}
                  >
                    Inspect Blueprint <ChevronRight size={12} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
