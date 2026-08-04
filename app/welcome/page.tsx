"use client";

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  Building2,
  KeyRound,
  Globe2,
  UserCircle2,
  LogOut,
  ArrowRight,
} from "lucide-react";

export default function WelcomePage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("User");
  const [greeting, setGreeting] = useState("Good Morning");

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const fullName =
        user.user_metadata?.full_name ||
        user.user_metadata?.fullName ||
        "User";

      // Show only first name
      setFirstName(fullName.split(" ")[0]);

      // Greeting based on time
      const hour = new Date().getHours();

      if (hour < 12) {
        setGreeting("Good Morning");
      } else if (hour < 17) {
        setGreeting("Good Afternoon");
      } else {
        setGreeting("Good Evening");
      }
    }

    loadUser();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-gray-950">

      {/* Background Glow */}

      <div className="absolute -top-40 -right-40 h-[420px] w-[420px] rounded-full bg-blue-500/20 blur-3xl"></div>

      <div className="absolute bottom-0 -left-40 h-[420px] w-[420px] rounded-full bg-indigo-500/20 blur-3xl"></div>

      {/* ================= HEADER ================= */}

      <header className="relative border-b border-white/20 bg-white/70 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/70">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">

          <div>

            <h1 className="text-3xl font-extrabold tracking-wide text-gray-900 dark:text-white">
              CHAMBER
            </h1>

            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Secure Collaboration Workspace
            </p>

          </div>

          <div className="flex items-center gap-5">

            <div className="flex items-center gap-3">

              <UserCircle2 className="h-11 w-11 text-blue-600" />

              <div>

                <p className="font-semibold text-gray-900 dark:text-white">
                  {firstName}
                </p>

                <p className="text-sm text-emerald-600">
                  ● Online
                </p>

              </div>

            </div>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white shadow-lg transition hover:bg-red-700"
            >
              <LogOut size={18} />
              Sign Out
            </button>

          </div>

        </div>

      </header>

      {/* ================= MAIN ================= */}

      <div className="relative mx-auto max-w-7xl px-8 py-14">

        <div className="mb-12">

          <h2 className="text-5xl font-extrabold text-gray-900 dark:text-white">
            {greeting}, {firstName} 👋
          </h2>

          <p className="mt-4 max-w-2xl text-xl text-gray-600 dark:text-gray-400">
            Manage your organizations, collaborate securely and build amazing
            communities with Chamber.
          </p>

        </div>

        {/* ================= ACTION CARDS ================= */}

        <div className="grid gap-8 md:grid-cols-3">

          {/* CREATE */}

          <Link href="/create">

            <div className="group cursor-pointer rounded-3xl border border-white/40 bg-white/80 p-8 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-blue-300 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-900/80">

              <Building2 className="mb-6 h-14 w-14 text-blue-600 transition group-hover:scale-110" />

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Create Chamber
              </h3>

              <p className="mt-3 text-gray-600 dark:text-gray-400">
                Create a secure collaboration space for your organization.
              </p>

              <div className="mt-8 flex items-center font-semibold text-blue-600">
                Open
                <ArrowRight className="ml-2 h-5 w-5" />
              </div>

            </div>

          </Link>

          {/* JOIN */}

          <Link href="/join">

            <div className="group cursor-pointer rounded-3xl border border-white/40 bg-white/80 p-8 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-emerald-300 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-900/80">

              <KeyRound className="mb-6 h-14 w-14 text-emerald-600 transition group-hover:scale-110" />

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Join Chamber
              </h3>

              <p className="mt-3 text-gray-600 dark:text-gray-400">
                Join an existing organization using a Chamber Code.
              </p>

              <div className="mt-8 flex items-center font-semibold text-emerald-600">
                Open
                <ArrowRight className="ml-2 h-5 w-5" />
              </div>

            </div>

          </Link>
                    {/* BROWSE */}

          <Link href="/browse">

            <div className="group cursor-pointer rounded-3xl border border-white/40 bg-white/80 p-8 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-indigo-300 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-900/80">

              <Globe2 className="mb-6 h-14 w-14 text-indigo-600 transition group-hover:scale-110" />

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Browse Chambers
              </h3>

              <p className="mt-3 text-gray-600 dark:text-gray-400">
                Discover public organizations available on Chamber.
              </p>

              <div className="mt-8 flex items-center font-semibold text-indigo-600">
                Open
                <ArrowRight className="ml-2 h-5 w-5" />
              </div>

            </div>

          </Link>

        </div>

        {/* ================= MY CHAMBERS ================= */}

        <section className="mt-20">

          <div className="mb-6 flex items-center justify-between">

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Chambers
            </h2>

            <Link
              href="/create"
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              + Create Chamber
            </Link>

          </div>

          <div className="rounded-3xl border border-white/40 bg-white/80 p-10 shadow-xl backdrop-blur-xl dark:border-gray-700 dark:bg-gray-900/80">

            <Building2 className="mb-5 h-14 w-14 text-blue-500" />

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              No Chambers Yet
            </h3>

            <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
              Create your first Chamber or join an existing one to start collaborating.
            </p>

          </div>

        </section>

        {/* ================= RECENT ACTIVITY ================= */}

        <section className="mt-16">

          <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
            Recent Activity
          </h2>

          <div className="rounded-3xl border border-white/40 bg-white/80 p-10 shadow-xl backdrop-blur-xl dark:border-gray-700 dark:bg-gray-900/80">

            <p className="text-lg text-gray-500 dark:text-gray-400">
              Nothing to show yet. Activity from your Chambers will appear here.
            </p>

          </div>

        </section>

      </div>

      {/* ================= FOOTER ================= */}

      <footer className="relative mt-20 border-t border-white/20 bg-white/70 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/70">

        <div className="mx-auto max-w-7xl px-8 py-12">

          <div className="grid gap-10 md:grid-cols-3">

            <div>

              <h2 className="text-3xl font-extrabold tracking-widest text-gray-900 dark:text-white">
                RIO LAB
              </h2>

              <p className="mt-4 leading-7 text-gray-600 dark:text-gray-400">
                Building purposeful software that helps organizations
                communicate, collaborate and improve productivity.
              </p>

            </div>

            <div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Quick Links
              </h3>

              <div className="mt-5 space-y-3">

                <Link
                  href="/create"
                  className="block text-gray-600 transition hover:text-blue-600 dark:text-gray-400"
                >
                  Create Chamber
                </Link>

                <Link
                  href="/join"
                  className="block text-gray-600 transition hover:text-blue-600 dark:text-gray-400"
                >
                  Join Chamber
                </Link>

                <Link
                  href="/browse"
                  className="block text-gray-600 transition hover:text-blue-600 dark:text-gray-400"
                >
                  Browse Chambers
                </Link>

              </div>

            </div>

            <div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Developers
              </h3>

              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Learn more about RIO LAB, our mission, vision and future software products.
              </p>

              <Link
                href="/about-rio-lab"
                className="mt-5 inline-flex items-center font-semibold text-blue-600 hover:underline"
              >
                Learn about the developers →
              </Link>

            </div>

          </div>

          <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-700">

            <p className="text-center text-sm text-gray-500">
              Version 0.1 Alpha • © 2026 RIO LAB. All rights reserved.
            </p>

          </div>

        </div>

      </footer>

    </main>
  );
}