import GameCanvas from '@/components/GameCanvas';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.gameContainer}>
        <GameCanvas />
        {/* HUD and Modals will go here */}
      </div>
    </main>
  );
}
