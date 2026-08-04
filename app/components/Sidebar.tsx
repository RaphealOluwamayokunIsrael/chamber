"use client";

import Link from "next/link";
import {
  MessageSquare,
  Users,
  Megaphone,
  CalendarDays,
  FolderOpen,
  BarChart3,
  Settings,
} from "lucide-react";

const menu = [
  {
    name: "General Chat",
    icon: MessageSquare,
    href: "#",
  },
  {
    name: "Members",
    icon: Users,
    href: "#",
  },
  {
    name: "Announcements",
    icon: Megaphone,
    href: "#",
  },
  {
    name: "Events",
    icon: CalendarDays,
    href: "#",
  },
  {
    name: "Files",
    icon: FolderOpen,
    href: "#",
  },
  {
    name: "Polls",
    icon: BarChart3,
    href: "#",
  },
  {
    name: "Settings",
    icon: Settings,
    href: "#",
  },
];

export default function Sidebar() {
  return (
    <aside className="w-72 h-screen bg-slate-950 border-r border-slate-800 flex flex-col text-white">

      {/* Logo */}

      <div className="px-7 py-7 border-b border-slate-800">

        <h1 className="text-3xl font-black tracking-tight text-blue-500">
          Chamber
        </h1>

        <p className="text-sm text-slate-400 mt-1">
          Where Organization Meets Focus
        </p>

      </div>

      {/* Navigation */}

      <nav className="flex-1 px-4 py-6 overflow-y-auto">

        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className="mb-2 flex items-center gap-4 rounded-2xl px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200"
            >
              <Icon size={22} />

              <span className="font-medium">
                {item.name}
              </span>
            </Link>
          );
        })}

      </nav>

      {/* Bottom User */}

      <div className="border-t border-slate-800 p-5">

        <div className="flex items-center gap-4">

          <div className="relative">

            <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-lg font-bold">
              I
            </div>

            <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-slate-950 bg-green-500"></span>

          </div>

          <div className="flex-1">

            <h3 className="font-semibold">
              Israel
            </h3>

            <p className="text-sm text-slate-400">
              Online
            </p>

          </div>

        </div>

      </div>

    </aside>
  );
}