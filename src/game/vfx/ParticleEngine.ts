import * as PIXI from 'pixi.js';


export interface ParticleOptions {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: number;
  size: number;
  alpha?: number;
  blendMode?: PIXI.BlendMode;
  trail?: boolean;
}


class Particle extends PIXI.Graphics {
  vx: number = 0;
  vy: number = 0;
  maxLife: number = 0;
  life: number = 0;

  constructor() {
    super();
  }

  init(options: ParticleOptions) {
    this.clear();
    this.circle(0, 0, options.size);
    this.fill(options.color);

    
    this.x = options.x;
    this.y = options.y;
    this.vx = options.vx;
    this.vy = options.vy;
    this.maxLife = options.life;
    this.life = options.life;
    this.alpha = options.alpha ?? 1;
    this.blendMode = options.blendMode ?? 'normal';

    this.visible = true;
  }

  update(dt: number) {
    this.life -= dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.alpha = this.life / this.maxLife;
    
    if (this.life <= 0) {
      this.visible = false;
    }
  }
}

export class ParticleEngine {
  private container: PIXI.Container;
  private pool: Particle[] = [];
  private activeParticles: Particle[] = [];

  constructor(container: PIXI.Container) {
    this.container = container;
    // Pre-pool particles
    for (let i = 0; i < 500; i++) {
      const p = new Particle();
      p.visible = false;
      this.pool.push(p);
      this.container.addChild(p);
    }
  }

  emit(options: ParticleOptions) {
    let p = this.pool.find(particle => !particle.visible);
    if (!p) {
      p = new Particle();
      this.pool.push(p);
      this.container.addChild(p);
    }
    p.init(options);
    this.activeParticles.push(p);
  }

  update(dt: number) {
    for (let i = this.activeParticles.length - 1; i >= 0; i--) {
      const p = this.activeParticles[i];
      p.update(dt);
      if (!p.visible) {
        this.activeParticles.splice(i, 1);
      }
    }
  }

  emitExplosion(x: number, y: number, color: number, count: number = 10) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 150;
      this.emit({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.3 + Math.random() * 0.5,
        color,
        size: 2 + Math.random() * 3,
        blendMode: 'add'

      });
    }
  }

  emitFireTrail(x: number, y: number) {
    this.emit({
      x, y,
      vx: (Math.random() - 0.5) * 20,
      vy: -20 - Math.random() * 30,
      life: 0.2 + Math.random() * 0.3,
      color: 0xff4400,
      size: 3 + Math.random() * 4,
      blendMode: 'add'

    });
  }

  emitIceTrail(x: number, y: number) {
    this.emit({
      x, y,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      life: 0.4 + Math.random() * 0.4,
      color: 0x00ffff,
      size: 2 + Math.random() * 2,
      blendMode: 'screen'

    });
  }
}
