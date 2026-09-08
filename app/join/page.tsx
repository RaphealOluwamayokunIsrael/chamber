"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function JoinPage() {
  const router = useRouter();

  const [chamberCode, setChamberCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleJoin(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setMessage("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("GET USER ERROR:", userError);

        setMessage(
          `Authentication error: ${userError.message}`
        );

        setLoading(false);
        return;
      }

      if (!user) {
        setMessage("Please login first.");
        setLoading(false);
        return;
      }

      const code = chamberCode.trim().toUpperCase();

      if (!code) {
        setMessage("Please enter a Chamber Code.");
        setLoading(false);
        return;
      }

      const {
        data: chamber,
        error: joinError,
      } = await supabase.rpc(
        "join_chamber_by_code",
        {
          input_code: code,
        }
      );

      if (joinError) {
        console.error(
          "JOIN CHAMBER ERROR:",
          joinError
        );

        setMessage(
          joinError.message ||
            "Unable to join the Chamber."
        );

        setLoading(false);
        return;
      }

      if (!chamber || chamber.length === 0) {
        setMessage(
          "Unable to join the Chamber."
        );

        setLoading(false);
        return;
      }

      const joinedChamber = chamber[0];

      console.log(
        "SUCCESSFULLY JOINED CHAMBER:",
        joinedChamber.id
      );

      router.push(
        `/chamber/${joinedChamber.id}`
      );

    } catch (error) {
      console.error(
        "JOIN CHAMBER UNEXPECTED ERROR:",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while joining the Chamber."
      );

      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 p-6">

      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 shadow-xl p-8">

        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
          Join Chamber
        </h1>

        <p className="mt-2 text-center text-gray-600 dark:text-gray-400">
          Enter the Chamber Code shared by the administrator.
        </p>

        <form
          onSubmit={handleJoin}
          className="mt-8 space-y-5"
        >

          <div>

            <label className="block mb-2 font-medium text-gray-900 dark:text-white">
              Chamber Code
            </label>

            <input
              type="text"
              value={chamberCode}
              onChange={(e) =>
                setChamberCode(
                  e.target.value.toUpperCase()
                )
              }
              placeholder="e.g LAW500"
              autoComplete="off"
              disabled={loading}
              className="w-full rounded-xl border border-gray-300 p-4 uppercase dark:border-gray-700 dark:bg-gray-800 dark:text-white disabled:opacity-60"
            />

          </div>

          <button
            type="submit"
            disabled={
              loading ||
              !chamberCode.trim()
            }
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Joining Chamber..."
              : "Join Chamber"}
          </button>

          {message && (
            <div
              className={`rounded-lg p-3 text-center ${
                message.toLowerCase().includes("not found") ||
                message.toLowerCase().includes("error") ||
                message.toLowerCase().includes("unable")
                  ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
                  : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
              }`}
            >
              {message}
            </div>
          )}

        </form>

        <div className="mt-8 border-t border-gray-200 pt-6 text-center dark:border-gray-700">

          <p className="text-sm text-gray-500">
            Powered by
          </p>

          <h2 className="text-xl font-bold tracking-widest text-gray-900 dark:text-white">
            RIO LAB
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Building purposeful software for organizations.
          </p>

        </div>

      </div>

    </main>
  );
}
