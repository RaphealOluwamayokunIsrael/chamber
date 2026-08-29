"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <section className="flex flex-col items-center justify-center bg-white px-6 py-28 text-center text-gray-900 transition-colors duration-300 dark:bg-gray-950 dark:text-white">
      <h1 className="text-5xl font-bold leading-tight md:text-6xl">
        One Platform.
        <br />
        Every Organization.
      </h1>

      <p className="mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
        Chamber helps universities, churches, companies, NGOs and communities
        communicate, collaborate and stay organized in one secure workspace.
      </p>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row">

        <Link
          href="/signup"
          className="rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-blue-700"
        >
          Get Started
        </Link>

        <Link
          href="/login"
          className="rounded-xl border border-blue-600 px-8 py-4 text-lg font-semibold text-blue-600 transition hover:bg-blue-600 hover:text-white"
        >
          Sign In
        </Link>

      </div>
    </section>
  );
}