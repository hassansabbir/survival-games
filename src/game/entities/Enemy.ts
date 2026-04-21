import * as PIXI from 'pixi.js';
import { Vector2, normalize } from '../../utils/math';
import { GameObject, EnemyType } from '../types';
import { CharacterVisual } from '../vfx/CharacterVisual';

export class Enemy implements GameObject {
  id: string;
  position: Vector2;
  radius: number;
  hp: number;
  maxHP: number;
  speed: number;
  damage: number;
  type: EnemyType;
  isDead: boolean = false;

  container: PIXI.Container;
  visual: CharacterVisual;
  private time: number = 0;
  private flashTimer: number = 0;
  private velocity: Vector2 = { x: 0, y: 0 };

  constructor(id: string, x: number, y: number, type: EnemyType, level: number = 1) {
    this.id = id;
    this.position = { x, y };
    this.type = type;
    
    // Stats based on type
    switch (type) {
      case 'wolf':
        this.radius = 18;
        this.maxHP = 40 * level;
        this.speed = 140;
        this.damage = 10;
        break;
      case 'boar':
        this.radius = 28;
        this.maxHP = 120 * level;
        this.speed = 60;
        this.damage = 25;
        break;
      case 'fox':
        this.radius = 15;
        this.maxHP = 30 * level;
        this.speed = 180;
        this.damage = 8;
        break;
      case 'bear':
        this.radius = 65;
        this.maxHP = 800 * level;
        this.speed = 45;
        this.damage = 60;
        break;
      default:
        this.radius = 20;
        this.maxHP = 50;
        this.speed = 100;
        this.damage = 10;
    }
    
    this.hp = this.maxHP;
    this.container = new PIXI.Container();
    
    this.visual = new CharacterVisual(type);
    this.container.addChild(this.visual);
    
    // Scale based on radius/type if needed, but CharacterVisual handles its own scaling config
    if (this.type === 'bear') this.visual.scale.set(1.5);
  }

  update(dt: number, playerPos: Vector2) {
    this.time += dt;
    
    const toPlayer = {
      x: playerPos.x - this.position.x,
      y: playerPos.y - this.position.y
    };
    
    const dir = normalize(toPlayer);
    
    // Unique behaviors
    let currentSpeed = this.speed;
    if (this.type === 'boar') {
      const chargeCycle = this.time % 4;
      if (chargeCycle > 3) currentSpeed *= 3;
    }

    if (this.type === 'fox') {
      const zigzag = Math.sin(this.time * 5) * 100;
      const perpendicular = { x: -dir.y, y: dir.x };
      this.velocity.x = dir.x * currentSpeed + perpendicular.x * zigzag;
      this.velocity.y = dir.y * currentSpeed + perpendicular.y * zigzag;
    } else {
      this.velocity.x = dir.x * currentSpeed;
      this.velocity.y = dir.y * currentSpeed;
    }

    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;

    this.container.x = this.position.x;
    this.container.y = this.position.y;

    // Update Visual
    this.visual.update(dt, this.velocity);

    // Hit flash effect
    if (this.flashTimer > 0) {
      this.flashTimer -= dt;
      this.visual.alpha = 0.5; // Simple flash
    } else {
      this.visual.alpha = 1;
    }
  }

  takeDamage(amount: number) {
    this.hp -= amount;
    this.flashTimer = 0.1;
    if (this.hp <= 0) {
      this.isDead = true;
    }
  }
}
