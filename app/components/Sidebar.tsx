"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Phone,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export type ChamberSection =
  | "overview"
  | "chat"
  | "announcements"
  | "members"
  | "files"
  | "events"
  | "polls"
  | "ai"
  | "settings";

interface ChamberSectionItem {
  id: ChamberSection;
  label: string;
  icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
  }>;
}

interface SidebarProps {
  activeSection: ChamberSection;
  onSectionChange: (section: ChamberSection) => void;
  collapsed?: boolean;
  onToggle?: () => void;

  activeCall?: {
    id: string;
    room_name: string;
    started_by: string;
    status: string;
  } | null;

  callLoading?: boolean;
  onStartCall?: () => void;
  onJoinCall?: () => void;
}

const sections: {
  title: string;
  items: ChamberSectionItem[];
}[] = [
  {
    title: "Workspace",
    items: [
      {
        id: "overview",
        label: "Overview",
        icon: LayoutDashboard,
      },
      {
        id: "chat",
        label: "Conversation",
        icon: MessageSquare,
      },
    ],
  },
  {
    title: "Organize",
    items: [
      {
        id: "announcements",
        label: "Announcements",
        icon: Megaphone,
      },
      {
        id: "events",
        label: "Events",
        icon: CalendarDays,
      },
      {
        id: "polls",
        label: "Polls",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Information",
    items: [
      {
        id: "files",
        label: "Files",
        icon: FolderOpen,
      },
      {
        id: "members",
        label: "Members",
        icon: Users,
      },
    ],
  },
  {
    title: "Intelligence",
    items: [
      {
        id: "ai",
        label: "Chamber AI",
        icon: Sparkles,
      },
    ],
  },
];

export default function Sidebar({
  activeSection,
  onSectionChange,
  collapsed = false,
  onToggle,
  activeCall,
  callLoading = false,
  onStartCall,
  onJoinCall,
}: SidebarProps) {
  const [profileName, setProfileName] =
    useState("Chamber Member");

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !mounted) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (!mounted) return;

      setProfileName(
        profile?.full_name ||
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "Chamber Member"
      );
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  const handleNavigation = (section: ChamberSection) => {
    onSectionChange(section);
  };

  const initials = profileName
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`relative flex h-full flex-col bg-[#080908] text-[#f5f5f2] transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        collapsed ? "w-[76px]" : "w-[248px]"
      }`}
    >
      {/* ==================================================
          BRAND
          ================================================== */}
      <div className="flex h-[72px] shrink-0 items-center border-b border-white/[0.08] px-4">
        {!collapsed ? (
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#00e676] text-[#050605]">
              <span className="text-sm font-bold tracking-[-0.04em]">
                C
              </span>
            </div>

            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold tracking-[-0.02em]">
                Chamber
              </p>

              <p className="truncate text-[11px] text-[#a5aaa5]">
                Organization meets focus
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-[#00e676] text-[#050605]">
            <span className="text-sm font-bold tracking-[-0.04em]">
              C
            </span>
          </div>
        )}
      </div>

      {/* ==================================================
          NAVIGATION
          ================================================== */}
      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
        <div className="space-y-6">
          {sections.map((group) => (
            <div key={group.title}>
              {!collapsed && (
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#707570]">
                  {group.title}
                </p>
              )}

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active =
                    activeSection === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        handleNavigation(item.id)
                      }
                      title={
                        collapsed
                          ? item.label
                          : undefined
                      }
                      aria-current={
                        active ? "page" : undefined
                      }
                      className={`group flex w-full items-center gap-3 border-l-2 px-3 py-2.5 text-left text-[13px] transition-all duration-200 ${
                        active
                          ? "border-[#00e676] bg-white/[0.07] text-[#f5f5f2]"
                          : "border-transparent text-[#a5aaa5] hover:bg-white/[0.045] hover:text-[#f5f5f2]"
                      } ${
                        collapsed
                          ? "justify-center px-0"
                          : ""
                      }`}
                    >
                      <Icon
                        size={17}
                        strokeWidth={
                          active ? 2 : 1.7
                        }
                      />

                      {!collapsed && (
                        <span className="truncate">
                          {item.label}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* ==================================================
              LIVE
              ================================================== */}
          <div>
            {!collapsed && (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#707570]">
                Live
              </p>
            )}

            {activeCall ? (
              <button
                type="button"
                onClick={onJoinCall}
                disabled={callLoading}
                title={
                  collapsed
                    ? "Join active call"
                    : undefined
                }
                className={`flex w-full items-center gap-3 border-l-2 border-[#00e676] bg-[#00e676]/[0.08] px-3 py-2.5 text-left text-[13px] text-[#f5f5f2] transition hover:bg-[#00e676]/[0.12] disabled:cursor-not-allowed disabled:opacity-60 ${
                  collapsed
                    ? "justify-center px-0"
                    : ""
                }`}
              >
                <Phone
                  size={17}
                  strokeWidth={1.8}
                />

                {!collapsed && (
                  <span className="truncate">
                    Join live call
                  </span>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={onStartCall}
                disabled={callLoading}
                title={
                  collapsed
                    ? "Start a call"
                    : undefined
                }
                className={`flex w-full items-center gap-3 border-l-2 border-transparent px-3 py-2.5 text-left text-[13px] text-[#a5aaa5] transition hover:bg-white/[0.045] hover:text-[#f5f5f2] disabled:cursor-not-allowed disabled:opacity-60 ${
                  collapsed
                    ? "justify-center px-0"
                    : ""
                }`}
              >
                <Phone
                  size={17}
                  strokeWidth={1.8}
                />

                {!collapsed && (
                  <span className="truncate">
                    {callLoading
                      ? "Starting call..."
                      : "Start a call"}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ==================================================
          ACCOUNT
          ================================================== */}
      <div className="shrink-0 border-t border-white/[0.08] p-3">
        <button
          type="button"
          onClick={() =>
            handleNavigation("settings")
          }
          title={
            collapsed ? "Settings" : undefined
          }
          className={`mb-2 flex w-full items-center gap-3 border-l-2 border-transparent px-3 py-2.5 text-left text-[13px] text-[#a5aaa5] transition hover:bg-white/[0.045] hover:text-[#f5f5f2] ${
            collapsed
              ? "justify-center px-0"
              : ""
          }`}
        >
          <Settings
            size={17}
            strokeWidth={1.7}
          />

          {!collapsed && <span>Settings</span>}
        </button>

        <div
          className={`flex items-center gap-3 px-2 py-2 ${
            collapsed
              ? "justify-center"
              : ""
          }`}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.06] text-[10px] font-semibold text-[#f5f5f2]">
            {initials || "CM"}
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-medium text-[#f5f5f2]">
                {profileName}
              </p>

              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00e676]" />

                <span className="text-[10px] text-[#707570]">
                  Online
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ==================================================
          COLLAPSE CONTROL
          ================================================== */}
      {onToggle && (
        <button
          type="button"
          onClick={onToggle}
          title={
            collapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
          aria-label={
            collapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
          className="absolute -right-3 top-[84px] z-40 flex h-6 w-6 items-center justify-center rounded-full border border-black/[0.12] bg-[#f8f8f6] text-[#111111] shadow-sm transition hover:bg-white"
        >
          {collapsed ? (
            <ChevronRight
              size={13}
              strokeWidth={2}
            />
          ) : (
            <ChevronLeft
              size={13}
              strokeWidth={2}
            />
          )}
        </button>
      )}
    </div>
  );
}