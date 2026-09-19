"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

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
  const [messages, setMessages] =
    useState<Message[]>([]);

  const [profiles, setProfiles] =
    useState<Profile[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [newMessage, setNewMessage] =
    useState("");

  const [currentUserId, setCurrentUserId] =
    useState("");

  const [typingUsers, setTypingUsers] =
    useState<TypingUser[]>([]);

  const messagesEndRef =
    useRef<HTMLDivElement>(null);

  const textareaRef =
    useRef<HTMLTextAreaElement>(null);

  const typingTimeoutRef =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

  const typingChannelRef =
    useRef<ReturnType<
      typeof supabase.channel
    > | null>(null);

  const currentUserIdRef =
    useRef("");

  useEffect(() => {
    currentUserIdRef.current =
      currentUserId;
  }, [currentUserId]);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (user) {
        setCurrentUserId(
          user.id
        );

        currentUserIdRef.current =
          user.id;
      }

      await loadMessages();
    }

    initialize();

    const messageChannel =
      supabase
        .channel(
          `messages-${chamberId}`
        )
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
        .subscribe(
          (status) => {
            console.log(
              "Message realtime:",
              status
            );
          }
        );

    const typingChannel =
      supabase.channel(
        `typing-${chamberId}`,
        {
          config: {
            broadcast: {
              self: false,
            },
          },
        }
      );

    typingChannelRef.current =
      typingChannel;

    typingChannel
      .on(
        "broadcast",
        {
          event: "typing",
        },
        ({
          payload,
        }: {
          payload: {
            userId: string;
            name: string;
            typing: boolean;
          };
        }) => {
          if (
            !payload ||
            !payload.userId
          ) {
            return;
          }

          if (
            payload.userId ===
            currentUserIdRef.current
          ) {
            return;
          }

          setTypingUsers(
            (previous) => {
              const existing =
                previous.find(
                  (user) =>
                    user.userId ===
                    payload.userId
                );

              if (
                payload.typing
              ) {
                if (existing) {
                  return previous.map(
                    (user) =>
                      user.userId ===
                      payload.userId
                        ? {
                            ...user,
                            name:
                              payload.name ||
                              user.name ||
                              "Chamber Member",
                          }
                        : user
                  );
                }

                return [
                  ...previous,
                  {
                    userId:
                      payload.userId,
                    name:
                      payload.name ||
                      "Chamber Member",
                  },
                ];
              }

              return previous.filter(
                (user) =>
                  user.userId !==
                  payload.userId
              );
            }
          );
        }
      )
      .subscribe(
        (status) => {
          console.log(
            "Typing realtime:",
            status
          );
        }
      );

    return () => {
      mounted = false;

      if (
        typingTimeoutRef.current
      ) {
        clearTimeout(
          typingTimeoutRef.current
        );
      }

      supabase.removeChannel(
        messageChannel
      );

      supabase.removeChannel(
        typingChannel
      );

      typingChannelRef.current =
        null;
    };
  }, [chamberId]);

  async function loadMessages() {
    try {
      const {
        data,
        error,
      } = await supabase
        .from("messages")
        .select("*")
        .eq(
          "chamber_id",
          chamberId
        )
        .order(
          "created_at",
          {
            ascending: true,
          }
        );

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
          data.map(
            (msg) =>
              msg.sender_id
          )
        ),
      ];

      if (
        senderIds.length > 0
      ) {
        const {
          data: profileData,
          error:
            profileError,
        } = await supabase
          .from("profiles")
          .select(
            "id, full_name"
          )
          .in(
            "id",
            senderIds
          );

        if (profileError) {
          console.error(
            "LOAD MESSAGE PROFILES ERROR:",
            profileError
          );
        } else {
          setProfiles(
            profileData || []
          );
        }
      }

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView(
          {
            behavior:
              "smooth",
          }
        );
      }, 100);
    } catch (error) {
      console.error(
        "CHAT ERROR:",
        error
      );
    }

    setLoading(false);
  }

  async function getCurrentUserName() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return "Chamber Member";
    }

    const profile =
      profiles.find(
        (item) =>
          item.id ===
          user.id
      );

    if (
      profile?.full_name
    ) {
      return profile.full_name;
    }

    const metadataName =
      user.user_metadata
        ?.full_name ||
      user.user_metadata
        ?.name;

    if (
      typeof metadataName ===
        "string" &&
      metadataName.trim()
    ) {
      return metadataName.trim();
    }

    if (user.email) {
      return user.email.split(
        "@"
      )[0];
    }

    return "Chamber Member";
  }

  async function broadcastTyping(
    typing: boolean
  ) {
    const channel =
      typingChannelRef.current;

    if (
      !channel ||
      !currentUserId
    ) {
      return;
    }

    const name =
      await getCurrentUserName();

    await channel.send({
      type: "broadcast",
      event: "typing",
      payload: {
        userId:
          currentUserId,
        name,
        typing,
      },
    });
  }

  function handleTyping(
    value: string
  ) {
    setNewMessage(value);

    if (
      textareaRef.current
    ) {
      textareaRef.current.style.height =
        "48px";

      textareaRef.current.style.height =
        textareaRef.current.scrollHeight +
        "px";
    }

    if (
      typingTimeoutRef.current
    ) {
      clearTimeout(
        typingTimeoutRef.current
      );
    }

    if (!value.trim()) {
      broadcastTyping(
        false
      );

      return;
    }

    broadcastTyping(
      true
    );

    typingTimeoutRef.current =
      setTimeout(() => {
        broadcastTyping(
          false
        );
      }, 2000);
  }

  async function sendMessage() {
    if (
      !newMessage.trim()
    ) {
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const messageToSend =
      newMessage.trim();

    const {
      error,
    } = await supabase
      .from("messages")
      .insert([
        {
          chamber_id:
            chamberId,
          sender_id:
            user.id,
          message:
            messageToSend,
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

    await broadcastTyping(
      false
    );

    if (
      typingTimeoutRef.current
    ) {
      clearTimeout(
        typingTimeoutRef.current
      );
    }

    if (
      textareaRef.current
    ) {
      textareaRef.current.style.height =
        "48px";
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

  function getSenderName(
    senderId: string
  ) {
    const profile =
      profiles.find(
        (p) =>
          p.id ===
          senderId
      );

    return (
      profile?.full_name ||
      "Chamber Member"
    );
  }

  function getTypingLabel() {
    if (
      typingUsers.length ===
      0
    ) {
      return "";
    }

    if (
      typingUsers.length ===
      1
    ) {
      return `${typingUsers[0].name} is typing`;
    }

    if (
      typingUsers.length ===
      2
    ) {
      return `${typingUsers[0].name} and ${typingUsers[1].name} are typing`;
    }

    return `${typingUsers[0].name} and ${
      typingUsers.length - 1
    } others are typing`;
  }

  return (
    <div className="flex h-full flex-col bg-slate-950">

      {/* Messages */}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6">

        {loading ? (
          <p className="text-slate-400">
            Loading messages...
          </p>
        ) : messages.length ===
          0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-slate-500">
              No messages yet. Start the conversation.
            </p>
          </div>
        ) : (
          messages.map(
            (msg) => (
              <MessageBubble
                key={
                  msg.id
                }
                message={
                  msg.message
                }
                sender={getSenderName(
                  msg.sender_id
                )}
                createdAt={
                  msg.created_at
                }
                isMine={
                  msg.sender_id ===
                  currentUserId
                }
              />
            )
          )
        )}

        <div
          ref={
            messagesEndRef
          }
        />

      </div>

      {/* Composer */}
      <div className="flex-shrink-0 border-t border-slate-800 bg-slate-900 p-5">

        {/* Messenger-style typing indicator */}
        {typingUsers.length >
          0 && (
          <div className="mb-3 flex items-end gap-2">

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-blue-400">
              {typingUsers[0]?.name
                ?.charAt(0)
                ?.toUpperCase() ||
                "C"}
            </div>

            <div className="flex flex-col items-start">

              <span className="mb-1 ml-2 text-[11px] text-slate-500">
                {getTypingLabel()}
              </span>

              <div className="flex h-9 items-center gap-1 rounded-full bg-slate-800 px-3 shadow-sm">

                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />

                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />

                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />

              </div>

            </div>

          </div>
        )}

        <textarea
          ref={
            textareaRef
          }
          rows={1}
          value={
            newMessage
          }
          placeholder="Type a message..."
          onChange={(
            e
          ) =>
            handleTyping(
              e.target.value
            )
          }
          onKeyDown={
            handleKeyDown
          }
          className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800 p-4 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
          style={{
            minHeight:
              "48px",
            maxHeight:
              "160px",
          }}
        />

        <div className="mt-4 flex justify-end">

          <button
            type="button"
            onClick={
              sendMessage
            }
            className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Send
          </button>

        </div>

      </div>

    </div>
  );
}
