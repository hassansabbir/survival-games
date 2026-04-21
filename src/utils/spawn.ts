import { Vector2 } from './math';

export const getOffScreenPosition = (playerPos: Vector2, canvasWidth: number, canvasHeight: number): Vector2 => {
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.max(canvasWidth, canvasHeight) / 2 + 100;
  
  return {
    x: playerPos.x + Math.cos(angle) * radius,
    y: playerPos.y + Math.sin(angle) * radius
  };
};
