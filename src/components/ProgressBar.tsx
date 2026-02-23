import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  color?: string;
  showValue?: boolean;
  height?: number;
}

export default function ProgressBar({ value, max, label, color, showValue = true, height = 12 }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div>
      {(label || showValue) && (
        <div className="flex justify-between text-xs text-muted mb-1">
          {label && <span>{label}</span>}
          {showValue && <span>{Math.floor(value)}/{max}</span>}
        </div>
      )}
      <div className="bg-surface-alt rounded-full overflow-hidden" style={{ height }}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: color ?? 'rgb(var(--color-primary))' }}
        />
      </div>
    </div>
  );
}
