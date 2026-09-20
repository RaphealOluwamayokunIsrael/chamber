"use client";

import {
  Building2,
  PanelTopClose,
  PanelTopOpen,
} from "lucide-react";
import { useState } from "react";

type TopbarProps = {
  chamberName?: string;
  onSidebarToggle?: () => void;
};

export default function Topbar({
  chamberName = "Chamber",
  onSidebarToggle,
}: TopbarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <header
      className={`relative z-40 flex shrink-0 items-center border-b border-slate-200 bg-white transition-all duration-300 ${
        collapsed ? "h-12" : "h-16"
      }`}
    >
      {/* Chamber sidebar button */}
      <button
        type="button"
        onClick={onSidebarToggle}
        aria-label="Open Chamber sidebar"
        title="Open Chamber sidebar"
        className={`ml-4 flex shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-100 hover:text-blue-700 sm:ml-6 ${
          collapsed ? "h-8 w-8" : "h-9 w-9"
        }`}
      >
        <Building2
          size={collapsed ? 17 : 19}
          strokeWidth={2}
        />
      </button>

      {/* Centrally positioned Chamber name */}
      <div className="pointer-events-none absolute left-1/2 max-w-[60%] -translate-x-1/2">
        <h1
          className={`truncate text-center font-bold text-slate-900 transition-all ${
            collapsed
              ? "text-sm"
              : "text-base sm:text-lg"
          }`}
        >
          {chamberName}
        </h1>
      </div>

      {/* Topbar collapse button */}
      <button
        type="button"
        onClick={() =>
          setCollapsed((previous) => !previous)
        }
        aria-label={
          collapsed
            ? "Expand topbar"
            : "Collapse topbar"
        }
        title={
          collapsed
            ? "Expand topbar"
            : "Collapse topbar"
        }
        className="ml-auto mr-4 flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-blue-600 sm:mr-6"
      >
        {collapsed ? (
          <PanelTopOpen size={18} />
        ) : (
          <PanelTopClose size={18} />
        )}
      </button>
    </header>
  );
}