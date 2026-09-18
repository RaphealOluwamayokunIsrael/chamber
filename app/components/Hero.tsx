"use client";

import Link from "next/link";
import { MessageSquare, Megaphone, Folder } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white px-6 pb-24 pt-24 text-gray-900 transition-colors duration-300 dark:bg-gray-950 dark:text-white md:pb-32 md:pt-32">

      {/* Chamber background watermark */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 opacity-[0.045] dark:opacity-[0.055]">
        <img
          src="/chamber-icon.svg.png"
          alt=""
          className="h-[420px] w-[420px] object-contain md:h-[650px] md:w-[650px]"
        />
      </div>

      {/* Soft background glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 z-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-100/60 blur-3xl dark:bg-blue-900/20" />

      {/* Hero content */}
      <div className="relative z-10 mx-auto max-w-5xl text-center">

        <div className="mb-8 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-5 py-2 text-sm font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300">
          Where Organization Meets Focus
        </div>

        <h1 className="text-5xl font-extrabold leading-tight tracking-tight md:text-7xl">
          One Platform.
          <br />
          <span className="text-blue-600 dark:text-blue-400">
            Every Organization.
          </span>
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300 md:text-xl">
          Chamber gives your organization one secure workspace to communicate,
          collaborate, share resources, manage activities and stay organized.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-600/20 transition duration-300 hover:-translate-y-1 hover:bg-blue-700"
          >
            Get Started
          </Link>

          <Link
            href="/login"
            className="rounded-xl border border-gray-300 bg-white px-8 py-4 text-lg font-semibold text-gray-800 transition duration-300 hover:-translate-y-1 hover:border-blue-600 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-blue-400 dark:hover:text-blue-400"
          >
            Sign In
          </Link>
        </div>

        {/* Product preview */}
        <div className="mx-auto mt-20 max-w-4xl">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 shadow-2xl shadow-gray-300/30 dark:border-gray-800 dark:bg-gray-900 dark:shadow-black/30">
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-left dark:border-gray-800 dark:bg-gray-950">

              <div className="mb-6 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-700" />
                <div className="h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-700" />
                <div className="h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-700" />
              </div>

              <div className="grid gap-4 md:grid-cols-3">

                <div className="rounded-xl bg-blue-50 p-5 dark:bg-blue-950/40">
                  <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />

                  <p className="mt-3 text-sm font-medium text-gray-900 dark:text-white">
                    Communication
                  </p>

                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    Keep conversations organized.
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-5 dark:bg-gray-900">
                  <Megaphone className="h-6 w-6 text-gray-700 dark:text-gray-300" />

                  <p className="mt-3 text-sm font-medium text-gray-900 dark:text-white">
                    Announcements
                  </p>

                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    Keep everyone informed.
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-5 dark:bg-gray-900">
                  <Folder className="h-6 w-6 text-gray-700 dark:text-gray-300" />

                  <p className="mt-3 text-sm font-medium text-gray-900 dark:text-white">
                    Resources
                  </p>

                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    Keep important files together.
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center text-sm text-gray-500 dark:text-gray-400">
          <span>Explore Chamber</span>
          <span className="mt-2 animate-bounce text-xl">↓</span>
        </div>

      </div>
    </section>
  );
}