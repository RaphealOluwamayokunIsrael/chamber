"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import Chat from "./Chat";

type Chamber = {
  id: string;
  chamber_name: string;
  description: string;
  organization: string;
  category: string;
  division: string;
  chamber_code: string;
};

export default function ChamberPage() {
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [chamber, setChamber] = useState<Chamber | null>(null);

  useEffect(() => {
    loadChamber();
  }, []);

  async function loadChamber() {
    const { data, error } = await supabase
      .from("chambers")
      .select("*")
      .eq("id", id)
      .single();

    if (!error && data) {
      setChamber(data);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <main className="h-screen bg-slate-950 flex items-center justify-center">
        <h1 className="text-2xl font-bold text-white">
          Loading Chamber...
        </h1>
      </main>
    );
  }

  if (!chamber) {
    return (
      <main className="h-screen bg-slate-950 flex items-center justify-center">
        <h1 className="text-2xl font-bold text-white">
          Chamber not found.
        </h1>
      </main>
    );
  }

  return (
    <main className="h-screen overflow-hidden bg-slate-950 flex">

      {/* Sidebar */}

      <Sidebar />

      {/* Right Side */}

      <section className="flex-1 flex flex-col overflow-hidden">

        {/* Top Bar */}

        <Topbar />

        {/* Chat Workspace */}

        <div className="flex-1 overflow-hidden p-6 bg-slate-900">

          <div className="h-full rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden flex flex-col">

            {/* Chamber Header */}

            <div className="border-b border-slate-800 px-8 py-6">

              <h1 className="text-3xl font-bold text-white">
                {chamber.chamber_name}
              </h1>

              <p className="mt-2 text-slate-400">
                {chamber.description}
              </p>

            </div>

            {/* Chat */}

            <div className="flex-1 overflow-hidden">

              <Chat chamberId={chamber.id} />

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}