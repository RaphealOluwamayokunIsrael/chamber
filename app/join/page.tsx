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

    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      setMessage("Please login first.");
      return;
    }

    const code = chamberCode.trim().toUpperCase();

    const { data: chamber, error } = await supabase
      .from("chambers")
      .select("*")
      .eq("chamber_code", code)
      .single();

    if (error || !chamber) {
      setLoading(false);
      setMessage("❌ Chamber not found.");
      return;
    }

    const { data: member } = await supabase
      .from("members")
      .select("id")
      .eq("chamber_id", chamber.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!member) {
      const { error: joinError } = await supabase
        .from("members")
        .insert([
          {
            chamber_id: chamber.id,
            user_id: user.id,
            role: "Member",
          },
        ]);

      if (joinError) {
        setLoading(false);
        setMessage(joinError.message);
        return;
      }
    }

    router.push(`/chamber/${chamber.id}`);
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
              className="w-full rounded-xl border border-gray-300 p-4 uppercase dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />

          </div>
                    <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Joining Chamber..." : "Join Chamber"}
          </button>

          {message && (
            <div
              className={`rounded-lg p-3 text-center ${
                message.startsWith("❌")
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