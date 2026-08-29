"use client";

interface VoiceControlsProps {
  isMicrophoneEnabled: boolean;
  onToggleMicrophone: () => void;
  onLeave: () => void;
}

export default function VoiceControls({
  isMicrophoneEnabled,
  onToggleMicrophone,
  onLeave,
}: VoiceControlsProps) {
  return (
    <div className="rounded-3xl bg-slate-900 p-6 shadow-2xl">
      <div className="flex flex-wrap items-center justify-center gap-4">

        {/* MICROPHONE */}

        <button
          type="button"
          onClick={onToggleMicrophone}
          className={`flex min-w-[140px] items-center justify-center gap-3 rounded-2xl px-6 py-4 font-semibold text-white transition ${
            isMicrophoneEnabled
              ? "bg-slate-700 hover:bg-slate-600"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          <span className="text-xl">
            {isMicrophoneEnabled ? "🎤" : "🔇"}
          </span>

          <span>
            {isMicrophoneEnabled ? "Mute" : "Unmute"}
          </span>
        </button>

        {/* LEAVE */}

        <button
          type="button"
          onClick={onLeave}
          className="flex min-w-[140px] items-center justify-center gap-3 rounded-2xl bg-red-600 px-6 py-4 font-semibold text-white transition hover:bg-red-700"
        >
          <span className="text-xl">
            📞
          </span>

          <span>
            Leave
          </span>
        </button>

      </div>
    </div>
  );
}