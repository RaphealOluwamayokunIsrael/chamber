"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SignUpPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    setMessage("");

    if (password !== confirmPassword) {
      setMessage("❌ Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    setLoading(false);

    if (error) {
      setMessage(`❌ ${error.message}`);
      return;
    }

    setMessage(
      "✅ Account created successfully! Please check your email and verify your account before signing in."
    );

    setFullName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-6 py-10 dark:bg-gray-950">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-2xl dark:bg-gray-900">

        <h1 className="mb-3 text-center text-4xl font-extrabold text-gray-900 dark:text-white">
          Create Account
        </h1>

        <p className="mb-8 text-center text-gray-600 dark:text-gray-300">
          Join Chamber and collaborate securely with your organization.
        </p>

        <form onSubmit={handleSignup} className="space-y-5">

          <div>
            <label className="mb-2 block font-semibold text-gray-900 dark:text-white">
              Full Name
            </label>

            <input
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-3 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              required
            />
          </div>

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

          <div>
            <label className="mb-2 block font-semibold text-gray-900 dark:text-white">
              Confirm Password
            </label>

            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-3 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

        </form>

        {message && (
          <div className="mt-6 rounded-xl bg-blue-100 p-4 text-center text-blue-700 dark:bg-blue-900 dark:text-blue-200">
            {message}
          </div>
        )}

        <p className="mt-8 text-center text-gray-700 dark:text-gray-300">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-blue-600 hover:underline"
          >
            Sign In
          </Link>
        </p>

      </div>
    </main>
  );
}