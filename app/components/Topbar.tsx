"use client";

import {
  Search,
  Phone,
  Video,
  MoreVertical,
} from "lucide-react";

export default function Topbar() {
  return (
    <header className="h-20 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8">

      {/* Left */}

      <div>
        <h1 className="text-xl font-bold text-white">
          Chamber
        </h1>

        <p className="text-sm text-slate-400">
          Collaboration without distractions
        </p>
      </div>

      {/* Center */}

      <div className="hidden lg:flex items-center bg-slate-800 rounded-xl px-4 py-2 w-[360px]">

        <Search
          className="text-slate-500"
          size={18}
        />

        <input
          type="text"
          placeholder="Search messages..."
          className="ml-3 bg-transparent outline-none text-white w-full placeholder:text-slate-500"
        />

      </div>

      {/* Right */}

      <div className="flex items-center gap-3">

        <button className="h-11 w-11 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center">
          <Phone size={20} className="text-white" />
        </button>

        <button className="h-11 w-11 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center">
          <Video size={20} className="text-white" />
        </button>

        <button className="h-11 w-11 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center">
          <MoreVertical size={20} className="text-white" />
        </button>

      </div>

    </header>
  );
}