"use client";

import { useEffect, useState } from "react";
import {
  Room,
  RoomEvent,
  RemoteParticipant,
  LocalParticipant,
  ConnectionState,
} from "livekit-client";

import VoiceControls from "./VoiceControls";
import ParticipantsList from "./ParticipantsList";
import ConnectionStatus from "./ConnectionStatus";

interface VoiceRoomProps {
  roomName: string;
  participantName: string;
}

export default function VoiceRoom({
  roomName,
  participantName,
}: VoiceRoomProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<
    (RemoteParticipant | LocalParticipant)[]
  >([]);

  const [connectionState, setConnectionState] =
    useState<ConnectionState>(ConnectionState.Disconnected);

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let activeRoom: Room | null = null;

    async function connectToRoom() {
      try {
        setLoading(true);
        setError("");

        /*
         * Request a secure LiveKit token from our
         * server-side API.
         */
        const response = await fetch("/api/livekit-token", {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            roomName,
            participantName,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error || "Unable to obtain LiveKit token."
          );
        }

        if (!data?.token) {
          throw new Error("LiveKit token was not returned.");
        }

        const livekitUrl =
  process.env.NEXT_PUBLIC_LIVEKIT_URL;

console.log(
  "LIVEKIT URL:",
  process.env.NEXT_PUBLIC_LIVEKIT_URL
);

if (!livekitUrl) {
          throw new Error(
            "NEXT_PUBLIC_LIVEKIT_URL is not configured."
          );
        }

        /*
         * Create the LiveKit room.
         */
        activeRoom = new Room({
          adaptiveStream: true,
          dynacast: true,
        });

        /*
         * Connection state.
         */
        activeRoom.on(
          RoomEvent.ConnectionStateChanged,
          (state) => {
            setConnectionState(state);
          }
        );

        /*
         * Participant joins.
         */
        activeRoom.on(
          RoomEvent.ParticipantConnected,
          () => {
            updateParticipants(activeRoom);
          }
        );

        /*
         * Participant leaves.
         */
        activeRoom.on(
          RoomEvent.ParticipantDisconnected,
          () => {
            updateParticipants(activeRoom);
          }
        );

        /*
         * Local track changes.
         */
        activeRoom.on(
          RoomEvent.LocalTrackPublished,
          () => {
            updateParticipants(activeRoom);
          }
        );

        activeRoom.on(
          RoomEvent.LocalTrackUnpublished,
          () => {
            updateParticipants(activeRoom);
          }
        );

        /*
         * Connect to LiveKit.
         */
        await activeRoom.connect(livekitUrl, data.token);

        /*
         * Request microphone permission and publish
         * the microphone.
         */
        await activeRoom.localParticipant.setMicrophoneEnabled(
          true
        );

        setRoom(activeRoom);

        updateParticipants(activeRoom);

        setLoading(false);
      } catch (err) {
        console.error("Chamber Voice Error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to connect to Chamber Voice."
        );

        setLoading(false);
      }
    }

    function updateParticipants(currentRoom: Room | null) {
      if (!currentRoom) return;

      const localParticipant =
        currentRoom.localParticipant;

      const remoteParticipants = Array.from(
        currentRoom.remoteParticipants.values()
      );

      setParticipants([
        localParticipant,
        ...remoteParticipants,
      ]);
    }

    connectToRoom();

    /*
     * Cleanup when the user leaves the page.
     */
    return () => {
      if (activeRoom) {
        activeRoom.disconnect();
      }

      setRoom(null);
      setParticipants([]);
    };
  }, [roomName, participantName]);

  /*
   * Leave the voice room.
   */
  async function handleLeave() {
    if (room) {
      await room.disconnect();
      setRoom(null);
      setParticipants([]);
    }

    window.history.back();
  }

  /*
   * Toggle microphone.
   */
  async function handleToggleMicrophone() {
    if (!room) return;

    const currentlyEnabled =
      room.localParticipant.isMicrophoneEnabled;

    await room.localParticipant.setMicrophoneEnabled(
      !currentlyEnabled
    );

    setParticipants((current) => [...current]);
  }

  /*
   * Loading screen.
   */
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

          <h1 className="mt-6 text-2xl font-bold text-white">
            Connecting to Chamber Voice
          </h1>

          <p className="mt-2 text-slate-400">
            Please wait while we connect you to the room.
          </p>
        </div>
      </main>
    );
  }

  /*
   * Error screen.
   */
  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
        <div className="w-full max-w-lg rounded-3xl bg-slate-900 p-8 text-center shadow-2xl">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-3xl">
            ⚠️
          </div>

          <h1 className="mt-6 text-3xl font-bold text-white">
            Voice Connection Failed
          </h1>

          <p className="mt-4 text-slate-400">
            {error}
          </p>

          <button
            onClick={() => window.history.back()}
            className="mt-8 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Return to Chamber
          </button>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10">

      <div className="mx-auto max-w-5xl">

        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
              Chamber Voice
            </p>

            <h1 className="mt-2 text-4xl font-extrabold text-white">
              {roomName}
            </h1>

            <ConnectionStatus
              connectionState={connectionState}
            />

          </div>

          <div className="rounded-xl bg-slate-900 px-5 py-3 text-sm text-slate-400">
            You are connected as{" "}
            <span className="font-semibold text-white">
              {participantName}
            </span>
          </div>

        </div>

        {/* PARTICIPANTS */}

        <ParticipantsList
          participants={participants}
        />

        {/* CONTROLS */}

        <div className="mt-8">

          <VoiceControls
            isMicrophoneEnabled={
              room?.localParticipant
                .isMicrophoneEnabled ?? false
            }
            onToggleMicrophone={
              handleToggleMicrophone
            }
            onLeave={handleLeave}
          />

        </div>

      </div>

    </main>
  );
}