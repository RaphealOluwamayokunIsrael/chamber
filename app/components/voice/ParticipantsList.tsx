"use client";

import {
  LocalParticipant,
  RemoteParticipant,
} from "livekit-client";

import ParticipantCard from "./ParticipantCard";

interface ParticipantsListProps {
  participants: (
    | LocalParticipant
    | RemoteParticipant
  )[];
}

export default function ParticipantsList({
  participants,
}: ParticipantsListProps) {
  return (
    <section className="rounded-3xl bg-slate-900 p-6 shadow-2xl">

      <div className="mb-6 flex items-center justify-between">

        <div>
          <h2 className="text-2xl font-bold text-white">
            Participants
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            {participants.length}{" "}
            {participants.length === 1
              ? "person"
              : "people"}{" "}
            in this voice room
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
          👥
        </div>

      </div>

      {participants.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 p-8 text-center">

          <div className="text-4xl">
            🎤
          </div>

          <p className="mt-4 font-semibold text-white">
            No participants yet
          </p>

          <p className="mt-2 text-sm text-slate-400">
            You will see people here when they join the
            Chamber voice room.
          </p>

        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">

          {participants.map((participant) => (
            <ParticipantCard
              key={participant.identity}
              participant={participant}
            />
          ))}

        </div>
      )}

    </section>
  );
}