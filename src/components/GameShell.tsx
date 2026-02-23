import React from 'react';

interface GameShellProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
}

export default function GameShell({ title, icon, children, sidebar, footer }: GameShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border px-4 py-3 flex items-center gap-3 bg-surface/50 backdrop-blur-sm">
        {icon && <span className="text-2xl">{icon}</span>}
        <h1 className="text-lg font-bold">{title}</h1>
      </header>
      <div className="flex-1 flex">
        {sidebar && <aside className="w-64 border-r border-border p-4 bg-surface/30 hidden md:block overflow-y-auto">{sidebar}</aside>}
        <main className="flex-1 p-4 overflow-y-auto">{children}</main>
      </div>
      {footer && <footer className="border-t border-border px-4 py-2 bg-surface/30">{footer}</footer>}
    </div>
  );
}
