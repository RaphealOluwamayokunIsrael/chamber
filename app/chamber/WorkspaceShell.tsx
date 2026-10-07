"use client";

import type { ReactNode } from "react";

interface WorkspaceShellProps {
  sidebar: ReactNode;
  header: ReactNode;
  children: ReactNode;
  contextPanel?: ReactNode;
  contextOpen?: boolean;
}

export default function WorkspaceShell({
  sidebar,
  header,
  children,
  contextPanel,
  contextOpen = false,
}: WorkspaceShellProps) {
  return (
    <div className="flex h-dvh min-h-0 overflow-hidden bg-[#f3f2f0] text-[#111111]">
      <aside className="relative z-30 hidden h-full w-[248px] shrink-0 border-r border-white/10 bg-[#080908] lg:flex">
        {sidebar}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="relative z-20 shrink-0 border-b border-black/[0.08] bg-[#f8f8f6]">
          {header}
        </header>

        <div className="flex min-h-0 flex-1">
          <main className="min-w-0 flex-1 overflow-y-auto">
            {children}
          </main>

          {contextPanel && contextOpen && (
            <aside className="hidden w-[320px] shrink-0 overflow-y-auto border-l border-black/[0.08] bg-[#f8f8f6] xl:block">
              {contextPanel}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}