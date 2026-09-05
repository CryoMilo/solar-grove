import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Generate 3D 64-bit pixel isometric textures (Smurf's Village bird's-eye style)
    this.createIsometricGrassTile();
    this.createIsometricSoilTile();
    this.createIsometricPathTile();
    this.createIsometricCropTextures();
    this.createIsometricBuildingTextures();
    this.createIsometricCursors();
    this.createStatusBadges();
  }

  create() {
    this.scene.start('FarmScene');
  }

  /**
   * Helper to draw standard 2:1 isometric diamond top face with 3D height extrusion.
   * Diamond top: (32, 0) -> (64, 16) -> (32, 32) -> (0, 16)
   * Left side: (0, 16) -> (32, 32) -> (32, 32 + height) -> (0, 16 + height)
   * Right side: (32, 32) -> (64, 16) -> (64, 16 + height) -> (32, 32 + height)
   */
  private drawIsometricBlock(
    ctx: CanvasRenderingContext2D,
    topColor: string,
    leftColor: string,
    rightColor: string,
    height = 8
  ) {
    // Left side facet (shadowed)
    ctx.fillStyle = leftColor;
    ctx.beginPath();
    ctx.moveTo(0, 16);
    ctx.lineTo(32, 32);
    ctx.lineTo(32, 32 + height);
    ctx.lineTo(0, 16 + height);
    ctx.closePath();
    ctx.fill();

    // Right side facet (medium shadow)
    ctx.fillStyle = rightColor;
    ctx.beginPath();
    ctx.moveTo(32, 32);
    ctx.lineTo(64, 16);
    ctx.lineTo(64, 16 + height);
    ctx.lineTo(32, 32 + height);
    ctx.closePath();
    ctx.fill();

    // Top diamond face
    ctx.fillStyle = topColor;
    ctx.beginPath();
    ctx.moveTo(32, 0);
    ctx.lineTo(64, 16);
    ctx.lineTo(32, 32);
    ctx.lineTo(0, 16);
    ctx.closePath();
    ctx.fill();
  }

  private createIsometricGrassTile() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 42;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.drawIsometricBlock(ctx, '#2f855a', '#1c4532', '#22543d', 8);

    // Pixel grass textures & subtle solarpunk details
    ctx.fillStyle = '#38a169';
    // Grass tufts inside diamond
    ctx.fillRect(28, 12, 2, 4);
    ctx.fillRect(36, 14, 2, 3);
    ctx.fillRect(20, 18, 3, 2);
    ctx.fillRect(44, 18, 2, 3);
    ctx.fillRect(32, 22, 2, 3);

    // Subtle highlighted flowers / clover
    ctx.fillStyle = '#ecc94b';
    ctx.fillRect(24, 10, 2, 2);
    ctx.fillRect(40, 24, 2, 2);

    // Top rim highlight for crisp 3D pop
    ctx.strokeStyle = 'rgba(154, 230, 180, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(32, 0);
    ctx.lineTo(64, 16);
    ctx.lineTo(32, 32);
    ctx.lineTo(0, 16);
    ctx.closePath();
    ctx.stroke();

    this.textures.addCanvas('iso_grass', canvas);
  }

  private createIsometricSoilTile() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 42;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dark fertile humus with extruded soil layers
    this.drawIsometricBlock(ctx, '#3d2817', '#24170d', '#2c1c10', 8);

    // 3D Furrows across isometric orientation
    ctx.strokeStyle = '#28180c';
    ctx.lineWidth = 2;
    // Row 1
    ctx.beginPath();
    ctx.moveTo(16, 8);
    ctx.lineTo(48, 24);
    ctx.stroke();
    // Row 2
    ctx.beginPath();
    ctx.moveTo(24, 4);
    ctx.lineTo(56, 20);
    ctx.stroke();
    // Row 3
    ctx.beginPath();
    ctx.moveTo(8, 12);
    ctx.lineTo(40, 28);
    ctx.stroke();

    // Soil moisture flecks
    ctx.fillStyle = '#543820';
    ctx.fillRect(30, 14, 2, 2);
    ctx.fillRect(42, 10, 2, 2);
    ctx.fillRect(22, 20, 2, 2);

    this.textures.addCanvas('iso_soil', canvas);
  }

  private createIsometricPathTile() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 42;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Slate stone block
    this.drawIsometricBlock(ctx, '#4a5568', '#2d3748', '#374151', 8);

    // Flagstone cracks
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(32, 0);
    ctx.lineTo(32, 32);
    ctx.moveTo(16, 8);
    ctx.lineTo(48, 24);
    ctx.stroke();

    // Embedded glowing cyan energy strip
    ctx.strokeStyle = '#38b2ac';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(16, 24);
    ctx.lineTo(48, 8);
    ctx.stroke();

    ctx.strokeStyle = '#81e6d9';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(18, 23);
    ctx.lineTo(46, 9);
    ctx.stroke();

    this.textures.addCanvas('iso_path', canvas);
  }

  private createIsometricCropTextures() {
    // 1. Seed
    const cSeed = document.createElement('canvas');
    cSeed.width = 64;
    cSeed.height = 48;
    const ctxSeed = cSeed.getContext('2d');
    if (ctxSeed) {
      ctxSeed.fillStyle = '#ecc94b';
      ctxSeed.beginPath();
      ctxSeed.arc(32, 20, 3, 0, Math.PI * 2);
      ctxSeed.fill();
      ctxSeed.fillStyle = '#744210';
      ctxSeed.fillRect(30, 22, 4, 2);
      this.textures.addCanvas('iso_crop_sunroot_seed', cSeed);
    }

    // 2. Sprout (3D dual leaves rising)
    const cSprout = document.createElement('canvas');
    cSprout.width = 64;
    cSprout.height = 48;
    const ctxSprout = cSprout.getContext('2d');
    if (ctxSprout) {
      // Stalk
      ctxSprout.fillStyle = '#276749';
      ctxSprout.fillRect(31, 14, 2, 10);
      // Left leaf
      ctxSprout.fillStyle = '#48bb78';
      ctxSprout.beginPath();
      ctxSprout.ellipse(27, 13, 5, 3, -Math.PI / 4, 0, Math.PI * 2);
      ctxSprout.fill();
      // Right leaf
      ctxSprout.beginPath();
      ctxSprout.ellipse(37, 13, 5, 3, Math.PI / 4, 0, Math.PI * 2);
      ctxSprout.fill();
      this.textures.addCanvas('iso_crop_sunroot_sprout', cSprout);
    }

    // 3. Growing (Bushy foliage & swelling golden root)
    const cGrowing = document.createElement('canvas');
    cGrowing.width = 64;
    cGrowing.height = 54;
    const ctxGrowing = cGrowing.getContext('2d');
    if (ctxGrowing) {
      // Golden root bulb
      ctxGrowing.fillStyle = '#d69e2e';
      ctxGrowing.beginPath();
      ctxGrowing.arc(32, 24, 6, 0, Math.PI * 2);
      ctxGrowing.fill();
      // Lush leaves
      ctxGrowing.fillStyle = '#38a169';
      ctxGrowing.beginPath();
      ctxGrowing.ellipse(24, 16, 8, 5, -0.6, 0, Math.PI * 2);
      ctxGrowing.fill();
      ctxGrowing.beginPath();
      ctxGrowing.ellipse(40, 16, 8, 5, 0.6, 0, Math.PI * 2);
      ctxGrowing.fill();
      ctxGrowing.fillStyle = '#48bb78';
      ctxGrowing.beginPath();
      ctxGrowing.ellipse(32, 10, 6, 8, 0, 0, Math.PI * 2);
      ctxGrowing.fill();
      this.textures.addCanvas('iso_crop_sunroot_growing', cGrowing);
    }

    // 4. Mature (Tall Radiant Golden Sunroot with Solar Energy Aura)
    const cMature = document.createElement('canvas');
    cMature.width = 64;
    cMature.height = 64;
    const ctxMature = cMature.getContext('2d');
    if (ctxMature) {
      // Ground shadow
      ctxMature.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctxMature.beginPath();
      ctxMature.ellipse(32, 38, 16, 8, 0, 0, Math.PI * 2);
      ctxMature.fill();

      // Golden Sunroot body
      ctxMature.fillStyle = '#d69e2e';
      ctxMature.beginPath();
      ctxMature.arc(32, 26, 10, 0, Math.PI * 2);
      ctxMature.fill();

      ctxMature.fillStyle = '#ecc94b';
      ctxMature.beginPath();
      ctxMature.arc(32, 24, 8, 0, Math.PI * 2);
      ctxMature.fill();

      // Highlight glint
      ctxMature.fillStyle = '#fffaf0';
      ctxMature.fillRect(30, 20, 3, 3);

      // Solar leaves
      ctxMature.fillStyle = '#38a169';
      ctxMature.beginPath();
      ctxMature.ellipse(20, 16, 10, 6, -0.7, 0, Math.PI * 2);
      ctxMature.fill();
      ctxMature.beginPath();
      ctxMature.ellipse(44, 16, 10, 6, 0.7, 0, Math.PI * 2);
      ctxMature.fill();
      ctxMature.fillStyle = '#48bb78';
      ctxMature.beginPath();
      ctxMature.ellipse(32, 8, 7, 10, 0, 0, Math.PI * 2);
      ctxMature.fill();

      // Glowing solar energy sparkles
      ctxMature.fillStyle = '#ffffff';
      ctxMature.fillRect(20, 6, 2, 2);
      ctxMature.fillRect(44, 8, 2, 2);
      ctxMature.fillRect(32, 2, 2, 2);

      this.textures.addCanvas('iso_crop_sunroot_mature', cMature);
    }
  }

  private createIsometricBuildingTextures() {
    // 1. Helio Pump (64×80 canvas) — 3D Smurf Village style pump
    const cPump = document.createElement('canvas');
    cPump.width = 64;
    cPump.height = 80;
    const ctxPump = cPump.getContext('2d');
    if (ctxPump) {
      // Ground Shadow
      ctxPump.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctxPump.beginPath();
      ctxPump.ellipse(32, 54, 28, 14, 0, 0, Math.PI * 2);
      ctxPump.fill();

      // Stone & Bronze Foundation
      ctxPump.fillStyle = '#2d3748';
      ctxPump.fillRect(16, 44, 32, 14);
      ctxPump.fillStyle = '#4a5568';
      ctxPump.fillRect(14, 42, 36, 4);

      // Cylindrical Cistern
      ctxPump.fillStyle = '#2c7a7b';
      ctxPump.fillRect(20, 26, 24, 18);
      // Water level window (glass tube)
      ctxPump.fillStyle = '#319795';
      ctxPump.fillRect(28, 28, 8, 14);
      ctxPump.fillStyle = '#63b3ed';
      ctxPump.fillRect(29, 32, 6, 8);

      // Brass Piston & Gear arm
      ctxPump.fillStyle = '#d69e2e';
      ctxPump.fillRect(12, 32, 8, 16);
      ctxPump.fillStyle = '#b7791f';
      ctxPump.beginPath();
      ctxPump.arc(16, 32, 5, 0, Math.PI * 2);
      ctxPump.fill();

      // Water Pipe leading forward
      ctxPump.fillStyle = '#4299e1';
      ctxPump.fillRect(40, 40, 18, 6);
      ctxPump.fillStyle = '#63b3ed';
      ctxPump.fillRect(52, 44, 6, 8);

      // Angled Photovoltaic Solar Panel Top
      ctxPump.fillStyle = '#1a365d';
      ctxPump.beginPath();
      ctxPump.moveTo(32, 4);
      ctxPump.lineTo(58, 16);
      ctxPump.lineTo(32, 24);
      ctxPump.lineTo(6, 12);
      ctxPump.closePath();
      ctxPump.fill();

      ctxPump.strokeStyle = '#63b3ed';
      ctxPump.lineWidth = 1;
      ctxPump.stroke();

      // Solar grid cell divisions
      ctxPump.beginPath();
      ctxPump.moveTo(32, 4);
      ctxPump.lineTo(32, 24);
      ctxPump.moveTo(19, 8);
      ctxPump.lineTo(45, 20);
      ctxPump.stroke();

      // Solar specular glint
      ctxPump.fillStyle = '#ffffff';
      ctxPump.fillRect(30, 8, 3, 2);

      this.textures.addCanvas('iso_building_helio_pump', cPump);
    }

    // 2. Verdant Glasshouse (96×100 canvas) — 3D Botanical Conservatory
    const cGh = document.createElement('canvas');
    cGh.width = 96;
    cGh.height = 100;
    const ctxGh = cGh.getContext('2d');
    if (ctxGh) {
      // Ground Shadow
      ctxGh.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctxGh.beginPath();
      ctxGh.ellipse(48, 70, 44, 20, 0, 0, Math.PI * 2);
      ctxGh.fill();

      // Earthen Brick Base
      ctxGh.fillStyle = '#744210';
      ctxGh.fillRect(18, 54, 60, 18);
      ctxGh.fillStyle = '#975a16';
      ctxGh.fillRect(16, 52, 64, 4);

      // Translucent Glass Conservatory Walls
      ctxGh.fillStyle = 'rgba(79, 209, 197, 0.35)';
      ctxGh.fillRect(20, 24, 56, 30);

      // Visible glowing greenhouse plants inside
      ctxGh.fillStyle = '#2f855a';
      ctxGh.beginPath();
      ctxGh.ellipse(32, 42, 8, 12, -0.3, 0, Math.PI * 2);
      ctxGh.fill();
      ctxGh.fillStyle = '#38a169';
      ctxGh.beginPath();
      ctxGh.ellipse(60, 40, 10, 14, 0.3, 0, Math.PI * 2);
      ctxGh.fill();
      ctxGh.fillStyle = '#ecc94b';
      ctxGh.fillRect(46, 36, 4, 8);

      // Triangular 3D Glass Prism Roof
      ctxGh.fillStyle = 'rgba(129, 230, 217, 0.5)';
      ctxGh.beginPath();
      ctxGh.moveTo(48, 6);
      ctxGh.lineTo(76, 24);
      ctxGh.lineTo(48, 34);
      ctxGh.lineTo(20, 24);
      ctxGh.closePath();
      ctxGh.fill();

      // Bronze/Brass Architecture Framework
      ctxGh.strokeStyle = '#ecc94b';
      ctxGh.lineWidth = 2;
      ctxGh.beginPath();
      // Corner pillars
      ctxGh.moveTo(20, 24);
      ctxGh.lineTo(20, 54);
      ctxGh.moveTo(76, 24);
      ctxGh.lineTo(76, 54);
      ctxGh.moveTo(48, 34);
      ctxGh.lineTo(48, 54);
      // Roof ribs
      ctxGh.moveTo(48, 6);
      ctxGh.lineTo(20, 24);
      ctxGh.moveTo(48, 6);
      ctxGh.lineTo(76, 24);
      ctxGh.moveTo(48, 6);
      ctxGh.lineTo(48, 34);
      ctxGh.stroke();

      // Rooftop Aeration Cupola
      ctxGh.fillStyle = '#d69e2e';
      ctxGh.fillRect(44, 2, 8, 6);
      ctxGh.fillStyle = '#f6ad55';
      ctxGh.beginPath();
      ctxGh.arc(48, 2, 4, 0, Math.PI * 2);
      ctxGh.fill();

      this.textures.addCanvas('iso_building_verdant_glasshouse', cGh);
    }
  }

  private createIsometricCursors() {
    // 1. Valid Isometric Placement Cursor (64×32 diamond)
    const cValid = document.createElement('canvas');
    cValid.width = 64;
    cValid.height = 32;
    const ctxValid = cValid.getContext('2d');
    if (ctxValid) {
      ctxValid.fillStyle = 'rgba(72, 187, 120, 0.4)';
      ctxValid.beginPath();
      ctxValid.moveTo(32, 0);
      ctxValid.lineTo(64, 16);
      ctxValid.lineTo(32, 32);
      ctxValid.lineTo(0, 16);
      ctxValid.closePath();
      ctxValid.fill();

      ctxValid.strokeStyle = '#48bb78';
      ctxValid.lineWidth = 2;
      ctxValid.stroke();
      this.textures.addCanvas('iso_cursor_valid', cValid);
    }

    // 2. Invalid Isometric Placement Cursor
    const cInvalid = document.createElement('canvas');
    cInvalid.width = 64;
    cInvalid.height = 32;
    const ctxInvalid = cInvalid.getContext('2d');
    if (ctxInvalid) {
      ctxInvalid.fillStyle = 'rgba(229, 62, 62, 0.45)';
      ctxInvalid.beginPath();
      ctxInvalid.moveTo(32, 0);
      ctxInvalid.lineTo(64, 16);
      ctxInvalid.lineTo(32, 32);
      ctxInvalid.lineTo(0, 16);
      ctxInvalid.closePath();
      ctxInvalid.fill();

      ctxInvalid.strokeStyle = '#e53e3e';
      ctxInvalid.lineWidth = 2;
      ctxInvalid.stroke();
      this.textures.addCanvas('iso_cursor_invalid', cInvalid);
    }

    // 3. Water Particle Droplet (4x4)
    const cDrop = document.createElement('canvas');
    cDrop.width = 6;
    cDrop.height = 6;
    const ctxDrop = cDrop.getContext('2d');
    if (ctxDrop) {
      ctxDrop.fillStyle = '#63b3ed';
      ctxDrop.beginPath();
      ctxDrop.arc(3, 3, 2.5, 0, Math.PI * 2);
      ctxDrop.fill();
      this.textures.addCanvas('particle_water', cDrop);
    }
  }

  private createStatusBadges() {
    // Healthy (Green badge)
    const cOk = document.createElement('canvas');
    cOk.width = 20;
    cOk.height = 20;
    const ctxOk = cOk.getContext('2d');
    if (ctxOk) {
      ctxOk.fillStyle = '#38a169';
      ctxOk.beginPath();
      ctxOk.arc(10, 10, 8, 0, Math.PI * 2);
      ctxOk.fill();
      ctxOk.strokeStyle = '#ffffff';
      ctxOk.lineWidth = 1.5;
      ctxOk.stroke();
      ctxOk.fillStyle = '#ffffff';
      ctxOk.fillRect(6, 9, 8, 2);
      ctxOk.fillRect(9, 6, 2, 8);
      this.textures.addCanvas('status_healthy', cOk);
    }

    // Offline / Degraded (Red badge)
    const cErr = document.createElement('canvas');
    cErr.width = 20;
    cErr.height = 20;
    const ctxErr = cErr.getContext('2d');
    if (ctxErr) {
      ctxErr.fillStyle = '#e53e3e';
      ctxErr.beginPath();
      ctxErr.arc(10, 10, 8, 0, Math.PI * 2);
      ctxErr.fill();
      ctxErr.strokeStyle = '#ffffff';
      ctxErr.lineWidth = 1.5;
      ctxErr.stroke();
      ctxErr.fillStyle = '#ffffff';
      ctxErr.fillRect(9, 5, 2, 6);
      ctxErr.fillRect(9, 13, 2, 2);
      this.textures.addCanvas('status_offline', cErr);
    }
  }
}
