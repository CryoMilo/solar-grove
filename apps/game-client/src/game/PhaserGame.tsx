import Phaser from 'phaser';
import type React from 'react';
import { useEffect, useRef } from 'react';
import { useGameStore } from '../stores/useGameStore';
import { BootScene } from './scenes/BootScene';
import { FarmScene } from './scenes/FarmScene';

export let activePhaserGame: Phaser.Game | null = null;

export const PhaserGame: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const pcOpen = useGameStore((s) => s.pcOpen);

  useEffect(() => {
    if (!containerRef.current) return;

    // Destroy existing instance if container already has children
    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
    }
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: window.innerWidth,
      height: window.innerHeight,
      pixelArt: true,
      backgroundColor: '#0a1410',
      physics: {
        default: 'arcade',
      },
      fps: {
        target: 30,
        min: 20,
        forceSetTimeOut: false,
      },
      scene: [BootScene, FarmScene],
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;
    activePhaserGame = game;

    const handleResize = () => {
      if (gameRef.current) {
        gameRef.current.scale.resize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    // Tab visibility handling - pause rendering when hidden to prevent heat & CPU drain
    const handleVisibilityChange = () => {
      if (!gameRef.current) return;
      if (document.hidden) {
        gameRef.current.scene.pause('FarmScene');
      } else if (!useGameStore.getState().pcOpen) {
        gameRef.current.scene.resume('FarmScene');
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
        activePhaserGame = null;
      }
    };
  }, []);

  // Pause farm scene rendering when Pixel PC is open full-screen (PRD Section 43 & 56)
  useEffect(() => {
    if (!gameRef.current) return;
    try {
      if (pcOpen) {
        gameRef.current.scene.pause('FarmScene');
      } else {
        gameRef.current.scene.resume('FarmScene');
      }
    } catch {
      // Scene may not be initialized yet during initial boot
    }
  }, [pcOpen]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    />
  );
};
