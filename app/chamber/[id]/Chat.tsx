"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type Message = {
  id: string;
  message: string;
  sender_id: string;
  created_at: string;
};

export default function Chat({ chamberId }: { chamberId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadMessages();

    const channel = supabase
      .channel(`messages-${chamberId}`)
      .on(
  "postgres_changes",
  {
    event: "INSERT",
    schema: "public",
    table: "messages",
    filter: `chamber_id=eq.${chamberId}`,
  },
  (payload) => {
    console.log("New message received:", payload);
    loadMessages();
  }
)
.subscribe((status) => {
  console.log("Realtime status:", status);
});
    return () => {
      supabase.removeChannel(channel);
    };
  }, [chamberId]);

  async function loadMessages() {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chamber_id", chamberId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setMessages(data);

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    }

    setLoading(false);
  }

  async function sendMessage() {
    if (!newMessage.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from("messages").insert([
      {
        chamber_id: chamberId,
        sender_id: user.id,
        message: newMessage,
      },
    ]);

    if (!error) {
      setNewMessage("");

      if (textareaRef.current) {
        textareaRef.current.style.height = "48px";
      }
    }
  }

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="h-full flex flex-col bg-slate-950">

      {/* Messages */}

      <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-4">

        {loading ? (
          <p className="text-slate-400">Loading messages...</p>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-slate-500">
              No messages yet. Start the conversation.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className="max-w-xl rounded-2xl bg-slate-800 px-5 py-4"
            >
              <p className="text-white whitespace-pre-wrap">
                {msg.message}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                {new Date(msg.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ))
        )}

        <div ref={messagesEndRef} />

      </div>

      {/* Input */}

      <div className="flex-shrink-0 border-t border-slate-800 bg-slate-900 p-5">

        <textarea
          ref={textareaRef}
          rows={1}
          value={newMessage}
          placeholder="Type a message..."
          onChange={(e) => {
            setNewMessage(e.target.value);

            e.target.style.height = "48px";
            e.target.style.height = e.target.scrollHeight + "px";
          }}
          onKeyDown={handleKeyDown}
          className="w-full resize-none rounded-xl bg-slate-800 border border-slate-700 p-4 text-white placeholder:text-slate-500 outline-none focus:border-blue-500"
          style={{
            minHeight: "48px",
            maxHeight: "160px",
          }}
        />

        <div className="mt-4 flex justify-end">

          <button
            onClick={sendMessage}
            className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700 transition"
          >
            Send
          </button>

        </div>

      </div>

    </div>
  );
}