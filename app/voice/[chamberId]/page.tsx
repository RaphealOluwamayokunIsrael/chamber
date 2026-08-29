"use client";

import { useParams, useRouter } from "next/navigation";

import JaasCall from "@/app/components/jaas/JaasCall";

export default function VoicePage() {
  const params = useParams();
  const router = useRouter();

  const chamberId = params.chamberId as string;

  function handleLeave() {
    router.push(`/chamber/${chamberId}`);
  }

  if (!chamberId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
        <div className="text-center">
          <div className="text-5xl">⚠️</div>

          <h1 className="mt-5 text-3xl font-bold text-white">
            Chamber Not Found
          </h1>

          <p className="mt-3 text-slate-400">
            No Chamber ID was provided.
          </p>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-8 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Return Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
              Chamber
            </p>

            <h1 className="mt-1 text-3xl font-bold text-white">
              Voice Call
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Chamber ID: {chamberId}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLeave}
            className="rounded-xl bg-slate-800 px-5 py-3 font-semibold text-white transition hover:bg-slate-700"
          >
            Back to Chamber
          </button>
        </div>

        <JaasCall
          chamberId={chamberId}
          participantName="Chamber User"
          onLeave={handleLeave}
        />
      </div>
    </main>
  );
}