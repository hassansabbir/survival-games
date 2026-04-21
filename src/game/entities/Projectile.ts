import * as PIXI from 'pixi.js';
import { Vector2, normalize } from '../../utils/math';
import { GameObject, WeaponType } from '../types';

export class Projectile implements GameObject {
  id: string;
  position: Vector2;
  velocity: Vector2;
  radius: number = 8;
  damage: number;
  speed: number;
  type: WeaponType;
  isDead: boolean = false;
  lifeTime: number = 2.5;
  currentLife: number = 0;

  container: PIXI.Container;
  sprite: PIXI.Graphics;

  constructor(id: string, x: number, y: number, targetDir: Vector2, damage: number, speed: number, type: WeaponType = 'fire') {
    this.id = id;
    this.position = { x, y };
    this.damage = damage;
    this.speed = speed;
    this.type = type;
    
    const dir = normalize(targetDir);
    this.velocity = {
      x: dir.x * speed,
      y: dir.y * speed
    };

    this.container = new PIXI.Container();
    this.sprite = new PIXI.Graphics();
    
    const color = type === 'fire' ? 0xff4400 : type === 'ice' ? 0x00ffff : 0xaa00ff;
    this.sprite.circle(0, 0, this.radius);
    this.sprite.fill(color);
    
    // Simple glow
    this.sprite.filters = [new PIXI.BlurFilter({ strength: 2 })];
    
    this.container.addChild(this.sprite);
    this.container.x = x;
    this.container.y = y;
  }

  update(dt: number) {
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
    
    this.container.x = this.position.x;
    this.container.y = this.position.y;

    this.currentLife += dt;
    if (this.currentLife >= this.lifeTime) {
      this.isDead = true;
    }
  }
}
