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
      /*
       * GET CURRENT USER
       */
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }

      setUserEmail(user.email || "");

      /*
       * GET USER'S CHAMBERS
       *
       * This secure database function returns
       * Chambers where the current user is a member.
       */
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
    return name.trim().charAt(0).toUpperCase() || "C";
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-6 dark:bg-gray-950 sm:px-6 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
                <Building2 className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                  Welcome to Chamber 👋
                </h1>

                <p className="mt-1 text-sm font-medium text-gray-600 dark:text-gray-400 sm:text-base">
                  Your organizations, all in one place.
                </p>
              </div>
            </div>

            {userEmail && (
              <p className="mt-4 break-all text-sm text-gray-500 dark:text-gray-500">
                {userEmail}
              </p>
            )}
          </div>

          {/* PROFILE */}
          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="flex h-14 w-14 shrink-0 items-center justify-center self-start rounded-full bg-blue-600 text-xl font-bold text-white shadow-lg transition hover:bg-blue-700 sm:self-center"
            title="Open Profile"
          >
            {userEmail
              ? userEmail.charAt(0).toUpperCase()
              : "U"}
          </button>
        </header>

        {/* ACTIONS */}
        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* CREATE */}
          <button
            type="button"
            onClick={() => router.push("/create")}
            className="group rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-900"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                <FolderPlus className="h-5 w-5" />
              </div>

              <ArrowRight className="h-5 w-5 text-gray-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-blue-600" />
            </div>

            <h2 className="mt-5 text-xl font-extrabold text-gray-900 dark:text-white">
              Create Chamber
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
              Start a new organization workspace.
            </p>
          </button>

          {/* JOIN */}
          <button
            type="button"
            onClick={() => router.push("/join")}
            className="group rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-900"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                <LogIn className="h-5 w-5" />
              </div>

              <ArrowRight className="h-5 w-5 text-gray-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-blue-600" />
            </div>

            <h2 className="mt-5 text-xl font-extrabold text-gray-900 dark:text-white">
              Join Chamber
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
              Join an existing organization using its Chamber Code.
            </p>
          </button>

          {/* NOTIFICATIONS */}
          <button
            type="button"
            onClick={() =>
              router.push("/notifications")
            }
            className="group rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-900"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                <Bell className="h-5 w-5" />
              </div>

              <ArrowRight className="h-5 w-5 text-gray-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-blue-600" />
            </div>

            <h2 className="mt-5 text-xl font-extrabold text-gray-900 dark:text-white">
              Notifications
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
              Stay updated with important organizational activity.
            </p>
          </button>

          {/* PROFILE */}
          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="group rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-900"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                <UserCircle className="h-5 w-5" />
              </div>

              <ArrowRight className="h-5 w-5 text-gray-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-blue-600" />
            </div>

            <h2 className="mt-5 text-xl font-extrabold text-gray-900 dark:text-white">
              Profile
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
              Manage your account and personal settings.
            </p>
          </button>
        </section>

        {/* MY CHAMBERS */}
        <section className="mt-14">

          {/* SECTION HEADER */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />

                <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                  My Chambers
                </h2>
              </div>

              <p className="mt-2 max-w-2xl text-gray-600 dark:text-gray-400">
                Chambers you created or joined.
              </p>
            </div>

            <button
              type="button"
              onClick={loadDashboard}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading ? "animate-spin" : ""
                }`}
              />

              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {/* ERROR */}
          {!loading && errorMessage && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/40">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-bold text-red-800 dark:text-red-200">
                    Unable to load your Chambers
                  </p>

                  <p className="mt-2 text-sm text-red-700 dark:text-red-300">
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
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-gray-200 dark:bg-gray-800" />

                      <div>
                        <div className="h-5 w-40 rounded bg-gray-200 dark:bg-gray-800" />
                        <div className="mt-3 h-4 w-28 rounded bg-gray-200 dark:bg-gray-800" />
                      </div>
                    </div>

                    <div className="h-7 w-20 rounded-full bg-gray-200 dark:bg-gray-800" />
                  </div>

                  <div className="mt-6 h-4 w-full rounded bg-gray-200 dark:bg-gray-800" />
                  <div className="mt-2 h-4 w-4/5 rounded bg-gray-200 dark:bg-gray-800" />

                  <div className="mt-6 h-12 w-full rounded-xl bg-gray-200 dark:bg-gray-800" />
                </div>
              ))}
            </div>
          )}

          {/* EMPTY */}
          {!loading &&
            !errorMessage &&
            chambers.length === 0 && (
              <div className="mt-6 rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-14">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                  <Building2 className="h-8 w-8" />
                </div>

                <h3 className="mt-6 text-2xl font-extrabold text-gray-900 dark:text-white">
                  No Chambers yet
                </h3>

                <p className="mx-auto mt-3 max-w-md leading-7 text-gray-600 dark:text-gray-400">
                  Create a new Chamber or join an existing organization to start collaborating.
                </p>

                <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() =>
                      router.push("/create")
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700"
                  >
                    Create Chamber
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      router.push("/join")
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 font-bold text-gray-800 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                  >
                    Join Chamber
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

          {/* CHAMBER CARDS */}
          {!loading &&
            !errorMessage &&
            chambers.length > 0 && (
              <div className="mt-6 grid gap-6 md:grid-cols-2">

                {chambers.map((chamber) => (
                  <article
                    key={chamber.id}
                    className="group overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900"
                  >
                    <div className="p-6 sm:p-7">

                      {/* TOP */}
                      <div className="flex items-start justify-between gap-4">

                        <div className="flex min-w-0 items-center gap-4">

                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-xl font-extrabold text-white shadow-lg shadow-blue-600/20">
                            {getInitial(
                              chamber.chamber_name
                            )}
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate text-xl font-extrabold text-gray-900 dark:text-white sm:text-2xl">
                              {chamber.chamber_name}
                            </h3>

                            <p className="mt-1 truncate font-semibold text-blue-600 dark:text-blue-400">
                              {chamber.organization}
                            </p>
                          </div>
                        </div>

                        <span className="shrink-0 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          {formatRole(chamber.role)}
                        </span>
                      </div>

                      {/* DESCRIPTION */}
                      <p className="mt-6 line-clamp-2 leading-7 text-gray-600 dark:text-gray-400">
                        {chamber.description}
                      </p>

                      {/* DETAILS */}
                      <div className="mt-6 grid gap-3 rounded-2xl bg-gray-50 p-4 dark:bg-gray-950">

                        <div className="flex items-start justify-between gap-4 text-sm">
                          <span className="font-semibold text-gray-500 dark:text-gray-500">
                            Division
                          </span>

                          <span className="text-right font-semibold text-gray-800 dark:text-gray-200">
                            {chamber.division}
                          </span>
                        </div>

                        <div className="flex items-start justify-between gap-4 text-sm">
                          <span className="font-semibold text-gray-500 dark:text-gray-500">
                            Category
                          </span>

                          <span className="text-right font-semibold text-gray-800 dark:text-gray-200">
                            {chamber.category || "—"}
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
                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 font-bold text-white transition-all duration-300 hover:bg-blue-700"
                      >
                        Open Chamber

                        <ChevronRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                      </button>

                    </div>
                  </article>
                ))}

              </div>
            )}

        </section>

        {/* FOOTER */}
        <footer className="mt-16 border-t border-gray-300 py-8 text-center dark:border-gray-800">
          <p className="text-sm text-gray-500">
            Powered by
          </p>

          <p className="mt-1 text-xl font-extrabold tracking-widest text-gray-900 dark:text-white">
            RIO LAB
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Building purposeful software for organizations.
          </p>
        </footer>

      </div>
    </main>
  );
}