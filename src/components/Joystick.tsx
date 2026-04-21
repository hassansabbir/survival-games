'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import styles from './Joystick.module.css';

interface JoystickProps {
  onMove: (dir: { x: number, y: number }) => void;
}

export default function Joystick({ onMove }: JoystickProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchId, setTouchId] = useState<number | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleStart = (e: React.TouchEvent) => {
    if (touchId !== null) return;
    const touch = e.changedTouches[0];
    setTouchId(touch.identifier);
  };

  const handleMove = useCallback((e: TouchEvent) => {
    if (touchId === null) return;
    
    let touch: Touch | undefined;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchId) {
        touch = e.changedTouches[i];
        break;
      }
    }

    if (touch && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      let dx = touch.clientX - centerX;
      let dy = touch.clientY - centerY;
      
      const maxRadius = rect.width / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > maxRadius) {
        dx = (dx / dist) * maxRadius;
        dy = (dy / dist) * maxRadius;
      }
      
      setPos({ x: dx, y: dy });
      onMove({ x: dx / maxRadius, y: dy / maxRadius });
    }
  }, [touchId, onMove]);

  const handleEnd = useCallback((e: TouchEvent) => {
    let found = false;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchId) {
        found = true;
        break;
      }
    }
    
    if (found) {
      setTouchId(null);
      setPos({ x: 0, y: 0 });
      onMove({ x: 0, y: 0 });
    }
  }, [touchId, onMove]);

  useEffect(() => {
    if (touchId !== null) {
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', handleEnd);
      window.addEventListener('touchcancel', handleEnd);
    }
    return () => {
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('touchcancel', handleEnd);
    };
  }, [touchId, handleMove, handleEnd]);

  return (
    <div className={styles.joystickWrapper}>
      <div 
        ref={containerRef}
        className={styles.container}
        onTouchStart={handleStart}
      >
        <div 
          className={styles.stick}
          style={{
            transform: `translate(${pos.x}px, ${pos.y}px)`
          }}
        />
      </div>
    </div>
  );
}
