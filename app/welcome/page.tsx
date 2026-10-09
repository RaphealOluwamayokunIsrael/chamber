
"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  ChevronRight,
  Clock3,
  Compass,
  LogOut,
  Plus,
  ShieldCheck,
  Users,
} from "lucide-react";

type Chamber = {
  id: string;
  chamber_name: string;
  description: string | null;
  created_at?: string;
};

const ICON_PATH = "/chamber-icon.svg.png";

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.08 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
      } ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

function BrandMark({ size = 44 }: { size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50"
      style={{ width: size, height: size }}
    >
      <Image
        src={ICON_PATH}
        alt="Chamber logo"
        width={size - 10}
        height={size - 10}
        className="object-contain"
        unoptimized
      />
    </span>
  );
}

function ActionCard({
  href,
  onClick,
  icon,
  title,
  description,
  action,
  featured = false,
}: {
  href?: string;
  onClick?: () => void;
  icon: ReactNode;
  title: string;
  description: string;
  action: string;
  featured?: boolean;
}) {
  const styles = `group flex h-full flex-col rounded-2xl border p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
    featured
      ? "border-[#173c72] bg-gradient-to-br from-[#164b88] to-[#102b56] text-white"
      : "border-[#e5eaf1] bg-white text-[#152844] hover:border-blue-200"
  }`;

  const content = (
    <>
      <div
        className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${
          featured ? "bg-white/15" : "bg-blue-50 text-blue-600"
        }`}
      >
        {icon}
      </div>

      <h3 className="text-lg font-semibold">{title}</h3>

      <p
        className={`mt-2 flex-1 text-sm leading-relaxed ${
          featured ? "text-blue-100" : "text-slate-500"
        }`}
      >
        {description}
      </p>

      <div
        className={`mt-6 flex items-center justify-between border-t pt-4 text-sm font-semibold ${
          featured
            ? "border-white/20 text-white"
            : "border-slate-100 text-blue-600"
        }`}
      >
        <span>{action}</span>
        <ArrowRight
          size={17}
          className="transition-transform group-hover:translate-x-1"
        />
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={styles}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={styles}>
      {content}
    </button>
  );
}

function ChamberCard({
  chamber,
  index,
}: {
  chamber: Chamber;
  index: number;
}) {
  const initials = chamber.chamber_name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || "")
    .join("");

  const colors = [
    "bg-blue-50 text-blue-600",
    "bg-emerald-50 text-emerald-600",
    "bg-amber-50 text-amber-600",
    "bg-violet-50 text-violet-600",
  ];

  return (
    <Reveal delay={index * 60} className="h-full">
      <Link
        href={`/chamber/${chamber.id}`}
        className="group flex h-full flex-col rounded-2xl border border-[#e5eaf1] bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold ${
              colors[index % colors.length]
            }`}
          >
            {initials || <Building2 size={22} />}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate font-serif text-lg font-semibold text-[#142743]">
              {chamber.chamber_name}
            </h3>

            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-500">
              {chamber.description ||
                "A dedicated space to connect, organize and collaborate."}
            </p>
          </div>

          <ArrowUpRight
            size={18}
            className="shrink-0 text-blue-600 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
          />
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="flex items-center gap-2 text-xs text-slate-500">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            Workspace
          </span>

          <span className="flex items-center gap-1 text-sm font-semibold text-blue-600">
            Enter <ChevronRight size={15} />
          </span>
        </div>
      </Link>
    </Reveal>
  );
}

