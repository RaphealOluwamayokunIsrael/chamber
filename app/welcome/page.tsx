"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, LayoutGroup } from "motion/react";
import { supabase } from "@/lib/supabase";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  Bot,
  Building2,
  ChevronRight,
  Compass,
  FolderPlus,
  LogIn,
  LogOut,
  MessageCircle,
  Plus,
  Users,
  Clock3,
  Sparkles,
} from "lucide-react";

type Chamber = {
  id: string;
  chamber_name: string;
  description: string | null;
  created_at?: string;
};

type Section =
  | "CREATE & JOIN"
  | "BROWSE"
  | "CONNECT"
  | "MY CHAMBERS"
  | "CHAMBER AI"
  | "NOTIFICATIONS";

const sections: { name: Section; icon: React.ReactNode }[] = [
  { name: "CREATE & JOIN", icon: <Plus size={16} /> },
  { name: "BROWSE", icon: <Compass size={16} /> },
  { name: "CONNECT", icon: <Users size={16} /> },
  { name: "MY CHAMBERS", icon: <Building2 size={16} /> },
  { name: "CHAMBER AI", icon: <Bot size={16} /> },
  { name: "NOTIFICATIONS", icon: <Bell size={16} /> },
];

const ICON_PATH = "/chamber-icon.svg.png";

const SERIF: React.CSSProperties = {
  fontFamily:
    '"Playfair Display", "Cormorant Garamond", Georgia, "Times New Roman", serif',
};

// Deep navy blue palette
const DARK_GRADIENT =
  "bg-gradient-to-br from-[#142B4A] via-[#0D1B30] to-[#07111F]";

const GOLD_TEXT = "text-[#142B4A]";

function BrandMark() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-white to-neutral-200 shadow-md shadow-black/40 ring-1 ring-[#24466B]/60">
      <Image
        src={ICON_PATH}
        alt="Chamber"
        width={29}
        height={29}
        className="object-contain"
        unoptimized
      />
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3">
        <span className="h-px w-10 bg-gradient-to-r from-[#142B4A] to-[#6B8DB5]" />
        <p
          className={`text-xs font-bold uppercase tracking-[0.24em] ${GOLD_TEXT}`}
        >
          {eyebrow}
        </p>
      </div>

      <h1
        style={SERIF}
        className="mt-4 bg-gradient-to-b from-[#07111F] to-[#24466B] bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl"
      >
        {title}
      </h1>

      <p className="mt-4 max-w-2xl text-base leading-8 text-neutral-700">
        {description}
      </p>
    </div>
  );
}

