import { BUILDINGS } from '@solar-grove/content';
import type { BuildingInstance, CropInstance } from '@solar-grove/game-types';
import Phaser from 'phaser';
import { useGameStore } from '../../stores/useGameStore';

export class FarmScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };

  private cropSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private buildingObjects: Map<
    string,
    {
      sprite: Phaser.GameObjects.Sprite;
      badge: Phaser.GameObjects.Sprite;
    }
  > = new Map();

  private gridWidth = 40;
  private gridHeight = 40;
  private tileSize = 32;

  constructor() {
    super('FarmScene');
  }

  create() {
    // 1. Build Farm Tilemap
    this.createFarmGrid();

    // 2. Spawn Player at farm center
    const startX = 20 * this.tileSize;
    const startY = 20 * this.tileSize;
    this.player = this.add.sprite(startX, startY, 'player');
    this.player.setDepth(10);

    // 3. Setup Camera & Bounds
    this.cameras.main.setBounds(
      0,
      0,
      this.gridWidth * this.tileSize,
      this.gridHeight * this.tileSize
    );
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1.5);

    // 4. Input handling
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
    }

    // 5. Farm click interaction (plant or harvest)
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      const tileX = Math.floor(worldPoint.x / this.tileSize);
      const tileY = Math.floor(worldPoint.y / this.tileSize);

      this.handleTileClick(tileX, tileY);
    });

    // 6. Hook Zustand store updates
    useGameStore.subscribe((state) => {
      this.syncCrops(state.farmState.crops);
      this.syncBuildings(state.buildings);
    });

    // Initial sync
    const state = useGameStore.getState();
    this.syncCrops(state.farmState.crops);
    this.syncBuildings(state.buildings);
  }

  update() {
    const speed = 3;
    let dx = 0;
    let dy = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) dx -= speed;
    if (this.cursors.right.isDown || this.wasd.D.isDown) dx += speed;
    if (this.cursors.up.isDown || this.wasd.W.isDown) dy -= speed;
    if (this.cursors.down.isDown || this.wasd.S.isDown) dy += speed;

    if (dx !== 0 && dy !== 0) {
      dx *= Math.SQRT1_2;
      dy *= Math.SQRT1_2;
    }

    this.player.x = Phaser.Math.Clamp(this.player.x + dx, 16, this.gridWidth * this.tileSize - 16);
    this.player.y = Phaser.Math.Clamp(this.player.y + dy, 16, this.gridHeight * this.tileSize - 16);
  }

  private createFarmGrid() {
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const posX = x * this.tileSize + 16;
        const posY = y * this.tileSize + 16;

        // Path across center
        if (x === 20 || y === 20) {
          this.add.image(posX, posY, 'tile_path').setDepth(0);
        } else if (x >= 15 && x <= 25 && y >= 15 && y <= 25) {
          // Central Soil Plots
          this.add.image(posX, posY, 'tile_soil').setDepth(0);
        } else {
          // Surrounding Solarpunk Grassland
          this.add.image(posX, posY, 'tile_grass').setDepth(0);
        }
      }
    }
  }

  private handleTileClick(tileX: number, tileY: number) {
    const state = useGameStore.getState();

    // Check if clicked an existing crop
    const existingCrop = state.farmState.crops.find((c) => c.x === tileX && c.y === tileY);
    if (existingCrop) {
      if (existingCrop.stage === 'mature') {
        const res = state.harvestCrop(existingCrop.id);
        if (res.success) {
          this.showHarvestFloatText(tileX * 32 + 16, tileY * 32, `+${res.goldEarned} Gold!`);
        }
      }
      return;
    }

    // Check if clicked a building
    const clickedBuilding = state.buildings.find(
      (b) => tileX >= b.x && tileX <= b.x + 1 && tileY >= b.y && tileY <= b.y + 1
    );
    if (clickedBuilding) {
      const blueprint = BUILDINGS[clickedBuilding.type];
      if (blueprint) {
        state.openBlueprint(blueprint);
      }
      return;
    }

    // Otherwise, plant Sunroot if clicking in soil area
    if (tileX >= 15 && tileX <= 25 && tileY >= 15 && tileY <= 25) {
      state.plantCrop('sunroot', tileX, tileY);
    }
  }

  private showHarvestFloatText(x: number, y: number, text: string) {
    const floatText = this.add.text(x, y, text, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#ecc94b',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    });
    floatText.setOrigin(0.5, 0.5);
    floatText.setDepth(20);

    this.tweens.add({
      targets: floatText,
      y: y - 28,
      alpha: 0,
      duration: 1000,
      ease: 'Power1',
      onComplete: () => floatText.destroy(),
    });
  }

  private syncCrops(crops: CropInstance[]) {
    const currentCropIds = new Set(crops.map((c) => c.id));

    // Remove obsolete sprites
    for (const [id, sprite] of this.cropSprites.entries()) {
      if (!currentCropIds.has(id)) {
        sprite.destroy();
        this.cropSprites.delete(id);
      }
    }

    // Create or update sprites
    for (const crop of crops) {
      let textureKey = 'crop_sunroot_seed';
      if (crop.stage === 'sprout') textureKey = 'crop_sunroot_sprout';
      else if (crop.stage === 'growing') textureKey = 'crop_sunroot_growing';
      else if (crop.stage === 'mature') textureKey = 'crop_sunroot_mature';

      let sprite = this.cropSprites.get(crop.id);
      if (!sprite) {
        sprite = this.add.sprite(crop.x * 32 + 16, crop.y * 32 + 16, textureKey);
        sprite.setDepth(5);
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
        this.buildingObjects.delete(id);
      }
    }

    for (const b of buildings) {
      let texture = 'building_helio_pump';
      if (b.type === 'verdant-glasshouse') texture = 'building_verdant_glasshouse';

      const obj = this.buildingObjects.get(b.id);
      if (!obj) {
        const sprite = this.add.sprite(b.x * 32 + 32, b.y * 32 + 32, texture);
        sprite.setDepth(6);

        const badgeTexture = b.status === 'healthy' ? 'status_healthy' : 'status_offline';
        const badge = this.add.sprite(b.x * 32 + 54, b.y * 32 + 10, badgeTexture);
        badge.setDepth(7);

        this.buildingObjects.set(b.id, { sprite, badge });
      } else {
        const badgeTexture = b.status === 'healthy' ? 'status_healthy' : 'status_offline';
        obj.badge.setTexture(badgeTexture);
      }
    }
  }
}
