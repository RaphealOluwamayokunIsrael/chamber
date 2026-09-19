"use client";

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  Building2,
  KeyRound,
  Globe2,
  UserCircle2,
  LogOut,
  ArrowRight,
  Clock3,
  CalendarDays,
  Plus,
} from "lucide-react";

type Chamber = {
  id: string;
  chamber_name: string;
  description: string | null;
  created_at?: string;
};

/* =========================
   REVEAL ANIMATION
========================= */

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -5% 0px",
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-10 opacity-0"
      } ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function WelcomePage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("User");
  const [greeting, setGreeting] = useState("Good Morning");

  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  const [chambers, setChambers] = useState<Chamber[]>([]);
  const [loadingChambers, setLoadingChambers] = useState(true);

  /* =========================
     LIVE DATE & TIME
  ========================= */

  useEffect(() => {
    function updateDateTime() {
      const now = new Date();
      const hour = now.getHours();

      if (hour < 12) {
        setGreeting("Good Morning");
      } else if (hour < 17) {
        setGreeting("Good Afternoon");
      } else {
        setGreeting("Good Evening");
      }

      setCurrentTime(
        now.toLocaleTimeString("en-NG", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );

      setCurrentDate(
        now.toLocaleDateString("en-NG", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      );
    }

    updateDateTime();

    const interval = setInterval(updateDateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  /* =========================
     LOAD USER + MY CHAMBERS
  ========================= */

  useEffect(() => {
    async function loadUserAndChambers() {
      setLoadingChambers(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const fullName =
        user.user_metadata?.full_name ||
        user.user_metadata?.fullName ||
        "User";

      setFirstName(fullName.split(" ")[0]);

      /* =========================
         GET USER'S CHAMBER MEMBERSHIPS
      ========================= */

      const { data: memberships, error: membershipError } =
        await supabase
          .from("members")
          .select("chamber_id")
          .eq("user_id", user.id);

      if (membershipError) {
        console.error(
          "Error loading Chamber memberships:",
          membershipError
        );

        setChambers([]);
        setLoadingChambers(false);
        return;
      }

      const chamberIds =
        memberships?.map((membership) => membership.chamber_id) || [];

      if (chamberIds.length === 0) {
        setChambers([]);
        setLoadingChambers(false);
        return;
      }

      /* =========================
         GET MY CHAMBERS
      ========================= */

      const { data: chamberData, error: chamberError } =
        await supabase
          .from("chambers")
          .select("id, chamber_name, description, created_at")
          .in("id", chamberIds)
          .order("created_at", { ascending: false });

      if (chamberError) {
        console.error(
          "Error loading Chambers:",
          chamberError
        );

        setChambers([]);
        setLoadingChambers(false);
        return;
      }

      /* =========================
         SHOW ALL MY CHAMBERS
      ========================= */

      setChambers(chamberData || []);

      setLoadingChambers(false);
    }

    loadUserAndChambers();
  }, [router]);

  /* =========================
     SIGN OUT
  ========================= */

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  /* =========================
     SCROLL TO MY CHAMBERS
  ========================= */

  function scrollToMyChambers() {
    document
      .getElementById("my-chambers")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-gray-950">

      {/* ================= BACKGROUND GLOW ================= */}

      <div className="absolute -top-40 -right-40 h-[420px] w-[420px] rounded-full bg-blue-500/20 blur-3xl" />

      <div className="absolute bottom-0 -left-40 h-[420px] w-[420px] rounded-full bg-indigo-500/20 blur-3xl" />

      {/* ================= HEADER ================= */}

      <Reveal>
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
      </Reveal>

      {/* ================= MAIN ================= */}

      <div className="relative mx-auto max-w-7xl px-8 py-14">

        {/* ================= WELCOME + CLOCK ================= */}

        <Reveal className="mb-12">

          <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-center">

            <div>

              <h2 className="text-5xl font-extrabold text-gray-900 dark:text-white">
                {greeting}, {firstName} 👋
              </h2>

              <p className="mt-4 max-w-2xl text-xl text-gray-600 dark:text-gray-400">
                Manage your organizations, collaborate securely and build
                amazing communities with Chamber.
              </p>

            </div>

            {/* ================= DATE & TIME ================= */}

            <div className="rounded-3xl border border-white/40 bg-white/80 p-7 shadow-xl backdrop-blur-xl dark:border-gray-700 dark:bg-gray-900/80">

              <div className="flex items-center gap-3 text-blue-600">

                <Clock3 className="h-6 w-6" />

                <span className="font-semibold">
                  Current Time
                </span>

              </div>

              <p className="mt-3 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                {currentTime}
              </p>

              <div className="mt-4 flex items-center gap-2 text-gray-600 dark:text-gray-400">

                <CalendarDays className="h-5 w-5" />

                <span className="text-sm">
                  {currentDate}
                </span>

              </div>

            </div>

          </div>

        </Reveal>

        {/* ================= ACTION CARDS ================= */}

        <Reveal className="mb-20">

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">

            {/* ================= CREATE ================= */}

            <Link href="/create">

              <div className="group h-full cursor-pointer rounded-3xl border border-white/40 bg-white/80 p-8 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-blue-300 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-900/80">

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

            {/* ================= JOIN ================= */}

            <Link href="/join">

              <div className="group h-full cursor-pointer rounded-3xl border border-white/40 bg-white/80 p-8 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-emerald-300 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-900/80">

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

            {/* ================= BROWSE ================= */}

            <Link href="/browse">

              <div className="group h-full cursor-pointer rounded-3xl border border-white/40 bg-white/80 p-8 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-indigo-300 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-900/80">

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

            {/* ================= MY CHAMBERS ================= */}

            <button
              type="button"
              onClick={scrollToMyChambers}
              className="group h-full text-left"
            >

              <div className="h-full cursor-pointer rounded-3xl border border-white/40 bg-white/80 p-8 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-purple-300 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-900/80">

                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-900/30">

                  <Building2 className="h-8 w-8 text-purple-600 dark:text-purple-400 transition group-hover:scale-110" />

                </div>

                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  My Chambers
                </h3>

                <p className="mt-3 text-gray-600 dark:text-gray-400">
                  Open and manage the organizations you already belong to.
                </p>

                <div className="mt-8 flex items-center font-semibold text-purple-600">
                  View Chambers
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </div>

              </div>

            </button>

          </div>

        </Reveal>

        {/* ================= MY CHAMBERS ================= */}

        <Reveal>

          <section
            id="my-chambers"
            className="scroll-mt-8"
          >

            <div className="mb-6 flex items-center justify-between">

              <div>

                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  My Chambers
                </h2>

                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  Your organizations and collaboration spaces
                </p>

              </div>

              <Link
                href="/create"
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                <Plus size={18} />
                Create Chamber
              </Link>

            </div>

            {/* ================= LOADING ================= */}

            {loadingChambers ? (

              <div className="rounded-3xl border border-white/40 bg-white/80 p-10 text-center shadow-xl backdrop-blur-xl dark:border-gray-700 dark:bg-gray-900/80">

                <p className="text-lg text-gray-500 dark:text-gray-400">
                  Loading your Chambers...
                </p>

              </div>

            ) : chambers.length === 0 ? (

              /* ================= NO CHAMBERS ================= */

              <div className="rounded-3xl border border-white/40 bg-white/80 p-10 text-center shadow-xl backdrop-blur-xl dark:border-gray-700 dark:bg-gray-900/80">

                <Building2 className="mx-auto mb-5 h-14 w-14 text-blue-500" />

                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  No Chambers Yet
                </h3>

                <p className="mx-auto mt-3 max-w-xl text-lg text-gray-600 dark:text-gray-400">
                  Create your first Chamber or join an existing one to start
                  collaborating.
                </p>

                <div className="mt-7 flex justify-center gap-4">

                  <Link
                    href="/create"
                    className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
                  >
                    Create Chamber
                  </Link>

                  <Link
                    href="/join"
                    className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    Join Chamber
                  </Link>

                </div>

              </div>

            ) : (

              /* ================= ALL MY CHAMBERS ================= */

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

                {chambers.map((chamber, index) => (

                  <Reveal
                    key={chamber.id}
                    delay={index * 100}
                  >

                    <Link
                      href={`/chamber/${chamber.id}`}
                      className="group block h-full"
                    >

                      <div className="h-full rounded-3xl border border-white/40 bg-white/80 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-blue-300 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-900/80">

                        {/* Chamber Icon */}

                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30">

                          <Building2 className="h-7 w-7 text-blue-600 dark:text-blue-400" />

                        </div>

                        {/* Name */}

                        <h3 className="line-clamp-2 text-xl font-bold text-gray-900 dark:text-white">
                          {chamber.chamber_name}
                        </h3>

                        {/* Description */}

                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
                          {chamber.description ||
                            "A secure collaboration space on Chamber."}
                        </p>

                        {/* Open */}

                        <div className="mt-6 flex items-center font-semibold text-blue-600">

                          Open Chamber

                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />

                        </div>

                      </div>

                    </Link>

                  </Reveal>

                ))}

              </div>

            )}

          </section>

        </Reveal>

        {/* ================= RECENT ACTIVITY ================= */}

        <Reveal>

          <section className="mt-16">

            <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
              Recent Activity
            </h2>

            <div className="rounded-3xl border border-white/40 bg-white/80 p-10 shadow-xl backdrop-blur-xl dark:border-gray-700 dark:bg-gray-900/80">

              <p className="text-lg text-gray-500 dark:text-gray-400">
                Activity from your Chambers will appear here.
              </p>

            </div>

          </section>

        </Reveal>

      </div>

      {/* ================= FOOTER ================= */}

      <Reveal>

        <footer className="relative mt-20 border-t border-white/20 bg-white/70 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/70">

          <div className="mx-auto max-w-7xl px-8 py-12">

            <div className="grid gap-10 md:grid-cols-3">

              {/* ================= RIO LAB ================= */}

              <div>

                <h2 className="text-3xl font-extrabold tracking-widest text-gray-900 dark:text-white">
                  RIO LAB
                </h2>

                <p className="mt-4 leading-7 text-gray-600 dark:text-gray-400">
                  Building purposeful software that helps organizations
                  communicate, collaborate and improve productivity.
                </p>

              </div>

              {/* ================= QUICK LINKS ================= */}

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

                  <button
                    type="button"
                    onClick={scrollToMyChambers}
                    className="block text-left text-gray-600 transition hover:text-blue-600 dark:text-gray-400"
                  >
                    My Chambers
                  </button>

                </div>

              </div>

              {/* ================= DEVELOPERS ================= */}

              <div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Developers
                </h3>

                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Learn more about RIO LAB, our mission, vision and future
                  software products.
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

      </Reveal>

    </main>
  );
}