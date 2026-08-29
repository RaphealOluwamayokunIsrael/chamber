"use client";

type Props = {
  message: string;
  sender: string;
  createdAt: string;
  isMine: boolean;
};

export default function MessageBubble({
  message,
  sender,
  createdAt,
  isMine,
}: Props) {
  return (
    <div
      className={`flex mb-4 ${
        isMine ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-lg ${
          isMine
            ? "bg-blue-600 text-white rounded-br-md"
            : "bg-slate-800 text-white rounded-bl-md"
        }`}
      >
        {!isMine && (
          <p className="mb-1 text-xs font-semibold text-blue-400">
            {sender}
          </p>
        )}

        <p className="whitespace-pre-wrap break-words">
          {message}
        </p>

        <p
          className={`mt-2 text-right text-[11px] ${
            isMine
              ? "text-blue-100"
              : "text-slate-400"
          }`}
        >
          {new Date(createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}