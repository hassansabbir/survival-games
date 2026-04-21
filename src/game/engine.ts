import * as PIXI from 'pixi.js';
import { Player } from './entities/Player';
import { Enemy } from './entities/Enemy';
import { Projectile } from './entities/Projectile';
import { XPGem } from './entities/XPGem';
import { ParticleEngine } from './vfx/ParticleEngine';
import { GrassBackground } from './environment/GrassShader';
import { Vector2, distance, circleCollision } from '../utils/math';
import { getOffScreenPosition } from '../utils/spawn';
import { useGameStore } from '@/store/useGameStore';
import { EnemyType, Weapon } from './types';

export class GameEngine {
  private app: PIXI.Application;
  private world!: PIXI.Container;
  private vfxLayer!: PIXI.Container;
  private background!: GrassBackground;
  
  private player!: Player;
  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];
  private gems: XPGem[] = [];
  
  private particleEngine!: ParticleEngine;
  
  private lastTime: number = 0;
  private isRunning: boolean = false;
  private input: Vector2 = { x: 0, y: 0 };
  private keys: Set<string> = new Set();
  
  private spawnTimer: number = 0;
  private spawnInterval: number = 1.5;
  
  // Camera & FX
  private camera: Vector2 = { x: 0, y: 0 };
  private screenShake: number = 0;
  private targetZoom: number = 1;
  private currentZoom: number = 1;

  constructor() {
    this.app = new PIXI.Application();
  }

  public async init(canvas: HTMLCanvasElement) {
    await this.app.init({
      canvas: canvas,
      width: window.innerWidth,
      height: window.innerHeight,
      background: 0x0a1a0a,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
    });

    // Load ALL assets first
    PIXI.Assets.add({ alias: 'grass', src: '/assets/grass.png' });
    PIXI.Assets.add({ alias: 'cat', src: '/assets/cat.png' });
    PIXI.Assets.add({ alias: 'enemies', src: '/assets/enemies.png' });
    await PIXI.Assets.load(['grass', 'cat', 'enemies']);

    // Layers
    this.world = new PIXI.Container();
    this.vfxLayer = new PIXI.Container();
    
    // Background
    const grassTexture = PIXI.Assets.get('grass');

    this.background = new GrassBackground(grassTexture, window.innerWidth, window.innerHeight);
    this.app.stage.addChild(this.background);
    
    this.app.stage.addChild(this.world);
    this.app.stage.addChild(this.vfxLayer);

    this.player = new Player(0, 0);
    this.world.addChild(this.player.container);
    
    this.particleEngine = new ParticleEngine(this.vfxLayer);
    
    this.setupInput();
    this.setupResize();
  }

  private setupInput() {
    window.addEventListener('keydown', (e) => this.keys.add(e.code));
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
  }

  private setupResize() {
    window.addEventListener('resize', () => {
      this.app.renderer.resize(window.innerWidth, window.innerHeight);
      if (this.background) {
        this.background.width = window.innerWidth;
        this.background.height = window.innerHeight;
      }
    });
  }

  public setJoystickInput(input: Vector2) {
    this.joystickInput = input;
  }

  private joystickInput: Vector2 = { x: 0, y: 0 };

  private updateInput() {
    this.input = { x: 0, y: 0 };
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) this.input.y -= 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) this.input.y += 1;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) this.input.x -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) this.input.x += 1;

    if (Math.abs(this.joystickInput.x) > 0.1 || Math.abs(this.joystickInput.y) > 0.1) {
      this.input.x = this.joystickInput.x;
      this.input.y = this.joystickInput.y;
    }
  }

  public start() {
    this.isRunning = true;
    this.lastTime = performance.now();
    this.app.ticker.add(this.loop, this);
  }

  public stop() {
    this.isRunning = false;
    this.app.ticker.remove(this.loop, this);
  }

  private loop() {
    if (!this.isRunning) return;

    const state = useGameStore.getState();
    if (state.isPaused || state.isGameOver) return;

    const dt = this.app.ticker.deltaMS / 1000;
    this.update(dt);
    this.updateCamera();
  }

  private update(dt: number) {
    this.updateInput();
    this.player.update(dt, this.input);
    
    // Background update (shader)
    if (this.background) {
      this.background.update(dt, performance.now() / 1000, this.player.position, this.camera);
    }

    // Spawning
    this.spawnTimer += dt;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnEnemy();
      this.spawnTimer = 0;
      this.spawnInterval = Math.max(0.3, this.spawnInterval - 0.005);
    }

    // Auto-attack
    this.player.weapons.forEach(weapon => {
      if (weapon.currentCooldown <= 0) {
        this.fireWeapon(weapon);
        weapon.currentCooldown = weapon.cooldown;
      }
    });

    // Update Entities
    this.enemies.forEach(enemy => enemy.update(dt, this.player.position));
    this.projectiles.forEach(proj => proj.update(dt));
    this.gems.forEach(gem => gem.update(dt, this.player.position));
    this.particleEngine.update(dt);

    this.handleCollisions();

    // Cleanup
    this.enemies = this.enemies.filter(e => {
      if (e.isDead) this.world.removeChild(e.container);
      return !e.isDead;
    });
    this.projectiles = this.projectiles.filter(p => {
      if (p.isDead) this.world.removeChild(p.container);
      return !p.isDead;
    });
    this.gems = this.gems.filter(g => {
      if (g.isDead) this.world.removeChild(g.container);
      return !g.isDead;
    });

    useGameStore.getState().updateGameTime(dt);
  }

  private updateCamera() {
    // Smooth follow
    this.camera.x += (this.player.position.x - this.camera.x) * 0.1;
    this.camera.y += (this.player.position.y - this.camera.y) * 0.1;

    // Dynamic Zoom based on enemy count
    this.targetZoom = 1.0 - Math.min(0.2, this.enemies.length * 0.005);
    this.currentZoom += (this.targetZoom - this.currentZoom) * 0.05;

    // Shake
    let shakeX = 0;
    let shakeY = 0;
    if (this.screenShake > 0) {
      shakeX = (Math.random() - 0.5) * this.screenShake;
      shakeY = (Math.random() - 0.5) * this.screenShake;
      this.screenShake *= 0.9;
    }

    // Apply to world
    this.world.scale.set(this.currentZoom);
    this.vfxLayer.scale.set(this.currentZoom);
    
    this.world.x = window.innerWidth / 2 - this.camera.x * this.currentZoom + shakeX;
    this.world.y = window.innerHeight / 2 - this.camera.y * this.currentZoom + shakeY;
    
    this.vfxLayer.x = this.world.x;
    this.vfxLayer.y = this.world.y;
  }

  private spawnEnemy() {
    const state = useGameStore.getState();
    const pos = getOffScreenPosition(this.player.position, window.innerWidth, window.innerHeight);
    
    const isBossTime = Math.floor(state.gameTime) > 0 && Math.floor(state.gameTime) % 60 === 0;
    const level = 1 + Math.floor(state.gameTime / 60);

    let type: EnemyType = 'wolf';
    if (isBossTime && !this.enemies.some(e => e.type === 'bear')) {
      type = 'bear';
    } else {
      const rand = Math.random();
      if (rand < 0.6) type = 'wolf';
      else if (rand < 0.9) type = 'boar';
      else type = 'fox';
    }

    const enemy = new Enemy(Math.random().toString(), pos.x, pos.y, type, level);
    this.enemies.push(enemy);
    this.world.addChild(enemy.container);
  }

  private fireWeapon(weapon: Weapon) {
    let nearestEnemy: Enemy | null = null;
    let minDist = 800;
    const { stats } = useGameStore.getState();

    for (const enemy of this.enemies) {
      const dist = distance(this.player.position, enemy.position);
      if (dist < minDist) {
        minDist = dist;
        nearestEnemy = enemy;
      }
    }

    if (nearestEnemy) {
      const targetDir = {
        x: nearestEnemy.position.x - this.player.position.x,
        y: nearestEnemy.position.y - this.player.position.y
      };
      
      const proj = new Projectile(
        Math.random().toString(),
        this.player.position.x,
        this.player.position.y,
        targetDir,
        weapon.damage * stats.damageMultiplier,
        weapon.projectileSpeed || 450,
        weapon.type
      );
      this.projectiles.push(proj);
      this.world.addChild(proj.container);
    }
  }

  private handleCollisions() {
    const state = useGameStore.getState();

    this.projectiles.forEach(proj => {
      this.enemies.forEach(enemy => {
        if (!proj.isDead && !enemy.isDead && circleCollision(proj.position, proj.radius, enemy.position, enemy.radius)) {
          enemy.takeDamage(proj.damage);
          proj.isDead = true;
          this.screenShake = 5;

          const color = proj.type === 'fire' ? 0xff4400 : proj.type === 'ice' ? 0x00ffff : 0xaa00ff;
          this.particleEngine.emitExplosion(proj.position.x, proj.position.y, color, 8);

          if (enemy.isDead) {
            state.addScore(10 * (enemy.type === 'bear' ? 10 : 1));
            const gem = new XPGem(Math.random().toString(), enemy.position.x, enemy.position.y, enemy.type === 'bear' ? 100 : 20);
            this.gems.push(gem);
            this.world.addChild(gem.container);
            this.particleEngine.emitExplosion(enemy.position.x, enemy.position.y, 0xffffff, 15);
          }
        }
      });
    });

    this.enemies.forEach(enemy => {
      if (!enemy.isDead && circleCollision(enemy.position, enemy.radius, this.player.position, this.player.radius)) {
        state.takeDamage(enemy.damage * 0.05);
        this.screenShake = 2;
      }
    });

    this.gems.forEach(gem => {
      const dist = distance(this.player.position, gem.position);
      if (dist < state.stats.pickupRadius) gem.isBeingCollected = true;
      if (circleCollision(gem.position, gem.radius, this.player.position, this.player.radius)) {
        state.addXP(gem.xpAmount);
        gem.isDead = true;
      }
    });
  }
}
