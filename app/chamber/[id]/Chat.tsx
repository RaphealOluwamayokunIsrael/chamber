"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import MessageBubble from "./MessageBubble";

type Message = {
  id: string;
  message: string;
  sender_id: string;
  created_at: string;
};

type Profile = {
  id: string;
  full_name: string | null;
};

type TypingUser = {
  userId: string;
  name: string;
};

export default function Chat({
  chamberId,
}: {
  chamberId: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const typingTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const channelRef = useRef<ReturnType<
    typeof supabase.channel
  > | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (user) {
        setCurrentUserId(user.id);
      }

      await loadMessages();
    }

    initialize();

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
        () => {
          loadMessages();
        }
      )
      .on(
        "broadcast",
        {
          event: "typing",
        },
        (payload) => {
          const {
            userId,
            name,
            isTyping,
          } = payload.payload || {};

          if (!userId || userId === currentUserId) {
            return;
          }

          setTypingUsers((current) => {
            const alreadyTyping = current.some(
              (user) => user.userId === userId
            );

            if (isTyping) {
              if (alreadyTyping) {
                return current;
              }

              return [
                ...current,
                {
                  userId,
                  name: name || "Someone",
                },
              ];
            }

            return current.filter(
              (user) => user.userId !== userId
            );
          });
        }
      )
      .subscribe((status) => {
        console.log("Realtime:", status);
      });

    channelRef.current = channel;

    return () => {
      mounted = false;

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [chamberId, currentUserId]);

  async function loadMessages() {
    try {
      const {
        data,
        error,
      } = await supabase
        .from("messages")
        .select("*")
        .eq("chamber_id", chamberId)
        .order("created_at", {
          ascending: true,
        });

      if (error) {
        console.error(
          "LOAD MESSAGES ERROR:",
          error
        );

        setLoading(false);
        return;
      }

      if (!data) {
        setMessages([]);
        setLoading(false);
        return;
      }

      setMessages(data);

      const senderIds = [
        ...new Set(
          data.map((msg) => msg.sender_id)
        ),
      ];

      if (senderIds.length > 0) {
        const {
          data: profileData,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", senderIds);

        if (profileError) {
          console.error(
            "LOAD MESSAGE PROFILES ERROR:",
            profileError
          );
        } else {
          setProfiles(profileData || []);
        }
      }

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    } catch (error) {
      console.error("CHAT ERROR:", error);
    }

    setLoading(false);
  }

  function getSenderName(senderId: string) {
    const profile = profiles.find(
      (p) => p.id === senderId
    );

    return profile?.full_name || "Unknown User";
  }

  async function broadcastTyping(
    isTyping: boolean
  ) {
    if (!channelRef.current || !currentUserId) {
      return;
    }

    const senderName =
      getSenderName(currentUserId);

    await channelRef.current.send({
      type: "broadcast",
      event: "typing",
      payload: {
        userId: currentUserId,
        name: senderName,
        isTyping,
      },
    });
  }

  function handleTyping(value: string) {
    setNewMessage(value);

    if (textareaRef.current) {
      textareaRef.current.style.height = "48px";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }

    broadcastTyping(value.trim().length > 0);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (value.trim().length > 0) {
      typingTimeoutRef.current = setTimeout(() => {
        broadcastTyping(false);
      }, 2000);
    } else {
      broadcastTyping(false);
    }
  }

  async function sendMessage() {
    if (!newMessage.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const messageToSend = newMessage.trim();

    const {
      error,
    } = await supabase
      .from("messages")
      .insert([
        {
          chamber_id: chamberId,
          sender_id: user.id,
          message: messageToSend,
        },
      ]);

    if (error) {
      console.error(
        "SEND MESSAGE ERROR:",
        error
      );
      return;
    }

    setNewMessage("");

    await broadcastTyping(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (textareaRef.current) {
      textareaRef.current.style.height = "48px";
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

  function renderTypingIndicator() {
    if (typingUsers.length === 0) {
      return null;
    }

    let text = "";

    if (typingUsers.length === 1) {
      text = `${typingUsers[0].name} is typing...`;
    } else if (typingUsers.length === 2) {
      text = `${typingUsers[0].name} and ${typingUsers[1].name} are typing...`;
    } else {
      text = `${typingUsers[0].name} and ${
        typingUsers.length - 1
      } others are typing...`;
    }

    return (
      <div className="px-1 pb-2 text-xs text-slate-400">
        <span>{text}</span>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-slate-950">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6">
        {loading ? (
          <p className="text-slate-400">
            Loading messages...
          </p>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-slate-500">
              No messages yet. Start the conversation.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg.message}
              sender={getSenderName(msg.sender_id)}
              createdAt={msg.created_at}
              isMine={
                msg.sender_id === currentUserId
              }
            />
          ))
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="flex-shrink-0 border-t border-slate-800 bg-slate-900 p-5">
        {renderTypingIndicator()}

        <textarea
          ref={textareaRef}
          rows={1}
          value={newMessage}
          placeholder="Type a message..."
          onChange={(e) =>
            handleTyping(e.target.value)
          }
          onKeyDown={handleKeyDown}
          className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800 p-4 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
          style={{
            minHeight: "48px",
            maxHeight: "160px",
          }}
        />

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={sendMessage}
            className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}