import { Vector2 } from '../utils/math';

export interface GameObject {
  id: string;
  position: Vector2;
  radius: number;
  update: (dt: number, ...args: unknown[]) => void;
  isDead?: boolean;
}

export type EnemyType = 'wolf' | 'boar' | 'fox' | 'bear';

export type WeaponType = 'fire' | 'ice' | 'magic';

export interface Weapon {
  type: WeaponType;
  damage: number;
  cooldown: number;
  currentCooldown: number;
  projectileSpeed?: number;
  radius?: number;
  count?: number;
}

export interface PlayerStats {
  speed: number;
  pickupRadius: number;
  attackSpeedMultiplier: number;
  damageMultiplier: number;
}

export interface UpgradeOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'stat' | 'weapon';
  value: Record<string, number>;
}
