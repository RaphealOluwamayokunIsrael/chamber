"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

import {
  Search,
  Users,
  Globe,
  Building2,
  ArrowRight,
} from "lucide-react";

interface Chamber {
  id: string;
  chamber_name: string;
  description: string;
  organization: string;
  division: string;
  category: string;
  visibility: string;
}

export default function BrowsePage() {
  const [chambers, setChambers] = useState<Chamber[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchChambers();
  }, []);

  async function fetchChambers() {
    setLoading(true);

    const { data, error } = await supabase
      .from("chambers")
      .select("*")
      .eq("visibility", "public")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(error);
    } else {
      setChambers(data || []);
    }

    setLoading(false);
  }

  const filteredChambers = useMemo(() => {
    return chambers.filter((chamber) => {
      const query = search.toLowerCase();

      return (
        chamber.chamber_name
          .toLowerCase()
          .includes(query) ||
        chamber.organization
          .toLowerCase()
          .includes(query) ||
        chamber.category
          .toLowerCase()
          .includes(query) ||
        chamber.description
          .toLowerCase()
          .includes(query)
      );
    });
  }, [search, chambers]);

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950">

      {/* Header */}

      <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">

        <div className="mx-auto max-w-7xl px-6 py-14">

          <h1 className="text-5xl font-extrabold text-slate-900 dark:text-white">
            Browse Public Chambers
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
            Discover organizations, communities,
            churches, companies and universities
            available on Chamber.
          </p>

          <div className="relative mt-10 max-w-2xl">

            <Search
              className="absolute left-5 top-4 text-slate-400"
              size={20}
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search Chambers..."
              className="w-full rounded-2xl border border-slate-300 bg-white py-4 pl-14 pr-6 text-lg outline-none transition focus:border-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />

          </div>

        </div>

      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
              {loading ? (

          <div className="flex justify-center py-20">

            <p className="text-xl text-slate-500">
              Loading Public Chambers...
            </p>

          </div>

        ) : filteredChambers.length === 0 ? (

          <div className="rounded-3xl bg-white p-16 text-center shadow-xl dark:bg-slate-900">

            <Building2
              size={60}
              className="mx-auto text-blue-600"
            />

            <h2 className="mt-8 text-3xl font-bold text-slate-900 dark:text-white">
              No Public Chambers Found
            </h2>

            <p className="mt-4 text-slate-500">
              Try another search or create the first
              public Chamber.
            </p>

            <Link
              href="/create"
              className="mt-10 inline-flex rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white transition hover:bg-blue-700"
            >
              Create Chamber
            </Link>

          </div>

        ) : (

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">

            {filteredChambers.map((chamber) => (

              <div
                key={chamber.id}
                className="rounded-3xl bg-white p-8 shadow-xl transition duration-300 hover:-translate-y-2 hover:shadow-2xl dark:bg-slate-900"
              >

                <div className="flex items-center justify-between">

                  <Building2
                    className="text-blue-600"
                    size={40}
                  />

                  <div className="flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700 dark:bg-green-900 dark:text-green-300">

                    <Globe size={16} />

                    Public

                  </div>

                </div>

                <h2 className="mt-8 text-2xl font-bold text-slate-900 dark:text-white">

                  {chamber.chamber_name}

                </h2>

                <p className="mt-4 line-clamp-3 text-slate-600 dark:text-slate-400">

                  {chamber.description}

                </p>

                <div className="mt-8 space-y-3 text-sm">

                  <p>

                    <strong>Organization:</strong>{" "}

                    {chamber.organization}

                  </p>

                  <p>

                    <strong>Division:</strong>{" "}

                    {chamber.division}

                  </p>

                  <p>

                    <strong>Category:</strong>{" "}

                    {chamber.category}

                  </p>

                </div>

                <div className="mt-8 flex items-center gap-2 text-slate-500">

                  <Users size={18} />

                  <span>Members Coming Soon</span>

                </div>
                                <div className="mt-10 flex gap-4">

                  <Link
                    href={`/browse/${chamber.id}`}
                    className="flex flex-1 items-center justify-center rounded-xl border border-blue-600 py-3 font-semibold text-blue-600 transition hover:bg-blue-600 hover:text-white"
                  >
                    View
                  </Link>

                  <Link
                    href={`/join?id=${chamber.id}`}
                    className="flex flex-1 items-center justify-center rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
                  >
                    Join

                    <ArrowRight
                      size={18}
                      className="ml-2"
                    />

                  </Link>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>
            <footer className="mt-20 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-10 md:flex-row">

          <div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Chamber
            </h2>

            <p className="mt-2 text-slate-500">
              Where Organizations Work Together.
            </p>

          </div>

          <div className="text-center text-sm text-slate-500 md:text-right">

            <p>Built by RIO LAB</p>

            <p className="mt-1">
              Version 0.1 Alpha
            </p>

          </div>

        </div>

      </footer>

    </main>
  );
}