import {
  BookOpen,
  ChevronRight,
  Coins,
  Cpu,
  Droplets,
  Globe,
  Layers,
  Monitor,
  Move,
  Sparkles,
  Sun,
  Terminal,
  X,
  Zap,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useGameStore } from '../stores/useGameStore';

export const OnboardingModal: React.FC = () => {
  const open = useGameStore((s) => s.onboardingModalOpen);
  const setOpen = useGameStore((s) => s.setOnboardingModalOpen);
  const [currentStep, setCurrentStep] = useState(0);

  if (!open) return null;

  const steps = [
    {
      title: 'Welcome to Solar Grove',
      subtitle: 'Solarpunk Farming & Infrastructure Simulation',
      icon: <Sun size={32} color="#ecc94b" />,
      content: (
        <div>
          <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#e2e8f0', marginBottom: '14px' }}>
            You are the caretaker of an ancient solarpunk grove. Your mission is to restore the farm
            and expand its agricultural yield by mastering and operating its digital infrastructure.
          </p>
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: 'rgba(214, 158, 46, 0.15)',
              border: '1px solid rgba(214, 158, 46, 0.35)',
              color: '#fefcbf',
              fontSize: '13px',
              fontStyle: 'italic',
            }}
          >
            "Every machine on the farm needs software to function. As your farm scales, you will
            progress from basic Linux services to Docker containers, edge networking, and production cloud systems."
          </div>
        </div>
      ),
    },
    {
      title: '1. Farming Basics',
      subtitle: 'Sow, Grow, and Harvest for Gold',
      icon: <Droplets size={32} color="#4fd1c5" />,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '6px' }}>
            <span style={{ fontSize: '20px' }}>🌱</span>
            <div>
              <strong style={{ color: '#9ae6b4' }}>Sow Seeds:</strong> Click any empty brown soil plot on the farm to plant Sunroot crops.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '6px' }}>
            <span style={{ fontSize: '20px' }}>☀️</span>
            <div>
              <strong style={{ color: '#fbd38d' }}>Hydration & Sunlight:</strong> Crops absorb water and sunlight over time, transitioning from sprout to mature.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '6px' }}>
            <span style={{ fontSize: '20px' }}>🌾</span>
            <div>
              <strong style={{ color: '#ecc94b' }}>Harvest for Gold:</strong> Click mature golden crops to sell them immediately for Gold coins.
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '2. The Infrastructure Loop',
      subtitle: 'Why Software Matters to Agriculture',
      icon: <Cpu size={32} color="#48bb78" />,
      content: (
        <div style={{ fontSize: '13px', lineHeight: '1.5', color: '#e2e8f0' }}>
          <p style={{ marginBottom: '12px' }}>
            Manual farming alone won't scale. Constructing machines unlocks physical capabilities, but they begin <strong style={{ color: '#fc8181' }}>OFFLINE</strong> until software is running.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px' }}>
              <div style={{ fontWeight: 700, color: '#ecc94b' }}>💧 Helio Irrigation</div>
              <div style={{ fontSize: '11px', color: '#cbd5e0' }}>Boosts crop growth by +40% when controller process runs on port 8080.</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px' }}>
              <div style={{ fontWeight: 700, color: '#48bb78' }}>🌿 Verdant Glasshouse</div>
              <div style={{ fontSize: '11px', color: '#cbd5e0' }}>Accelerates photosynthesis (+50%) using Docker containers & PostgreSQL.</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px' }}>
              <div style={{ fontWeight: 700, color: '#63b3ed' }}>📡 Helio Relay Station</div>
              <div style={{ fontSize: '11px', color: '#cbd5e0' }}>Edge reverse proxy, TLS certificates, and public DNS routing.</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px' }}>
              <div style={{ fontWeight: 700, color: '#b794f4' }}>☁️ Production Cloud</div>
              <div style={{ fontSize: '11px', color: '#cbd5e0' }}>VPCs, Subnets, EC2 Compute, Managed RDS, and S3 Storage.</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '3. Pixel PC & Controls',
      subtitle: 'Your Engineering Command Center',
      icon: <Terminal size={32} color="#68d391" />,
      content: (
        <div style={{ fontSize: '13px', color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '6px' }}>
            <strong style={{ color: '#ecc94b' }}>Press [TAB]</strong> at any time to toggle the Pixel PC (Helios OS desktop) with simulated Terminal, Browser, Cloud Console, and Objectives.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
            <div>🖱️ <strong>Drag Mouse:</strong> Pan camera</div>
            <div>🔍 <strong>Wheel Scroll:</strong> Zoom in/out</div>
            <div>⌨️ <strong>ESC Key:</strong> Cancel placement</div>
            <div>ℹ️ <strong>Click Building:</strong> Inspect & Triage</div>
          </div>
          <div style={{ color: '#9ae6b4', fontSize: '12px', marginTop: '4px' }}>
            💡 Follow the <strong>Current Goal</strong> banner in the top-right corner to progress smoothly from beginner to cloud master!
          </div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setOpen(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 12, 10, 0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
      }}
    >
      <div
        className="glass-panel frame-solarpunk"
        style={{
          width: '600px',
          maxWidth: '92vw',
          padding: '28px',
          backgroundColor: '#0a1612',
          border: '1px solid #d69e2e',
          boxShadow: '0 20px 50px rgba(0,0,0,0.85)',
          position: 'relative',
        }}
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
            borderBottom: '1px solid rgba(214, 158, 46, 0.3)',
            paddingBottom: '16px',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                background: 'rgba(214, 158, 46, 0.15)',
                border: '1px solid #d69e2e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {step.icon}
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#f0fff4', margin: 0 }}>
                {step.title}
              </h2>
              <div style={{ fontSize: '12px', color: '#ecc94b', marginTop: '3px' }}>
                {step.subtitle}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn-solarpunk"
            onClick={() => setOpen(false)}
            style={{ padding: '6px', borderRadius: '50%' }}
            title="Close Guide"
          >
            <X size={16} />
          </button>
        </div>

        {/* Step Content */}
        <div style={{ minHeight: '170px', marginBottom: '20px' }}>
          {step.content}
        </div>

        {/* Stepper Dots & Navigation */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(214, 158, 46, 0.25)',
            paddingTop: '16px',
          }}
        >
          {/* Step Indicators */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {steps.map((_, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentStep(idx)}
                style={{
                  width: idx === currentStep ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: idx === currentStep ? '#ecc94b' : 'rgba(214, 158, 46, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              />
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {currentStep > 0 && (
              <button
                type="button"
                className="btn-solarpunk"
                onClick={handlePrev}
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                Back
              </button>
            )}

            <button
              type="button"
              className="btn-solarpunk btn-gold"
              onClick={handleNext}
              style={{ padding: '8px 20px', fontSize: '13px', fontWeight: 700 }}
            >
              {currentStep < steps.length - 1 ? (
                <>Next <ChevronRight size={15} /></>
              ) : (
                'Enter Solar Grove 🌾'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
