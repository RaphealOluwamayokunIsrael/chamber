"use client";

import {
  Bell,
  Search,
  Moon,
  Shield,
} from "lucide-react";

export default function Topbar() {
  return (
    <header className="h-20 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8">

      {/* Left */}

      <div>

        <h1 className="text-2xl font-bold text-white">
          General Chat
        </h1>

        <p className="text-sm text-slate-400 mt-1">
          Welcome to your Chamber workspace
        </p>

      </div>

      {/* Right */}

      <div className="flex items-center gap-4">

        {/* Search */}

        <div className="relative hidden md:block">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            type="text"
            placeholder="Search messages..."
            className="w-72 rounded-xl border border-slate-700 bg-slate-800 py-3 pl-11 pr-4 text-white placeholder:text-slate-500 outline-none transition focus:border-blue-500"
          />

        </div>

        {/* Notifications */}

        <button className="relative rounded-xl bg-slate-800 p-3 text-slate-300 transition hover:bg-slate-700 hover:text-white">

          <Bell size={21} />

          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500"></span>

        </button>

        {/* Chamber Security */}

        <div className="hidden lg:flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-3">

          <Shield
            size={18}
            className="text-emerald-400"
          />

          <span className="text-sm text-slate-300">
            Secure Chamber
          </span>

        </div>

        {/* Theme */}

        <button className="rounded-xl bg-slate-800 p-3 text-slate-300 transition hover:bg-slate-700 hover:text-white">

          <Moon size={20} />

        </button>

      </div>

    </header>
  );
}