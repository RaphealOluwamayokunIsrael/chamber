
"use client";

import Link from "next/link";
import ParticleBrandSymbol from "./ParticleBrandSymbol";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Users,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#f4f4f1] px-6 pb-20 pt-16 text-[#111111] transition-colors duration-300 sm:px-8 md:pb-28 md:pt-24 lg:px-10 lg:pt-28">
      {/* BACKGROUND GRAPHICS */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute left-[-180px] top-[-180px] h-[460px] w-[460px] rounded-full border border-black/[0.045]" />
        <div className="absolute left-[-110px] top-[-110px] h-[320px] w-[320px] rounded-full border border-black/[0.035]" />
        <div className="absolute right-[-180px] top-[100px] h-[440px] w-[440px] rounded-full border border-black/[0.045]" />
        <div className="absolute right-[-80px] top-[200px] h-[280px] w-[280px] rounded-full border border-black/[0.035]" />
        <div className="absolute left-0 top-[44%] h-px w-full bg-black/[0.035]" />
        <div className="absolute left-[20%] top-0 h-full w-px bg-black/[0.025]" />
        <div className="absolute right-[20%] top-0 h-full w-px bg-black/[0.025]" />
        <div className="absolute left-[14%] top-[18%] h-2 w-2 rounded-full bg-[#00e676]" />
        <div className="absolute right-[17%] top-[28%] h-1.5 w-1.5 rounded-full bg-black/20" />
        <div className="absolute bottom-[18%] left-[10%] h-1.5 w-1.5 rounded-full bg-black/20" />
      </div>

      {/* ANIMATED CHAMBER PARTICLE SYMBOL */}
      <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
        <div className="absolute left-1/2 top-[8%] h-[360px] w-[360px] -translate-x-1/2 opacity-[0.13] sm:top-[5%] sm:h-[520px] sm:w-[520px] sm:opacity-[0.15] lg:left-[68%] lg:top-[2%] lg:h-[760px] lg:w-[760px] lg:opacity-[0.17]">
          <ParticleBrandSymbol
            src="/chamber-icon.svg.png"
            color="#087BFA"
          />
        </div>
      </div>

      {/* CONTENT */}
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="grid items-center gap-14 lg:grid-cols-[0.88fr_1.12fr] lg:gap-16">
          {/* LEFT SIDE */}
          <div className="max-w-xl">
            {/* LABEL */}
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/70 px-3.5 py-2 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00e676]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-black/55">
                The organization workspace
              </span>
            </div>

            {/* HEADING */}
            <h1 className="text-[clamp(3.4rem,7vw,6.5rem)] font-semibold leading-[0.91] tracking-[-0.07em]">
              One Platform.
              <br />
              <span className="text-black/30">
                Every Organization.
              </span>
            </h1>

            {/* DESCRIPTION */}
            <p className="mt-8 max-w-lg text-[16px] leading-7 text-black/55 sm:text-[18px]">
              Chamber gives your organization one focused
              workspace to communicate, collaborate, share
              resources, manage activities and move together.
            </p>

            {/* ACTIONS */}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              {/* BLUE GET STARTED BUTTON */}
              <Link
                href="/signup"
                className="group flex h-12 items-center justify-center gap-2 rounded-xl bg-[#087BFA] px-6 text-sm font-semibold text-white shadow-xl shadow-blue-500/20 transition duration-300 hover:-translate-y-0.5 hover:bg-[#0666D6]"
              >
                Get Started
                <ArrowRight
                  size={16}
                  strokeWidth={1.8}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </Link>

              {/* SIGN IN BUTTON */}
              <Link
                href="/login"
                className="flex h-12 items-center justify-center rounded-xl border border-black/[0.1] bg-white px-6 text-sm font-semibold text-black transition duration-300 hover:-translate-y-0.5 hover:bg-[#fafaf8]"
              >
                Sign In
              </Link>
            </div>

            {/* PRODUCT PROMISES */}
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
              <div className="flex items-center gap-1.5 text-[11px] text-black/45">
                <CheckCircle2 size={13} className="text-[#00a854]" />
                Focused communication
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-black/45">
                <CheckCircle2 size={13} className="text-[#00a854]" />
                Organization tools
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-black/45">
                <CheckCircle2 size={13} className="text-[#00a854]" />
                Built for groups
              </div>
            </div>
          </div>

          {/* RIGHT PRODUCT VISUAL */}
          <div className="relative">
            {/* FLOATING ORGANIZATION CARD */}
            <div className="absolute -left-4 top-8 z-30 hidden rounded-xl border border-black/[0.08] bg-white px-3 py-2.5 shadow-xl sm:block">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eafff2] text-[#00a854]">
                  <Users size={15} />
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-black">
                    Organization
                  </p>
                  <p className="text-[9px] text-black/40">
                    Connected workspace
                  </p>
                </div>
              </div>
            </div>

            {/* MAIN PRODUCT FRAME */}
            <div className="relative overflow-hidden rounded-[26px] border border-black/[0.1] bg-white shadow-[0_35px_100px_rgba(0,0,0,0.14)]">
              {/* BROWSER BAR */}
              <div className="flex h-12 items-center justify-between border-b border-black/[0.07] px-4">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
                  <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
                  <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
                </div>

                <div className="hidden items-center gap-2 sm:flex">
                  <div className="h-1.5 w-20 rounded-full bg-black/[0.05]" />
                  <div className="h-1.5 w-9 rounded-full bg-black/[0.035]" />
                </div>
              </div>

              {/* APPLICATION */}
              <div className="flex min-h-[420px]">
                {/* SIDEBAR */}
                <div className="hidden w-[155px] shrink-0 border-r border-black/[0.07] bg-[#080908] p-3 sm:block">
                  <div className="mb-7 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#00e676] text-[10px] font-bold text-black">
                      C
                    </div>
                    <span className="text-[11px] font-semibold text-white">
                      Chamber
                    </span>
                  </div>

                  <div className="space-y-1">
                    <PreviewNav icon="◈" label="Overview" active />
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
                    <div className="flex items-center gap-2 rounded-md bg-white/[0.08] px-2 py-2 text-[9px] text-white">
                      <Sparkles size={13} />
                      <span>Chamber AI</span>
                    </div>
                  </div>
                </div>

                {/* DASHBOARD */}
                <div className="min-w-0 flex-1 bg-[#f5f5f2] p-4 sm:p-6">
                  {/* TOP */}
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
                      <Sparkles size={14} className="text-[#00a854]" />
                    </div>
                  </div>

                  {/* STATS */}
                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <PreviewStat value="42" label="Members" />
                    <PreviewStat value="18" label="Files" />
                    <PreviewStat value="03" label="Events" />
                  </div>

                  {/* CARDS */}
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <PreviewCard
                      title="Latest announcement"
                      label="GENERAL"
                    >
                      <div className="mt-3 h-2 w-4/5 rounded-full bg-black/10" />
                      <div className="mt-2 h-1.5 w-full rounded-full bg-black/[0.06]" />
                      <div className="mt-1.5 h-1.5 w-3/4 rounded-full bg-black/[0.06]" />
                    </PreviewCard>

                    <PreviewCard title="Next event" label="UPCOMING">
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex h-9 w-9 flex-col items-center justify-center rounded-lg bg-[#080908] text-white">
                          <span className="text-[6px] uppercase text-white/50">
                            Oct
                          </span>
                          <span className="text-xs font-semibold">12</span>
                        </div>

                        <div>
                          <div className="h-2 w-20 rounded-full bg-black/10" />
                          <div className="mt-1.5 h-1.5 w-14 rounded-full bg-black/[0.06]" />
                        </div>
                      </div>
                    </PreviewCard>
                  </div>

                  {/* ACTIVE POLL */}
                  <div className="mt-3 rounded-xl border border-black/[0.06] bg-white p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-semibold text-black/60">
                        Active poll
                      </span>
                      <span className="text-[8px] text-black/35">
                        24 votes
                      </span>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/[0.05]">
                      <div className="h-full w-[68%] rounded-full bg-[#00e676]" />
                    </div>

                    <div className="mt-2 flex justify-between text-[7px] text-black/35">
                      <span>Option A</span>
                      <span>68%</span>
                    </div>
                  </div>

                  {/* LIVE WORKSPACE */}
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

            {/* AI FLOATING CARD */}
            <div className="absolute -bottom-5 -right-3 z-30 w-[205px] rounded-2xl border border-black/[0.08] bg-[#080908] p-3.5 text-white shadow-2xl sm:-right-5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#00e676] text-black">
                  <Sparkles size={13} />
                </div>

                <div>
                  <p className="text-[10px] font-semibold">Chamber AI</p>
                  <p className="text-[8px] text-white/40">
                    Workspace intelligence
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

        {/* EXPLORE */}
        <div className="mt-20 flex flex-col items-center">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-black/35">
            <span>Explore Chamber</span>
          </div>

          <div className="mt-3 flex h-8 w-8 items-center justify-center rounded-full border border-black/[0.08] bg-white text-black/40">
            <ArrowRight size={13} className="rotate-90" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* PREVIEW COMPONENTS                                                         */
/* -------------------------------------------------------------------------- */

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
      <span className="flex w-3.5 justify-center">{icon}</span>
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
      <p className="mt-0.5 text-[8px] text-black/35">{label}</p>
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
        <p className="text-[9px] font-semibold">{title}</p>
        <span className="text-[6px] font-semibold tracking-[0.12em] text-black/30">
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}