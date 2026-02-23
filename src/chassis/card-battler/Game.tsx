import React, { useState, useCallback } from 'react';
import type { GameTheme } from '../../types';
import { GameShell, ActionButton, ProgressBar, GameOverModal } from '../../components';

interface Card {
  id: string;
  name: string;
  icon: string;
  cost: number;
  damage: number;
  heal: number;
  shield: number;
  description: string;
}

const ALL_CARDS: Card[] = [
  { id: 'slash', name: 'Slash', icon: '⚔️', cost: 1, damage: 6, heal: 0, shield: 0, description: 'Deal 6 damage' },
  { id: 'fireball', name: 'Fireball', icon: '🔥', cost: 2, damage: 12, heal: 0, shield: 0, description: 'Deal 12 damage' },
  { id: 'heal', name: 'Heal', icon: '💚', cost: 1, damage: 0, heal: 8, shield: 0, description: 'Heal 8 HP' },
  { id: 'shield', name: 'Shield Up', icon: '🛡️', cost: 1, damage: 0, heal: 0, shield: 6, description: 'Gain 6 shield' },
  { id: 'smite', name: 'Smite', icon: '⚡', cost: 3, damage: 20, heal: 0, shield: 0, description: 'Deal 20 damage' },
  { id: 'drain', name: 'Life Drain', icon: '🧛', cost: 2, damage: 8, heal: 5, shield: 0, description: 'Deal 8, heal 5' },
  { id: 'block', name: 'Iron Wall', icon: '🧱', cost: 2, damage: 0, heal: 0, shield: 12, description: 'Gain 12 shield' },
  { id: 'stab', name: 'Quick Stab', icon: '🗡️', cost: 0, damage: 3, heal: 0, shield: 0, description: 'Deal 3 damage' },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (let i = 0; i < 3; i++) deck.push(ALL_CARDS[0]); // 3x slash
  for (let i = 0; i < 2; i++) deck.push(ALL_CARDS[7]); // 2x stab
  for (let i = 0; i < 2; i++) deck.push(ALL_CARDS[2]); // 2x heal
  for (let i = 0; i < 2; i++) deck.push(ALL_CARDS[3]); // 2x shield
  deck.push(ALL_CARDS[1]); // 1x fireball
  deck.push(ALL_CARDS[5]); // 1x drain
  deck.push(ALL_CARDS[6]); // 1x iron wall
  return deck;
}

