import React from 'react';

interface GameOverModalProps {
  title: string;
  icon?: string;
  stats: Array<{ label: string; value: string | number }>;
  actions: Array<{ label: string; onClick: () => void; primary?: boolean }>;
}

export default function GameOverModal({ title, icon, stats, actions }: GameOverModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl animate-[fadeIn_0.3s_ease]">
        {icon && <div className="text-5xl mb-4">{icon}</div>}
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {stats.map((s, i) => (
            <div key={i} className="bg-surface-alt rounded-lg p-3">
              <div className="text-lg font-bold">{s.value}</div>
              <div className="text-xs text-muted">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {actions.map((a, i) => (
            <button key={i} onClick={a.onClick}
              className={a.primary
                ? 'w-full py-3 rounded-xl font-semibold text-white bg-primary hover:bg-primary/80 transition-colors'
                : 'w-full py-3 rounded-xl font-semibold text-foreground bg-surface-alt hover:bg-border transition-colors'}>
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
