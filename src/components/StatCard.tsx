import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  color?: string;
  onClick?: () => void;
  subtitle?: string;
}

export default function StatCard({ label, value, icon, color, onClick, subtitle }: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-surface border border-border rounded-xl p-4 ${onClick ? 'cursor-pointer hover:border-primary/50 transition-colors' : ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted uppercase tracking-wide">{label}</span>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <div className="text-2xl font-bold" style={color ? { color } : undefined}>{value}</div>
      {subtitle && <div className="text-xs text-muted mt-1">{subtitle}</div>}
    </div>
  );
}
