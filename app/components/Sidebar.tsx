"use client";

import { useEffect, useState } from "react";
import {
  MessageSquare,
  Users,
  Megaphone,
  Folder,
  Calendar,
  BarChart3,
  Bot,
  Settings,
  Menu,
  X,
  PhoneCall,
  Loader2,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

export type ChamberSection =
  | "chat"
  | "announcements"
  | "members"
  | "files"
  | "events"
  | "polls"
  | "ai"
  | "settings";

type ChamberCall = {
  id: string;
  chamber_id: string;
  room_name: string;
  started_by: string;
  status: string;
};

type SidebarProps = {
  activeSection: ChamberSection;
  onSectionChange: (
    section: ChamberSection
  ) => void;
  collapsed: boolean;
  onToggle: () => void;

  activeCall?: ChamberCall | null;
  callLoading?: boolean;
  onStartCall?: () => void;
  onJoinCall?: () => void;
};

type Profile = {
  full_name: string | null;
};

export default function Sidebar({
  activeSection,
  onSectionChange,
  collapsed,
  onToggle,
  activeCall,
  callLoading = false,
  onStartCall,
  onJoinCall,
}: SidebarProps) {
  const [profile, setProfile] =
    useState<Profile | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const {
        data,
        error,
      } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error(
          "LOAD SIDEBAR PROFILE ERROR:",
          error
        );

        return;
      }

      setProfile(data);
    } catch (error) {
      console.error(
        "SIDEBAR PROFILE ERROR:",
        error
      );
    }
  }

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
    {
      id: "ai" as ChamberSection,
      label: "Chamber AI",
      icon: Bot,
    },
  ];

  const displayName =
    profile?.full_name ||
    "Chamber Member";

  const initial =
    displayName
      .charAt(0)
      .toUpperCase() || "C";

  const callAvailable =
    Boolean(onStartCall) ||
    Boolean(onJoinCall);

  function handleCallClick() {
    if (activeCall) {
      onJoinCall?.();
      return;
    }

    onStartCall?.();
  }

  return (
    <aside
      className={[
        "absolute inset-y-0 left-0 z-50 flex h-full flex-col transition-all duration-300 ease-in-out",
        collapsed
          ? "w-20 bg-transparent text-slate-900"
          : "w-72 bg-transparent text-slate-900",
      ].join(" ")}
    >
      {/* SIDEBAR HEADER */}
      <div
        className={[
          "flex h-16 shrink-0 items-center",
          collapsed
            ? "justify-center"
            : "justify-between px-5",
        ].join(" ")}
      >
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-slate-900">
              Chamber
            </p>

            <p className="text-xs text-slate-500">
              Where Organization Meets Focus
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={onToggle}
          aria-label={
            collapsed
              ? "Open sidebar"
              : "Close sidebar"
          }
          className={[
            "flex shrink-0 items-center justify-center rounded-xl transition",
            collapsed
              ? "h-10 w-10 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              : "h-10 w-10 text-slate-500 hover:bg-slate-100 hover:text-slate-900",
          ].join(" ")}
        >
          {collapsed ? (
            <Menu className="h-5 w-5" />
          ) : (
            <X className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* NAVIGATION */}
      <nav
        className={[
          "flex-1 overflow-y-auto",
          collapsed
            ? "px-3 py-5"
            : "px-4 py-6",
        ].join(" ")}
      >
        <div className="space-y-2">
          {navigation.map(
            ({
              id,
              label,
              icon: Icon,
            }) => {
              const active =
                activeSection === id;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() =>
                    onSectionChange(id)
                  }
                  title={
                    collapsed
                      ? label
                      : undefined
                  }
                  className={[
                    "group flex w-full items-center transition-all duration-200",
                    collapsed
                      ? "h-12 justify-center rounded-xl"
                      : "h-11 rounded-xl px-3",
                    active
                      ? collapsed
                        ? "bg-blue-600 text-white shadow-sm"
                        : "border-l-2 border-blue-600 text-blue-600"
                      : collapsed
                        ? "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                        : "text-slate-600 hover:text-blue-600",
                  ].join(" ")}
                >
                  <Icon className="h-5 w-5 shrink-0" />

                  {!collapsed && (
                    <span className="ml-3 truncate text-sm font-semibold">
                      {label}
                    </span>
                  )}
                </button>
              );
            }
          )}
        </div>

        {/* WORKING CALL BUTTON */}
        {callAvailable && (
          <div
            className={[
              "mt-3",
              collapsed
                ? ""
                : "border-t border-slate-200 pt-3",
            ].join(" ")}
          >
            <button
              type="button"
              onClick={handleCallClick}
              disabled={callLoading}
              title={
                collapsed
                  ? activeCall
                    ? "Join active call"
                    : "Start call"
                  : undefined
              }
              className={[
                "group flex w-full items-center transition-all duration-200",
                collapsed
                  ? "h-12 justify-center rounded-xl"
                  : "h-11 rounded-xl px-3",
                activeCall
                  ? collapsed
                    ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                    : "border-l-2 border-emerald-600 text-emerald-600 hover:text-emerald-700"
                  : collapsed
                    ? "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                    : "text-slate-600 hover:text-blue-600",
                callLoading
                  ? "cursor-not-allowed opacity-60"
                  : "",
              ].join(" ")}
            >
              {callLoading ? (
                <Loader2 className="h-5 w-5 shrink-0 animate-spin" />
              ) : (
                <PhoneCall className="h-5 w-5 shrink-0" />
              )}

              {!collapsed && (
                <span className="ml-3 truncate text-sm font-semibold">
                  {callLoading
                    ? "Starting Call..."
                    : activeCall
                      ? "Join Call"
                      : "Start Call"}
                </span>
              )}
            </button>
          </div>
        )}

        {/* SETTINGS */}
        <div
          className={[
            "mt-2",
            collapsed
              ? ""
              : "border-t border-slate-200 pt-2",
          ].join(" ")}
        >
          <button
            type="button"
            onClick={() =>
              onSectionChange("settings")
            }
            title={
              collapsed
                ? "Settings"
                : undefined
            }
            className={[
              "group flex w-full items-center transition-all duration-200",
              collapsed
                ? "h-12 justify-center rounded-xl"
                : "h-11 rounded-xl px-3",
              activeSection === "settings"
                ? collapsed
                  ? "bg-blue-600 text-white shadow-sm"
                  : "border-l-2 border-blue-600 text-blue-600"
                : collapsed
                  ? "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                  : "text-slate-600 hover:text-blue-600",
            ].join(" ")}
          >
            <Settings className="h-5 w-5 shrink-0" />

            {!collapsed && (
              <span className="ml-3 truncate text-sm font-semibold">
                Settings
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* USER FOOTER */}
      <div
        className={[
          "shrink-0",
          collapsed
            ? "px-3 py-4"
            : "px-4 pb-5",
        ].join(" ")}
      >
        <div
          className={[
            "flex items-center",
            collapsed
              ? "justify-center"
              : "gap-3",
          ].join(" ")}
        >
          <div
            title={
              collapsed
                ? displayName
                : undefined
            }
            className={[
              "flex shrink-0 items-center justify-center rounded-full font-bold",
              collapsed
                ? "h-10 w-10 bg-slate-800 text-white"
                : "h-10 w-10 bg-blue-50 text-blue-600",
            ].join(" ")}
          >
            {initial}
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {displayName}
              </p>

              <div className="mt-1 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />

                <span className="text-xs text-slate-500">
                  Online
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}