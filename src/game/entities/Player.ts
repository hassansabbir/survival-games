import * as PIXI from 'pixi.js';
import { Vector2, normalize } from '../../utils/math';
import { GameObject, Weapon } from '../types';
import { CharacterVisual } from '../vfx/CharacterVisual';
import { useGameStore } from '@/store/useGameStore';

export class Player implements GameObject {
  id: string = 'player';
  position: Vector2 = { x: 0, y: 0 };
  radius: number = 25;
  
  weapons: Weapon[] = [
    {
      type: 'fire',
      damage: 15,
      cooldown: 0.8,
      currentCooldown: 0,
      projectileSpeed: 500,
    },
  ];

  container: PIXI.Container;
  visual: CharacterVisual;
  private velocity: Vector2 = { x: 0, y: 0 };

  constructor(x: number, y: number) {
    this.position = { x, y };
    this.container = new PIXI.Container();
    
    this.visual = new CharacterVisual('cat');
    this.container.addChild(this.visual);
    
    this.container.x = x;
    this.container.y = y;
  }

  update(dt: number, input: Vector2) {
    const { stats } = useGameStore.getState();
    const dir = normalize(input);
    
    this.velocity.x = dir.x * stats.speed;
    this.velocity.y = dir.y * stats.speed;

    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;

    // Update PIXI position
    this.container.x = this.position.x;
    this.container.y = this.position.y;

    // Update Visual
    this.visual.update(dt, this.velocity);

    // Update weapon cooldowns
    this.weapons.forEach(w => {
      if (w.currentCooldown > 0) {
        w.currentCooldown -= dt * stats.attackSpeedMultiplier;
      }
    });
  }
}
