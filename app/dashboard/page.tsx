"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
       * GET CHAMBERS THROUGH SECURE DATABASE FUNCTION
       *
       * The function only returns Chambers where
       * the current logged-in user is a member.
       */
      const {
        data,
        error,
      } = await supabase.rpc("get_my_chambers");

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

  return (
    <main className="min-h-screen bg-gray-100 p-6 dark:bg-gray-950 md:p-8">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white md:text-5xl">
              Welcome to Chamber 👋
            </h1>

            <p className="mt-3 text-lg font-semibold text-gray-700 dark:text-gray-300">
              Your organization starts here.
            </p>

            {userEmail && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {userEmail}
              </p>
            )}
          </div>

          {/* PROFILE */}
          <button
            onClick={() => router.push("/profile")}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white shadow-lg transition hover:bg-blue-700"
            title="Open Profile"
          >
            {userEmail
              ? userEmail.charAt(0).toUpperCase()
              : "U"}
          </button>

        </div>

        {/* ACTIONS */}
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

          {/* CREATE */}
          <button
            onClick={() => router.push("/create")}
            className="rounded-2xl bg-white p-6 text-left shadow-lg transition hover:-translate-y-1 hover:shadow-xl dark:bg-gray-900"
          >
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
              Create Chamber
            </h2>

            <p className="mt-3 font-medium text-gray-700 dark:text-gray-300">
              Start a new organization workspace.
            </p>

            <span className="mt-5 inline-block font-bold text-blue-600 dark:text-blue-400">
              Create →
            </span>
          </button>

          {/* JOIN */}
          <button
            onClick={() => router.push("/join")}
            className="rounded-2xl bg-white p-6 text-left shadow-lg transition hover:-translate-y-1 hover:shadow-xl dark:bg-gray-900"
          >
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
              Join Chamber
            </h2>

            <p className="mt-3 font-medium text-gray-700 dark:text-gray-300">
              Join an existing organization.
            </p>

            <span className="mt-5 inline-block font-bold text-blue-600 dark:text-blue-400">
              Join →
            </span>
          </button>

          {/* NOTIFICATIONS */}
          <button
            onClick={() =>
              router.push("/notifications")
            }
            className="rounded-2xl bg-white p-6 text-left shadow-lg transition hover:-translate-y-1 hover:shadow-xl dark:bg-gray-900"
          >
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
              Notifications
            </h2>

            <p className="mt-3 font-medium text-gray-700 dark:text-gray-300">
              Stay updated with announcements.
            </p>

            <span className="mt-5 inline-block font-bold text-blue-600 dark:text-blue-400">
              View →
            </span>
          </button>

          {/* PROFILE */}
          <button
            onClick={() => router.push("/profile")}
            className="rounded-2xl bg-white p-6 text-left shadow-lg transition hover:-translate-y-1 hover:shadow-xl dark:bg-gray-900"
          >
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
              Profile
            </h2>

            <p className="mt-3 font-medium text-gray-700 dark:text-gray-300">
              Manage your account settings.
            </p>

            <span className="mt-5 inline-block font-bold text-blue-600 dark:text-blue-400">
              Manage →
            </span>
          </button>

        </div>

        {/* AVAILABLE CHAMBERS */}
        <section className="mt-12">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                Available Chambers
              </h2>

              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Chambers you created or joined.
              </p>
            </div>

            <button
              onClick={loadDashboard}
              disabled={loading}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>

          </div>

          {/* ERROR */}
          {!loading && errorMessage && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              <p className="font-bold">
                Unable to load Chambers
              </p>

              <p className="mt-2 text-sm">
                {errorMessage}
              </p>

              <button
                onClick={loadDashboard}
                className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          )}

          {/* LOADING */}
          {loading && (
            <div className="mt-6 rounded-2xl bg-white p-8 text-center shadow dark:bg-gray-900">
              <p className="font-semibold text-gray-600 dark:text-gray-400">
                Loading your Chambers...
              </p>
            </div>
          )}

          {/* EMPTY */}
          {!loading &&
            !errorMessage &&
            chambers.length === 0 && (
              <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm dark:border-gray-700 dark:bg-gray-900">

                <div className="text-5xl">
                  🏢
                </div>

                <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
                  No Chambers yet
                </h3>

                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Create a new Chamber or join an existing one to get started.
                </p>

                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">

                  <button
                    onClick={() =>
                      router.push("/create")
                    }
                    className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
                  >
                    Create Chamber
                  </button>

                  <button
                    onClick={() =>
                      router.push("/join")
                    }
                    className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-bold text-gray-800 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    Join Chamber
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
                  <div
                    key={chamber.id}
                    className="rounded-2xl bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl dark:bg-gray-900"
                  >

                    {/* TOP */}
                    <div className="flex items-start justify-between gap-4">

                      <div className="min-w-0">
                        <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                          {chamber.chamber_name}
                        </h3>

                        <p className="mt-1 font-semibold text-blue-600 dark:text-blue-400">
                          {chamber.organization}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        {formatRole(chamber.role)}
                      </span>

                    </div>

                    {/* DESCRIPTION */}
                    <p className="mt-4 line-clamp-2 text-gray-600 dark:text-gray-400">
                      {chamber.description}
                    </p>

                    {/* DETAILS */}
                    <div className="mt-5 space-y-2 text-sm">

                      <div className="flex justify-between gap-4">
                        <span className="font-semibold text-gray-500">
                          Division
                        </span>

                        <span className="text-right font-medium text-gray-800 dark:text-gray-200">
                          {chamber.division}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="font-semibold text-gray-500">
                          Category
                        </span>

                        <span className="text-right font-medium text-gray-800 dark:text-gray-200">
                          {chamber.category || "—"}
                        </span>
                      </div>

                    </div>

                    {/* OPEN */}
                    <button
                      onClick={() =>
                        router.push(
                          `/chamber/${chamber.id}`
                        )
                      }
                      className="mt-6 w-full rounded-xl bg-blue-600 py-3 font-bold text-white transition hover:bg-blue-700"
                    >
                      Open Chamber →
                    </button>

                  </div>
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
        </footer>

      </div>
    </main>
  );
}