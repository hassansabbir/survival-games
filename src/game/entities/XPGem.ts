import * as PIXI from 'pixi.js';
import { Vector2, distance, normalize } from '../../utils/math';
import { GameObject } from '../types';

export class XPGem implements GameObject {
  id: string;
  position: Vector2;
  radius: number = 8;
  xpAmount: number;
  isDead: boolean = false;
  isBeingCollected: boolean = false;
  collectSpeed: number = 500;

  container: PIXI.Container;
  sprite: PIXI.Graphics;
  private time: number = 0;

  constructor(id: string, x: number, y: number, amount: number) {
    this.id = id;
    this.position = { x, y };
    this.xpAmount = amount;

    this.container = new PIXI.Container();
    this.sprite = new PIXI.Graphics();
    
    // Diamond shape
    this.sprite.poly([
      0, -this.radius,
      this.radius, 0,
      0, this.radius,
      -this.radius, 0
    ], true);
    this.sprite.fill(0x00ffff);
    
    // Glow
    this.sprite.filters = [new PIXI.BlurFilter({ strength: 2 })];
    
    this.container.addChild(this.sprite);
    this.container.x = x;
    this.container.y = y;
  }

  update(dt: number, playerPos?: Vector2) {
    this.time += dt;
    
    // Hover animation
    this.sprite.y = Math.sin(this.time * 5) * 5;

    if (this.isBeingCollected && playerPos) {
      const toPlayer = {
        x: playerPos.x - this.position.x,
        y: playerPos.y - this.position.y
      };
      const dist = distance(this.position, playerPos);
      
      if (dist < 15) {
        this.isDead = true;
      } else {
        const dir = normalize(toPlayer);
        this.position.x += dir.x * this.collectSpeed * dt;
        this.position.y += dir.y * this.collectSpeed * dt;
      }
    }

    this.container.x = this.position.x;
    this.container.y = this.position.y;
  }
}
