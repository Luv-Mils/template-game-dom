import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { GameTheme } from '../../types';
import { GameShell, StatCard, ProgressBar, ActionButton } from '../../components';

interface Upgrade {
  id: string;
  name: string;
  icon: string;
  baseCost: number;
  cps: number; // crystals per second
  description: string;
}

const UPGRADES: Upgrade[] = [
  { id: 'pickaxe', name: 'Auto Pickaxe', icon: '⛏️', baseCost: 15, cps: 0.5, description: '+0.5/s' },
  { id: 'miner', name: 'Miner Bot', icon: '🤖', baseCost: 100, cps: 3, description: '+3/s' },
  { id: 'drill', name: 'Mega Drill', icon: '🔧', baseCost: 500, cps: 15, description: '+15/s' },
  { id: 'laser', name: 'Crystal Laser', icon: '🔬', baseCost: 3000, cps: 80, description: '+80/s' },
  { id: 'reactor', name: 'Quantum Reactor', icon: '⚛️', baseCost: 20000, cps: 500, description: '+500/s' },
];

const CLICK_UPGRADES = [
  { id: 'gloves', name: 'Mining Gloves', icon: '🧤', cost: 50, bonus: 1 },
  { id: 'hammer', name: 'Crystal Hammer', icon: '🔨', cost: 500, bonus: 5 },
  { id: 'gauntlet', name: 'Power Gauntlet', icon: '🦾', cost: 5000, bonus: 25 },
];

function formatNum(n: number): string {
  if (n >= 1e12) return (n / 1e12).toFixed(1) + 'T';
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return Math.floor(n).toString();
}

