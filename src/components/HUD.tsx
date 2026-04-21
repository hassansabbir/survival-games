'use client';

import { useGameStore } from '@/store/useGameStore';
import styles from './HUD.module.css';

export default function HUD() {
  const { 
    playerHP, 
    playerMaxHP, 
    xp, 
    xpToNextLevel, 
    level, 
    score, 
    gameTime 
  } = useGameStore();

  const hpPercentage = (playerHP / playerMaxHP) * 100;
  const xpPercentage = (xp / xpToNextLevel) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.hud}>
      <div className={styles.topRow}>
        <div className={styles.timerContainer}>
          <div className={styles.timer}>{formatTime(gameTime)}</div>
        </div>
        <div className={styles.score}>Score: {score}</div>
      </div>

      <div className={styles.bottomContainer}>
        <div className={styles.xpContainer}>
          <div className={styles.xpHeader}>
            <span className={styles.levelText}>Level {level}</span>
            <span className={styles.xpValue}>{xp} / {xpToNextLevel} XP</span>
          </div>
          <div className={styles.xpBarContainer}>
            <div 
              className={styles.xpBarFill} 
              style={{ width: `${xpPercentage}%` }}
            />
          </div>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.hpBarContainer}>
            <div 
              className={styles.hpBarFill} 
              style={{ width: `${hpPercentage}%` }}
            />
            <span className={styles.hpText}>{Math.ceil(playerHP)} / {playerMaxHP} HP</span>
          </div>
        </div>
      </div>
    </div>
  );
}
