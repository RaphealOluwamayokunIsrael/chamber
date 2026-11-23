
"use client";

import { useState } from "react";
import {
  Bot,
  Send,
  Sparkles,
  User,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const MAX_HISTORY_MESSAGES = 12;

const suggestions = [
  "What is Chamber?",
  "Who is RIO LAB?",
  "Give me an overview of my Chambers",
  "Help me organise my work",
  "Help me write a document",
];

export default function ChamberAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(
    null
  );

  async function sendMessage() {
    const message = input.trim();

    if (!message || loading) return;

    const updatedMessages: Message[] = [
      ...messages,
      { role: "user", content: message },
    ];

    const conversationHistory = updatedMessages.slice(
      -MAX_HISTORY_MESSAGES
    );

    setInput("");
    setError("");
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error("Please sign in again to use Chamber AI.");
      }

      const response = await fetch("/api/chamber-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          message,
          messages: conversationHistory,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (typeof result.attemptsRemaining === "number") {
          setAttemptsRemaining(result.attemptsRemaining);
        }

        throw new Error(
          result.error || "Chamber AI could not process your request."
        );
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: result.answer,
        },
      ]);

      if (typeof result.attemptsRemaining === "number") {
        setAttemptsRemaining(result.attemptsRemaining);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function startNewConversation() {
    if (loading) return;

    setMessages([]);
    setError("");
    setInput("");
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-[#d5dfeb] bg-white shadow-lg shadow-[#142B4A]/10">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-gradient-to-r from-[#07182e] via-[#12345b] to-[#07182e] px-5 py-5 text-white sm:px-7">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
            <Sparkles size={24} />
          </div>

          <div>
            <h2 className="text-lg font-bold tracking-tight">
              Chamber AI
            </h2>
            <p className="text-xs text-blue-100">
              Your Personal Workspace Intelligence
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={startNewConversation}
          disabled={loading || messages.length === 0}
          className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RotateCcw size={14} />
          New conversation
        </button>
      </div>

      {/* Daily allowance */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e5eaf1] bg-[#f5f8fc] px-5 py-3 sm:px-7">
        <span className="text-xs font-medium text-neutral-600">
          Free allowance: 3 requests per day
        </span>

        {attemptsRemaining !== null && (
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-[#142B4A]">
            {attemptsRemaining} free attempts remaining
          </span>
        )}
      </div>

      {/* Conversation */}
      <div className="min-h-[390px] max-h-[560px] space-y-5 overflow-y-auto bg-gradient-to-b from-white to-[#f8fafd] p-5 sm:p-7">

        {messages.length === 0 ? (
          <div className="flex min-h-[350px] flex-col items-center justify-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#142B4A] to-[#07111F] text-white shadow-xl shadow-[#142B4A]/20">
              <Bot size={38} />
            </div>

            <h3 className="mt-6 text-2xl font-bold tracking-tight text-[#07182e]">
              How can I help you today?
            </h3>

            <p className="mt-3 max-w-md text-sm leading-7 text-neutral-600">
              I am Chamber AI, your personal workspace intelligence.
              Ask me about Chamber, your workspaces, documents,
              research, or anything you need help with.
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setInput(suggestion)}
                  className="rounded-full border border-[#d5dfeb] bg-white px-4 py-2 text-xs font-medium text-[#142B4A] transition hover:border-[#142B4A] hover:bg-[#eef4fb]"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${
                message.role === "user"
                  ? "flex-row-reverse"
                  : "flex-row"
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  message.role === "user"
                    ? "bg-[#142B4A] text-white"
                    : "bg-[#eaf1fa] text-[#142B4A]"
                }`}
              >
                {message.role === "user" ? (
                  <User size={17} />
                ) : (
                  <Bot size={18} />
                )}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-7 ${
                  message.role === "user"
                    ? "rounded-tr-sm bg-[#142B4A] text-white"
                    : "rounded-tl-sm border border-[#e1e8f0] bg-white text-neutral-800 shadow-sm"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eaf1fa] text-[#142B4A]">
              <Bot size={18} />
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-[#e1e8f0] bg-white px-4 py-3 text-sm text-neutral-600 shadow-sm">
              <Loader2 size={16} className="animate-spin" />
              Chamber AI is thinking...
            </div>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
          >
            {error}
          </div>
        )}
      </div>

      {/* Message input */}
      <div className="border-t border-[#e5eaf1] bg-white p-4 sm:p-6">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void sendMessage();
          }}
          className="flex items-end gap-3 rounded-2xl border border-[#ccd8e6] bg-[#f8fafd] p-2 transition focus-within:border-[#42658D] focus-within:ring-2 focus-within:ring-[#142B4A]/10"
        >
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void sendMessage();
              }
            }}
            placeholder="Ask Chamber AI anything..."
            rows={2}
            maxLength={4000}
            disabled={loading}
            className="max-h-32 min-h-[48px] flex-1 resize-y bg-transparent px-3 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send message"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#142B4A] text-white shadow-md transition hover:bg-[#24466B] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <Loader2 size={19} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </form>

        <p className="mt-3 text-center text-[11px] text-neutral-500">
          Chamber AI can make mistakes. Verify important information.
        </p>

        <p className="mt-2 text-center text-[10px] font-medium tracking-wide text-neutral-400">
          Developed by RIO LAB
        </p>
      </div>
    </div>
  );
}
