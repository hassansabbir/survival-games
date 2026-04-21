import { create } from 'zustand';
import { UpgradeOption } from '@/game/types';

const UPGRADES = [
  { id: 'speed', title: 'Agility', description: 'Increase movement speed by 10%', icon: '🏃', type: 'stat', value: { speed: 1.1 } },
  { id: 'damage', title: 'Power', description: 'Increase damage by 20%', icon: '⚔️', type: 'stat', value: { damageMultiplier: 1.2 } },
  { id: 'attackSpeed', title: 'Rapid Fire', description: 'Increase attack speed by 15%', icon: '🔥', type: 'stat', value: { attackSpeedMultiplier: 1.15 } },
  { id: 'pickup', title: 'Magnet', description: 'Increase pickup radius by 30%', icon: '🧲', type: 'stat', value: { pickupRadius: 1.3 } },
  { id: 'hp', title: 'Vitality', description: 'Heal 50% HP and increase Max HP', icon: '❤️', type: 'stat', value: { maxHP: 20 } },
];

interface GameState {
  score: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  isGameOver: boolean;
  isPaused: boolean;
  showUpgradeModal: boolean;
  gameTime: number;
  playerHP: number;
  playerMaxHP: number;
  highScore: number;
  
  // Player Stats
  stats: {
    speed: number;
    pickupRadius: number;
    attackSpeedMultiplier: number;
    damageMultiplier: number;
  };
  upgradeOptions: UpgradeOption[];
  // Actions
  addXP: (amount: number) => void;
  addScore: (amount: number) => void;
  takeDamage: (amount: number) => void;
  heal: (amount: number) => void;
  levelUp: () => void;
  resetGame: () => void;
  setPaused: (paused: boolean) => void;
  setUpgradeModal: (show: boolean) => void;
  updateGameTime: (dt: number) => void;
  applyUpgrade: (upgrade: UpgradeOption) => void;
}

export const useGameStore = create<GameState>((set) => {
  // Initialize highscore from localStorage
  const savedHighScore = typeof window !== 'undefined' ? 
    Number(localStorage.getItem('catSurvivors_highScore') || 0) : 0;

  return {
    score: 0,
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    isGameOver: false,
    isPaused: false,
    showUpgradeModal: false,
    gameTime: 0,
    playerHP: 100,
    playerMaxHP: 100,
    highScore: savedHighScore,
    stats: {
      speed: 220,
      pickupRadius: 120,
      attackSpeedMultiplier: 1,
      damageMultiplier: 1,
    },
    upgradeOptions: [],

    addXP: (amount) => set((state) => {
      const newXP = state.xp + amount;
      if (newXP >= state.xpToNextLevel) {
        return { 
          xp: newXP - state.xpToNextLevel, 
          level: state.level + 1,
          xpToNextLevel: Math.floor(state.xpToNextLevel * 1.2),
          showUpgradeModal: true,
          isPaused: true,
          upgradeOptions: [...UPGRADES].sort(() => 0.5 - Math.random()).slice(0, 3)
        };
      }
      return { xp: newXP };
    }),

    addScore: (amount) => set((state) => {
      const newScore = state.score + amount;
      if (newScore > state.highScore) {
        localStorage.setItem('catSurvivors_highScore', newScore.toString());
        return { score: newScore, highScore: newScore };
      }
      return { score: newScore };
    }),

  takeDamage: (amount) => set((state) => {
    const newHP = Math.max(0, state.playerHP - amount);
    return { 
      playerHP: newHP,
      isGameOver: newHP <= 0
    };
  }),

  heal: (amount) => set((state) => ({ 
    playerHP: Math.min(state.playerMaxHP, state.playerHP + amount) 
  })),

  levelUp: () => set((state) => ({ 
    level: state.level + 1,
    showUpgradeModal: true,
    isPaused: true,
    upgradeOptions: [...UPGRADES].sort(() => 0.5 - Math.random()).slice(0, 3)
  })),

  resetGame: () => set({
    score: 0,
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    isGameOver: false,
    isPaused: false,
    showUpgradeModal: false,
    gameTime: 0,
    playerHP: 100,
    playerMaxHP: 100,
    stats: {
      speed: 220,
      pickupRadius: 120,
      attackSpeedMultiplier: 1,
      damageMultiplier: 1,
    },
    upgradeOptions: [],
  }),

  setPaused: (paused) => set({ isPaused: paused }),
  
  setUpgradeModal: (show) => set({ showUpgradeModal: show, isPaused: show }),

  updateGameTime: (dt) => set((state) => ({ gameTime: state.gameTime + dt })),

  applyUpgrade: (upgrade) => set((state) => {
    const newStats = { ...state.stats };
    const newMaxHP = state.playerMaxHP + (upgrade.value.maxHP || 0);
    const newHP = state.playerHP + (upgrade.value.maxHP || 0); // Increase current HP if max HP increases

    if (upgrade.value.speed) newStats.speed *= upgrade.value.speed;
    if (upgrade.value.damageMultiplier) newStats.damageMultiplier *= upgrade.value.damageMultiplier;
    if (upgrade.value.attackSpeedMultiplier) newStats.attackSpeedMultiplier *= upgrade.value.attackSpeedMultiplier;
    if (upgrade.value.pickupRadius) newStats.pickupRadius *= upgrade.value.pickupRadius;

    return {
      stats: newStats,
      playerMaxHP: newMaxHP,
      playerHP: Math.min(newMaxHP, newHP),
      showUpgradeModal: false,
      isPaused: false
    };
  }),
  };
});
