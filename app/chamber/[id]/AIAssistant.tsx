"use client";

import { useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type AIAssistantProps = {
  chamberId: string;
  chamberName: string;
  chamberDescription: string;
  memberCount: number;
};

export default function AIAssistant({
  chamberId,
  chamberName,
  chamberDescription,
  memberCount,
}: AIAssistantProps) {
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        `Hi! I'm Chamber AI, the assistant for "${chamberName}". I can help you understand and discuss this Chamber.`,
    },
  ]);

  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    const text = message.trim();

    if (!text || loading) return;

    setMessage("");

    setMessages((current) => [
      ...current,
      {
        role: "user",
        content: text,
      },
    ]);

    setLoading(true);

    try {
      const response = await fetch(
        "/api/chamber-ai",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: text,
            chamberId,
            chamberName,
            chamberDescription,
            memberCount,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "AI request failed."
        );
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            data.reply ||
            "I couldn't generate a response.",
        },
      ]);
    } catch (error) {
      console.error(
        "AI REQUEST ERROR:",
        error
      );

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't connect to Chamber AI. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex h-full flex-col bg-slate-900">

      {/* HEADER */}

      <div className="border-b border-slate-800 px-5 py-4">

        <h2 className="font-semibold text-white">
          Chamber AI
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Your Chamber assistant
        </p>

      </div>

      {/* MESSAGES */}

      <div className="flex-1 space-y-3 overflow-y-auto p-5">

        {messages.map(
          (item, index) => (
            <div
              key={index}
              className={
                item.role === "user"
                  ? "ml-6 rounded-xl bg-blue-600 p-3 text-white"
                  : "mr-6 rounded-xl bg-slate-800 p-3 text-slate-200"
              }
            >
              <p className="whitespace-pre-wrap text-sm">
                {item.content}
              </p>
            </div>
          )
        )}

        {loading && (
          <div className="mr-6 rounded-xl bg-slate-800 p-3">

            <p className="text-sm text-slate-400">
              Chamber AI is thinking...
            </p>

          </div>
        )}

      </div>

      {/* INPUT */}

      <div className="border-t border-slate-800 p-4">

        <textarea
          rows={2}
          value={message}
          disabled={loading}
          onChange={(e) =>
            setMessage(
              e.target.value
            )
          }
          onKeyDown={
            handleKeyDown
          }
          placeholder="Ask Chamber AI..."
          className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800 p-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500 disabled:opacity-50"
        />

        <button
          type="button"
          onClick={
            sendMessage
          }
          disabled={
            loading ||
            !message.trim()
          }
          className="mt-3 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Thinking..."
            : "Ask AI"}
        </button>

      </div>

    </div>
  );
}