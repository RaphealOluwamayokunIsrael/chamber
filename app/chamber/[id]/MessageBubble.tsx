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
      className={`mb-4 flex transition-all duration-500 ease-out ${
        isMine ? "justify-end" : "justify-start"
      } ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-3 opacity-0"
      }`}
    >
      <div
        className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-lg ${
          isMine
            ? "rounded-br-md bg-blue-600 text-white"
            : "rounded-bl-md bg-slate-800 text-white"
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
          {dateLabel} · {timeLabel}
        </p>
      </div>
    </div>
  );
}