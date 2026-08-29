"use client";

import { ConnectionState } from "livekit-client";

interface ConnectionStatusProps {
  connectionState: ConnectionState;
}

export default function ConnectionStatus({
  connectionState,
}: ConnectionStatusProps) {
  let label = "Disconnected";
  let indicator = "bg-red-500";
  let textColor = "text-red-400";

  if (connectionState === ConnectionState.Connecting) {
    label = "Connecting...";
    indicator = "bg-yellow-400 animate-pulse";
    textColor = "text-yellow-400";
  }

  if (connectionState === ConnectionState.Connected) {
    label = "Connected";
    indicator = "bg-emerald-400";
    textColor = "text-emerald-400";
  }

  if (connectionState === ConnectionState.Reconnecting) {
    label = "Reconnecting...";
    indicator = "bg-yellow-400 animate-pulse";
    textColor = "text-yellow-400";
  }

  if (connectionState === ConnectionState.Disconnected) {
    label = "Disconnected";
    indicator = "bg-red-500";
    textColor = "text-red-400";
  }

  return (
    <div className="mt-3 flex items-center gap-2">
      <span
        className={`h-2.5 w-2.5 rounded-full ${indicator}`}
      />

      <span className={`text-sm font-medium ${textColor}`}>
        {label}
      </span>
    </div>
  );
}