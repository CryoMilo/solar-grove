import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // 1. Preload AI-generated panoramic Solarpunk landscape background
    this.load.image('solarpunk_bg', '/assets/solarpunk_grove_bg.jpg');

    // 2. Generate 3D 64-bit pixel isometric textures
    this.createIsometricGrassTile();
    this.createIsometricSoilTile();
    this.createIsometricPathTile();
    this.createIsometricCropTextures();
    this.createIsometricBuildingTextures();
    this.createIsometricCursors();
    this.createStatusBadges();
    this.createIncidentAlarmTextures();
  }

  create() {
    this.scene.start('FarmScene');
  }

  private drawIsometricBlock(
    ctx: CanvasRenderingContext2D,
    topColor: string,
    leftColor: string,
    rightColor: string,
    height = 8
  ) {
    // Left side facet (shadowed cliff)
    ctx.fillStyle = leftColor;
    ctx.beginPath();
    ctx.moveTo(0, 16);
    ctx.lineTo(32, 32);
    ctx.lineTo(32, 32 + height);
    ctx.lineTo(0, 16 + height);
    ctx.closePath();
    ctx.fill();

    // Right side facet (medium shadow cliff)
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

    // Lush mossy loam cliff
    this.drawIsometricBlock(ctx, '#276749', '#143324', '#1b4330', 9);

    // Fine pixel blades and meadow texture
    ctx.fillStyle = '#2f855a';
    ctx.fillRect(26, 10, 3, 5);
    ctx.fillRect(38, 12, 2, 4);
    ctx.fillRect(18, 16, 4, 3);
    ctx.fillRect(44, 18, 3, 3);
    ctx.fillRect(30, 22, 3, 4);

    // Bright spring clovers
    ctx.fillStyle = '#48bb78';
    ctx.fillRect(32, 8, 2, 2);
    ctx.fillRect(22, 14, 2, 2);
    ctx.fillRect(40, 20, 2, 2);

    // Solarpunk golden dandelion flowers
    ctx.fillStyle = '#ecc94b';
    ctx.fillRect(24, 18, 2, 2);
    ctx.fillRect(42, 12, 2, 2);

    // Soft top-edge sunlit highlight
    ctx.strokeStyle = 'rgba(154, 230, 180, 0.45)';
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

    // Dark fertile rich terracotta loam
    this.drawIsometricBlock(ctx, '#402613', '#23140a', '#2d1b0e', 9);

    // 3D Furrows across isometric orientation with moisture depth
    ctx.strokeStyle = '#271509';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(16, 8);
    ctx.lineTo(48, 24);
    ctx.moveTo(24, 4);
    ctx.lineTo(56, 20);
    ctx.moveTo(8, 12);
    ctx.lineTo(40, 28);
    ctx.stroke();

    // Raised moist ridges
    ctx.strokeStyle = '#5a381c';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(17, 7);
    ctx.lineTo(49, 23);
    ctx.moveTo(25, 3);
    ctx.lineTo(57, 19);
    ctx.stroke();

    // Humus compost flecks
    ctx.fillStyle = '#654020';
    ctx.fillRect(30, 13, 2, 2);
    ctx.fillRect(42, 9, 2, 2);
    ctx.fillRect(20, 19, 2, 2);

    this.textures.addCanvas('iso_soil', canvas);
  }

  private createIsometricPathTile() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 42;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Aged slate stone block
    this.drawIsometricBlock(ctx, '#4a5568', '#252d3a', '#323c4e', 9);

    // Cobblestone paver divisions
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(32, 0);
    ctx.lineTo(32, 32);
    ctx.moveTo(16, 8);
    ctx.lineTo(48, 24);
    ctx.stroke();

    // Moss on stone cracks
    ctx.fillStyle = '#2f855a';
    ctx.fillRect(31, 14, 2, 3);
    ctx.fillRect(20, 10, 3, 2);

    // Embedded glowing cyan energy conduit trace
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

    // 2. Sprout
    const cSprout = document.createElement('canvas');
    cSprout.width = 64;
    cSprout.height = 48;
    const ctxSprout = cSprout.getContext('2d');
    if (ctxSprout) {
      ctxSprout.fillStyle = '#276749';
      ctxSprout.fillRect(31, 14, 2, 10);
      ctxSprout.fillStyle = '#48bb78';
      ctxSprout.beginPath();
      ctxSprout.ellipse(27, 13, 5, 3, -Math.PI / 4, 0, Math.PI * 2);
      ctxSprout.fill();
      ctxSprout.beginPath();
      ctxSprout.ellipse(37, 13, 5, 3, Math.PI / 4, 0, Math.PI * 2);
      ctxSprout.fill();
      this.textures.addCanvas('iso_crop_sunroot_sprout', cSprout);
    }

    // 3. Growing
    const cGrowing = document.createElement('canvas');
    cGrowing.width = 64;
    cGrowing.height = 54;
    const ctxGrowing = cGrowing.getContext('2d');
    if (ctxGrowing) {
      ctxGrowing.fillStyle = '#d69e2e';
      ctxGrowing.beginPath();
      ctxGrowing.arc(32, 24, 6, 0, Math.PI * 2);
      ctxGrowing.fill();
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

    // 4. Mature (Tall Radiant Golden Sunroot)
    const cMature = document.createElement('canvas');
    cMature.width = 64;
    cMature.height = 64;
    const ctxMature = cMature.getContext('2d');
    if (ctxMature) {
      ctxMature.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctxMature.beginPath();
      ctxMature.ellipse(32, 38, 16, 8, 0, 0, Math.PI * 2);
      ctxMature.fill();

      ctxMature.fillStyle = '#d69e2e';
      ctxMature.beginPath();
      ctxMature.arc(32, 26, 10, 0, Math.PI * 2);
      ctxMature.fill();

      ctxMature.fillStyle = '#ecc94b';
      ctxMature.beginPath();
      ctxMature.arc(32, 24, 8, 0, Math.PI * 2);
      ctxMature.fill();

      ctxMature.fillStyle = '#fffaf0';
      ctxMature.fillRect(30, 20, 3, 3);

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

      ctxMature.fillStyle = '#ffffff';
      ctxMature.fillRect(20, 6, 2, 2);
      ctxMature.fillRect(44, 8, 2, 2);
      ctxMature.fillRect(32, 2, 2, 2);

      this.textures.addCanvas('iso_crop_sunroot_mature', cMature);
    }
  }

  private createIsometricBuildingTextures() {
    // 1. Helio Pump (64×80 canvas)
    const cPump = document.createElement('canvas');
    cPump.width = 64;
    cPump.height = 80;
    const ctxPump = cPump.getContext('2d');
    if (ctxPump) {
      ctxPump.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctxPump.beginPath();
      ctxPump.ellipse(32, 54, 28, 14, 0, 0, Math.PI * 2);
      ctxPump.fill();

      ctxPump.fillStyle = '#2d3748';
      ctxPump.fillRect(16, 44, 32, 14);
      ctxPump.fillStyle = '#4a5568';
      ctxPump.fillRect(14, 42, 36, 4);

      ctxPump.fillStyle = '#2c7a7b';
      ctxPump.fillRect(20, 26, 24, 18);
      ctxPump.fillStyle = '#319795';
      ctxPump.fillRect(28, 28, 8, 14);
      ctxPump.fillStyle = '#63b3ed';
      ctxPump.fillRect(29, 32, 6, 8);

      ctxPump.fillStyle = '#d69e2e';
      ctxPump.fillRect(12, 32, 8, 16);
      ctxPump.fillStyle = '#b7791f';
      ctxPump.beginPath();
      ctxPump.arc(16, 32, 5, 0, Math.PI * 2);
      ctxPump.fill();

      ctxPump.fillStyle = '#4299e1';
      ctxPump.fillRect(40, 40, 18, 6);
      ctxPump.fillStyle = '#63b3ed';
      ctxPump.fillRect(52, 44, 6, 8);

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

      ctxPump.beginPath();
      ctxPump.moveTo(32, 4);
      ctxPump.lineTo(32, 24);
      ctxPump.moveTo(19, 8);
      ctxPump.lineTo(45, 20);
      ctxPump.stroke();

      ctxPump.fillStyle = '#ffffff';
      ctxPump.fillRect(30, 8, 3, 2);

      this.textures.addCanvas('iso_building_helio_pump', cPump);
    }

    // 2. Verdant Glasshouse (96×100 canvas)
    const cGh = document.createElement('canvas');
    cGh.width = 96;
    cGh.height = 100;
    const ctxGh = cGh.getContext('2d');
    if (ctxGh) {
      ctxGh.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctxGh.beginPath();
      ctxGh.ellipse(48, 70, 44, 20, 0, 0, Math.PI * 2);
      ctxGh.fill();

      ctxGh.fillStyle = '#744210';
      ctxGh.fillRect(18, 54, 60, 18);
      ctxGh.fillStyle = '#975a16';
      ctxGh.fillRect(16, 52, 64, 4);

      ctxGh.fillStyle = 'rgba(79, 209, 197, 0.35)';
      ctxGh.fillRect(20, 24, 56, 30);

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

      ctxGh.fillStyle = 'rgba(129, 230, 217, 0.5)';
      ctxGh.beginPath();
      ctxGh.moveTo(48, 6);
      ctxGh.lineTo(76, 24);
      ctxGh.lineTo(48, 34);
      ctxGh.lineTo(20, 24);
      ctxGh.closePath();
      ctxGh.fill();

      ctxGh.strokeStyle = '#ecc94b';
      ctxGh.lineWidth = 2;
      ctxGh.beginPath();
      ctxGh.moveTo(20, 24);
      ctxGh.lineTo(20, 54);
      ctxGh.moveTo(76, 24);
      ctxGh.lineTo(76, 54);
      ctxGh.moveTo(48, 34);
      ctxGh.lineTo(48, 54);
      ctxGh.moveTo(48, 6);
      ctxGh.lineTo(20, 24);
      ctxGh.moveTo(48, 6);
      ctxGh.lineTo(76, 24);
      ctxGh.moveTo(48, 6);
      ctxGh.lineTo(48, 34);
      ctxGh.stroke();

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

  private createIncidentAlarmTextures() {
    // 3D Animated Flashing Siren / Alarm Beacon (28x28)
    const cAlarm = document.createElement('canvas');
    cAlarm.width = 28;
    cAlarm.height = 28;
    const ctx = cAlarm.getContext('2d');
    if (ctx) {
      // Outer warning halo
      ctx.fillStyle = 'rgba(229, 62, 62, 0.4)';
      ctx.beginPath();
      ctx.arc(14, 14, 13, 0, Math.PI * 2);
      ctx.fill();

      // Flashing red siren housing
      ctx.fillStyle = '#e53e3e';
      ctx.beginPath();
      ctx.arc(14, 14, 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#fffaf0';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Exclamation mark (!)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(13, 8, 2, 7);
      ctx.fillRect(13, 17, 2, 2.5);

      this.textures.addCanvas('iso_alarm_beacon', cAlarm);
    }
  }
}
