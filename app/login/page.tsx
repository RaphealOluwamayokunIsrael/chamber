"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(`❌ ${error.message}`);
      return;
    }

    router.push("/welcome");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-6 py-10 dark:bg-gray-950">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-2xl dark:bg-gray-900">

        <h1 className="mb-3 text-center text-4xl font-extrabold text-gray-900 dark:text-white">
          Welcome Back
        </h1>

        <p className="mb-8 text-center text-gray-600 dark:text-gray-300">
          Sign in to continue to Chamber.
        </p>

        <form onSubmit={handleLogin} className="space-y-5">

          <div>
            <label className="mb-2 block font-semibold text-gray-900 dark:text-white">
              Email Address
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-3 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-900 dark:text-white">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-3 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 text-white font-bold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

        </form>

        {message && (
          <div className="mt-6 rounded-xl bg-blue-100 p-4 text-center text-blue-700 dark:bg-blue-900 dark:text-blue-200">
            {message}
          </div>
        )}

        <p className="mt-8 text-center text-gray-700 dark:text-gray-300">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="font-bold text-blue-600 hover:underline"
          >
            Create Account
          </Link>
        </p>

      </div>
    </main>
  );
}