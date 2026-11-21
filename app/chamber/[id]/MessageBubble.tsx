
"use client";

import { useEffect, useRef, useState } from "react";

type ReplyMessage = {
  id: string;
  message: string;
  sender: string;
  deleted: boolean;
};

type Props = {
  messageId: string;
  message: string;
  sender: string;
  createdAt: string;
  isMine: boolean;
  edited: boolean;
  deleted: boolean;
  replyToMessage: ReplyMessage | null;
  onReply: () => void;
  onEdit: (newMessage: string) => Promise<void>;
  onDelete: () => Promise<void>;
};

const EDIT_WINDOW = 10 * 60 * 1000;

export default function MessageBubble({
  messageId,
  message,
  sender,
  createdAt,
  isMine,
  edited,
  deleted,
  replyToMessage,
  onReply,
  onEdit,
  onDelete,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const touchStartRef = useRef<{
    x: number;
    y: number;
  } | null>(null);

  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(message);
  const [saving, setSaving] = useState(false);

  const createdTime = new Date(createdAt).getTime();

  const canEdit =
    isMine &&
    !deleted &&
    Number.isFinite(createdTime) &&
    Date.now() - createdTime <= EDIT_WINDOW;

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

  useEffect(() => {
    setEditText(message);
  }, [message]);

  useEffect(() => {
    if (!canEdit) {
      setEditing(false);
    }
  }, [canEdit]);

  async function saveEdit() {
    const trimmed = editText.trim();

    if (!trimmed || trimmed === message || !canEdit) {
      setEditing(false);
      setEditText(message);
      return;
    }

    setSaving(true);

    try {
      await onEdit(trimmed);
      setEditing(false);
    } catch (error) {
      console.error("EDIT MESSAGE ERROR:", error);
    } finally {
      setSaving(false);
    }
  }

  async function deleteMessage() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this message?"
    );

    if (confirmed) {
      await onDelete();
    }
  }

  function handleTouchStart(
    e: React.TouchEvent<HTMLDivElement>
  ) {
    const touch = e.touches[0];

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
  }

  function handleTouchEnd(
    e: React.TouchEvent<HTMLDivElement>
  ) {
    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];

    const deltaX =
      touch.clientX - touchStartRef.current.x;

    const deltaY =
      touch.clientY - touchStartRef.current.y;

    if (
      deltaX > 65 &&
      Math.abs(deltaX) > Math.abs(deltaY) * 1.3
    ) {
      onReply();
    }

    touchStartRef.current = null;
  }

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
      data-message-id={messageId}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`flex transition-all duration-500 ease-out ${
        isMine ? "justify-end" : "justify-start"
      } ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-3 opacity-0"
      }`}
    >
      <div
        className={`flex max-w-[88%] flex-col sm:max-w-[70%] ${
          isMine ? "items-end" : "items-start"
        }`}
      >
        {!isMine && (
          <div className="mb-1.5 flex items-center gap-2 px-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-700">
              {sender?.charAt(0)?.toUpperCase() || "C"}
            </div>

            <p className="text-xs font-semibold text-slate-700">
              {sender}
            </p>
          </div>
        )}

        <div
          className={`min-w-0 rounded-2xl px-4 py-3 sm:px-5 ${
            isMine
              ? "rounded-br-md bg-[#101827] text-white shadow-sm"
              : "rounded-bl-md border border-slate-200 bg-white text-slate-800 shadow-sm"
          }`}
        >
          {replyToMessage && (
            <div
              className={`mb-3 rounded-lg border-l-[3px] px-3 py-2 ${
                isMine
                  ? "border-white/70 bg-white/10"
                  : "border-slate-700 bg-slate-50"
              }`}
            >
              <p
                className={`text-[11px] font-semibold ${
                  isMine ? "text-white" : "text-slate-700"
                }`}
              >
                {replyToMessage.sender}
              </p>

              <p
                className={`mt-0.5 line-clamp-2 break-words text-xs ${
                  isMine ? "text-slate-200" : "text-slate-500"
                }`}
              >
                {replyToMessage.deleted
                  ? "This message was deleted"
                  : replyToMessage.message}
              </p>
            </div>
          )}

          {deleted ? (
            <p
              className={`text-sm italic ${
                isMine ? "text-slate-300" : "text-slate-400"
              }`}
            >
              This message was deleted
            </p>
          ) : editing ? (
            <div className="min-w-[190px]">
              <textarea
                autoFocus
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={3}
                className="w-full resize-y rounded-lg border border-white/20 bg-white/10 p-2 text-sm text-white outline-none placeholder:text-slate-300"
              />

              <div className="mt-2 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    setEditing(false);
                    setEditText(message);
                  }}
                  className="rounded-md px-2 py-1 text-slate-200 hover:bg-white/10 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={saving || !editText.trim()}
                  onClick={saveEdit}
                  className="rounded-md bg-white px-3 py-1 font-semibold text-slate-900 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap break-words text-sm leading-6">
              {message}
            </p>
          )}

          <div
            className={`mt-2 flex items-center justify-end gap-1.5 text-[10px] ${
              isMine ? "text-slate-300" : "text-slate-400"
            }`}
          >
            {edited && !deleted && <span>Edited</span>}

            {edited && !deleted && <span>·</span>}

            <span>
              {dateLabel} · {timeLabel}
            </span>
          </div>
        </div>

        {!deleted && !editing && (
          <div className="mt-1 flex items-center gap-3 px-2">
            <button
              type="button"
              onClick={onReply}
              className="text-[11px] font-medium text-slate-400 transition hover:text-slate-800"
            >
              Reply
            </button>

            {isMine && (
              <>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="text-[11px] font-medium text-slate-400 transition hover:text-slate-800"
                  >
                    Edit
                  </button>
                )}

                <button
                  type="button"
                  onClick={deleteMessage}
                  className="text-[11px] font-medium text-slate-400 transition hover:text-red-600"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
