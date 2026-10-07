import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Users,
} from "lucide-react";

export default function GetStartedPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f4f4f1] text-[#111111]">

      {/* ==================================================
          BACKGROUND GRAPHICS
          ================================================== */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-180px] top-[-180px] h-[420px] w-[420px] rounded-full border border-black/[0.05]" />
        <div className="absolute right-[-140px] top-[120px] h-[360px] w-[360px] rounded-full border border-black/[0.05]" />

        <div className="absolute left-[18%] top-[8%] h-2 w-2 rounded-full bg-[#00e676]" />
        <div className="absolute right-[22%] top-[18%] h-1.5 w-1.5 rounded-full bg-black/20" />
        <div className="absolute bottom-[20%] left-[12%] h-1.5 w-1.5 rounded-full bg-black/20" />

        <div className="absolute left-0 top-[42%] h-px w-full bg-black/[0.035]" />
        <div className="absolute left-[25%] top-0 h-full w-px bg-black/[0.025]" />
        <div className="absolute right-[25%] top-0 h-full w-px bg-black/[0.025]" />
      </div>

      {/* ==================================================
          NAVIGATION
          ================================================== */}
      <header className="relative z-10 mx-auto flex h-[76px] max-w-7xl items-center justify-between px-6 sm:px-8 lg:px-10">

        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#080908] text-[#00e676] shadow-sm">
            <span className="text-sm font-bold">
              C
            </span>
          </div>

          <div>
            <p className="text-[15px] font-semibold tracking-[-0.03em]">
              Chamber
            </p>

            <p className="hidden text-[10px] uppercase tracking-[0.15em] text-black/40 sm:block">
              Organization meets focus
            </p>
          </div>

        </div>

        <div className="flex items-center gap-2">

          <Link
            href="/login"
            className="hidden px-4 py-2 text-[13px] font-medium text-black/60 transition hover:text-black sm:block"
          >
            Sign in
          </Link>

          <Link
            href="/signup"
            className="group flex items-center gap-2 rounded-lg bg-[#080908] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-black"
          >
            Get started

            <ArrowRight
              size={14}
              strokeWidth={1.8}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </Link>

        </div>

      </header>

      {/* ==================================================
          HERO
          ================================================== */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-12 sm:px-8 sm:pt-16 lg:px-10 lg:pb-28 lg:pt-20">

        <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">

          {/* LEFT */}
          <div className="max-w-xl">

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/70 px-3 py-1.5 backdrop-blur">

              <span className="h-1.5 w-1.5 rounded-full bg-[#00e676]" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-black/55">
                The organization workspace
              </span>

            </div>

            <h1 className="text-[clamp(3rem,7vw,6rem)] font-semibold leading-[0.94] tracking-[-0.065em] text-[#111111]">
              One Platform.
              <br />

              <span className="text-black/35">
                Every Organization.
              </span>
            </h1>

            <p className="mt-7 max-w-lg text-[16px] leading-7 text-black/55 sm:text-[18px]">
              Chamber gives teams, communities, ministries,
              student organizations and other groups one focused
              place to communicate, organize and move together.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">

              <Link
                href="/signup"
                className="group flex h-12 items-center justify-center gap-2 rounded-xl bg-[#080908] px-6 text-sm font-semibold text-white shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-black"
              >
                Create your Chamber

                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>

              <Link
                href="/login"
                className="flex h-12 items-center justify-center rounded-xl border border-black/[0.1] bg-white px-6 text-sm font-semibold text-black transition hover:bg-[#f8f8f6]"
              >
                Sign in
              </Link>

            </div>

            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-black/45">

              <span className="flex items-center gap-1.5">
                <CheckCircle2
                  size={13}
                  className="text-[#00a854]"
                />
                Focused communication
              </span>

              <span className="flex items-center gap-1.5">
                <CheckCircle2
                  size={13}
                  className="text-[#00a854]"
                />
                Organization tools
              </span>

              <span className="flex items-center gap-1.5">
                <CheckCircle2
                  size={13}
                  className="text-[#00a854]"
                />
                Built for groups
              </span>

            </div>

          </div>

          {/* RIGHT — GRAPHICAL PRODUCT PREVIEW */}
          <div className="relative">

            {/* Floating label */}
            <div className="absolute -left-3 top-10 z-20 hidden rounded-xl border border-black/[0.08] bg-white px-3 py-2 shadow-xl sm:block">

              <div className="flex items-center gap-2">

                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#eafff2] text-[#00a854]">
                  <Users size={14} />
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-black">
                    Your organization
                  </p>

                  <p className="text-[9px] text-black/40">
                    Connected workspace
                  </p>
                </div>

              </div>

            </div>

            {/* Main product window */}
            <div className="relative overflow-hidden rounded-[24px] border border-black/[0.1] bg-white shadow-[0_30px_100px_rgba(0,0,0,0.12)]">

              {/* Window top */}
              <div className="flex h-12 items-center justify-between border-b border-black/[0.07] px-4">

                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
                  <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
                  <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
                </div>

                <div className="hidden items-center gap-2 sm:flex">
                  <div className="h-1.5 w-16 rounded-full bg-black/[0.06]" />
                  <div className="h-1.5 w-8 rounded-full bg-black/[0.04]" />
                </div>

              </div>

              {/* Workspace */}
              <div className="flex min-h-[390px]">

                {/* Mini sidebar */}
                <div className="hidden w-[150px] shrink-0 border-r border-black/[0.07] bg-[#0a0b0a] p-3 sm:block">

                  <div className="mb-7 flex items-center gap-2">

                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#00e676] text-[10px] font-bold text-black">
                      C
                    </div>

                    <span className="text-[11px] font-semibold text-white">
                      Chamber
                    </span>

                  </div>

                  <div className="space-y-1">

                    <PreviewNav
                      icon={<span>◈</span>}
                      label="Overview"
                      active
                    />

                    <PreviewNav
                      icon={<MessageSquare size={13} />}
                      label="Conversation"
                    />

                    <PreviewNav
                      icon={<Users size={13} />}
                      label="Members"
                    />

                    <PreviewNav
                      icon={<CalendarDays size={13} />}
                      label="Events"
                    />

                    <PreviewNav
                      icon={<BarChart3 size={13} />}
                      label="Polls"
                    />

                  </div>

                  <div className="mt-8 border-t border-white/[0.08] pt-4">

                    <p className="mb-2 px-2 text-[7px] uppercase tracking-[0.18em] text-white/30">
                      Intelligence
                    </p>

                    <PreviewNav
                      icon={<Sparkles size={13} />}
                      label="Chamber AI"
                    />

                  </div>

                </div>

                {/* Main preview */}
                <div className="min-w-0 flex-1 bg-[#f5f5f2] p-4 sm:p-6">

                  <div className="flex items-start justify-between">

                    <div>
                      <p className="text-[8px] font-semibold uppercase tracking-[0.15em] text-black/35">
                        Workspace
                      </p>

                      <h3 className="mt-1 text-lg font-semibold tracking-[-0.04em] text-black sm:text-xl">
                        Student Advocacy
                      </h3>

                      <p className="mt-1 text-[9px] text-black/40">
                        Where organization meets focus.
                      </p>
                    </div>

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
                      <Sparkles
                        size={14}
                        className="text-[#00a854]"
                      />
                    </div>

                  </div>

                  {/* Stats */}
                  <div className="mt-5 grid grid-cols-3 gap-2">

                    <PreviewStat
                      value="42"
                      label="Members"
                    />

                    <PreviewStat
                      value="18"
                      label="Files"
                    />

                    <PreviewStat
                      value="03"
                      label="Events"
                    />

                  </div>

                  {/* Dashboard cards */}
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">

                    <PreviewCard
                      title="Latest announcement"
                      label="GENERAL"
                    >
                      <div className="mt-3 h-2 w-4/5 rounded-full bg-black/10" />
                      <div className="mt-2 h-1.5 w-full rounded-full bg-black/[0.06]" />
                      <div className="mt-1.5 h-1.5 w-3/4 rounded-full bg-black/[0.06]" />
                    </PreviewCard>

                    <PreviewCard
                      title="Next event"
                      label="UPCOMING"
                    >
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex h-9 w-9 flex-col items-center justify-center rounded-lg bg-[#0a0b0a] text-white">
                          <span className="text-[6px] uppercase text-white/50">
                            Oct
                          </span>
                          <span className="text-xs font-semibold">
                            12
                          </span>
                        </div>

                        <div>
                          <div className="h-2 w-20 rounded-full bg-black/10" />
                          <div className="mt-1.5 h-1.5 w-14 rounded-full bg-black/[0.06]" />
                        </div>
                      </div>
                    </PreviewCard>

                  </div>

                  {/* Bottom activity */}
                  <div className="mt-3 rounded-xl border border-black/[0.06] bg-white p-3">

                    <div className="flex items-center justify-between">

                      <span className="text-[9px] font-semibold text-black/60">
                        Live workspace
                      </span>

                      <span className="flex items-center gap-1 text-[8px] text-[#00a854]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#00e676]" />
                        Active
                      </span>

                    </div>

                    <div className="mt-3 flex -space-x-2">

                      {["A", "D", "M", "J", "K"].map(
                        (letter, index) => (
                          <div
                            key={index}
                            className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#111111] text-[8px] font-semibold text-white"
                          >
                            {letter}
                          </div>
                        )
                      )}

                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* Floating AI card */}
            <div className="absolute -bottom-5 -right-3 z-20 w-[190px] rounded-2xl border border-black/[0.08] bg-[#080908] p-3.5 text-white shadow-2xl sm:-right-5">

              <div className="flex items-center gap-2">

                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#00e676] text-black">
                  <Sparkles size={13} />
                </div>

                <div>
                  <p className="text-[10px] font-semibold">
                    Chamber AI
                  </p>

                  <p className="text-[8px] text-white/40">
                    Your workspace intelligence
                  </p>
                </div>

              </div>

              <div className="mt-3 rounded-lg bg-white/[0.06] p-2.5">

                <p className="text-[8px] leading-4 text-white/65">
                  “There are 3 upcoming events and
                  2 recent announcements.”
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ==================================================
          PRODUCT PRINCIPLES
          ================================================== */}
      <section className="relative z-10 border-t border-black/[0.06] bg-white/60">

        <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8 lg:px-10">

          <div className="grid gap-8 sm:grid-cols-3">

            <Feature
              number="01"
              title="Communicate"
              description="Keep conversations focused inside a dedicated organizational space."
            />

            <Feature
              number="02"
              title="Organize"
              description="Bring announcements, events, polls, files and people into one workspace."
            />

            <Feature
              number="03"
              title="Move together"
              description="Give every organization a shared environment built around collective action."
            />

          </div>

        </div>

      </section>

      {/* ==================================================
          FOOTER
          ================================================== */}
      <footer className="relative z-10 border-t border-black/[0.06] bg-[#f4f4f1]">

        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">

          <div>

            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/35">
              Powered by
            </p>

            <p className="mt-1 text-lg font-bold tracking-[-0.04em]">
              RIO LAB
            </p>

          </div>

          <p className="text-[11px] text-black/40">
            Building purposeful software for organizations.
          </p>

        </div>

      </footer>

    </main>
  );
}

