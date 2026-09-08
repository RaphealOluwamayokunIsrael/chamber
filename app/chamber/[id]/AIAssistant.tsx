"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type Message = {
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
};

type AIAssistantProps = {
  chamberId: string;
  chamberName: string;
  chamberDescription: string;
  memberCount: number;
};

const MAX_MESSAGE_LENGTH = 4000;

function getFriendlyErrorMessage(
  code?: string,
  status?: number
): string {
  switch (code) {
    case "AI_TIMEOUT":
      return "Chamber AI took too long to respond. Please try again.";

    case "AI_CONNECTION_FAILED":
      return "Chamber AI could not connect to the AI service. Please try again.";

    case "AI_SERVICE_NOT_CONFIGURED":
      return "Chamber AI is not configured on the deployed server yet.";

    case "AI_MODEL_NOT_FOUND":
      return "The Chamber AI model is not available. Please check the AI service configuration.";

    case "AI_PROVIDER_ERROR":
      return "The AI service returned an error. Please try again.";

    case "AI_INVALID_RESPONSE":
      return "Chamber AI returned an invalid response. Please try again.";

    case "AI_EMPTY_RESPONSE":
      return "Chamber AI returned an empty response. Please try again.";

    default:
      if (status === 401) {
        return "Your session has expired. Please sign in again.";
      }

      if (status === 403) {
        return "You do not have permission to use Chamber AI in this Chamber.";
      }

      if (status === 404) {
        return "The Chamber AI service could not be found.";
      }

      if (status === 500) {
        return "Something went wrong while processing your request.";
      }

      return "Could not connect to Chamber AI. Please try again.";
  }
}

export default function AIAssistant({
  chamberId,
  chamberName,
}: AIAssistantProps) {
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hello! I'm Chamber AI for ${chamberName}. I can help you understand and find information within this Chamber. Ask me about its discussions, members, announcements, events, polls, or other Chamber information.`,
    },
  ]);

  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  useEffect(() => {
    if (!loading) {
      textareaRef.current?.focus();
    }
  }, [loading]);

  /**
   * Sends a request to Chamber AI using the supplied conversation history.
   *
   * This is separated from sendMessage so retry can use the cleaned
   * conversation immediately instead of relying on asynchronous React state.
   */
  async function requestAI(
    text: string,
    historyMessages: Message[]
  ) {
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("AUTH_REQUIRED");
      }

      const conversation = historyMessages
        .filter((item) => !item.isError)
        .slice(-20)
        .map((item) => ({
          role: item.role,
          content: item.content,
        }));

      const response = await fetch("/api/chamber-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          chamberId,
          message: text,
          conversation,
        }),
      });

      let data: {
        reply?: string;
        error?: string;
        code?: string;
      } = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        const error = new Error(
          getFriendlyErrorMessage(data.code, response.status)
        );

        (
          error as Error & {
            code?: string;
            status?: number;
          }
        ).code = data.code;

        (
          error as Error & {
            code?: string;
            status?: number;
          }
        ).status = response.status;

        throw error;
      }

      if (!data.reply || typeof data.reply !== "string") {
        throw new Error("AI_EMPTY_RESPONSE");
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.reply!.trim(),
        },
      ]);
    } catch (error) {
      console.error("Chamber AI error:", error);

      let errorMessage =
        "Could not connect to Chamber AI. Please try again.";

      if (error instanceof Error) {
        if (error.message === "AUTH_REQUIRED") {
          errorMessage =
            "Your session has expired. Please sign in again.";
        } else if (
          [
            "AI_TIMEOUT",
            "AI_CONNECTION_FAILED",
            "AI_SERVICE_NOT_CONFIGURED",
            "AI_MODEL_NOT_FOUND",
            "AI_PROVIDER_ERROR",
            "AI_INVALID_RESPONSE",
            "AI_EMPTY_RESPONSE",
          ].includes(error.message)
        ) {
          errorMessage = getFriendlyErrorMessage(error.message);
        } else if (error.message) {
          errorMessage = error.message;
        }
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: errorMessage,
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(customMessage?: string) {
    const text = (customMessage ?? message).trim();

    if (!text || loading) {
      return;
    }

    if (text.length > MAX_MESSAGE_LENGTH) {
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: text,
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setMessage("");

    await requestAI(text, updatedMessages);
  }

  async function retryLastMessage() {
    if (loading) {
      return;
    }

    const latestMessage = messages[messages.length - 1];

    if (
      !latestMessage ||
      latestMessage.role !== "assistant" ||
      !latestMessage.isError
    ) {
      return;
    }

    /**
     * Remove only the latest error.
     *
     * The previous user message remains in the conversation.
     */
    const cleanedMessages = messages.slice(0, -1);

    const lastUserMessage = [...cleanedMessages]
      .reverse()
      .find((item) => item.role === "user");

    if (!lastUserMessage) {
      return;
    }

    setMessages(cleanedMessages);

    /**
     * Use cleanedMessages directly rather than waiting for React's
     * setMessages() update.
     *
     * This prevents the failed AI response from being included in
     * the retry history.
     */
    await requestAI(
      lastUserMessage.content,
      cleanedMessages
    );
  }

  function clearConversation() {
    setMessages([
      {
        role: "assistant",
        content: `Hello! I'm Chamber AI for ${chamberName}. I can help you understand and find information within this Chamber. Ask me about its discussions, members, announcements, events, polls, or other Chamber information.`,
      },
    ]);

    setMessage("");
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900 text-sm font-semibold text-white dark:bg-white dark:text-gray-900">
            AI
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Chamber AI
            </h2>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Ask about this Chamber
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={clearConversation}
          disabled={loading}
          className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-900"
        >
          Clear
        </button>
      </div>

      {/* Messages */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {messages.map((item, index) => {
            const isUser = item.role === "user";

            const isLatestError =
              index === messages.length - 1 &&
              item.role === "assistant" &&
              item.isError;

            return (
              <div
                key={`${index}-${item.role}`}
                className={`flex ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                    isUser
                      ? "rounded-br-md bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                      : item.isError
                      ? "rounded-bl-md border border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
                      : "rounded-bl-md bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                  }`}
                >
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide opacity-60">
                    {isUser ? "You" : "Chamber AI"}
                  </div>

                  <div className="whitespace-pre-wrap break-words">
                    {item.content}
                  </div>

                  {isLatestError && (
                    <button
                      type="button"
                      onClick={() => void retryLastMessage()}
                      disabled={loading}
                      className="mt-3 rounded-md border border-current px-3 py-1.5 text-xs font-semibold transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Try again
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md bg-gray-100 px-4 py-3 dark:bg-gray-900">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 dark:border-gray-800">
        <div className="mx-auto max-w-3xl">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(event) =>
                setMessage(
                  event.target.value.slice(0, MAX_MESSAGE_LENGTH)
                )
              }
              onKeyDown={handleKeyDown}
              disabled={loading}
              maxLength={MAX_MESSAGE_LENGTH}
              rows={3}
              placeholder="Ask Chamber AI something..."
              className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 pr-24 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500"
            />

            <button
              type="button"
              onClick={() => void sendMessage()}
              disabled={
                loading ||
                !message.trim() ||
                message.length > MAX_MESSAGE_LENGTH
              }
              className="absolute bottom-3 right-3 rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-gray-900"
            >
              {loading ? "Thinking..." : "Ask AI"}
            </button>
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-500">
            <span>
              Press Enter to send • Shift + Enter for a new line
            </span>

            <span>
              {message.length}/{MAX_MESSAGE_LENGTH}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