export default function IdleClickerGame({ theme }: { theme: GameTheme }) {
  const [crystals, setCrystals] = useState(0);
  const [totalCrystals, setTotalCrystals] = useState(0);
  const [clickPower, setClickPower] = useState(1);
  const [cps, setCps] = useState(0);
  const [owned, setOwned] = useState<Record<string, number>>({});
  const [clickUpgrades, setClickUpgrades] = useState<Set<string>>(new Set());
  const [prestige, setPrestige] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [clicks, setClicks] = useState<{ id: number; x: number; y: number }[]>([]);
  const clickId = useRef(0);

  // Auto-generation
  useEffect(() => {
    if (cps <= 0) return;
    const interval = setInterval(() => {
      const gain = cps * multiplier * 0.1;
      setCrystals(c => c + gain);
      setTotalCrystals(t => t + gain);
    }, 100);
    return () => clearInterval(interval);
  }, [cps, multiplier]);

  // Save/load
  useEffect(() => {
    try {
      const save = JSON.parse(localStorage.getItem('idle_save') ?? 'null');
      if (save) {
        setCrystals(save.crystals ?? 0);
        setTotalCrystals(save.totalCrystals ?? 0);
        setClickPower(save.clickPower ?? 1);
        setOwned(save.owned ?? {});
        setClickUpgrades(new Set(save.clickUpgrades ?? []));
        setPrestige(save.prestige ?? 0);
        setMultiplier(save.multiplier ?? 1);
        // Recalculate CPS
        let totalCps = 0;
        for (const u of UPGRADES) totalCps += (save.owned?.[u.id] ?? 0) * u.cps;
        setCps(totalCps);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem('idle_save', JSON.stringify({
        crystals, totalCrystals, clickPower, owned, clickUpgrades: [...clickUpgrades], prestige, multiplier,
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, [crystals, totalCrystals, clickPower, owned, clickUpgrades, prestige, multiplier]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const gain = clickPower * multiplier;
    setCrystals(c => c + gain);
    setTotalCrystals(t => t + gain);
    const id = clickId.current++;
    const rect = e.currentTarget.getBoundingClientRect();
    setClicks(prev => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setClicks(prev => prev.filter(c => c.id !== id)), 800);
  }, [clickPower, multiplier]);

  function buyUpgrade(upgrade: Upgrade) {
    const count = owned[upgrade.id] ?? 0;
    const cost = Math.floor(upgrade.baseCost * Math.pow(1.15, count));
    if (crystals < cost) return;
    setCrystals(c => c - cost);
    setOwned(o => ({ ...o, [upgrade.id]: count + 1 }));
    setCps(prev => prev + upgrade.cps);
  }

  function buyClickUpgrade(cu: typeof CLICK_UPGRADES[0]) {
    if (clickUpgrades.has(cu.id) || crystals < cu.cost) return;
    setCrystals(c => c - cu.cost);
    setClickUpgrades(prev => new Set([...prev, cu.id]));
    setClickPower(p => p + cu.bonus);
  }

  function doPrestige() {
    if (totalCrystals < 100000) return;
    const newPrestige = prestige + 1;
    const newMultiplier = 1 + newPrestige * 0.5;
    setCrystals(0);
    setTotalCrystals(0);
    setClickPower(1);
    setCps(0);
    setOwned({});
    setClickUpgrades(new Set());
    setPrestige(newPrestige);
    setMultiplier(newMultiplier);
  }

  const sidebar = (
    <div className="space-y-4">
      <div className="text-xs text-muted uppercase tracking-wide mb-2">Auto-Miners</div>
      {UPGRADES.map(u => {
        const count = owned[u.id] ?? 0;
        const cost = Math.floor(u.baseCost * Math.pow(1.15, count));
        return (
          <ActionButton
            key={u.id}
            label={`${u.icon} ${u.name} (${count})`}
            subtitle={`${u.description} — Cost: ${formatNum(cost)}`}
            onClick={() => buyUpgrade(u)}
            disabled={crystals < cost}
            variant="secondary"
            fullWidth
            size="sm"
          />
        );
      })}

      <div className="text-xs text-muted uppercase tracking-wide mt-6 mb-2">Click Power</div>
      {CLICK_UPGRADES.map(cu => (
        <ActionButton
          key={cu.id}
          label={`${cu.icon} ${cu.name}`}
          subtitle={clickUpgrades.has(cu.id) ? 'Owned' : `+${cu.bonus}/click — ${formatNum(cu.cost)}`}
          onClick={() => buyClickUpgrade(cu)}
          disabled={clickUpgrades.has(cu.id) || crystals < cu.cost}
          variant={clickUpgrades.has(cu.id) ? 'success' : 'secondary'}
          fullWidth
          size="sm"
        />
      ))}

      {totalCrystals >= 50000 && (
        <>
          <div className="text-xs text-muted uppercase tracking-wide mt-6 mb-2">Prestige</div>
          <ActionButton
            label={`⭐ Prestige (${prestige})`}
            subtitle={`Reset for ${((prestige + 1) * 0.5 + 1).toFixed(1)}x multiplier`}
            onClick={doPrestige}
            disabled={totalCrystals < 100000}
            variant="danger"
            fullWidth
            size="sm"
          />
        </>
      )}
    </div>
  );

  return (
    <GameShell title="Crystal Miner" icon="💎" sidebar={sidebar}
      footer={<div className="text-xs text-muted text-center">Prestige level: {prestige} | Multiplier: {multiplier.toFixed(1)}x | Auto-saved every 5s</div>}>
      <div className="max-w-lg mx-auto">
        <div className="grid grid-cols-3 gap-3 mb-8">
          <StatCard label="Crystals" value={formatNum(crystals)} icon="💎" />
          <StatCard label="Per Second" value={formatNum(cps * multiplier)} icon="⚡" />
          <StatCard label="Per Click" value={formatNum(clickPower * multiplier)} icon="👆" />
        </div>

        <div
          onClick={handleClick}
          className="relative w-48 h-48 mx-auto rounded-full cursor-pointer select-none
                     bg-gradient-to-br from-primary to-accent
                     flex items-center justify-center text-6xl
                     hover:scale-105 active:scale-95 transition-transform shadow-2xl shadow-primary/30"
        >
          💎
          {clicks.map(c => (
            <span key={c.id}
              className="absolute text-accent font-bold text-lg pointer-events-none animate-[floatUp_0.8s_ease-out_forwards]"
              style={{ left: c.x, top: c.y }}>
              +{formatNum(clickPower * multiplier)}
            </span>
          ))}
        </div>

        <p className="text-center text-muted text-sm mt-4">Click the crystal to mine!</p>

        <style>{`
          @keyframes floatUp {
            0% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-60px); }
          }
        `}</style>
      </div>
    </GameShell>
  );
}
