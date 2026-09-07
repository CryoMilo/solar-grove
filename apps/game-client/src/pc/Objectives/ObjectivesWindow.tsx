import { BUILDINGS } from '@solar-grove/content';
import type { ProgressionObjective } from '@solar-grove/game-types';
import {
  Award,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock,
  Coins,
  Cpu,
  Droplets,
  Filter,
  Globe,
  Layers,
  Lock,
  Sparkles,
  Sun,
  Target,
  Terminal,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useGameStore } from '../../stores/useGameStore';

export const ObjectivesWindow: React.FC = () => {
  const objectives = useGameStore((s) => s.objectives);
  const openBlueprint = useGameStore((s) => s.openBlueprint);
  const setActiveWindow = useGameStore((s) => s.setActiveWindow);
  const [filter, setFilter] = useState<'all' | 'active' | 'p1' | 'p2' | 'p3' | 'p4' | 'p5'>('active');

  const getPhaseForIndex = (index: number): string => {
    if (index <= 3) return 'p1';
    if (index <= 8) return 'p2';
    if (index <= 14) return 'p3';
    if (index <= 20) return 'p4';
    return 'p5';
  };

  const filteredObjectives = objectives.filter((obj) => {
    if (filter === 'all') return true;
    if (filter === 'active') return !obj.completed;
    return getPhaseForIndex(obj.index) === filter;
  });

  const activeObjective = objectives.find((o) => !o.completed) || objectives[objectives.length - 1];
  const completedCount = objectives.filter((o) => o.completed).length;

  const getWhyExplanation = (obj: ProgressionObjective): string => {
    if (obj.index === 1) return 'Provides foundational treasury capital to procure physical machinery.';
    if (obj.index === 2) return 'Increases biomass coverage across the terraced soil plots.';
    if (obj.index === 3) return 'Converts mature crops into immediate market liquidity.';
    if (obj.index === 4) return 'Physical pump rig required to draw from the deep groundwater aquifer.';
    if (obj.index === 5) return 'Software daemon required to command pneumatic pump valves on port 8080.';
    if (obj.index === 6) return 'Automated hydration accelerates crop growth speed by +40%.';
    if (obj.index === 7) return 'Scales capital reserves to purchase advanced climate regulation hardware.';
    if (obj.index === 8) return 'Restores halted irrigation by diagnosing system errors in the Terminal.';
    if (obj.index === 9) return 'Enclosed structure to regulate humidity and ambient temperature.';
    if (obj.index === 10) return 'Fetches immutable, reproducible OCI container images for app and database.';
    if (obj.index === 11) return 'Launches containerized controller and PostgreSQL database on isolated bridge network.';
    if (obj.index === 12) return 'Investigating authentication errors reveals incorrect environment variables.';
    if (obj.index === 13) return 'Valid database connection allows controller to reach HEALTHY status.';
    if (obj.index === 14) return 'Connected telemetry enables accelerated photosynthesis (+50% crop growth speed).';
    if (obj.index === 15) return 'Physical edge array required for public external ingress and telemetry routing.';
    if (obj.index === 16) return 'Nginx edge proxy routes external domain requests to internal upstream containers.';
    if (obj.index === 17) return 'Domain Name System resolves human-friendly hostnames to IP addresses.';
    if (obj.index === 18) return 'Fixes 502 Bad Gateway by pointing reverse proxy upstream to valid container port.';
    if (obj.index === 19) return 'Cryptographic TLS handshake encrypts traffic and eliminates browser security warnings.';
    if (obj.index === 20) return 'Exposes irrigation telemetry through secure unified edge gateway.';
    if (obj.index >= 21 && obj.index <= 30) return 'Migrates local server to high-availability cloud compute and managed database.';
    if (obj.index === 31) return 'Archives agricultural time-series records to durable object storage buckets.';
    return 'Ensures the farm runs autonomously on production cloud infrastructure with maximum crop boosts.';
  };

  const getKnowledgeUnlocked = (obj: ProgressionObjective): string[] => {
    if (obj.index <= 3) return ['Crop Cultivation', 'Soil Hydration', 'Farm Economics'];
    if (obj.index <= 8) return ['Linux Services', 'Systemd Daemons', 'TCP Ports', 'Process Triage'];
    if (obj.index <= 14) return ['Docker Images', 'Container Compose', 'PostgreSQL', 'Health Checks'];
    if (obj.index <= 20) return ['Reverse Proxy', 'DNS Records', 'TLS / HTTPS', 'Upstream Routing'];
    return ['Cloud VPC', 'Private Subnets', 'EC2 / Compute Engine', 'Managed RDS', 'Object Storage'];
  };

  return (
    <div style={{ padding: '20px', height: '100%', overflowY: 'auto', boxSizing: 'border-box' }}>
      {/* Header & Progress Stats */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          borderBottom: '1px solid rgba(72, 187, 120, 0.25)',
          paddingBottom: '14px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={20} color="#ecc94b" />
            <h2 style={{ fontSize: '18px', color: '#f0fff4', margin: 0 }}>FARM PROGRESSION MISSIONS</h2>
          </div>
          <p style={{ fontSize: '12px', color: '#a0aec0', marginTop: '4px' }}>
            Complete architectural milestones to scale farm hydration, photosynthesis, and automation.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: 'rgba(0,0,0,0.35)',
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(214, 158, 46, 0.3)',
          }}
        >
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: '#cbd5e0' }}>PROGRESSION</div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#ecc94b' }}>
              {completedCount} / {objectives.length} Goals
            </div>
          </div>
          <div
            style={{
              width: '80px',
              height: '8px',
              borderRadius: '4px',
              background: 'rgba(255,255,255,0.1)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${(completedCount / objectives.length) * 100}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #ecc94b, #48bb78)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Phase Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          marginBottom: '18px',
          overflowX: 'auto',
          paddingBottom: '4px',
        }}
      >
        {[
          { id: 'active', label: 'Active Mission' },
          { id: 'all', label: 'All (32)' },
          { id: 'p1', label: 'Phase 1: Soil' },
          { id: 'p2', label: 'Phase 2: Linux' },
          { id: 'p3', label: 'Phase 3: Docker' },
          { id: 'p4', label: 'Phase 4: Relay' },
          { id: 'p5', label: 'Phase 5: Cloud' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id as typeof filter)}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: filter === tab.id ? 'rgba(214, 158, 46, 0.25)' : 'rgba(0,0,0,0.25)',
              color: filter === tab.id ? '#ecc94b' : '#cbd5e0',
              boxShadow: filter === tab.id ? 'inset 0 0 0 1px rgba(214, 158, 46, 0.5)' : 'none',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Objectives Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredObjectives.map((obj) => {
          const isCompleted = obj.completed;
          const unlockedBlueprint = obj.unlocksBlueprintId
            ? BUILDINGS[obj.unlocksBlueprintId]
            : null;
          const whyText = getWhyExplanation(obj);
          const knowledgeList = getKnowledgeUnlocked(obj);

          return (
            <div
              key={obj.id}
              className="glass-panel"
              style={{
                padding: '18px',
                background: isCompleted ? 'rgba(15, 34, 27, 0.4)' : 'rgba(20, 45, 37, 0.65)',
                border: isCompleted
                  ? '1px solid rgba(72, 187, 120, 0.35)'
                  : '1px solid rgba(236, 201, 75, 0.35)',
                boxShadow: isCompleted ? 'none' : '0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              {/* Top Row: Status & Title & Reward */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {isCompleted ? (
                    <CheckCircle2 size={24} color="#48bb78" />
                  ) : (
                    <Circle size={24} color="#ecc94b" />
                  )}
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#f0fff4' }}>
                      {obj.title}{' '}
                      <span style={{ color: '#ecc94b', fontSize: '13px', fontWeight: 600 }}>
                        — {obj.solarpunkTitle}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#e2e8f0', marginTop: '2px' }}>
                      {obj.description}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(0,0,0,0.35)',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(214, 158, 46, 0.25)',
                  }}
                >
                  <Coins size={16} color="#ecc94b" />
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#ecc94b' }}>
                    +{obj.rewardGold} G
                  </span>
                </div>
              </div>

              {/* Middle Row: Why It Matters to the Farm */}
              <div
                style={{
                  margin: '10px 0',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: 'rgba(0,0,0,0.2)',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <strong style={{ color: '#9ae6b4' }}>Why:</strong>
                <span style={{ color: '#cbd5e0' }}>{whyText}</span>
              </div>

              {/* Requirements Checklist */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {obj.requirements.map((req, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      color: req.satisfied ? '#9ae6b4' : '#e2e8f0',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      background: req.satisfied ? 'rgba(72, 187, 120, 0.1)' : 'rgba(0,0,0,0.25)',
                      border: req.satisfied ? '1px solid rgba(72, 187, 120, 0.2)' : 'none',
                    }}
                  >
                    <span>{req.description}</span>
                    <span style={{ fontWeight: 700, color: req.satisfied ? '#48bb78' : '#ecc94b' }}>
                      {req.current} / {req.target} {req.satisfied ? '✓' : ''}
                    </span>
                  </div>
                ))}
              </div>

              {/* Knowledge Unlocked Badges */}
              <div
                style={{
                  marginTop: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', color: '#a0aec0' }}>Knowledge:</span>
                  {knowledgeList.map((k, kIdx) => (
                    <span
                      key={kIdx}
                      style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: 'rgba(66, 153, 225, 0.15)',
                        border: '1px solid rgba(66, 153, 225, 0.3)',
                        color: '#90cdf4',
                      }}
                    >
                      {k}
                    </span>
                  ))}
                </div>

                {/* Blueprint unlock shortcut if present */}
                {unlockedBlueprint && (
                  <button
                    type="button"
                    className="btn-solarpunk"
                    style={{ padding: '4px 10px', fontSize: '11px' }}
                    onClick={() => openBlueprint(unlockedBlueprint)}
                  >
                    <Sparkles size={12} color="#ecc94b" /> Inspect {unlockedBlueprint.solarpunkName}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
