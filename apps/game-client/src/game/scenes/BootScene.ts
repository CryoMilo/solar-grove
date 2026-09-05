import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Generate procedural pixel textures so the game runs immediately with zero missing textures
    this.createGrassTile();
    this.createSoilTile();
    this.createPathTile();
    this.createPlayerTexture();
    this.createCropTextures();
    this.createBuildingTextures();
    this.createStatusBadges();
  }

  create() {
    this.scene.start('FarmScene');
  }

  private createGrassTile() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    // Base emerald green
    ctx.fillStyle = '#1c4436';
    ctx.fillRect(0, 0, 32, 32);

    // Subtle grass texture
    ctx.fillStyle = '#235946';
    for (let i = 0; i < 16; i++) {
      const x = (i * 7) % 30;
      const y = (i * 11) % 30;
      ctx.fillRect(x, y, 2, 2);
    }
    ctx.fillStyle = '#2f755c';
    ctx.fillRect(8, 12, 1, 3);
    ctx.fillRect(22, 6, 1, 3);
    ctx.fillRect(14, 24, 1, 3);

    // Grid border
    ctx.strokeStyle = 'rgba(15, 34, 27, 0.4)';
    ctx.strokeRect(0, 0, 32, 32);

    this.textures.addCanvas('tile_grass', canvas);
  }

  private createSoilTile() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#3d2817';
    ctx.fillRect(0, 0, 32, 32);

    // Furrows
    ctx.fillStyle = '#2b1a0d';
    ctx.fillRect(0, 4, 32, 4);
    ctx.fillRect(0, 14, 32, 4);
    ctx.fillRect(0, 24, 32, 4);

    ctx.fillStyle = '#4d331e';
    ctx.fillRect(4, 10, 2, 2);
    ctx.fillRect(18, 20, 2, 2);

    this.textures.addCanvas('tile_soil', canvas);
  }

  private createPathTile() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#4a5568';
    ctx.fillRect(0, 0, 32, 32);

    // Solar conductive inlay
    ctx.fillStyle = '#319795';
    ctx.fillRect(14, 0, 4, 32);

    ctx.fillStyle = '#4fd1c5';
    ctx.fillRect(15, 4, 2, 24);

    this.textures.addCanvas('tile_path', canvas);
  }

  private createPlayerTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    // Solar Straw Hat (wide brim)
    ctx.fillStyle = '#ecc94b';
    ctx.fillRect(8, 4, 16, 4);
    ctx.fillRect(10, 2, 12, 3);

    // Head / Face
    ctx.fillStyle = '#fbd38d';
    ctx.fillRect(11, 8, 10, 8);

    // Eyes
    ctx.fillStyle = '#1a202c';
    ctx.fillRect(13, 11, 2, 2);
    ctx.fillRect(17, 11, 2, 2);

    // Overalls (solarpunk teal)
    ctx.fillStyle = '#2c7a7b';
    ctx.fillRect(9, 16, 14, 10);

    // Shirt sleeves (amber)
    ctx.fillStyle = '#dd6b20';
    ctx.fillRect(7, 17, 2, 6);
    ctx.fillRect(23, 17, 2, 6);

    // Boots
    ctx.fillStyle = '#744210';
    ctx.fillRect(10, 26, 4, 6);
    ctx.fillRect(18, 26, 4, 6);

    this.textures.addCanvas('player', canvas);
  }

  private createCropTextures() {
    // 1. Seed
    const cSeed = document.createElement('canvas');
    cSeed.width = 32;
    cSeed.height = 32;
    const ctxSeed = cSeed.getContext('2d')!;
    ctxSeed.fillStyle = '#d69e2e';
    ctxSeed.fillRect(14, 20, 4, 4);
    this.textures.addCanvas('crop_sunroot_seed', cSeed);

    // 2. Sprout
    const cSprout = document.createElement('canvas');
    cSprout.width = 32;
    cSprout.height = 32;
    const ctxSprout = cSprout.getContext('2d')!;
    ctxSprout.fillStyle = '#48bb78';
    ctxSprout.fillRect(15, 16, 2, 8);
    ctxSprout.fillRect(12, 14, 4, 3);
    ctxSprout.fillRect(16, 13, 4, 3);
    this.textures.addCanvas('crop_sunroot_sprout', cSprout);

    // 3. Growing
    const cGrowing = document.createElement('canvas');
    cGrowing.width = 32;
    cGrowing.height = 32;
    const ctxGrowing = cGrowing.getContext('2d')!;
    ctxGrowing.fillStyle = '#38a169';
    ctxGrowing.fillRect(14, 10, 4, 14);
    ctxGrowing.fillRect(8, 8, 7, 4);
    ctxGrowing.fillRect(17, 7, 8, 4);
    ctxGrowing.fillStyle = '#ecc94b';
    ctxGrowing.fillRect(13, 20, 6, 6);
    this.textures.addCanvas('crop_sunroot_growing', cGrowing);

    // 4. Mature (Golden Radiant)
    const cMature = document.createElement('canvas');
    cMature.width = 32;
    cMature.height = 32;
    const ctxMature = cMature.getContext('2d')!;
    // Golden root
    ctxMature.fillStyle = '#ecc94b';
    ctxMature.fillRect(11, 16, 10, 10);
    ctxMature.fillStyle = '#f6e05e';
    ctxMature.fillRect(13, 18, 6, 6);
    // Solar leaves
    ctxMature.fillStyle = '#48bb78';
    ctxMature.fillRect(6, 6, 9, 6);
    ctxMature.fillRect(17, 5, 10, 6);
    ctxMature.fillRect(14, 4, 4, 8);
    // Sparkle
    ctxMature.fillStyle = '#ffffff';
    ctxMature.fillRect(10, 8, 2, 2);
    ctxMature.fillRect(20, 7, 2, 2);
    this.textures.addCanvas('crop_sunroot_mature', cMature);
  }

  private createBuildingTextures() {
    // Helio Pump (64x64)
    const cPump = document.createElement('canvas');
    cPump.width = 64;
    cPump.height = 64;
    const ctxPump = cPump.getContext('2d')!;

    // Base concrete pad
    ctxPump.fillStyle = '#2d3748';
    ctxPump.fillRect(4, 36, 56, 24);

    // Solar PV Panel top
    ctxPump.fillStyle = '#2b6cb0';
    ctxPump.fillRect(10, 8, 44, 16);
    ctxPump.strokeStyle = '#63b3ed';
    ctxPump.lineWidth = 1;
    ctxPump.strokeRect(10, 8, 44, 16);
    ctxPump.beginPath();
    ctxPump.moveTo(25, 8);
    ctxPump.lineTo(25, 24);
    ctxPump.moveTo(40, 8);
    ctxPump.lineTo(40, 24);
    ctxPump.stroke();

    // Pump mechanism / impeller housing
    ctxPump.fillStyle = '#319795';
    ctxPump.fillRect(18, 26, 28, 24);
    ctxPump.fillStyle = '#4fd1c5';
    ctxPump.beginPath();
    ctxPump.arc(32, 38, 8, 0, Math.PI * 2);
    ctxPump.fill();

    // Water pipe outlet
    ctxPump.fillStyle = '#4299e1';
    ctxPump.fillRect(46, 42, 14, 6);

    this.textures.addCanvas('building_helio_pump', cPump);

    // Verdant Glasshouse (64x64)
    const cGh = document.createElement('canvas');
    cGh.width = 64;
    cGh.height = 64;
    const ctxGh = cGh.getContext('2d')!;

    // Foundation
    ctxGh.fillStyle = '#1a202c';
    ctxGh.fillRect(4, 44, 56, 16);

    // Glass walls
    ctxGh.fillStyle = 'rgba(79, 209, 197, 0.45)';
    ctxGh.fillRect(8, 18, 48, 30);

    // Triangular glass roof
    ctxGh.beginPath();
    ctxGh.moveTo(32, 4);
    ctxGh.lineTo(8, 18);
    ctxGh.lineTo(56, 18);
    ctxGh.closePath();
    ctxGh.fillStyle = 'rgba(79, 209, 197, 0.6)';
    ctxGh.fill();

    // Steel framework lines
    ctxGh.strokeStyle = '#ecc94b';
    ctxGh.lineWidth = 2;
    ctxGh.strokeRect(8, 18, 48, 30);
    ctxGh.beginPath();
    ctxGh.moveTo(32, 4);
    ctxGh.lineTo(8, 18);
    ctxGh.moveTo(32, 4);
    ctxGh.lineTo(56, 18);
    ctxGh.moveTo(32, 4);
    ctxGh.lineTo(32, 48);
    ctxGh.stroke();

    // Plant silhouettes inside
    ctxGh.fillStyle = '#2f855a';
    ctxGh.fillRect(16, 28, 8, 16);
    ctxGh.fillRect(38, 26, 10, 18);

    this.textures.addCanvas('building_verdant_glasshouse', cGh);
  }

  private createStatusBadges() {
    // Healthy (Green badge)
    const cOk = document.createElement('canvas');
    cOk.width = 16;
    cOk.height = 16;
    const ctxOk = cOk.getContext('2d')!;
    ctxOk.fillStyle = '#38a169';
    ctxOk.beginPath();
    ctxOk.arc(8, 8, 6, 0, Math.PI * 2);
    ctxOk.fill();
    ctxOk.fillStyle = '#ffffff';
    ctxOk.fillRect(5, 7, 6, 2);
    ctxOk.fillRect(7, 5, 2, 6);
    this.textures.addCanvas('status_healthy', cOk);

    // Offline / Degraded (Amber/Red badge)
    const cErr = document.createElement('canvas');
    cErr.width = 16;
    cErr.height = 16;
    const ctxErr = cErr.getContext('2d')!;
    ctxErr.fillStyle = '#e53e3e';
    ctxErr.beginPath();
    ctxErr.arc(8, 8, 6, 0, Math.PI * 2);
    ctxErr.fill();
    ctxErr.fillStyle = '#ffffff';
    ctxErr.fillRect(7, 4, 2, 5);
    ctxErr.fillRect(7, 11, 2, 2);
    this.textures.addCanvas('status_offline', cErr);
  }
}
