import { Vector2 } from '../../utils/math';
import { GameObject } from '../types';

export class Particle implements GameObject {
  id: string;
  position: Vector2;
  velocity: Vector2;
  radius: number;
  color: string;
  lifeTime: number;
  currentLife: number = 0;
  isDead: boolean = false;

  constructor(id: string, x: number, y: number, velocity: Vector2, radius: number, color: string, lifeTime: number) {
    this.id = id;
    this.position = { x, y };
    this.velocity = velocity;
    this.radius = radius;
    this.color = color;
    this.lifeTime = lifeTime;
  }

  update(dt: number) {
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
    
    this.currentLife += dt;
    if (this.currentLife >= this.lifeTime) {
      this.isDead = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D, camera: Vector2) {
    const screenX = this.position.x - camera.x + ctx.canvas.width / 2;
    const screenY = this.position.y - camera.y + ctx.canvas.height / 2;

    const opacity = 1 - (this.currentLife / this.lifeTime);
    ctx.globalAlpha = opacity;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;
  }
}
