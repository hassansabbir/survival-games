'use client';

import { useEffect, useRef } from 'react';
import { GameEngine } from '@/game/engine';
import { useGameStore } from '@/store/useGameStore';
import HUD from './HUD';
import UpgradeModal from './UpgradeModal';
import Joystick from './Joystick';

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const { isGameOver, resetGame } = useGameStore();

  useEffect(() => {
    if (canvasRef.current && !engineRef.current) {
      const engine = new GameEngine();
      engineRef.current = engine;
      
      const initGame = async () => {
        if (canvasRef.current) {
          await engine.init(canvasRef.current);
          engine.start();
        }
      };
      
      initGame();
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.stop();
        engineRef.current = null;
      }
    };
  }, []);


  const handleJoystickMove = (dir: { x: number, y: number }) => {
    if (engineRef.current) {
      engineRef.current.setJoystickInput(dir);
    }
  };

  return (
    <div id="game-container" style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#0a0a0a' }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      />

      
      <HUD />
      <UpgradeModal />
      <Joystick onMove={handleJoystickMove} />

      {isGameOver && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          zIndex: 200
        }}>
          <h1 style={{ fontSize: '4rem', color: '#ff4444' }}>GAME OVER</h1>
          <button 
            onClick={() => {
              resetGame();
              window.location.reload();
            }}
            style={{
              padding: '15px 40px',
              fontSize: '1.5rem',
              background: '#ffcc00',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              marginTop: '20px',
              color: 'black',
              fontWeight: 'bold'
            }}
          >
            TRY AGAIN
          </button>
        </div>
      )}
    </div>
  );
}
