"use client";

import {
  MessageSquare,
  Users,
  Megaphone,
  Folder,
  Calendar,
  BarChart3,
  Menu,
  X,
} from "lucide-react";

export type ChamberSection =
  | "chat"
  | "announcements"
  | "members"
  | "files"
  | "events"
  | "polls";

type SidebarProps = {
  activeSection: ChamberSection;
  onSectionChange: (section: ChamberSection) => void;
  collapsed: boolean;
  onToggle: () => void;
};

export default function Sidebar({
  activeSection,
  onSectionChange,
  collapsed,
  onToggle,
}: SidebarProps) {
  const navigation = [
    {
      id: "chat" as ChamberSection,
      label: "General Chat",
      icon: MessageSquare,
    },
    {
      id: "announcements" as ChamberSection,
      label: "Announcements",
      icon: Megaphone,
    },
    {
      id: "members" as ChamberSection,
      label: "Members",
      icon: Users,
    },
    {
      id: "files" as ChamberSection,
      label: "Files",
      icon: Folder,
    },
    {
      id: "events" as ChamberSection,
      label: "Events",
      icon: Calendar,
    },
    {
      id: "polls" as ChamberSection,
      label: "Polls",
      icon: BarChart3,
    },
  ];

  return (
    <aside
      className={`relative flex h-screen shrink-0 flex-col border-r border-slate-800 bg-slate-950 transition-all duration-300 ${
        collapsed ? "w-20" : "w-72"
      }`}
    >
      {/* TOGGLE */}
      <div
        className={`flex h-20 items-center border-b border-slate-800 ${
          collapsed
            ? "justify-center"
            : "justify-between px-4"
        }`}
      >
        {!collapsed && (
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white">
              C
            </div>

            <div className="ml-3">
              <h1 className="text-lg font-bold text-white">
                Chamber
              </h1>

              <p className="text-xs text-slate-400">
                Secure Collaboration
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onToggle}
          className="rounded-xl bg-slate-800 p-3 text-white transition hover:bg-slate-700"
          title={
            collapsed
              ? "Open sidebar"
              : "Collapse sidebar"
          }
        >
          {collapsed ? (
            <Menu size={22} />
          ) : (
            <X size={22} />
          )}
        </button>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 space-y-2 p-3">
        {navigation.map((item) => {
          const Icon = item.icon;

          const isActive =
            activeSection === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                onSectionChange(item.id)
              }
              title={
                collapsed
                  ? item.label
                  : undefined
              }
              className={`flex w-full items-center rounded-xl py-3 font-medium transition ${
                collapsed
                  ? "justify-center"
                  : "gap-3 px-4"
              } ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <Icon size={20} />

              {!collapsed && (
                <span>{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* USER */}
      <div className="border-t border-slate-800 p-4">
        <div
          className={`flex items-center ${
            collapsed
              ? "justify-center"
              : ""
          }`}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-600 font-bold text-white">
            I
          </div>

          {!collapsed && (
            <div className="ml-3">
              <p className="font-semibold text-white">
                Israel
              </p>

              <p className="text-sm text-green-400">
                ● Online
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}