"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Announcement = {
  id: string;
  chamber_id: string;
  author_id: string;
  recipient_id: string | null;
  title: string;
  content: string;
  announcement_type: "general" | "specific";
  is_read: boolean;
  created_at: string;
  updated_at: string;
};

type Member = {
  id: string;
  user_id: string;
  role: string;
};

type Profile = {
  id: string;
  full_name: string | null;
};

export default function Announcements({
  chamberId,
}: {
  chamberId: string;
}) {
  const [announcements, setAnnouncements] = useState<
    Announcement[]
  >([]);

  const [members, setMembers] = useState<Member[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  const [currentUserId, setCurrentUserId] =
    useState("");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [announcementType, setAnnouncementType] =
    useState<"general" | "specific">("general");

  const [recipientId, setRecipientId] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] =
    useState(true);

  const [creating, setCreating] = useState(false);

  const [message, setMessage] = useState("");

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!chamberId) return;

    initialize();

    const channel = supabase
      .channel(`announcements-${chamberId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "announcements",
          filter: `chamber_id=eq.${chamberId}`,
        },
        () => {
          loadAnnouncements();
        }
      )
      .subscribe((status) => {
        console.log(
          "ANNOUNCEMENT REALTIME:",
          status
        );
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chamberId]);

  async function initialize() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setCurrentUserId(user.id);

      await Promise.all([
        loadAnnouncements(user.id),
        loadMembers(user.id),
      ]);
    } catch (error) {
      console.error(
        "ANNOUNCEMENT INITIALIZE ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadAnnouncements(
    userId?: string
  ) {
    try {
      let currentId = userId;

      if (!currentId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        currentId = user?.id;
      }

      if (!currentId) {
        setAnnouncements([]);
        return;
      }

      const {
        data: generalData,
        error: generalError,
      } = await supabase
        .from("announcements")
        .select("*")
        .eq("chamber_id", chamberId)
        .eq("announcement_type", "general")
        .order("created_at", {
          ascending: false,
        });

      if (generalError) {
        console.error(
          "LOAD GENERAL ANNOUNCEMENTS ERROR:",
          generalError
        );

        setMessage(generalError.message);
        return;
      }

      const {
        data: personalData,
        error: personalError,
      } = await supabase
        .from("announcements")
        .select("*")
        .eq("chamber_id", chamberId)
        .eq("announcement_type", "specific")
        .eq("recipient_id", currentId)
        .order("created_at", {
          ascending: false,
        });

      if (personalError) {
        console.error(
          "LOAD PERSONAL ANNOUNCEMENTS ERROR:",
          personalError
        );

        setMessage(personalError.message);
        return;
      }

      const combined = [
        ...(generalData || []),
        ...(personalData || []),
      ].sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      );

      setAnnouncements(combined);

      const authorIds = Array.from(
        new Set(
          combined.map(
            (announcement) =>
              announcement.author_id
          )
        )
      );

      if (authorIds.length > 0) {
        const {
          data: profileData,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", authorIds);

        if (profileError) {
          console.error(
            "LOAD AUTHOR PROFILES ERROR:",
            profileError
          );
        } else {
          setProfiles((previous) => {
            const combinedProfiles = [
              ...previous,
              ...(profileData || []),
            ];

            return Array.from(
              new Map(
                combinedProfiles.map(
                  (profile) => [
                    profile.id,
                    profile,
                  ]
                )
              ).values()
            );
          });
        }
      }
    } catch (error) {
      console.error(
        "LOAD ANNOUNCEMENTS ERROR:",
        error
      );
    }
  }

  async function loadMembers(userId: string) {
    try {
      setMembersLoading(true);

      const {
        data: memberData,
        error,
      } = await supabase
        .from("members")
        .select(
          "id, user_id, role"
        )
        .eq("chamber_id", chamberId);

      if (error) {
        console.error(
          "LOAD MEMBERS ERROR:",
          error
        );

        return;
      }

      const memberList =
        memberData || [];

      setMembers(memberList);

      const currentMember =
        memberList.find(
          (member) =>
            member.user_id === userId
        );

      const role =
        currentMember?.role?.toLowerCase();

      if (
        role === "admin" ||
        role === "owner"
      ) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }

      const userIds =
        memberList.map(
          (member) =>
            member.user_id
        );

      if (userIds.length > 0) {
        const {
          data: profileData,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select(
            "id, full_name"
          )
          .in("id", userIds);

        if (profileError) {
          console.error(
            "LOAD MEMBER PROFILES ERROR:",
            profileError
          );
        } else {
          setProfiles((previous) => {
            const combined = [
              ...previous,
              ...(profileData || []),
            ];

            return Array.from(
              new Map(
                combined.map(
                  (profile) => [
                    profile.id,
                    profile,
                  ]
                )
              ).values()
            );
          });
        }
      }
    } catch (error) {
      console.error(
        "LOAD MEMBERS ERROR:",
        error
      );
    } finally {
      setMembersLoading(false);
    }
  }

  function getProfileName(
    userId: string
  ) {
    const profile =
      profiles.find(
        (item) =>
          item.id === userId
      );

    return (
      profile?.full_name ||
      "Chamber Member"
    );
  }

  async function createAnnouncement(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setMessage("");

    if (!title.trim()) {
      setMessage(
        "Please enter an announcement title."
      );
      return;
    }

    if (!content.trim()) {
      setMessage(
        "Please enter the announcement message."
      );
      return;
    }

    if (
      announcementType ===
        "specific" &&
      !recipientId
    ) {
      setMessage(
        "Please select a Chamber member."
      );
      return;
    }

    try {
      setCreating(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage(
          "Please login first."
        );
        return;
      }

      const { error } =
        await supabase
          .from("announcements")
          .insert({
            chamber_id:
              chamberId,

            author_id:
              user.id,

            recipient_id:
              announcementType ===
              "specific"
                ? recipientId
                : null,

            title:
              title.trim(),

            content:
              content.trim(),

            announcement_type:
              announcementType,

            is_read: false,
          });

      if (error) {
        console.error(
          "CREATE ANNOUNCEMENT ERROR:",
          error
        );

        setMessage(
          error.message
        );

        return;
      }

      setTitle("");
      setContent("");
      setRecipientId("");

      setMessage(
        announcementType ===
          "general"
          ? "General announcement published successfully."
          : `Announcement sent to ${getProfileName(
              recipientId
            )}.`
      );

      await loadAnnouncements(
        currentUserId
      );
    } catch (error) {
      console.error(
        "CREATE ANNOUNCEMENT ERROR:",
        error
      );

      setMessage(
        "Unable to create announcement."
      );
    } finally {
      setCreating(false);
    }
  }

  async function markAsRead(
    announcement: Announcement
  ) {
    if (
      announcement.announcement_type !==
        "specific" ||
      announcement.recipient_id !==
        currentUserId ||
      announcement.is_read
    ) {
      return;
    }

    const { error } =
      await supabase
        .from("announcements")
        .update({
          is_read: true,
        })
        .eq(
          "id",
          announcement.id
        )
        .eq(
          "recipient_id",
          currentUserId
        );

    if (error) {
      console.error(
        "MARK ANNOUNCEMENT READ ERROR:",
        error
      );

      return;
    }

    setAnnouncements(
      (previous) =>
        previous.map(
          (item) =>
            item.id ===
            announcement.id
              ? {
                  ...item,
                  is_read: true,
                }
              : item
        )
    );
  }

  async function deleteAnnouncement(
    announcementId: string
  ) {
    const confirmed =
      window.confirm(
        "Delete this announcement?"
      );

    if (!confirmed) {
      return;
    }

    const { error } =
      await supabase
        .from("announcements")
        .delete()
        .eq(
          "id",
          announcementId
        );

    if (error) {
      console.error(
        "DELETE ANNOUNCEMENT ERROR:",
        error
      );

      setMessage(
        error.message
      );

      return;
    }

    await loadAnnouncements(
      currentUserId
    );
  }

  function formatDate(
    date: string
  ) {
    return new Date(
      date
    ).toLocaleString();
  }

  const unreadCount =
    announcements.filter(
      (announcement) =>
        announcement.announcement_type ===
          "specific" &&
        announcement.recipient_id ===
          currentUserId &&
        !announcement.is_read
    ).length;

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-950 text-white">

      <div className="border-b border-slate-800 bg-slate-900 px-6 py-5">

        <div className="flex items-center justify-between gap-4">

          <div>
            <h2 className="text-2xl font-bold">
              Announcements
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Chamber-wide and personal announcements.
            </p>
          </div>

          {unreadCount > 0 && (
            <div className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
              {unreadCount} unread
            </div>
          )}

        </div>

      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-6">

        {isAdmin && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

            <h3 className="text-lg font-semibold">
              Create Announcement
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Send an announcement to everyone or directly to one Chamber member.
            </p>

            <form
              onSubmit={
                createAnnouncement
              }
              className="mt-5 space-y-4"
            >

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Announcement Type
                </label>

                <div className="grid grid-cols-2 gap-3">

                  <button
                    type="button"
                    onClick={() =>
                      setAnnouncementType(
                        "general"
                      )
                    }
                    className={
                      announcementType ===
                      "general"
                        ? "rounded-xl border border-blue-500 bg-blue-600/20 p-3 text-sm font-semibold text-blue-300"
                        : "rounded-xl border border-slate-700 bg-slate-800 p-3 text-sm text-slate-400 hover:border-slate-600"
                    }
                  >
                    📢 General

                    <span className="mt-1 block text-xs font-normal">
                      Everyone in Chamber
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setAnnouncementType(
                        "specific"
                      )
                    }
                    className={
                      announcementType ===
                      "specific"
                        ? "rounded-xl border border-purple-500 bg-purple-600/20 p-3 text-sm font-semibold text-purple-300"
                        : "rounded-xl border border-slate-700 bg-slate-800 p-3 text-sm text-slate-400 hover:border-slate-600"
                    }
                  >
                    👤 Specific

                    <span className="mt-1 block text-xs font-normal">
                      One member
                    </span>
                  </button>

                </div>

              </div>

              {announcementType ===
                "specific" && (
                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Send To
                  </label>

                  {membersLoading ? (
                    <p className="text-sm text-slate-500">
                      Loading Chamber members...
                    </p>
                  ) : (
                    <select
                      value={
                        recipientId
                      }
                      onChange={(e) =>
                        setRecipientId(
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-purple-500"
                    >

                      <option value="">
                        Select a member
                      </option>

                      {members
                        .filter(
                          (member) =>
                            member.user_id !==
                            currentUserId
                        )
                        .map(
                          (member) => (
                            <option
                              key={
                                member.user_id
                              }
                              value={
                                member.user_id
                              }
                            >
                              {getProfileName(
                                member.user_id
                              )}{" "}
                              —{" "}
                              {
                                member.role
                              }
                            </option>
                          )
                        )}

                    </select>
                  )}

                </div>
              )}

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) =>
                    setTitle(
                      e.target.value
                    )
                  }
                  placeholder="Announcement title"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Message
                </label>

                <textarea
                  rows={5}
                  value={content}
                  onChange={(e) =>
                    setContent(
                      e.target.value
                    )
                  }
                  placeholder={
                    announcementType ===
                    "specific"
                      ? "Write a message for this member..."
                      : "Write an announcement for the Chamber..."
                  }
                  className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
                />

              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating
                  ? "Sending..."
                  : announcementType ===
                    "specific"
                  ? "Send to Member"
                  : "Publish to Chamber"}
              </button>

              {message && (
                <div className="rounded-xl border border-slate-700 bg-slate-800 p-3 text-sm text-slate-300">
                  {message}
                </div>
              )}

            </form>

          </div>
        )}

        {!isAdmin && (
          <div className="mb-6 rounded-xl border border-blue-900/50 bg-blue-950/30 p-4">

            <p className="text-sm text-blue-300">
              You can view Chamber announcements and messages sent specifically to you here.
            </p>

          </div>
        )}

        <div className="mt-6">

          <div className="mb-4 flex items-center justify-between">

            <h3 className="text-lg font-semibold">
              Recent Announcements
            </h3>

            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
              {announcements.length}
            </span>

          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <p className="text-slate-400">
                Loading announcements...
              </p>

            </div>
          ) : announcements.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-8 text-center">

              <p className="text-slate-400">
                No announcements yet.
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Announcements for this Chamber will appear here.
              </p>

            </div>
          ) : (
            <div className="space-y-4">

              {announcements.map(
                (announcement) => {

                  const isPersonal =
                    announcement.announcement_type ===
                    "specific";

                  const isUnread =
                    isPersonal &&
                    announcement.recipient_id ===
                      currentUserId &&
                    !announcement.is_read;

                  return (
                    <article
                      key={
                        announcement.id
                      }
                      onClick={() =>
                        markAsRead(
                          announcement
                        )
                      }
                      className={`rounded-2xl border p-5 transition ${
                        isUnread
                          ? "border-purple-500/50 bg-purple-950/30"
                          : "border-slate-800 bg-slate-900"
                      }`}
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div className="min-w-0">

                          <div className="mb-2 flex flex-wrap items-center gap-2">

                            <span
                              className={
                                isPersonal
                                  ? "rounded-full bg-purple-600/20 px-2 py-1 text-xs font-semibold text-purple-300"
                                  : "rounded-full bg-blue-600/20 px-2 py-1 text-xs font-semibold text-blue-300"
                              }
                            >
                              {isPersonal
                                ? "👤 Personal"
                                : "📢 General"}
                            </span>

                            {isUnread && (
                              <span className="rounded-full bg-red-600 px-2 py-1 text-xs font-semibold text-white">
                                New
                              </span>
                            )}

                          </div>

                          <h4 className="text-lg font-semibold text-white">
                            {
                              announcement.title
                            }
                          </h4>

                          <p className="mt-2 text-xs text-slate-500">
                            From{" "}
                            {getProfileName(
                              announcement.author_id
                            )}
                            {" • "}
                            {formatDate(
                              announcement.created_at
                            )}
                          </p>

                          {isPersonal && (
                            <p className="mt-2 text-xs text-purple-400">
                              Sent specifically to you
                            </p>
                          )}

                        </div>

                        {isAdmin && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();

                              deleteAnnouncement(
                                announcement.id
                              );
                            }}
                            className="shrink-0 rounded-lg bg-red-600/10 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-600/20"
                          >
                            Delete
                          </button>
                        )}

                      </div>

                      <div className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                        {
                          announcement.content
                        }
                      </div>

                    </article>
                  );
                }
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}