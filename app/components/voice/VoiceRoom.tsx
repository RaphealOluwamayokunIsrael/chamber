
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Room,
  RoomEvent,
  RemoteParticipant,
  LocalParticipant,
  ConnectionState,
  ParticipantEvent,
} from "livekit-client";
import {
  AudioLines,
  Check,
  CircleAlert,
  Headphones,
  Loader2,
  Mic,
  MicOff,
  PhoneOff,
  Radio,
  Search,
  ShieldCheck,
  Users,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";

interface VoiceRoomProps {
  roomName: string;
  participantName: string;
}

type VoiceParticipant = RemoteParticipant | LocalParticipant;

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

function getParticipantName(participant: VoiceParticipant) {
  return participant.name || participant.identity || "Participant";
}

function ParticipantCard({
  participant,
  isLocal,
  speaking,
}: {
  participant: VoiceParticipant;
  isLocal: boolean;
  speaking: boolean;
}) {
  const name = getParticipantName(participant);
  const microphoneEnabled = participant.isMicrophoneEnabled;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 ${
        isLocal
          ? "border-blue-400/60 bg-gradient-to-br from-blue-50 to-blue-100/70 shadow-[0_8px_30px_rgba(37,99,235,0.10)]"
          : "border-slate-200 bg-white hover:border-blue-200 hover:shadow-lg"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-lg ${
              isLocal
                ? "bg-gradient-to-br from-blue-400 to-blue-700"
                : "bg-gradient-to-br from-indigo-400 to-violet-700"
            }`}
          >
            {getInitials(name)}
          </div>

          <span
            className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-[3px] border-white ${
              speaking ? "bg-emerald-500" : "bg-slate-400"
            }`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-lg font-bold text-slate-950">
              {name}
              {isLocal && (
                <span className="ml-1 text-sm font-medium text-slate-500">
                  (You)
                </span>
              )}
            </h3>

            {isLocal && (
              <span className="rounded-full bg-blue-200/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-800">
                Local
              </span>
            )}
          </div>

          <p className="mt-1 text-xs font-medium text-slate-500">
            {speaking
              ? "Speaking now"
              : microphoneEnabled
              ? "Microphone on"
              : "Microphone muted"}
          </p>
        </div>

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            microphoneEnabled
              ? "bg-emerald-50 text-emerald-600"
              : "bg-rose-50 text-rose-500"
          }`}
          title={microphoneEnabled ? "Microphone on" : "Microphone muted"}
        >
          {microphoneEnabled ? <Mic size={18} /> : <MicOff size={18} />}
        </div>
      </div>

      <div className="mt-6 flex h-9 items-center justify-center gap-1">
        {Array.from({ length: 23 }).map((_, index) => {
          const height = 7 + ((index * 13 + 7) % 24);

          return (
            <span
              key={index}
              className={`w-[3px] rounded-full transition-all duration-300 ${
                speaking && microphoneEnabled
                  ? "animate-pulse bg-emerald-500"
                  : "bg-slate-300"
              }`}
              style={{
                height: `${height}px`,
                opacity: speaking && microphoneEnabled ? 1 : 0.7,
                animationDelay: `${index * 45}ms`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function VoiceRoom({
  roomName,
  participantName,
}: VoiceRoomProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<VoiceParticipant[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    ConnectionState.Disconnected
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [microphoneEnabled, setMicrophoneEnabled] = useState(false);
  const [speakingIds, setSpeakingIds] = useState<string[]>([]);
  const [micBusy, setMicBusy] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let activeRoom: Room | null = null;
    let cancelled = false;

    function updateParticipants(currentRoom: Room) {
      if (cancelled) return;

      setParticipants([
        currentRoom.localParticipant,
        ...Array.from(currentRoom.remoteParticipants.values()),
      ]);

      setMicrophoneEnabled(
        currentRoom.localParticipant.isMicrophoneEnabled
      );
    }

    function updateSpeakers(currentRoom: Room) {
      if (cancelled) return;

      setSpeakingIds(
        currentRoom.activeSpeakers.map((participant) => participant.identity)
      );
    }

    async function connectToRoom() {
      try {
        setLoading(true);
        setError("");
        setNotice("");

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
          throw new Error(data?.error || "Unable to obtain LiveKit token.");
        }

        if (!data?.token) {
          throw new Error("LiveKit token was not returned.");
        }

        const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

        if (!livekitUrl) {
          throw new Error("NEXT_PUBLIC_LIVEKIT_URL is not configured.");
        }

        if (cancelled) return;

        const newRoom = new Room({
          adaptiveStream: true,
          dynacast: true,
        });

        activeRoom = newRoom;

        newRoom.on(RoomEvent.ConnectionStateChanged, (state) => {
          if (!cancelled) setConnectionState(state);
        });

        newRoom.on(RoomEvent.ParticipantConnected, () => {
          updateParticipants(newRoom);
        });

        newRoom.on(RoomEvent.ParticipantDisconnected, () => {
          updateParticipants(newRoom);
        });

        newRoom.on(RoomEvent.LocalTrackPublished, () => {
          updateParticipants(newRoom);
        });

        newRoom.on(RoomEvent.LocalTrackUnpublished, () => {
          updateParticipants(newRoom);
        });

        newRoom.on(RoomEvent.TrackMuted, () => {
          updateParticipants(newRoom);
        });

        newRoom.on(RoomEvent.TrackUnmuted, () => {
          updateParticipants(newRoom);
        });

        newRoom.on(RoomEvent.ActiveSpeakersChanged, () => {
          updateSpeakers(newRoom);
        });

        newRoom.on(RoomEvent.Disconnected, () => {
          if (!cancelled) {
            setConnectionState(ConnectionState.Disconnected);
            setSpeakingIds([]);
          }
        });

        await newRoom.connect(livekitUrl, data.token);

        if (cancelled) {
          await newRoom.disconnect();
          return;
        }

        // A microphone permission failure should not prevent
        // the user from joining the voice room.
        try {
          await newRoom.localParticipant.setMicrophoneEnabled(true);
        } catch (micError) {
          console.warn("Microphone permission:", micError);

          if (!cancelled) {
            setNotice(
              "Connected successfully. Your microphone is off. Check browser microphone permissions to enable it."
            );
          }
        }

        if (cancelled) {
          await newRoom.disconnect();
          return;
        }

        setRoom(newRoom);
        updateParticipants(newRoom);
        updateSpeakers(newRoom);
        setConnectionState(newRoom.state);
        setLoading(false);
      } catch (err) {
        console.error("Chamber Voice Error:", err);

        if (activeRoom) {
          await activeRoom.disconnect();
        }

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to connect to Chamber Voice."
          );
          setLoading(false);
        }
      }
    }

    void connectToRoom();

    return () => {
      cancelled = true;

      if (activeRoom) {
        void activeRoom.disconnect();
      }
    };
  }, [roomName, participantName]);

  const filteredParticipants = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return participants;

    return participants.filter((participant) =>
      getParticipantName(participant).toLowerCase().includes(query)
    );
  }, [participants, search]);

  const connected = connectionState === ConnectionState.Connected;

  async function handleToggleMicrophone() {
    if (!room || !connected || micBusy) return;

    setMicBusy(true);
    setNotice("");

    try {
      await room.localParticipant.setMicrophoneEnabled(!microphoneEnabled);

      setMicrophoneEnabled(room.localParticipant.isMicrophoneEnabled);

      setParticipants([
        room.localParticipant,
        ...Array.from(room.remoteParticipants.values()),
      ]);
    } catch (err) {
      console.error("Microphone toggle failed:", err);
      setNotice(
        err instanceof Error
          ? err.message
          : "Unable to change microphone status."
      );
    } finally {
      setMicBusy(false);
    }
  }

  async function handleLeave() {
    if (leaving) return;

    setLeaving(true);

    try {
      if (room) {
        await room.disconnect();
      }

      setRoom(null);
      setParticipants([]);
      window.history.back();
    } catch (err) {
      console.error("Unable to leave room:", err);
      setNotice("Unable to leave the voice room. Please try again.");
      setLeaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030b1e] px-6">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-blue-400/20 bg-blue-500/10 shadow-[0_0_60px_rgba(37,99,235,0.15)]">
            <Loader2 className="h-10 w-10 animate-spin text-blue-400" />
          </div>

          <h1 className="mt-7 text-2xl font-bold text-white">
            Connecting to Chamber Voice
          </h1>

          <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">
            Preparing your secure voice room and connecting participants.
          </p>

          <div className="mx-auto mt-7 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300">
            <ShieldCheck size={15} className="text-blue-400" />
            Establishing connection
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030b1e] px-6">
        <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0c1830] p-8 text-center shadow-2xl sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
            <CircleAlert size={30} />
          </div>

          <h1 className="mt-6 text-3xl font-bold text-white">
            Voice Connection Failed
          </h1>

          <p className="mt-4 break-words text-sm leading-7 text-slate-400">
            {error}
          </p>

          <button
            onClick={() => window.history.back()}
            className="mt-8 rounded-xl bg-blue-600 px-7 py-3 font-semibold text-white transition hover:bg-blue-500"
          >
            Return to Chamber
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#03112d] text-white">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-blue-600/20 blur-[130px]" />
        <div className="absolute -bottom-64 -left-40 h-[650px] w-[650px] rounded-full bg-blue-700/20 blur-[140px]" />
        <div className="absolute left-1/2 top-20 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-8 lg:px-12">
        {/* Brand navigation */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-700 shadow-lg shadow-blue-900/40">
              <AudioLines size={25} strokeWidth={2.5} />
            </div>

            <span className="text-xl font-extrabold tracking-tight sm:text-2xl">
              Chamber
            </span>

            <span className="hidden h-8 w-px bg-white/20 sm:block" />

            <div className="hidden items-center gap-2 sm:flex">
              <AudioLines size={22} className="text-blue-400" />
              <span className="text-lg font-semibold text-slate-200">
                Chamber Voice
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/15 px-4 py-2 text-sm font-semibold text-blue-100">
            <Headphones size={17} />
            Voice Room
          </div>
        </header>

        {/* Hero */}
        <section className="relative grid gap-8 py-10 lg:grid-cols-[1fr_auto] lg:items-center lg:py-14">
          <div className="relative z-10 min-w-0">
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-200">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-blue-400" />
              Live Voice Room
            </div>

            <h1 className="mt-4 break-words text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              {roomName}
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-lg">
              A real-time voice space for focused discussions and collaboration.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${
                  connected
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                    : "border-amber-500/20 bg-amber-500/10 text-amber-300"
                }`}
              >
                {connected ? <Wifi size={17} /> : <WifiOff size={17} />}
                {connected
                  ? "Connected"
                  : connectionState === ConnectionState.Reconnecting
                  ? "Reconnecting"
                  : connectionState === ConnectionState.Connecting
                  ? "Connecting"
                  : "Disconnected"}
              </span>

              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100">
                <Users size={17} />
                {participants.length}{" "}
                {participants.length === 1 ? "Participant" : "Participants"}
              </span>

              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100">
                <ShieldCheck size={17} className="text-blue-400" />
                Chamber Voice
              </span>
            </div>
          </div>

          {/* Connected identity */}
          <div className="relative z-10 w-full rounded-3xl border border-blue-300/20 bg-white/[0.07] p-5 shadow-2xl backdrop-blur-xl sm:min-w-[300px] lg:w-auto">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-700 text-2xl font-bold shadow-lg">
                {getInitials(participantName)}
              </div>

              <div className="min-w-0">
                <p className="text-sm text-slate-300">
                  You are connected as
                </p>
                <h2 className="mt-1 truncate text-xl font-bold text-white">
                  {participantName}
                </h2>
              </div>

              <Check size={18} className="ml-auto shrink-0 text-emerald-400" />
            </div>
          </div>

          {/* Decorative microphone */}
          <div className="pointer-events-none absolute bottom-0 right-[29%] hidden opacity-[0.07] lg:block">
            <Mic size={230} strokeWidth={1} />
          </div>
        </section>

        {/* Notice */}
        {notice && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
            <CircleAlert size={19} className="mt-0.5 shrink-0" />
            <p className="flex-1">{notice}</p>
            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss notification"
              className="text-amber-200 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Participants panel */}
        <section className="rounded-[28px] border border-white/20 bg-gradient-to-b from-white to-[#edf3ff] p-5 text-slate-950 shadow-[0_25px_90px_rgba(0,0,0,0.25)] sm:p-8">
          <div className="flex flex-col gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <Users size={23} />
              </div>

              <div>
                <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
                  Participants ({participants.length})
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  People currently in this voice room
                </p>
              </div>
            </div>

            <div className="relative w-full sm:w-72">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search participants..."
                aria-label="Search participants"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
          </div>

          {filteredParticipants.length > 0 ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredParticipants.map((participant) => (
                <ParticipantCard
                  key={participant.identity}
                  participant={participant}
                  isLocal={participant === room?.localParticipant}
                  speaking={speakingIds.includes(participant.identity)}
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-52 flex-col items-center justify-center text-center">
              <Search size={30} className="text-slate-300" />
              <h3 className="mt-4 font-semibold text-slate-700">
                No participants found
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Try searching with another name.
              </p>
            </div>
          )}
        </section>

        {/* Call controls */}
        <section className="mt-9 flex flex-col items-center">
          <div className="flex w-full flex-wrap items-center justify-center gap-4 sm:gap-6">
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleToggleMicrophone}
                disabled={!connected || micBusy || leaving}
                aria-label={microphoneEnabled ? "Mute microphone" : "Unmute microphone"}
                aria-pressed={microphoneEnabled}
                className={`flex h-16 w-16 items-center justify-center rounded-2xl border text-white shadow-xl transition duration-200 hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:h-20 sm:w-20 ${
                  microphoneEnabled
                    ? "border-cyan-300 bg-gradient-to-br from-sky-400 to-blue-700 shadow-blue-600/30"
                    : "border-rose-400/40 bg-rose-600 shadow-rose-900/30"
                }`}
              >
                {micBusy ? (
                  <Loader2 size={27} className="animate-spin" />
                ) : microphoneEnabled ? (
                  <Mic size={30} />
                ) : (
                  <MicOff size={30} />
                )}
              </button>

              <span className="text-sm font-semibold text-slate-200">
                {microphoneEnabled ? "Mute" : "Unmute"}
              </span>
            </div>

            <div className="mx-1 hidden h-16 w-px bg-white/20 sm:block" />

            <div className="flex flex-col items-center gap-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-blue-200 sm:h-20 sm:w-20">
                <Radio size={29} />
              </div>
              <span className="text-sm font-medium text-slate-300">
                Live Audio
              </span>
            </div>

            <div className="mx-1 hidden h-16 w-px bg-white/20 sm:block" />

            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleLeave}
                disabled={leaving}
                className="flex h-16 items-center justify-center gap-3 rounded-2xl border border-red-400/40 bg-gradient-to-r from-red-500 to-rose-600 px-6 font-bold text-white shadow-xl shadow-red-950/30 transition hover:-translate-y-1 hover:from-red-400 hover:to-rose-500 disabled:cursor-not-allowed disabled:opacity-60 sm:h-20 sm:px-9"
              >
                {leaving ? (
                  <Loader2 size={23} className="animate-spin" />
                ) : (
                  <PhoneOff size={23} />
                )}
                <span>Leave Room</span>
              </button>

              <span className="text-sm font-medium text-slate-300">
                End your session
              </span>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-slate-500">
            Chamber Voice • Real-time collaboration powered by LiveKit
          </p>
        </section>
      </div>
    </main>
  );
}
