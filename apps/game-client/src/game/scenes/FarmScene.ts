import { BUILDINGS } from '@solar-grove/content';
import type { BuildingInstance, BuildingType, CropInstance } from '@solar-grove/game-types';
import Phaser from 'phaser';
import { useGameStore } from '../../stores/useGameStore';

export class FarmScene extends Phaser.Scene {
  private gridWidth = 40;
  private gridHeight = 40;
  private tileWidth = 64;
  private tileHeight = 32;
  private originX = 20 * 64;
  private originY = 120;

  // Camera drag state
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private camStartX = 0;
  private camStartY = 0;
  private dragDistance = 0;

  // Visual Entity Maps
  private tileSprites: Map<string, Phaser.GameObjects.Image> = new Map();
  private cropSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private buildingObjects: Map<
    string,
    {
      sprite: Phaser.GameObjects.Sprite;
      badge: Phaser.GameObjects.Sprite;
      alarmBeacon?: Phaser.GameObjects.Sprite;
      gx: number;
      gy: number;
    }
  > = new Map();

  // Placement mode & hover visuals
  private hoverCursor!: Phaser.GameObjects.Image;
  private ghostBuildingSprite!: Phaser.GameObjects.Sprite;
  private waterParticles: Phaser.GameObjects.Arc[] = [];

  constructor() {
    super('FarmScene');
  }

  create() {
    // 0. Panoramic Solarpunk Grove Backdrop (Blends farm into living ecosystem)
    const centerPos = this.gridToIso(20, 20);
    const bg = this.add.image(centerPos.x, centerPos.y, 'solarpunk_bg');
    bg.setOrigin(0.5, 0.5);
    bg.setDisplaySize(4200, 2400);
    bg.setDepth(-1000);
    bg.setAlpha(0.85);

    // 1. Build 3D Isometric Farm Grid
    this.createIsometricGrid();

    // 2. Center Camera initially over the Grove
    this.cameras.main.centerOn(centerPos.x, centerPos.y);
    this.cameras.main.setZoom(1.15);

    // 3. Hover & Placement Cursors
    this.hoverCursor = this.add.image(0, 0, 'iso_cursor_valid');
    this.hoverCursor.setOrigin(0.5, 0.5);
    this.hoverCursor.setDepth(9999);
    this.hoverCursor.setVisible(false);

    this.ghostBuildingSprite = this.add.sprite(0, 0, 'iso_building_helio_pump');
    this.ghostBuildingSprite.setOrigin(0.5, 0.75);
    this.ghostBuildingSprite.setDepth(10000);
    this.ghostBuildingSprite.setAlpha(0.6);
    this.ghostBuildingSprite.setVisible(false);

    // 4. Mouse Input Handling (Smurf Village Pan & Zoom)
    this.setupCameraControls();

    // 5. Hook Zustand store updates
    useGameStore.subscribe((state) => {
      this.syncCrops(state.farmState.crops);
      this.syncBuildings(state.buildings);
      this.updatePlacementGhost(state.placementMode.active, state.placementMode.buildingType);
    });

    // Initial sync
    const initialState = useGameStore.getState();
    this.syncCrops(initialState.farmState.crops);
    this.syncBuildings(initialState.buildings);

    // Periodic water spray effect for running irrigation pumps
    this.time.addEvent({
      delay: 400,
      callback: () => this.emitIrrigationParticles(),
      loop: true,
    });
  }

