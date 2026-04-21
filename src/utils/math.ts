export interface Vector2 {
  x: number;
  y: number;
}

export const normalize = (v: Vector2): Vector2 => {
  const length = Math.sqrt(v.x * v.x + v.y * v.y);
  if (length === 0) return { x: 0, y: 0 };
  return { x: v.x / length, y: v.y / length };
};

export const distance = (v1: Vector2, v2: Vector2): number => {
  return Math.sqrt(Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2));
};

export const lerp = (a: number, b: number, t: number): number => {
  return a + (b - a) * t;
};

export const clamp = (val: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, val));
};

export const getAngle = (v1: Vector2, v2: Vector2): number => {
  return Math.atan2(v2.y - v1.y, v2.x - v1.x);
};

export const circleCollision = (
  p1: Vector2,
  r1: number,
  p2: Vector2,
  r2: number
): boolean => {
  return distance(p1, p2) < r1 + r2;
};

export const getRandomRange = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};