export default function WelcomePage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("User");
  const [greeting, setGreeting] = useState("Welcome");
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [chambers, setChambers] = useState<Chamber[]>([]);
  const [loadingChambers, setLoadingChambers] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const hour = now.getHours();

      setGreeting(
        hour < 12
          ? "Good morning"
          : hour < 17
          ? "Good afternoon"
          : "Good evening"
      );

      setCurrentTime(
        now.toLocaleTimeString("en-NG", {
          hour: "2-digit",
          minute: "2-digit",
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
    };

    updateDateTime();

    const interval = window.setInterval(updateDateTime, 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadWorkspace() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (cancelled) return;

        if (authError || !user) {
          router.replace("/login");
          return;
        }

        const metadata = user.user_metadata || {};
        const fullName =
          metadata.full_name ||
          metadata.fullName ||
          user.email?.split("@")[0] ||
          "User";

        setFirstName(String(fullName).trim().split(/\s+/)[0]);

        const { data: memberships, error: membershipError } =
          await supabase
            .from("members")
            .select("chamber_id")
            .eq("user_id", user.id);

        if (membershipError) throw membershipError;
        if (cancelled) return;

        const chamberIds = [
          ...new Set(
            (memberships || [])
              .map((member) => member.chamber_id)
              .filter((id): id is string => Boolean(id))
          ),
        ];

        if (chamberIds.length === 0) {
          setChambers([]);
          return;
        }

        const { data: chamberData, error: chamberError } =
          await supabase
            .from("chambers")
            .select("id, chamber_name, description, created_at")
            .in("id", chamberIds)
            .order("created_at", { ascending: false });

        if (chamberError) throw chamberError;

        if (!cancelled) {
          setChambers((chamberData || []) as Chamber[]);
        }
      } catch (error) {
        console.error("Failed to load workspace:", error);

        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoadingChambers(false);
      }
    }

    loadWorkspace();

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSignOut() {
    if (signingOut) return;

    setSigningOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Sign out failed:", error);
      setSigningOut(false);
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  function scrollToChambers() {
    document
      .getElementById("my-chambers")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="min-h-screen bg-[#f8f9fb] text-[#152844]">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-[#e6eaf0] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/welcome" className="flex items-center gap-3">
            <BrandMark />

            <div>
              <p className="font-serif text-xl font-bold tracking-tight">
                Chamber
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Your Workspace
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3 sm:gap-5">
            <span className="hidden items-center gap-2 text-xs text-slate-500 sm:flex">
              <ShieldCheck size={16} className="text-blue-600" />
              Secure workspace
            </span>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#153e70] text-sm font-bold text-white">
              {firstName[0]?.toUpperCase() || "U"}
            </div>

            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">
                {signingOut ? "Signing out..." : "Sign out"}
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 pb-12 pt-8 sm:px-8">
        {/* WELCOME BANNER */}
        <Reveal>
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#10243f] via-[#123a68] to-[#0b55a5] p-7 text-white shadow-xl sm:p-10">
            <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute bottom-[-90px] right-32 h-56 w-56 rounded-full border border-white/10" />

            <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
                  Welcome to your workspace
                </p>

                <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-5xl">
                  {greeting}, {firstName}.
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-7 text-blue-100 sm:text-base">
                  Your space to organize ideas, build meaningful
                  connections, and bring people together.
                  Everything starts here.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href="/create"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#087bfa] px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-blue-500"
                  >
                    <Plus size={18} />
                    Create Chamber
                  </Link>

                  <button
                    onClick={scrollToChambers}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/20"
                  >
                    My Chambers
                    <ArrowRight size={17} />
                  </button>
                </div>
              </div>

              <div className="relative flex min-w-[220px] flex-col items-center rounded-2xl border border-white/20 bg-white/10 p-6 text-center backdrop-blur-sm">
                <Clock3 size={23} className="mb-3 text-blue-200" />

                <p className="text-xs uppercase tracking-widest text-blue-100">
                  Local Time
                </p>

                <p className="mt-2 text-3xl font-semibold tabular-nums">
                  {currentTime || "--:--"}
                </p>

                <p className="mt-2 text-xs text-blue-100">
                  {currentDate || "Loading date..."}
                </p>
              </div>
            </div>
          </section>
        </Reveal>

        {/* WORKSPACE SUMMARY */}
        <section className="mt-7 grid gap-4 sm:grid-cols-3">
          <Reveal delay={60}>
            <div className="rounded-2xl border border-[#e5eaf1] bg-white p-5">
              <p className="text-xs font-medium text-slate-500">
                Total Chambers
              </p>
              <p className="mt-2 text-3xl font-bold text-[#153e70]">
                {loadingChambers ? "—" : chambers.length}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Your active workspaces
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="rounded-2xl border border-[#e5eaf1] bg-white p-5">
              <p className="text-xs font-medium text-slate-500">
                Connection
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-lg font-semibold text-[#153e70]">
                  Connected
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Your Chamber workspace
              </p>
            </div>
          </Reveal>

          <Reveal delay={180}>
            <Link
              href="/browse"
              className="group block rounded-2xl border border-[#e5eaf1] bg-white p-5 transition-all hover:border-blue-200 hover:shadow-md"
            >
              <p className="text-xs font-medium text-slate-500">
                Discover
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-lg font-semibold text-[#153e70]">
                  Explore Chambers
                </span>
                <ArrowUpRight
                  size={19}
                  className="text-blue-600 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Find communities and opportunities
              </p>
            </Link>
          </Reveal>
        </section>

        {/* QUICK ACTIONS */}
        <Reveal>
          <div className="mb-5 mt-12">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
              Get started
            </p>
            <h2 className="mt-2 font-serif text-2xl font-semibold text-[#142743] sm:text-3xl">
              What would you like to do?
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Everything you need to make your next move.
            </p>
          </div>
        </Reveal>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Reveal delay={60} className="h-full">
            <ActionCard
              href="/create"
              icon={<Plus size={23} />}
              title="Create a Chamber"
              description="Start a new workspace and bring your people together."
              action="Create now"
              featured
            />
          </Reveal>

          <Reveal delay={120} className="h-full">
            <ActionCard
              href="/join"
              icon={<Users size={23} />}
              title="Join a Chamber"
              description="Connect with an existing team or community."
              action="Join now"
            />
          </Reveal>

          <Reveal delay={180} className="h-full">
            <ActionCard
              href="/browse"
              icon={<Compass size={23} />}
              title="Discover"
              description="Explore new Chambers and find where you belong."
              action="Explore"
            />
          </Reveal>

          <Reveal delay={240} className="h-full">
            <ActionCard
              onClick={scrollToChambers}
              icon={<Building2 size={23} />}
              title="My Chambers"
              description="Return to the spaces you are already part of."
              action="View workspaces"
            />
          </Reveal>
        </section>

        {/* MY CHAMBERS */}
        <section id="my-chambers" className="scroll-mt-28 pt-14">
          <Reveal>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                  Your spaces
                </p>
                <h2 className="mt-2 font-serif text-2xl font-semibold text-[#142743] sm:text-3xl">
                  My Chambers
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Pick up where you left off.
                </p>
              </div>

              <Link
                href="/browse"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline"
              >
                Browse Chambers <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>

          {loadingChambers ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <div className="h-11 w-11 rounded-xl bg-slate-100" />
                  <div className="mt-4 h-4 w-2/3 rounded bg-slate-100" />
                  <div className="mt-3 h-3 w-full rounded bg-slate-100" />
                </div>
              ))}
            </div>
          ) : loadError ? (
            <div className="rounded-2xl border border-red-100 bg-white p-10 text-center">
              <h3 className="font-semibold text-[#142743]">
                Unable to load your Chambers
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Please refresh the page and try again.
              </p>
            </div>
          ) : chambers.length === 0 ? (
            <Reveal>
              <div className="rounded-2xl border border-dashed border-blue-200 bg-white px-6 py-14 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Building2 size={30} />
                </div>

                <h3 className="mt-5 font-serif text-xl font-semibold text-[#142743]">
                  Your journey starts here
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
                  You are not part of any Chamber yet. Create your
                  first workspace or join an existing one.
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link
                    href="/create"
                    className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    Create Chamber
                  </Link>

                  <Link
                    href="/join"
                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-[#153e70] transition-colors hover:bg-slate-50"
                  >
                    Join Chamber
                  </Link>
                </div>
              </div>
            </Reveal>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {chambers.map((chamber, index) => (
                <ChamberCard
                  key={chamber.id}
                  chamber={chamber}
                  index={index}
                />
              ))}
            </div>
          )}
        </section>

        {/* ACTIVITY */}
        <Reveal>
          <section className="mt-14">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                Stay informed
              </p>
              <h2 className="mt-2 font-serif text-2xl font-semibold text-[#142743]">
                Recent Activity
              </h2>
            </div>

            <div className="flex flex-col items-center justify-center rounded-2xl border border-[#e5eaf1] bg-white px-6 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Clock3 size={25} />
              </div>

              <h3 className="mt-4 font-semibold text-[#142743]">
                Your activity, all in one place
              </h3>

              <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
                Updates from your Chambers will appear here when
                the activity feature becomes available.
              </p>

              <span className="mt-4 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-600">
                Coming soon
              </span>
            </div>
          </section>
        </Reveal>

        {/* CLOSING SECTION */}
        <Reveal>
          <section className="mt-12 flex flex-col items-start justify-between gap-5 rounded-2xl border border-blue-100 bg-[#eef5ff] p-7 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-serif text-xl font-semibold text-[#153e70]">
                Great things begin with connection.
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                Bring your community together in one organized space.
              </p>
            </div>

            <Link
              href="/create"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#087bfa] px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-blue-700"
            >
              Get Started <ArrowRight size={17} />
            </Link>
          </section>
        </Reveal>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-[#e5eaf1] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-6 text-center sm:flex-row sm:px-8 sm:text-left">
          <div className="flex items-center gap-3">
            <BrandMark size={34} />

            <div>
              <p className="text-sm font-bold text-[#153e70]">
                Chamber
              </p>
              <p className="text-xs text-slate-400">
                Where Organization Meets Focus.
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-500">
            Built by{" "}
            <Link
              href="/about-rio-lab"
              className="font-semibold text-blue-600 hover:underline"
            >
              RIO LAB
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