  update() {
    // Keep hover cursor aligned with pointer
    const pointer = this.input.activePointer;
    const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const { x: gx, y: gy } = this.isoToGrid(worldPoint.x, worldPoint.y);

    const store = useGameStore.getState();
    const isPlacement = store.placementMode.active;

    if (gx >= 0 && gx < this.gridWidth && gy >= 0 && gy < this.gridHeight) {
      const isoPos = this.gridToIso(gx, gy);
      this.hoverCursor.setPosition(isoPos.x, isoPos.y);
      this.hoverCursor.setVisible(true);

      const isOccupied = store.buildings.some(
        (b) => gx >= b.x && gx <= b.x + 1 && gy >= b.y && gy <= b.y + 1
      );

      if (isPlacement) {
        this.hoverCursor.setTexture(isOccupied ? 'iso_cursor_invalid' : 'iso_cursor_valid');
        this.ghostBuildingSprite.setPosition(isoPos.x, isoPos.y);
        this.ghostBuildingSprite.setVisible(true);
      } else {
        this.hoverCursor.setTexture('iso_cursor_valid');
        this.ghostBuildingSprite.setVisible(false);
      }
    } else {
      this.hoverCursor.setVisible(false);
      this.ghostBuildingSprite.setVisible(false);
    }
  }

  /**
   * Transforms 2D grid coordinates (gx, gy) into 3D isometric screen coordinates.
   */
  public gridToIso(gx: number, gy: number): { x: number; y: number } {
    return {
      x: (gx - gy) * (this.tileWidth / 2) + this.originX,
      y: (gx + gy) * (this.tileHeight / 2) + this.originY,
    };
  }

  /**
   * Transforms screen/world coordinates into 2D grid coordinates.
   */
  public isoToGrid(worldX: number, worldY: number): { x: number; y: number } {
    const relX = worldX - this.originX;
    const relY = worldY - this.originY;
    const gx = Math.floor((relX / (this.tileWidth / 2) + relY / (this.tileHeight / 2)) / 2);
    const gy = Math.floor((relY / (this.tileHeight / 2) - relX / (this.tileWidth / 2)) / 2);
    return { x: gx, y: gy };
  }

  private createIsometricGrid() {
    for (let gy = 0; gy < this.gridHeight; gy++) {
      for (let gx = 0; gx < this.gridWidth; gx++) {
        const { x: isoX, y: isoY } = this.gridToIso(gx, gy);

        let texture = 'iso_grass';
        if (gx === 20 || gy === 20) {
          texture = 'iso_path';
        } else if (gx >= 15 && gx <= 25 && gy >= 15 && gy <= 25) {
          texture = 'iso_soil';
        }

        const tile = this.add.image(isoX, isoY, texture);
        tile.setOrigin(0.5, 0.38); // Standard isometric anchor accounting for 8px thickness
        tile.setDepth((gx + gy) * 10);
        this.tileSprites.set(`${gx},${gy}`, tile);
      }
    }
  }