export default function CardBattlerGame({ theme }: { theme: GameTheme }) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'win' | 'lose'>('menu');
  const [playerHp, setPlayerHp] = useState(50);
  const [playerShield, setPlayerShield] = useState(0);
  const [playerEnergy, setPlayerEnergy] = useState(3);
  const [enemyHp, setEnemyHp] = useState(50);
  const [enemyShield, setEnemyShield] = useState(0);
  const [hand, setHand] = useState<Card[]>([]);
  const [drawPile, setDrawPile] = useState<Card[]>([]);
  const [discardPile, setDiscardPile] = useState<Card[]>([]);
  const [turn, setTurn] = useState(1);
  const [log, setLog] = useState<string[]>([]);
  const [enemyAction, setEnemyAction] = useState('');

  const addLog = useCallback((msg: string) => {
    setLog(prev => [msg, ...prev].slice(0, 10));
  }, []);

  const startGame = useCallback(() => {
    const deck = shuffle(buildDeck());
    const h = deck.splice(0, 5);
    setDrawPile(deck);
    setHand(h);
    setDiscardPile([]);
    setPlayerHp(50);
    setPlayerShield(0);
    setPlayerEnergy(3);
    setEnemyHp(50);
    setEnemyShield(0);
    setTurn(1);
    setLog(['Battle begins!']);
    setEnemyAction('');
    setGameState('playing');
  }, []);

  function playCard(card: Card, idx: number) {
    if (playerEnergy < card.cost) return;

    setPlayerEnergy(e => e - card.cost);

    // Apply damage
    if (card.damage > 0) {
      setEnemyHp(prev => {
        const dmg = card.damage;
        let remaining = dmg;
        setEnemyShield(s => {
          if (s > 0) {
            const absorbed = Math.min(s, remaining);
            remaining -= absorbed;
            return s - absorbed;
          }
          return s;
        });
        const newHp = prev - remaining;
        if (newHp <= 0) setTimeout(() => setGameState('win'), 300);
        return Math.max(0, newHp);
      });
    }
    if (card.heal > 0) setPlayerHp(h => Math.min(50, h + card.heal));
    if (card.shield > 0) setPlayerShield(s => s + card.shield);

    addLog(`You play ${card.icon} ${card.name}`);

    // Move card to discard
    setHand(prev => prev.filter((_, i) => i !== idx));
    setDiscardPile(prev => [...prev, card]);
  }

  function endTurn() {
    // Enemy turn
    const actions = ['attack', 'attack', 'defend', 'heal'];
    const action = actions[Math.floor(Math.random() * actions.length)];

    if (action === 'attack') {
      const dmg = 5 + Math.floor(turn * 1.5);
      let remaining = dmg;
      setPlayerShield(s => {
        const absorbed = Math.min(s, remaining);
        remaining -= absorbed;
        return s - absorbed;
      });
      setPlayerHp(prev => {
        const newHp = prev - remaining;
        if (newHp <= 0) setTimeout(() => setGameState('lose'), 300);
        return Math.max(0, newHp);
      });
      setEnemyAction(`Enemy attacks for ${dmg}!`);
      addLog(`Enemy attacks for ${dmg} damage`);
    } else if (action === 'defend') {
      setEnemyShield(s => s + 4 + turn);
      setEnemyAction('Enemy raises shield');
      addLog(`Enemy gains ${4 + turn} shield`);
    } else {
      setEnemyHp(h => Math.min(50, h + 5));
      setEnemyAction('Enemy heals');
      addLog('Enemy heals 5 HP');
    }

    // Draw new hand
    setTurn(t => t + 1);
    setPlayerEnergy(3);
    setPlayerShield(0); // Shield fades each turn

    // Draw 5 cards
    setDrawPile(prev => {
      let pile = [...prev];
      setDiscardPile(d => {
        setHand(h => {
          const toDiscard = [...h]; // discard remaining hand
          let all = [...pile, ...d, ...toDiscard];
          if (all.length < 5) all = shuffle(buildDeck());
          else all = shuffle(all);
          const newHand = all.splice(0, 5);
          setDrawPile(all);
          setDiscardPile([]);
          return newHand;
        });
        return d;
      });
      return pile;
    });
  }

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🃏</div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Deck Duels</h1>
          <p className="text-muted mb-6">Play cards, manage energy, defeat the enemy!</p>
          <ActionButton label="Start Battle" onClick={startGame} variant="primary" size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      {gameState === 'win' && (
        <GameOverModal title="Victory!" icon="🏆"
          stats={[{ label: 'Turns', value: turn }, { label: 'HP Left', value: playerHp }]}
          actions={[{ label: 'Play Again', onClick: startGame, primary: true }]} />
      )}
      {gameState === 'lose' && (
        <GameOverModal title="Defeated" icon="💀"
          stats={[{ label: 'Turns', value: turn }, { label: 'Enemy HP', value: enemyHp }]}
          actions={[{ label: 'Try Again', onClick: startGame, primary: true }]} />
      )}

      <div className="max-w-4xl mx-auto">
        {/* Enemy */}
        <div className="bg-surface border border-border rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl">👹</span>
              <div>
                <h3 className="font-bold">Dark Knight</h3>
                <span className="text-xs text-muted">{enemyAction}</span>
              </div>
            </div>
            {enemyShield > 0 && <span className="text-sm text-accent">🛡️ {enemyShield}</span>}
          </div>
          <ProgressBar value={enemyHp} max={50} label="HP" color={theme.colors.danger} />
        </div>

        {/* Player */}
        <div className="bg-surface border border-border rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🧙</span>
              <div>
                <h3 className="font-bold">You</h3>
                <span className="text-xs text-muted">Turn {turn}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {playerShield > 0 && <span className="text-sm text-accent">🛡️ {playerShield}</span>}
              <span className="text-sm text-primary">⚡ {playerEnergy}/3</span>
            </div>
          </div>
          <ProgressBar value={playerHp} max={50} label="HP" color={theme.colors.success} />
        </div>

        {/* Hand */}
        <div className="flex gap-3 flex-wrap justify-center mb-4">
          {hand.map((card, i) => (
            <button
              key={i}
              onClick={() => playCard(card, i)}
              disabled={playerEnergy < card.cost}
              className={`w-32 bg-surface border-2 ${playerEnergy >= card.cost ? 'border-primary/50 hover:border-primary cursor-pointer' : 'border-border opacity-50 cursor-not-allowed'} rounded-xl p-3 text-center transition-all hover:scale-105`}
            >
              <div className="text-2xl mb-1">{card.icon}</div>
              <div className="text-xs font-bold">{card.name}</div>
              <div className="text-xs text-muted mt-1">{card.description}</div>
              <div className="mt-2 text-xs text-primary font-bold">⚡ {card.cost}</div>
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <ActionButton label="End Turn" onClick={endTurn} variant="secondary" icon="⏭️" />
        </div>

        {/* Log */}
        <div className="mt-4 bg-surface/50 rounded-lg p-3 max-h-32 overflow-y-auto">
          {log.map((msg, i) => (
            <div key={i} className={`text-xs ${i === 0 ? 'text-foreground' : 'text-muted'}`}>{msg}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
