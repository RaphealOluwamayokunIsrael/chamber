"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bell,
  Building2,
  ChevronRight,
  FolderPlus,
  LogIn,
  RefreshCw,
  ShieldCheck,
  UserCircle,
  Users,
  Sparkles,
  Command,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Chamber = {
  id: string;
  chamber_name: string;
  description: string;
  organization: string;
  division: string;
  category: string | null;
  chamber_code: string;
  role: string;
};

export default function Dashboard() {
  const router = useRouter();

  const [chambers, setChambers] = useState<Chamber[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    setErrorMessage("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }

      setUserEmail(user.email || "");

      const { data, error } =
        await supabase.rpc("get_my_chambers");

      if (error) {
        console.error(
          "GET MY CHAMBERS ERROR:",
          error
        );

        setErrorMessage(
          error.message ||
            "Unable to load your Chambers."
        );

        setChambers([]);
        return;
      }

      setChambers(
        (data as Chamber[]) || []
      );
    } catch (error) {
      console.error(
        "DASHBOARD ERROR:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while loading your Chambers."
      );

      setChambers([]);
    } finally {
      setLoading(false);
    }
  }

  function formatRole(role: string) {
    if (!role) {
      return "Member";
    }

    return (
      role.charAt(0).toUpperCase() +
      role.slice(1).toLowerCase()
    );
  }

  function getInitial(name: string) {
    return (
      name.trim().charAt(0).toUpperCase() ||
      "C"
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f4f4f1] text-[#111111]">

      {/* BACKGROUND GRAPHICS */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute left-[-180px] top-[-180px] h-[440px] w-[440px] rounded-full border border-black/[0.045]" />

        <div className="absolute right-[-180px] top-[120px] h-[420px] w-[420px] rounded-full border border-black/[0.045]" />

        <div className="absolute left-0 top-[28%] h-px w-full bg-black/[0.03]" />

        <div className="absolute left-[18%] top-0 h-full w-px bg-black/[0.025]" />

        <div className="absolute right-[18%] top-0 h-full w-px bg-black/[0.025]" />

        <div className="absolute left-[12%] top-[18%] h-2 w-2 rounded-full bg-[#00e676]" />

        <div className="absolute right-[14%] top-[25%] h-1.5 w-1.5 rounded-full bg-black/20" />

        <div className="absolute bottom-[20%] left-[9%] h-1.5 w-1.5 rounded-full bg-black/20" />

      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-10">

        {/* TOP NAV */}
        <header className="flex items-center justify-between">

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

              <p className="hidden text-[9px] uppercase tracking-[0.15em] text-black/35 sm:block">
                Organization meets focus
              </p>
            </div>

          </div>

          <div className="flex items-center gap-2">

            <button
              type="button"
              onClick={() =>
                router.push("/notifications")
              }
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-black/[0.08] bg-white text-black/55 transition hover:bg-[#fafaf8]"
              title="Notifications"
            >
              <Bell
                size={16}
                strokeWidth={1.7}
              />

              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#00e676]" />
            </button>

            <button
              type="button"
              onClick={() =>
                router.push("/profile")
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#080908] text-xs font-semibold text-white transition hover:bg-black"
              title="Open Profile"
            >
              {userEmail
                ? userEmail
                    .charAt(0)
                    .toUpperCase()
                : "U"}
            </button>

          </div>

        </header>

        {/* HERO DASHBOARD HEADER */}
        <section className="relative mt-14 overflow-hidden rounded-[28px] bg-[#080908] px-6 py-10 text-white shadow-[0_25px_70px_rgba(0,0,0,0.12)] sm:px-9 sm:py-12">

          {/* GRAPHICS */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">

            <div className="absolute right-[-100px] top-[-140px] h-[360px] w-[360px] rounded-full border border-white/[0.06]" />

            <div className="absolute right-[80px] top-[-70px] h-[210px] w-[210px] rounded-full border border-white/[0.04]" />

            <div className="absolute bottom-[-100px] left-[35%] h-[250px] w-[250px] rounded-full bg-[#00e676]/[0.04] blur-3xl" />

          </div>

          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

            <div className="max-w-2xl">

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.05] px-3 py-1.5">

                <span className="h-1.5 w-1.5 rounded-full bg-[#00e676]" />

                <span className="text-[9px] font-semibold uppercase tracking-[0.17em] text-white/50">
                  Personal workspace
                </span>

              </div>

              <h1 className="text-[clamp(2.5rem,5vw,4.7rem)] font-semibold leading-[0.94] tracking-[-0.065em]">
                Welcome back.
                <br />
                <span className="text-white/35">
                  Everything in one place.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-sm leading-6 text-white/50 sm:text-base">
                Manage your organizations, enter your
                Chambers and stay connected to the work
                that matters.
              </p>

            </div>

            <div className="hidden shrink-0 lg:block">

              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00e676] text-black">
                    <Sparkles size={17} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold">
                      Your workspace
                    </p>

                    <p className="mt-1 text-[10px] text-white/35">
                      {chambers.length}{" "}
                      {chambers.length === 1
                        ? "Chamber"
                        : "Chambers"}{" "}
                      available
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* QUICK COMMANDS */}
        <section className="mt-8">

          <div className="mb-4 flex items-center justify-between">

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-black/35">
                Quick actions
              </p>

              <h2 className="mt-1 text-lg font-semibold tracking-[-0.03em]">
                Workspace commands
              </h2>
            </div>

            <Command
              size={17}
              className="text-black/25"
            />

          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            {/* CREATE */}
            <DashboardAction
              icon={
                <FolderPlus size={18} />
              }
              title="Create Chamber"
              description="Start a new organization workspace."
              dark
              onClick={() =>
                router.push("/create")
              }
            />

            {/* JOIN */}
            <DashboardAction
              icon={
                <LogIn size={18} />
              }
              title="Join Chamber"
              description="Enter an existing workspace using a Chamber Code."
              onClick={() =>
                router.push("/join")
              }
            />

            {/* NOTIFICATIONS */}
            <DashboardAction
              icon={
                <Bell size={18} />
              }
              title="Notifications"
              description="See important organizational activity."
              onClick={() =>
                router.push("/notifications")
              }
            />

            {/* PROFILE */}
            <DashboardAction
              icon={
                <UserCircle size={18} />
              }
              title="Profile"
              description="Manage your account and personal settings."
              onClick={() =>
                router.push("/profile")
              }
            />

          </div>

        </section>

        {/* MY CHAMBERS */}
        <section className="mt-16">

          {/* SECTION HEADER */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#080908] text-[#00e676]">
                  <Users size={16} />
                </div>

                <div>

                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-black/35">
                    Your organizations
                  </p>

                  <h2 className="mt-0.5 text-2xl font-semibold tracking-[-0.04em]">
                    My Chambers
                  </h2>

                </div>

              </div>

              <p className="mt-3 max-w-2xl text-sm text-black/45">
                Chambers you created or joined.
              </p>

            </div>

            <button
              type="button"
              onClick={loadDashboard}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 text-xs font-semibold text-black/65 transition hover:bg-[#fafaf8] disabled:cursor-not-allowed disabled:opacity-50"
            >

              <RefreshCw
                className={`h-4 w-4 ${
                  loading
                    ? "animate-spin"
                    : ""
                }`}
              />

              {loading
                ? "Loading..."
                : "Refresh"}

            </button>

          </div>

          {/* ERROR */}
          {!loading &&
            errorMessage && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6">

                <div className="flex items-start gap-4">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                    <ShieldCheck size={18} />
                  </div>

                  <div>

                    <p className="font-bold text-red-800">
                      Unable to load your Chambers
                    </p>

                    <p className="mt-2 text-sm text-red-700">
                      {errorMessage}
                    </p>

                    <button
                      type="button"
                      onClick={loadDashboard}
                      className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700"
                    >
                      Try Again
                    </button>

                  </div>

                </div>

              </div>
            )}

          {/* LOADING */}
          {loading && (
            <div className="mt-6 grid gap-6 md:grid-cols-2">

              {[1, 2].map(
                (item) => (
                  <div
                    key={item}
                    className="animate-pulse rounded-3xl border border-black/[0.06] bg-white p-6"
                  >

                    <div className="flex items-start justify-between">

                      <div className="flex gap-4">

                        <div className="h-14 w-14 rounded-2xl bg-black/[0.06]" />

                        <div>

                          <div className="h-5 w-40 rounded bg-black/[0.06]" />

                          <div className="mt-3 h-4 w-28 rounded bg-black/[0.04]" />

                        </div>

                      </div>

                      <div className="h-7 w-20 rounded-full bg-black/[0.05]" />

                    </div>

                    <div className="mt-6 h-4 w-full rounded bg-black/[0.05]" />

                    <div className="mt-2 h-4 w-4/5 rounded bg-black/[0.04]" />

                    <div className="mt-6 h-12 w-full rounded-xl bg-black/[0.05]" />

                  </div>
                )
              )}

            </div>
          )}

          {/* EMPTY */}
          {!loading &&
            !errorMessage &&
            chambers.length === 0 && (
              <div className="mt-6 overflow-hidden rounded-[28px] border border-black/[0.08] bg-white p-10 text-center shadow-sm sm:p-14">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#080908] text-[#00e676]">
                  <Building2 size={27} />
                </div>

                <h3 className="mt-6 text-2xl font-semibold tracking-[-0.04em]">
                  No Chambers yet
                </h3>

                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-black/45">
                  Create a new Chamber or join an
                  existing organization to start
                  collaborating.
                </p>

                <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">

                  <button
                    type="button"
                    onClick={() =>
                      router.push("/create")
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#080908] px-6 py-3 text-sm font-semibold text-white transition hover:bg-black"
                  >
                    Create Chamber
                    <ArrowRight size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      router.push("/join")
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/[0.1] bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#fafaf8]"
                  >
                    Join Chamber
                    <ArrowRight size={15} />
                  </button>

                </div>

              </div>
            )}

          {/* CHAMBER CARDS */}
          {!loading &&
            !errorMessage &&
            chambers.length > 0 && (
              <div className="mt-6 grid gap-6 md:grid-cols-2">

                {chambers.map(
                  (chamber) => (
                    <article
                      key={chamber.id}
                      className="group overflow-hidden rounded-[28px] border border-black/[0.07] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                    >

                      <div className="p-6 sm:p-7">

                        {/* TOP */}
                        <div className="flex items-start justify-between gap-4">

                          <div className="flex min-w-0 items-center gap-4">

                            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#080908] text-xl font-bold text-[#00e676] shadow-lg">

                              {getInitial(
                                chamber.chamber_name
                              )}

                              <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-[#00e676]" />

                            </div>

                            <div className="min-w-0">

                              <h3 className="truncate text-xl font-semibold tracking-[-0.035em] text-[#111111] sm:text-2xl">
                                {chamber.chamber_name}
                              </h3>

                              <p className="mt-1 truncate text-xs font-semibold uppercase tracking-[0.08em] text-black/35">
                                {chamber.organization}
                              </p>

                            </div>

                          </div>

                          <span className="shrink-0 rounded-full border border-black/[0.07] bg-[#f4f4f1] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-black/55">
                            {formatRole(
                              chamber.role
                            )}
                          </span>

                        </div>

                        {/* DESCRIPTION */}
                        <p className="mt-6 line-clamp-2 text-sm leading-7 text-black/50">
                          {chamber.description}
                        </p>

                        {/* DETAILS */}
                        <div className="mt-6 grid gap-3 rounded-2xl bg-[#f4f4f1] p-4">

                          <div className="flex items-start justify-between gap-4 text-xs">

                            <span className="font-semibold uppercase tracking-[0.08em] text-black/30">
                              Division
                            </span>

                            <span className="text-right font-semibold text-black/65">
                              {chamber.division}
                            </span>

                          </div>

                          <div className="flex items-start justify-between gap-4 text-xs">

                            <span className="font-semibold uppercase tracking-[0.08em] text-black/30">
                              Category
                            </span>

                            <span className="text-right font-semibold text-black/65">
                              {chamber.category ||
                                "—"}
                            </span>

                          </div>

                        </div>

                        {/* OPEN */}
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/chamber/${chamber.id}`
                            )
                          }
                          className="group/open mt-6 flex w-full items-center justify-between rounded-xl bg-[#080908] px-5 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-black"
                        >

                          <span>
                            Open Chamber
                          </span>

                          <ChevronRight
                            size={17}
                            className="transition-transform duration-300 group-hover/open:translate-x-1"
                          />

                        </button>

                      </div>

                    </article>
                  )
                )}

              </div>
            )}

        </section>

        {/* FOOTER */}
        <footer className="mt-16 border-t border-black/[0.07] py-8">

          <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">

            <div>

              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-black/30">
                Powered by
              </p>

              <p className="mt-1 text-lg font-bold tracking-[-0.04em]">
                RIO LAB
              </p>

            </div>

            <p className="text-[11px] text-black/35">
              Building purposeful software for organizations.
            </p>

          </div>

        </footer>

      </div>

    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* DASHBOARD ACTION                                                           */
/* -------------------------------------------------------------------------- */

function DashboardAction({
  icon,
  title,
  description,
  onClick,
  dark = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  dark?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300 hover:-translate-y-1 ${
        dark
          ? "border-[#080908] bg-[#080908] text-white shadow-lg shadow-black/10 hover:bg-black"
          : "border-black/[0.08] bg-white text-[#111111] hover:shadow-xl"
      }`}
    >

      <div className="flex items-start justify-between gap-4">

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            dark
              ? "bg-[#00e676] text-black"
              : "bg-[#f4f4f1] text-black/65"
          }`}
        >
          {icon}
        </div>

        <ArrowRight
          size={16}
          className={`mt-1 transition-transform duration-300 group-hover:translate-x-1 ${
            dark
              ? "text-white/40"
              : "text-black/25"
          }`}
        />

      </div>

      <h3
        className={`mt-5 text-sm font-semibold tracking-[-0.02em] ${
          dark
            ? "text-white"
            : "text-[#111111]"
        }`}
      >
        {title}
      </h3>

      <p
        className={`mt-2 text-xs leading-5 ${
          dark
            ? "text-white/40"
            : "text-black/40"
        }`}
      >
        {description}
      </p>

      {dark && (
        <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-[#00e676]/[0.05] blur-xl" />
      )}

    </button>
  );
}