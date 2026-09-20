"use client";

import {
  Menu,
  PanelTopClose,
  PanelTopOpen,
} from "lucide-react";
import { useState } from "react";

type TopbarProps = {
  chamberName?: string;
};

export default function Topbar({
  chamberName = "Chamber",
}: TopbarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <header
      className={`relative z-20 flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 transition-all duration-300 sm:px-6 ${
        collapsed ? "h-12" : "h-16"
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-all ${
            collapsed ? "h-8 w-8" : "h-9 w-9"
          }`}
        >
          <Menu
            size={collapsed ? 17 : 19}
          />
        </div>

        <h1
          className={`truncate font-bold text-slate-900 transition-all ${
            collapsed
              ? "text-sm"
              : "text-base sm:text-lg"
          }`}
        >
          {chamberName}
        </h1>
      </div>

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
        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
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