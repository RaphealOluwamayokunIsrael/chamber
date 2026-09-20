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
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

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
        setCurrentUserId(user.id);
        currentUserIdRef.current =
          user.id;
      }

      await loadMessages();
    }

    initialize();

    const messageChannel =
      supabase
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
        .subscribe((status) => {
          console.log(
            "Message realtime:",
            status
          );
        });

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

              if (payload.typing) {
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
      .subscribe((status) => {
        console.log(
          "Typing realtime:",
          status
        );
      });

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
            behavior: "smooth",
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
          item.id === user.id
      );

    if (profile?.full_name) {
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
      broadcastTyping(false);
      return;
    }

    broadcastTyping(true);

    typingTimeoutRef.current =
      setTimeout(() => {
        broadcastTyping(false);
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

    await broadcastTyping(false);

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
          p.id === senderId
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
    <div className="flex h-full flex-col bg-white">

      {/* Chat Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-4">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 8.5 8.5 0 0 1-7-3.5L3 21l1.5-4A8.5 8.5 0 1 1 21 11.5Z" />
            </svg>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              General Chat
            </h2>

            <p className="text-xs text-slate-500">
              Chamber conversation
            </p>
          </div>

        </div>

        <div className="hidden items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 sm:flex">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          Live
        </div>

      </div>

      {/* Messages */}
      <div className="min-h-0 flex-1 overflow-y-auto bg-white px-4 py-6 sm:px-6">

        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
              Loading messages...
            </div>
          </div>
        ) : messages.length ===
          0 ? (
          <div className="flex h-full items-center justify-center">

            <div className="text-center">

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <svg
                  width="25"
                  height="25"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 8.5 8.5 0 0 1-7-3.5L3 21l1.5-4A8.5 8.5 0 1 1 21 11.5Z" />
                </svg>
              </div>

              <h3 className="text-sm font-semibold text-slate-900">
                Start the conversation
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Send the first message to your Chamber.
              </p>

            </div>

          </div>
        ) : (
          <div className="mx-auto w-full max-w-4xl space-y-5">

            {messages.map(
              (msg) => (
                <MessageBubble
                  key={msg.id}
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
            )}

            <div
              ref={
                messagesEndRef
              }
            />

          </div>
        )}

      </div>

      {/* Composer */}
      <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-4 sm:px-6">

        <div className="mx-auto w-full max-w-4xl">

          {/* Typing Indicator */}
          {typingUsers.length >
            0 && (
            <div className="mb-3 flex items-center gap-2">

              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-600">
                {typingUsers[0]?.name
                  ?.charAt(0)
                  ?.toUpperCase() ||
                  "C"}
              </div>

              <div className="flex items-center gap-2">

                <span className="text-xs text-slate-500">
                  {getTypingLabel()}
                </span>

                <div className="flex h-7 items-center gap-1 rounded-full bg-slate-100 px-2.5">

                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:-0.3s]" />

                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:-0.15s]" />

                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400" />

                </div>

              </div>

            </div>
          )}

          {/* Message Input */}
          <div className="flex items-end gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-2 transition focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50">

            <textarea
              ref={
                textareaRef
              }
              rows={1}
              value={
                newMessage
              }
              placeholder="Write a message..."
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
              className="min-h-[48px] flex-1 resize-none bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
              style={{
                maxHeight:
                  "160px",
              }}
            />

            <button
              type="button"
              onClick={
                sendMessage
              }
              disabled={
                !newMessage.trim()
              }
              aria-label="Send message"
              className="mb-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 2 11 13" />
                <path d="m22 2-7 20-4-9-9-4Z" />
              </svg>
            </button>

          </div>

          <p className="mt-2 hidden text-[11px] text-slate-400 sm:block">
            Press Enter to send · Shift + Enter for a new line
          </p>

        </div>

      </div>

    </div>
  );
}