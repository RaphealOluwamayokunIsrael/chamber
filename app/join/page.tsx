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

    try {
      /*
       * CHECK AUTHENTICATION
       */
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error(
          "GET USER ERROR:",
          userError
        );

        setMessage(
          `Authentication error: ${userError.message}`
        );

        setLoading(false);
        return;
      }

      if (!user) {
        setMessage(
          "Please login first."
        );

        setLoading(false);
        return;
      }

      /*
       * VALIDATE CHAMBER CODE
       */
      const code = chamberCode
        .trim()
        .toUpperCase();

      if (!code) {
        setMessage(
          "Please enter a Chamber Code."
        );

        setLoading(false);
        return;
      }

      /*
       * FIND CHAMBER USING SECURE DATABASE FUNCTION
       *
       * We do NOT directly SELECT from chambers here.
       *
       * This is important because Chambers have RLS enabled
       * and users who are not yet members cannot normally
       * SELECT a private Chamber.
       */
      const {
        data: chamber,
        error: chamberError,
      } = await supabase.rpc(
        "find_chamber_by_code",
        {
          input_code: code,
        }
      );

      if (chamberError) {
        console.error(
          "FIND CHAMBER ERROR:",
          chamberError
        );

        setMessage(
          chamberError.message ||
            "Unable to find the Chamber."
        );

        setLoading(false);
        return;
      }

      /*
       * NO CHAMBER FOUND
       */
      if (!chamber || chamber.length === 0) {
        setMessage(
          "❌ Chamber not found. Please check the Chamber Code."
        );

        setLoading(false);
        return;
      }

      /*
       * RPC RETURNS AN ARRAY
       *
       * We only expect one Chamber because Chamber Codes
       * should be unique.
       */
      const foundChamber = chamber[0];

      console.log(
        "========== CHAMBER FOUND =========="
      );

      console.log(
        "CHAMBER ID:",
        foundChamber.id
      );

      console.log(
        "CHAMBER NAME:",
        foundChamber.chamber_name
      );

      console.log(
        "CHAMBER CODE:",
        foundChamber.chamber_code
      );

      console.log(
        "CURRENT USER:",
        user.id
      );

      console.log(
        "==================================="
      );

      /*
       * CHECK WHETHER USER IS ALREADY A MEMBER
       */
      const {
        data: existingMember,
        error: memberCheckError,
      } = await supabase
        .from("members")
        .select("id, role")
        .eq(
          "chamber_id",
          foundChamber.id
        )
        .eq(
          "user_id",
          user.id
        )
        .maybeSingle();

      /*
       * Because the user is not yet a member,
       * the members SELECT policy may prevent this
       * lookup. Therefore we don't treat that as
       * proof that membership doesn't exist.
       *
       * If there is no error, we can safely use the result.
       */
      if (
        memberCheckError &&
        memberCheckError.code !== "PGRST116"
      ) {
        console.warn(
          "MEMBER CHECK:",
          memberCheckError
        );
      }

      /*
       * ALREADY A MEMBER
       */
      if (existingMember) {
        setMessage(
          "You are already a member of this Chamber."
        );

        setLoading(false);

        router.push(
          `/chamber/${foundChamber.id}`
        );

        return;
      }

      /*
       * JOIN CHAMBER
       *
       * Your current RLS policy allows an authenticated
       * user to insert themselves as a member when:
       *
       * user_id = auth.uid()
       */
      const {
        error: joinError,
      } = await supabase
        .from("members")
        .insert([
          {
            chamber_id: foundChamber.id,
            user_id: user.id,
            role: "Member",
          },
        ]);

      if (joinError) {
        console.error(
          "JOIN CHAMBER ERROR:",
          joinError
        );

        /*
         * If the user was already a member but the
         * membership check was hidden by RLS, the
         * database may return a duplicate error.
         */
        if (
          joinError.code === "23505"
        ) {
          setMessage(
            "You are already a member of this Chamber."
          );

          setLoading(false);

          router.push(
            `/chamber/${foundChamber.id}`
          );

          return;
        }

        setMessage(
          joinError.message ||
            "Unable to join the Chamber."
        );

        setLoading(false);
        return;
      }

      /*
       * SUCCESS
       */
      console.log(
        "SUCCESSFULLY JOINED CHAMBER:",
        foundChamber.id
      );

      router.push(
        `/chamber/${foundChamber.id}`
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

        {/* HEADER */}
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
          Join Chamber
        </h1>

        <p className="mt-2 text-center text-gray-600 dark:text-gray-400">
          Enter the Chamber Code shared by the administrator.
        </p>

        {/* FORM */}
        <form
          onSubmit={handleJoin}
          className="mt-8 space-y-5"
        >

          {/* CHAMBER CODE */}
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
              className="w-full rounded-xl border border-gray-300 p-4 uppercase dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />

          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Joining Chamber..."
              : "Join Chamber"}
          </button>

          {/* MESSAGE */}
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

        {/* FOOTER */}
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