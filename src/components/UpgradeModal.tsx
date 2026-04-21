'use client';

import { UpgradeOption } from '@/game/types';
import { useGameStore } from '@/store/useGameStore';
import styles from './UpgradeModal.module.css';

export default function UpgradeModal() {
  const { showUpgradeModal, applyUpgrade, upgradeOptions: options } = useGameStore();

  if (!showUpgradeModal) return null;

  const handleSelect = (upgrade: UpgradeOption) => {
    applyUpgrade(upgrade);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>LEVEL UP!</h2>
        <p className={styles.subtitle}>Choose an upgrade</p>
        
        <div className={styles.options}>
          {options.map((opt: UpgradeOption) => (
            <button 
              key={opt.id} 
              className={styles.optionCard}
              onClick={() => handleSelect(opt)}
            >
              <span className={styles.icon}>{opt.icon}</span>
              <h3 className={styles.optTitle}>{opt.title}</h3>
              <p className={styles.optDesc}>{opt.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
