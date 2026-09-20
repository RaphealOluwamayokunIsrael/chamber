"use client";

import { useEffect, useRef, useState } from "react";

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
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      {
        threshold: 0.05,
        rootMargin: "0px 0px -20px 0px",
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const date = new Date(createdAt);

  const now = new Date();
  const yesterday = new Date();

  yesterday.setDate(now.getDate() - 1);

  const isToday =
    date.toDateString() === now.toDateString();

  const isYesterday =
    date.toDateString() === yesterday.toDateString();

  let dateLabel = "";

  if (isToday) {
    dateLabel = "Today";
  } else if (isYesterday) {
    dateLabel = "Yesterday";
  } else {
    dateLabel = date.toLocaleDateString([], {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  const timeLabel = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      ref={ref}
      className={`flex transition-all duration-500 ease-out ${
        isMine
          ? "justify-end"
          : "justify-start"
      } ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-3 opacity-0"
      }`}
    >
      <div
        className={`max-w-[85%] sm:max-w-[70%] ${
          isMine
            ? "items-end"
            : "items-start"
        }`}
      >
        {!isMine && (
          <div className="mb-1.5 flex items-center gap-2 px-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-[11px] font-bold text-blue-600">
              {sender
                ?.charAt(0)
                ?.toUpperCase() || "C"}
            </div>

            <p className="text-xs font-semibold text-blue-600">
              {sender}
            </p>
          </div>
        )}

        <div
          className={`rounded-2xl px-4 py-3 sm:px-5 ${
            isMine
              ? "rounded-br-md bg-blue-600 text-white shadow-sm shadow-blue-100"
              : "rounded-bl-md border border-slate-200 bg-white text-slate-800 shadow-sm"
          }`}
        >
          <p className="whitespace-pre-wrap break-words text-sm leading-6">
            {message}
          </p>

          <p
            className={`mt-2 text-right text-[10px] ${
              isMine
                ? "text-blue-100"
                : "text-slate-400"
            }`}
          >
            {dateLabel} · {timeLabel}
          </p>
        </div>
      </div>
    </div>
  );
}