function ActionCard({
  icon,
  title,
  description,
  action,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex min-h-[230px] flex-col overflow-hidden rounded-3xl border border-neutral-300 bg-gradient-to-br from-white via-white to-neutral-100 p-7 shadow-sm outline-none transition-all duration-300 hover:-translate-y-1 hover:border-[#142B4A] hover:shadow-2xl focus-visible:ring-2 focus-visible:ring-[#142B4A] focus-visible:ring-offset-2"
    >
      <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#07111F] via-[#42658D] to-[#07111F] opacity-90" />

      <div
        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${DARK_GRADIENT} text-white shadow-lg shadow-[#142B4A]/20`}
      >
        {icon}
      </div>

      <h2
        style={SERIF}
        className="mt-6 text-2xl font-bold tracking-tight text-neutral-950"
      >
        {title}
      </h2>

      <p className="mt-2 flex-1 text-[15px] leading-7 text-neutral-700">
        {description}
      </p>

      <div className="mt-6 flex items-center justify-between border-t border-neutral-300 pt-4 text-sm font-bold uppercase tracking-wider text-[#142B4A]">
        {action}
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#142B4A] text-white transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:bg-[#24466B]">
          <ArrowUpRight size={16} />
        </span>
      </div>
    </Link>
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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
    >
      <Link
        href={`/chamber/${chamber.id}`}
        className="group block rounded-3xl border border-neutral-300 bg-gradient-to-br from-white to-neutral-100 p-6 shadow-sm outline-none transition-all duration-300 hover:-translate-y-1 hover:border-[#142B4A] hover:shadow-xl focus-visible:ring-2 focus-visible:ring-[#142B4A] focus-visible:ring-offset-2"
      >
        <div className="flex items-start gap-4">
          <div
            style={SERIF}
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${DARK_GRADIENT} text-lg font-bold text-white shadow-md shadow-[#142B4A]/20`}
          >
            {initials || <Building2 size={22} />}
          </div>

          <div className="min-w-0 flex-1">
            <h3
              style={SERIF}
              className="truncate text-xl font-bold text-neutral-950"
            >
              {chamber.chamber_name}
            </h3>
            <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-neutral-700">
              {chamber.description ||
                "A dedicated space to connect, organize and collaborate."}
            </p>
          </div>

          <ArrowUpRight
            size={20}
            className="shrink-0 text-neutral-500 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#142B4A]"
          />
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-neutral-300 pt-4">
          <span className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
            Workspace
          </span>

          <span className="flex items-center gap-1 text-sm font-bold uppercase tracking-wider text-[#142B4A] transition-colors group-hover:text-[#42658D]">
            Enter <ChevronRight size={16} />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

function ComingSoon({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="relative flex min-h-[400px] flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-neutral-300 bg-gradient-to-br from-white via-neutral-50 to-neutral-200 px-6 py-16 text-center shadow-sm">
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border border-neutral-300/70" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full border border-neutral-300/70" />

      <div
        className={`relative flex h-20 w-20 items-center justify-center rounded-3xl ${DARK_GRADIENT} text-white shadow-xl shadow-[#142B4A]/25`}
      >
        {icon}
      </div>

      <span className="relative mt-7 rounded-full border border-[#42658D]/40 bg-[#EAF0F7] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-[#142B4A]">
        Coming soon
      </span>

      <h2
        style={SERIF}
        className="relative mt-5 text-3xl font-bold tracking-tight text-neutral-950"
      >
        {title}
      </h2>

      <p className="relative mt-3 max-w-md text-[15px] leading-7 text-neutral-700">
        {description}
      </p>
    </div>
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
  const [activeSection, setActiveSection] =
    useState<Section>("CREATE & JOIN");

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

  function renderSection() {
    switch (activeSection) {
      case "CREATE & JOIN":
        return (
          <div>
            <SectionHeading
              eyebrow="Get started"
              title={`${greeting}, ${firstName}.`}
              description="Create a new Chamber or join an existing workspace. Everything you need to bring your people together starts here."
            />

            <div className="mb-8 grid gap-5 sm:grid-cols-2">
              <ActionCard
                href="/create"
                icon={<FolderPlus size={25} />}
                title="Create a Chamber"
                description="Start a new workspace for your organization, team or community."
                action="Create Chamber"
              />

              <ActionCard
                href="/join"
                icon={<LogIn size={25} />}
                title="Join a Chamber"
                description="Already have a Chamber code? Join an existing workspace."
                action="Join Chamber"
              />
            </div>

            <div
              className={`flex flex-wrap items-center justify-between gap-4 rounded-3xl ${DARK_GRADIENT} p-6 text-white shadow-xl shadow-[#142B4A]/20 ring-1 ring-[#42658D]/40`}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/20">
                  <Clock3 size={22} />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-white">
                    Your local time
                  </p>
                  <p className="mt-1 text-sm text-neutral-300">
                    {currentDate}
                  </p>
                </div>
              </div>

              <p
                style={SERIF}
                className="text-4xl font-bold tabular-nums text-white"
              >
                {currentTime || "--:--"}
              </p>
            </div>
          </div>
        );

      case "BROWSE":
        return (
          <div>
            <SectionHeading
              eyebrow="Discover"
              title="Explore Chambers."
              description="Find public Chambers, discover communities and explore opportunities to connect with organizations."
            />

            <div className="relative overflow-hidden rounded-[2rem] border border-neutral-300 bg-gradient-to-br from-white via-neutral-50 to-neutral-200 p-8 shadow-sm sm:p-12">
              <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-neutral-300/70" />

              <div
                className={`relative flex h-16 w-16 items-center justify-center rounded-2xl ${DARK_GRADIENT} text-white shadow-lg shadow-[#142B4A]/20`}
              >
                <Compass size={29} />
              </div>

              <h2
                style={SERIF}
                className="relative mt-6 text-3xl font-bold tracking-tight text-neutral-950"
              >
                Discover your next community
              </h2>

              <p className="relative mt-3 max-w-xl text-base leading-8 text-neutral-700">
                Explore available public workspaces and find a Chamber that
                aligns with your interests and goals.
              </p>

              <Link
                href="/browse"
                className={`relative mt-7 inline-flex items-center gap-2 rounded-xl ${DARK_GRADIENT} px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-[#142B4A]/25 transition hover:-translate-y-0.5 hover:shadow-xl`}
              >
                Explore Chambers <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        );

      case "CONNECT":
        return (
          <div>
            <SectionHeading
              eyebrow="People and relationships"
              title="Connect beyond your Chambers."
              description="A space to discover people across Chamber and build direct connections beyond shared workspaces."
            />
            <ComingSoon
              icon={<MessageCircle size={32} />}
              title="Your connections start here."
              description="Discover people, send connection requests and have personal conversations across the Chamber community. This feature is under development."
            />
          </div>
        );

      case "MY CHAMBERS":
        return (
          <div>
            <SectionHeading
              eyebrow="Your workspaces"
              title="My Chambers."
              description="All your organizations, teams and communities in one place."
            />

            {loadingChambers ? (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-44 animate-pulse rounded-3xl border border-neutral-300 bg-gradient-to-br from-white to-neutral-100 p-6"
                  >
                    <div className="h-12 w-12 rounded-2xl bg-neutral-300" />
                    <div className="mt-4 h-4 w-2/3 rounded bg-neutral-300" />
                    <div className="mt-3 h-3 w-full rounded bg-neutral-200" />
                  </div>
                ))}
              </div>
            ) : loadError ? (
              <div
                role="alert"
                className="rounded-3xl border border-red-300 bg-gradient-to-br from-red-50 to-white p-10 text-center"
              >
                <h3
                  style={SERIF}
                  className="text-xl font-bold text-red-900"
                >
                  Unable to load your Chambers
                </h3>
                <p className="mt-2 text-sm text-red-800">
                  Please refresh the page and try again.
                </p>
              </div>
            ) : chambers.length === 0 ? (
              <div className="rounded-[2rem] border-2 border-dashed border-neutral-400 bg-gradient-to-br from-white to-neutral-100 px-6 py-16 text-center">
                <div
                  className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${DARK_GRADIENT} text-white shadow-lg shadow-[#142B4A]/20`}
                >
                  <Building2 size={30} />
                </div>

                <h3
                  style={SERIF}
                  className="mt-6 text-2xl font-bold text-neutral-950"
                >
                  Your journey starts here
                </h3>

                <p className="mx-auto mt-2 max-w-md text-[15px] leading-7 text-neutral-700">
                  You are not part of any Chamber yet. Create your first
                  workspace or join an existing one.
                </p>

                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <Link
                    href="/create"
                    className={`rounded-xl ${DARK_GRADIENT} px-6 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg`}
                  >
                    Create Chamber
                  </Link>

                  <Link
                    href="/join"
                    className="rounded-xl border-2 border-[#142B4A] bg-white px-6 py-3 text-sm font-bold uppercase tracking-wider text-[#142B4A] transition hover:bg-[#142B4A] hover:text-white"
                  >
                    Join Chamber
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {chambers.map((chamber, index) => (
                  <ChamberCard
                    key={chamber.id}
                    chamber={chamber}
                    index={index}
                  />
                ))}
              </div>
            )}

            <Link
              href="/create"
              className="mt-8 inline-flex items-center gap-2 rounded-full border-2 border-[#142B4A] px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-[#142B4A] transition hover:bg-[#142B4A] hover:text-white"
            >
              <Plus size={17} /> Create another Chamber
            </Link>
          </div>
        );

      case "CHAMBER AI":
        return (
          <div>
            <SectionHeading
              eyebrow="Workspace intelligence"
              title="Meet Chamber AI."
              description="An intelligent overview of activity, conversations and developments across your workspaces."
            />
            <ComingSoon
              icon={<Sparkles size={32} />}
              title="A clearer view of your organization."
              description="Chamber AI will help you understand discussions, identify important developments and generate useful summaries. This feature is under development."
            />
          </div>
        );

      case "NOTIFICATIONS":
        return (
          <div>
            <SectionHeading
              eyebrow="Stay informed"
              title="Notifications."
              description="A central place for important updates and activity across Chamber."
            />
            <ComingSoon
              icon={<Bell size={32} />}
              title="Your notification centre."
              description="Updates from your Chambers, personal connections, invitations and announcements will be brought together here."
            />
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-white text-neutral-950">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black text-white shadow-lg">
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center justify-between px-4 sm:px-8">
          <Link href="/welcome" className="flex min-w-0 items-center gap-3">
            <BrandMark />
            <span style={SERIF} className="truncate text-2xl font-bold tracking-tight sm:text-3xl">Chamber</span>
          </Link>
          <div className="flex items-center gap-3">
            <div title={firstName} className="hidden h-9 w-9 items-center justify-center rounded-full bg-[#142B4A] text-sm font-bold ring-1 ring-white/30 sm:flex">
              {firstName[0]?.toUpperCase() || "U"}
            </div>
            <button type="button" onClick={handleSignOut} disabled={signingOut} aria-label="Sign out" title="Sign out"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/40 bg-white/5 transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-50">
              <LogOut size={19} />
            </button>
          </div>
        </div>
      </header>

      {/* Boardroom artwork: place chamber-boardroom-blue.png in public/ */}
      <section aria-label="Chamber workspace" className="relative mx-auto h-[220px] w-full max-w-[1500px] overflow-hidden bg-[#07182e] sm:h-[330px] lg:h-[430px]">
        <Image src="/chamber-boardroom-blue.png" alt="Luxurious Chamber boardroom, developed by RIO LAB"
          fill priority sizes="(max-width: 640px) 100vw, 1500px" className="object-cover object-[65%_center] sm:object-center" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#04152e]/55 via-transparent to-transparent" />
        <svg aria-hidden="true" viewBox="0 0 1440 90" preserveAspectRatio="none" className="pointer-events-none absolute -bottom-px left-0 h-9 w-full sm:h-14">
          <path d="M0 44 C330 -15 710 130 1440 28 L1440 90 L0 90 Z" fill="#082653" />
          <path d="M0 60 C400 5 810 130 1440 43 L1440 90 L0 90 Z" fill="#061b39" />
        </svg>
      </section>

      {/* Six separate, equal-height navigation tiles; scroll-free on mobile. */}
      <div className="relative z-10 mx-auto w-full max-w-[1500px] bg-gradient-to-b from-[#061b39] via-[#e8f1fc] to-white px-3 pb-7 pt-3 sm:px-8 sm:pb-9">
        <LayoutGroup id="chamber-navigation">
          <nav aria-label="Chamber sections" className="grid grid-cols-3 gap-2.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
            {sections.map((section) => {
              const active = activeSection === section.name;
              return (
                <button key={section.name} type="button" onClick={() => setActiveSection(section.name)}
                  aria-current={active ? "page" : undefined}
                  className={`group relative isolate flex h-[94px] min-w-0 flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border px-1.5 py-3 text-center shadow-[0_6px_16px_rgba(2,17,39,0.16)] transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 sm:h-[112px] sm:gap-3 ${active ? "border-[#55b5ff] bg-gradient-to-b from-[#123c78] to-[#06152e] text-white ring-1 ring-[#2e96ff] shadow-[0_0_18px_rgba(33,150,243,0.55)]" : "border-[#d7e2f1] bg-gradient-to-b from-white to-[#f3f7ff] text-[#071426] hover:border-[#73b7fa]"}`}>
                  {active && <motion.span layoutId="active-navigation-indicator" className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-gradient-to-b from-[#123c78] to-[#06152e]" transition={{type:"spring", stiffness:380, damping:32}} />}
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${active ? "bg-[#164f96] text-white" : "bg-[#eaf2ff] text-[#071d41]"}`}>{section.icon}</span>
                  <span className="w-full break-normal text-center text-[9px] font-extrabold uppercase leading-tight tracking-[-0.02em] min-[370px]:text-[10px] sm:text-xs">{section.name}</span>
                </button>
              );
            })}
          </nav>
        </LayoutGroup>
      </div>

      <div className="mx-auto min-h-[calc(100vh-72px)] w-full max-w-[1500px] px-4 pb-10 pt-5 sm:px-8 sm:pt-10">
        <AnimatePresence mode="wait" initial={false}>
          <motion.section
            key={activeSection}
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(3px)" }}
            transition={{
              duration: 0.28,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {renderSection()}
          </motion.section>
        </AnimatePresence>

        <footer className="mt-20 flex flex-col items-center justify-between gap-3 border-t border-neutral-300 pt-6 text-sm text-neutral-600 sm:flex-row">
          <p style={SERIF} className="italic">
            Chamber — Where Organization Meets Focus.
          </p>

          <Link
            href="/about-rio-lab"
            className="font-bold text-[#142B4A] underline-offset-4 transition hover:text-[#42658D] hover:underline"
          >
            Built by RIO LAB
          </Link>
        </footer>
      </div>
    </main>
  );
}
