import React from 'react';

interface ActionButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  icon?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  subtitle?: string;
}

export default function ActionButton({ label, onClick, disabled, variant = 'primary', icon, size = 'md', fullWidth, subtitle }: ActionButtonProps) {
  const colors = {
    primary: 'bg-primary hover:bg-primary/80 text-white',
    secondary: 'bg-surface-alt hover:bg-border text-foreground',
    danger: 'bg-danger hover:bg-danger/80 text-white',
    success: 'bg-success hover:bg-success/80 text-white',
  };
  const sizes = { sm: 'py-1.5 px-3 text-xs', md: 'py-2.5 px-4 text-sm', lg: 'py-3 px-6 text-base' };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${sizes[size]} ${colors[variant]} rounded-xl font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${fullWidth ? 'w-full' : ''}`}
    >
      <div className="flex items-center justify-center gap-2">
        {icon && <span>{icon}</span>}
        <span>{label}</span>
      </div>
      {subtitle && <div className="text-xs opacity-70 mt-0.5">{subtitle}</div>}
    </button>
  );
}