  private setupCameraControls() {
    // 1. Mouse Drag-to-Pan (Smurf Village Pan)
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Right click cancels placement
      if (pointer.rightButtonDown()) {
        useGameStore.getState().cancelPlacement();
        return;
      }

      this.isDragging = true;
      this.dragStartX = pointer.x;
      this.dragStartY = pointer.y;
      this.camStartX = this.cameras.main.scrollX;
      this.camStartY = this.cameras.main.scrollY;
      this.dragDistance = 0;
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging) {
        const dx = (pointer.x - this.dragStartX) / this.cameras.main.zoom;
        const dy = (pointer.y - this.dragStartY) / this.cameras.main.zoom;
        this.cameras.main.scrollX = this.camStartX - dx;
        this.cameras.main.scrollY = this.camStartY - dy;
        this.dragDistance += Math.abs(dx) + Math.abs(dy);
      }
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      this.isDragging = false;
      // If user clicked with minimal drag, process tile click!
      if (this.dragDistance < 6) {
        const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
        const { x: gx, y: gy } = this.isoToGrid(worldPoint.x, worldPoint.y);
        this.handleTileClick(gx, gy);
      }
    });

    // 2. Mouse Wheel Zooming
    this.input.on(
      'wheel',
      (_pointer: Phaser.Input.Pointer, _gameObjects: unknown, _deltaX: number, deltaY: number) => {
        const currentZoom = this.cameras.main.zoom;
        const zoomFactor = deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Phaser.Math.Clamp(currentZoom * zoomFactor, 0.65, 2.2);
        this.cameras.main.setZoom(newZoom);
      }
    );

    // Prevent context menu on right click
    this.game.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private handleTileClick(gx: number, gy: number) {
    const store = useGameStore.getState();

    // 1. Placement Mode handling
    if (store.placementMode.active && store.placementMode.buildingType) {
      if (gx < 0 || gx >= this.gridWidth || gy < 0 || gy >= this.gridHeight) return;

      const isOccupied = store.buildings.some(
        (b) => gx >= b.x && gx <= b.x + 1 && gy >= b.y && gy <= b.y + 1
      );
      if (isOccupied) {
        this.showFloatMessage(this.gridToIso(gx, gy), 'Area Occupied!', '#e53e3e');
        return;
      }

      const res = store.constructBuilding(store.placementMode.buildingType, gx, gy);
      if (res.success) {
        this.showFloatMessage(this.gridToIso(gx, gy), 'Structure Built!', '#48bb78');
      } else {
        this.showFloatMessage(this.gridToIso(gx, gy), res.message, '#e53e3e');
      }
      return;
    }

    // 2. Check if clicked an existing building
    const clickedBuilding = store.buildings.find(
      (b) => gx >= b.x && gx <= b.x + 1 && gy >= b.y && gy <= b.y + 1
    );
    if (clickedBuilding) {
      const blueprint = BUILDINGS[clickedBuilding.type];
      if (blueprint) {
        store.openBlueprint(blueprint);
      }
      return;
    }

    // 3. Check if clicked an existing crop
    const existingCrop = store.farmState.crops.find((c) => c.x === gx && c.y === gy);
    if (existingCrop) {
      if (existingCrop.stage === 'mature') {
        const res = store.harvestCrop(existingCrop.id);
        if (res.success) {
          const isoPos = this.gridToIso(gx, gy);
          this.showFloatMessage(isoPos, `+${res.goldEarned} Gold!`, '#ecc94b');
        }
      } else {
        const isoPos = this.gridToIso(gx, gy);
        this.showFloatMessage(
          isoPos,
          `Growing (${Math.round(existingCrop.growthProgress * 100)}%)`,
          '#68d391'
        );
      }
      return;
    }

    // 4. If empty soil clicked, plant Sunroot!
    if (gx >= 15 && gx <= 25 && gy >= 15 && gy <= 25) {
      const planted = store.plantCrop('sunroot', gx, gy);
      if (planted) {
        const isoPos = this.gridToIso(gx, gy);
        this.showFloatMessage(isoPos, 'Sunroot Planted!', '#ecc94b');
      }
    }
  }

  private updatePlacementGhost(active: boolean, type: BuildingType | null) {
    if (active && type) {
      let texture = 'iso_building_helio_pump';
      if (type === 'verdant-glasshouse') texture = 'iso_building_verdant_glasshouse';
      this.ghostBuildingSprite.setTexture(texture);
      this.ghostBuildingSprite.setVisible(true);
    } else {
      this.ghostBuildingSprite.setVisible(false);
    }
  }

  private syncCrops(crops: CropInstance[]) {
    const currentCropIds = new Set(crops.map((c) => c.id));

    // Remove harvested crops
    for (const [id, sprite] of this.cropSprites.entries()) {
      if (!currentCropIds.has(id)) {
        sprite.destroy();
        this.cropSprites.delete(id);
      }
    }

    // Add or update 3D isometric crops
    for (const crop of crops) {
      let textureKey = 'iso_crop_sunroot_seed';
      if (crop.stage === 'sprout') textureKey = 'iso_crop_sunroot_sprout';
      else if (crop.stage === 'growing') textureKey = 'iso_crop_sunroot_growing';
      else if (crop.stage === 'mature') textureKey = 'iso_crop_sunroot_mature';

      const isoPos = this.gridToIso(crop.x, crop.y);
      let sprite = this.cropSprites.get(crop.id);

      if (!sprite) {
        sprite = this.add.sprite(isoPos.x, isoPos.y, textureKey);
        sprite.setOrigin(0.5, 0.7);
        sprite.setDepth((crop.x + crop.y) * 10 + 5);
        this.cropSprites.set(crop.id, sprite);
      } else {
        sprite.setTexture(textureKey);
      }
    }
  }

  private syncBuildings(buildings: BuildingInstance[]) {
    const currentBldIds = new Set(buildings.map((b) => b.id));

    for (const [id, obj] of this.buildingObjects.entries()) {
      if (!currentBldIds.has(id)) {
        obj.sprite.destroy();
        obj.badge.destroy();
        if (obj.alarmBeacon) obj.alarmBeacon.destroy();
        this.buildingObjects.delete(id);
      }
    }

    for (const b of buildings) {
      let texture = 'iso_building_helio_pump';
      if (b.type === 'verdant-glasshouse') texture = 'iso_building_verdant_glasshouse';

      const isoPos = this.gridToIso(b.x, b.y);
      let obj = this.buildingObjects.get(b.id);

      if (!obj) {
        const sprite = this.add.sprite(isoPos.x, isoPos.y, texture);
        sprite.setOrigin(0.5, 0.72);
        sprite.setDepth((b.x + b.y) * 10 + 8);

        const badgeTexture = b.status === 'healthy' ? 'status_healthy' : 'status_offline';
        const badge = this.add.sprite(isoPos.x + 20, isoPos.y - 36, badgeTexture);
        badge.setDepth((b.x + b.y) * 10 + 9);

        obj = { sprite, badge, gx: b.x, gy: b.y };
        this.buildingObjects.set(b.id, obj);
      } else {
        const badgeTexture = b.status === 'healthy' ? 'status_healthy' : 'status_offline';
        obj.badge.setTexture(badgeTexture);
      }

      // Solarpunk Flashing Alarm Beacon for Degraded or Failed status
      if (b.status === 'failed' || b.status === 'degraded') {
        if (!obj.alarmBeacon) {
          const beacon = this.add.sprite(isoPos.x, isoPos.y - 48, 'iso_alarm_beacon');
          beacon.setOrigin(0.5, 0.5);
          beacon.setDepth((b.x + b.y) * 10 + 12);
          this.tweens.add({
            targets: beacon,
            scaleX: 1.35,
            scaleY: 1.35,
            alpha: 0.5,
            yoyo: true,
            repeat: -1,
            duration: 450,
          });
          obj.alarmBeacon = beacon;
        }
      } else {
        if (obj.alarmBeacon) {
          obj.alarmBeacon.destroy();
          obj.alarmBeacon = undefined;
        }
      }
    }
  }

  private emitIrrigationParticles() {
    const store = useGameStore.getState();
    const service = store.serviceManager.getService('irrigation-controller');
    if (service?.status !== 'running') return;

    for (const b of store.buildings) {
      if (b.type === 'helio-pump' && b.status === 'healthy') {
        const isoPos = this.gridToIso(b.x, b.y);

        // Spawn a subtle sparkling water droplet
        const droplet = this.add.circle(
          isoPos.x + Phaser.Math.Between(-15, 25),
          isoPos.y - Phaser.Math.Between(10, 25),
          2.5,
          0x63b3ed,
          0.85
        );
        droplet.setDepth((b.x + b.y) * 10 + 9);

        this.tweens.add({
          targets: droplet,
          x: droplet.x + Phaser.Math.Between(-20, 20),
          y: droplet.y + Phaser.Math.Between(10, 20),
          alpha: 0,
          scale: 0.2,
          duration: 700,
          ease: 'Cubic.easeOut',
          onComplete: () => droplet.destroy(),
        });
      }
    }
  }

  private showFloatMessage(pos: { x: number; y: number }, message: string, color: string) {
    const floatText = this.add.text(pos.x, pos.y - 20, message, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '15px',
      color: color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    });
    floatText.setOrigin(0.5, 0.5);
    floatText.setDepth(100000);

    this.tweens.add({
      targets: floatText,
      y: pos.y - 48,
      alpha: 0,
      duration: 1100,
      ease: 'Power1',
      onComplete: () => floatText.destroy(),
    });
  }
}