/* ==================================================
   PREVIEW COMPONENTS
   ================================================== */

function PreviewNav({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-md px-2 py-2 text-[9px] ${
        active
          ? "bg-white/[0.08] text-white"
          : "text-white/40"
      }`}
    >
      <span className="flex w-3.5 justify-center">
        {icon}
      </span>

      <span>{label}</span>
    </div>
  );
}

function PreviewStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-black/[0.06] bg-white p-3">

      <p className="text-lg font-semibold tracking-[-0.04em]">
        {value}
      </p>

      <p className="mt-0.5 text-[8px] text-black/35">
        {label}
      </p>

    </div>
  );
}

function PreviewCard({
  title,
  label,
  children,
}: {
  title: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-black/[0.06] bg-white p-3">

      <div className="flex items-center justify-between">

        <p className="text-[9px] font-semibold">
          {title}
        </p>

        <span className="text-[6px] font-semibold tracking-[0.12em] text-black/30">
          {label}
        </span>

      </div>

      {children}

    </div>
  );
}

function Feature({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="border-l border-black/[0.1] pl-5">

      <p className="text-[10px] font-semibold tracking-[0.14em] text-[#00a854]">
        {number}
      </p>

      <h2 className="mt-2 text-lg font-semibold tracking-[-0.03em]">
        {title}
      </h2>

      <p className="mt-2 max-w-sm text-[13px] leading-6 text-black/45">
        {description}
      </p>

    </div>
  );
}
