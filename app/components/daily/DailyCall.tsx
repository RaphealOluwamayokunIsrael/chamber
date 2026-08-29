"use client";

import { useEffect, useRef, useState } from "react";
import DailyIframe, {
  DailyCall as DailyCallObject,
} from "@daily-co/daily-js";

interface DailyCallProps {
  roomUrl: string;
  onLeave?: () => void;
}

export default function DailyCall({
  roomUrl,
  onLeave,
}: DailyCallProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const callRef = useRef<DailyCallObject | null>(null);

  const startingRef = useRef(false);

  const [joined, setJoined] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!roomUrl || !containerRef.current) {
      return;
    }

    if (startingRef.current) {
      return;
    }

    startingRef.current = true;

    let cancelled = false;

    async function startCall() {
      try {
        setError("");

        /*
         * Make absolutely sure there isn't
         * another Daily instance alive.
         */
        const existingCall =
          DailyIframe.getCallInstance();

        if (existingCall) {
          try {
            await existingCall.leave();
          } catch {}

          try {
            await existingCall.destroy();
          } catch {}
        }

        if (cancelled || !containerRef.current) {
          startingRef.current = false;
          return;
        }

        /*
         * Create exactly one Daily call object.
         */
        const call =
          DailyIframe.createCallObject({
            audioSource: true,
            videoSource: false,
          });

        callRef.current = call;

        call.on("joined-meeting", () => {
          if (cancelled) return;

          console.log("DAILY: joined meeting");

          setJoined(true);
          setMuted(false);
          setCameraOn(false);
        });

        call.on("left-meeting", () => {
          if (cancelled) return;

          console.log("DAILY: left meeting");

          setJoined(false);
        });

        call.on("error", (event) => {
          console.error(
            "DAILY CALL ERROR:",
            event
          );

          if (cancelled) return;

          setError(
            event?.errorMsg ||
              "Unable to connect to the Daily call."
          );
        });

        /*
         * Join the existing Daily room.
         */
        await call.join({
          url: roomUrl,
        });

        if (cancelled) {
          try {
            await call.leave();
          } catch {}

          try {
            await call.destroy();
          } catch {}

          callRef.current = null;
          startingRef.current = false;
        }
      } catch (err) {
        console.error(
          "DAILY CONNECTION ERROR:",
          err
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to join the call."
          );
        }

        callRef.current = null;
        startingRef.current = false;
      }
    }

    startCall();

    return () => {
      cancelled = true;

      const call = callRef.current;

      callRef.current = null;

      if (call) {
        call
          .leave()
          .catch(() => {})
          .finally(() => {
            call
              .destroy()
              .catch(() => {});
          });
      }

      startingRef.current = false;
    };
  }, [roomUrl]);

  async function toggleMute() {
    const call = callRef.current;

    if (!call) return;

    try {
      const nextMuted = !muted;

      await call.setLocalAudio(!nextMuted);

      setMuted(nextMuted);
    } catch (err) {
      console.error(
        "DAILY MICROPHONE ERROR:",
        err
      );
    }
  }

  async function toggleCamera() {
    const call = callRef.current;

    if (!call) return;

    try {
      const nextCamera = !cameraOn;

      await call.setLocalVideo(nextCamera);

      setCameraOn(nextCamera);
    } catch (err) {
      console.error(
        "DAILY CAMERA ERROR:",
        err
      );
    }
  }

  async function leaveCall() {
    const call = callRef.current;

    if (call) {
      try {
        await call.leave();
      } catch (err) {
        console.error(
          "DAILY LEAVE ERROR:",
          err
        );
      }

      try {
        await call.destroy();
      } catch (err) {
        console.error(
          "DAILY DESTROY ERROR:",
          err
        );
      }

      callRef.current = null;
    }

    setJoined(false);

    if (onLeave) {
      onLeave();
    }
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-2xl bg-slate-900 p-8 text-center">
        <div>
          <div className="text-5xl">
            ⚠️
          </div>

          <h2 className="mt-4 text-2xl font-bold text-white">
            Call Connection Failed
          </h2>

          <p className="mt-3 text-slate-400">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[500px] overflow-hidden rounded-2xl bg-slate-950">
      <div
        ref={containerRef}
        className="h-full min-h-[500px] w-full"
      />

      {!joined && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

            <p className="mt-4 text-slate-400">
              Joining Chamber call...
            </p>
          </div>
        </div>
      )}

      {joined && (
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-2xl bg-slate-900/95 p-3 shadow-2xl">
          <button
            type="button"
            onClick={toggleMute}
            className={`rounded-xl px-5 py-3 font-semibold text-white ${
              muted
                ? "bg-red-600"
                : "bg-slate-700"
            }`}
          >
            {muted
              ? "🔇 Unmute"
              : "🎤 Mute"}
          </button>

          <button
            type="button"
            onClick={toggleCamera}
            className={`rounded-xl px-5 py-3 font-semibold text-white ${
              cameraOn
                ? "bg-blue-600"
                : "bg-slate-700"
            }`}
          >
            {cameraOn
              ? "📹 Camera Off"
              : "📷 Camera"}
          </button>

          <button
            type="button"
            onClick={leaveCall}
            className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white"
          >
            Leave
          </button>
        </div>
      )}
    </div>
  );
}