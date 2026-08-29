"use client";

import {
  LocalParticipant,
  RemoteParticipant,
} from "livekit-client";

interface ParticipantCardProps {
  participant: LocalParticipant | RemoteParticipant;
}

export default function ParticipantCard({
  participant,
}: ParticipantCardProps) {
  const isLocal = participant instanceof LocalParticipant;

  const isMicrophoneEnabled =
    participant.isMicrophoneEnabled;

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5 transition hover:border-slate-600">

      <div className="flex items-center justify-between gap-4">

        {/* PARTICIPANT INFORMATION */}

        <div className="flex min-w-0 items-center gap-4">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
            {participant.identity
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="min-w-0">

            <p className="truncate font-semibold text-white">
              {participant.identity}
            </p>

            {isLocal && (
              <p className="text-sm text-blue-400">
                You
              </p>
            )}

            {!isLocal && (
              <p className="text-sm text-slate-400">
                Participant
              </p>
            )}

          </div>

        </div>

        {/* MICROPHONE STATUS */}

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            isMicrophoneEnabled
              ? "bg-emerald-500/10"
              : "bg-red-500/10"
          }`}
          title={
            isMicrophoneEnabled
              ? "Microphone on"
              : "Microphone muted"
          }
        >
          <span className="text-lg">
            {isMicrophoneEnabled
              ? "🎤"
              : "🔇"}
          </span>
        </div>

      </div>

      {/* CONNECTION INDICATOR */}

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">

        <span className="h-2 w-2 rounded-full bg-emerald-400" />

        Connected

      </div>

    </div>
  );
}