"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Chamber = {
  id: string;
  chamber_name: string;
  description: string | null;
};

export default function MyChambers() {
  const router = useRouter();

  const [chambers, setChambers] = useState<Chamber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMyChambers();
  }, []);

  async function loadMyChambers() {
    try {
      setLoading(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("GET USER ERROR:", userError);
        setError("Unable to load your Chambers.");
        return;
      }

      if (!user) {
        setChambers([]);
        return;
      }

      const {
        data,
        error: chambersError,
      } = await supabase.rpc("get_my_chambers");

      if (chambersError) {
        console.error(
          "GET MY CHAMBERS ERROR:",
          chambersError
        );

        setError("Unable to load your Chambers.");
        return;
      }

      setChambers(data || []);
    } catch (err) {
      console.error("MY CHAMBERS ERROR:", err);

      setError(
        "Something went wrong while loading your Chambers."
      );
    } finally {
      setLoading(false);
    }
  }

  function openChamber(chamberId: string) {
    router.push(`/chamber/${chamberId}`);
  }

  return (
    <section className="w-full">
      {/* Section heading */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-xl">
            🏛️
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              My Chambers
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Chambers you already belong to.
            </p>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />

          <p className="mt-4 text-sm text-slate-400">
            Loading your Chambers...
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-2xl border border-red-900/50 bg-red-950/20 p-6">
          <p className="text-sm text-red-300">
            {error}
          </p>

          <button
            type="button"
            onClick={loadMyChambers}
            className="mt-4 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* No Chambers */}
      {!loading &&
        !error &&
        chambers.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-2xl">
              🏛️
            </div>

            <h3 className="mt-5 text-lg font-semibold text-white">
              No Chambers yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
              You don't belong to any Chamber yet.
              Create a Chamber, join one, or browse
              existing Chambers to get started.
            </p>
          </div>
        )}

      {/* My Chambers */}
      {!loading &&
        !error &&
        chambers.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {chambers.map((chamber) => (
              <button
                key={chamber.id}
                type="button"
                onClick={() =>
                  openChamber(chamber.id)
                }
                className="group text-left"
              >
                <div className="h-full rounded-2xl border border-slate-800 bg-slate-900 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:bg-slate-800">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-xl">
                      🏛️
                    </div>

                    <span className="text-xl text-slate-600 transition group-hover:translate-x-1 group-hover:text-blue-400">
                      →
                    </span>
                  </div>

                  <h3 className="mt-5 line-clamp-2 text-lg font-bold text-white">
                    {chamber.chamber_name}
                  </h3>

                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">
                    {chamber.description ||
                      "No description provided for this Chamber."}
                  </p>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
                    <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      Already a member
                    </span>

                    <span className="text-sm font-semibold text-blue-400 transition group-hover:text-blue-300">
                      Open →
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
    </section>
  );
}