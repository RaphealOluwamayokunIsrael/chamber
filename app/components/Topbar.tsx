"use client";

import {
  Bell,
  ChevronDown,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
} from "lucide-react";

interface TopbarProps {
  chamberName?: string;
  onSidebarToggle?: () => void;
  sidebarCollapsed?: boolean;
}

export default function Topbar({
  chamberName = "Chamber",
  onSidebarToggle,
  sidebarCollapsed = false,
}: TopbarProps) {
  return (
    <div className="flex h-[72px] items-center justify-between px-5 sm:px-7">
      {/* LEFT */}
      <div className="flex min-w-0 items-center gap-4">
        {onSidebarToggle && (
          <button
            type="button"
            onClick={onSidebarToggle}
            aria-label={
              sidebarCollapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
            title={
              sidebarCollapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
            className="hidden h-9 w-9 items-center justify-center border border-black/[0.08] bg-white text-[#111111] transition hover:bg-[#f3f2f0] lg:flex"
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen
                size={17}
                strokeWidth={1.7}
              />
            ) : (
              <PanelLeftClose
                size={17}
                strokeWidth={1.7}
              />
            )}
          </button>
        )}

        {/* Mobile menu */}
        {onSidebarToggle && (
          <button
            type="button"
            onClick={onSidebarToggle}
            aria-label="Open workspace navigation"
            className="flex h-9 w-9 items-center justify-center border border-black/[0.08] bg-white text-[#111111] transition hover:bg-[#f3f2f0] lg:hidden"
          >
            <Menu
              size={18}
              strokeWidth={1.7}
            />
          </button>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="hidden text-[11px] font-medium uppercase tracking-[0.14em] text-[#8a8d8a] sm:inline">
              Workspace
            </span>

            <span className="hidden text-[#b2b4b2] sm:inline">
              /
            </span>

            <h1 className="truncate text-[15px] font-semibold tracking-[-0.02em] text-[#111111]">
              {chamberName}
            </h1>
          </div>

          <p className="mt-0.5 hidden text-[11px] text-[#777b77] sm:block">
            Organization workspace
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search */}
        <button
          type="button"
          aria-label="Search Chamber"
          className="hidden h-9 items-center gap-2 border border-black/[0.08] bg-white px-3 text-[#6c706c] transition hover:bg-[#f3f2f0] sm:flex"
        >
          <Search
            size={15}
            strokeWidth={1.7}
          />

          <span className="text-[12px]">
            Search
          </span>

          <kbd className="ml-3 hidden border border-black/[0.08] px-1.5 py-0.5 text-[9px] text-[#8a8d8a] lg:inline">
            /
          </kbd>
        </button>

        {/* Mobile search */}
        <button
          type="button"
          aria-label="Search Chamber"
          className="flex h-9 w-9 items-center justify-center border border-black/[0.08] bg-white text-[#6c706c] transition hover:bg-[#f3f2f0] sm:hidden"
        >
          <Search
            size={16}
            strokeWidth={1.7}
          />
        </button>

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center border border-black/[0.08] bg-white text-[#5f625f] transition hover:bg-[#f3f2f0]"
        >
          <Bell
            size={16}
            strokeWidth={1.7}
          />

          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#00e676]" />
        </button>

        {/* Workspace context */}
        <button
          type="button"
          className="hidden h-9 items-center gap-2 border border-black/[0.08] bg-white px-3 text-[#111111] transition hover:bg-[#f3f2f0] md:flex"
        >
          <span className="flex h-5 w-5 items-center justify-center bg-[#111111] text-[9px] font-semibold text-white">
            C
          </span>

          <span className="max-w-[120px] truncate text-[12px] font-medium">
            {chamberName}
          </span>

          <ChevronDown
            size={13}
            strokeWidth={1.7}
            className="text-[#777b77]"
          />
        </button>
      </div>
    </div>
  );
}