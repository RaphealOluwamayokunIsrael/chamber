
"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
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

type FilterType = "all" | "general" | "specific" | "unread";
type SortType = "newest" | "oldest";

function MegaphoneIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m3 11 18-5v12L3 13v-2Z" />
      <path d="m7 14 2 6h4l-2-5" />
      <path d="M21 9a3 3 0 0 1 0 6" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export default function Announcements({
  chamberId,
}: {
  chamberId: string;
}) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  const [currentUserId, setCurrentUserId] = useState("");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [announcementType, setAnnouncementType] =
    useState<"general" | "specific">("general");

  const [recipientId, setRecipientId] = useState("");

  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // UI-ONLY STATE
  const [showComposer, setShowComposer] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortType>("newest");

  // INITIALIZE + REALTIME
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
        console.log("ANNOUNCEMENT REALTIME:", status);
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
      console.error("ANNOUNCEMENT INITIALIZE ERROR:", error);
    } finally {
      setLoading(false);
    }
  }

  // LOAD ANNOUNCEMENTS
  async function loadAnnouncements(userId?: string) {
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
        .order("created_at", { ascending: false });

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
        .order("created_at", { ascending: false });

      if (personalError) {
        console.error(
          "LOAD PERSONAL ANNOUNCEMENTS ERROR:",
          personalError
        );
        setMessage(personalError.message);
        return;
      }

      const combined: Announcement[] = [
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
          combined.map((announcement) => announcement.author_id)
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
                combinedProfiles.map((profile) => [
                  profile.id,
                  profile,
                ])
              ).values()
            );
          });
        }
      }
    } catch (error) {
      console.error("LOAD ANNOUNCEMENTS ERROR:", error);
    }
  }

  // LOAD MEMBERS AND PERMISSIONS
  async function loadMembers(userId: string) {
    try {
      setMembersLoading(true);

      const {
        data: memberData,
        error,
      } = await supabase
        .from("members")
        .select("id, user_id, role")
        .eq("chamber_id", chamberId);

      if (error) {
        console.error("LOAD MEMBERS ERROR:", error);
        return;
      }

      const memberList = memberData || [];
      setMembers(memberList);

      const currentMember = memberList.find(
        (member) => member.user_id === userId
      );

      const role = currentMember?.role?.toLowerCase();

      setIsAdmin(role === "admin" || role === "owner");

      const userIds = memberList.map(
        (member) => member.user_id
      );

      if (userIds.length > 0) {
        const {
          data: profileData,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select("id, full_name")
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
                combined.map((profile) => [
                  profile.id,
                  profile,
                ])
              ).values()
            );
          });
        }
      }
    } catch (error) {
      console.error("LOAD MEMBERS ERROR:", error);
    } finally {
      setMembersLoading(false);
    }
  }

  function getProfileName(userId: string) {
    const profile = profiles.find(
      (item) => item.id === userId
    );

    return profile?.full_name || "Chamber Member";
  }

  // CREATE ANNOUNCEMENT
  async function createAnnouncement(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setMessage("");

    if (!isAdmin) {
      setMessage("You do not have permission to publish announcements.");
      return;
    }

    if (!title.trim()) {
      setMessage("Please enter an announcement title.");
      return;
    }

    if (!content.trim()) {
      setMessage("Please enter the announcement message.");
      return;
    }

    if (announcementType === "specific" && !recipientId) {
      setMessage("Please select a Chamber member.");
      return;
    }

    try {
      setCreating(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please login first.");
        return;
      }

      const { error } = await supabase
        .from("announcements")
        .insert({
          chamber_id: chamberId,
          author_id: user.id,
          recipient_id:
            announcementType === "specific"
              ? recipientId
              : null,
          title: title.trim(),
          content: content.trim(),
          announcement_type: announcementType,
          is_read: false,
        });

      if (error) {
        console.error("CREATE ANNOUNCEMENT ERROR:", error);
        setMessage(error.message);
        return;
      }

      const successMessage =
        announcementType === "general"
          ? "General announcement published successfully."
          : `Announcement sent to ${getProfileName(recipientId)}.`;

      setTitle("");
      setContent("");
      setRecipientId("");
      setAnnouncementType("general");

      setMessage(successMessage);
      setShowComposer(false);

      await loadAnnouncements(currentUserId);
    } catch (error) {
      console.error("CREATE ANNOUNCEMENT ERROR:", error);
      setMessage("Unable to create announcement.");
    } finally {
      setCreating(false);
    }
  }

  // MARK PERSONAL ANNOUNCEMENT AS READ
  async function markAsRead(announcement: Announcement) {
    if (
      announcement.announcement_type !== "specific" ||
      announcement.recipient_id !== currentUserId ||
      announcement.is_read
    ) {
      return;
    }

    const { error } = await supabase
      .from("announcements")
      .update({ is_read: true })
      .eq("id", announcement.id)
      .eq("recipient_id", currentUserId);

    if (error) {
      console.error("MARK ANNOUNCEMENT READ ERROR:", error);
      return;
    }

    setAnnouncements((previous) =>
      previous.map((item) =>
        item.id === announcement.id
          ? { ...item, is_read: true }
          : item
      )
    );
  }

  // DELETE ANNOUNCEMENT
  async function deleteAnnouncement(
    announcementId: string
  ) {
    if (!isAdmin) return;

    const confirmed = window.confirm(
      "Delete this announcement?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", announcementId);

    if (error) {
      console.error("DELETE ANNOUNCEMENT ERROR:", error);
      setMessage(error.message);
      return;
    }

    await loadAnnouncements(currentUserId);
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString();
  }

  function getInitials(name: string) {
    return (
      name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join("")
        .toUpperCase() || "CM"
    );
  }

  const unreadCount = announcements.filter(
    (announcement) =>
      announcement.announcement_type === "specific" &&
      announcement.recipient_id === currentUserId &&
      !announcement.is_read
  ).length;

  const generalCount = announcements.filter(
    (announcement) =>
      announcement.announcement_type === "general"
  ).length;

  const personalCount = announcements.filter(
    (announcement) =>
      announcement.announcement_type === "specific"
  ).length;

  const filteredAnnouncements = announcements
    .filter((announcement) => {
      if (
        activeFilter === "general" &&
        announcement.announcement_type !== "general"
      ) {
        return false;
      }

      if (
        activeFilter === "specific" &&
        announcement.announcement_type !== "specific"
      ) {
        return false;
      }

      if (
        activeFilter === "unread" &&
        !(
          announcement.announcement_type === "specific" &&
          announcement.recipient_id === currentUserId &&
          !announcement.is_read
        )
      ) {
        return false;
      }

      const query = searchQuery.trim().toLowerCase();

      if (!query) return true;

      const authorName = getProfileName(
        announcement.author_id
      );

      return (
        announcement.title.toLowerCase().includes(query) ||
        announcement.content.toLowerCase().includes(query) ||
        authorName.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      const difference =
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime();

      return sortOrder === "newest"
        ? difference
        : -difference;
    });

  const filters: {
    value: FilterType;
    label: string;
    count: number;
  }[] = [
    {
      value: "all",
      label: "All Announcements",
      count: announcements.length,
    },
    {
      value: "general",
      label: "General",
      count: generalCount,
    },
    {
      value: "specific",
      label: "Personal",
      count: personalCount,
    },
    {
      value: "unread",
      label: "Unread",
      count: unreadCount,
    },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-950 text-white">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl space-y-5 px-4 py-5 sm:px-6 sm:py-7">
          {/* HEADER */}
          <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-7">
            <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />

            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-600/15 text-blue-400 sm:h-16 sm:w-16">
                  <MegaphoneIcon className="h-8 w-8" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    Announcements
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                    Stay informed with important updates, news,
                    and information from this Chamber.
                  </p>

                  {unreadCount > 0 && (
                    <span className="mt-3 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-600/10 px-3 py-1 text-xs font-semibold text-blue-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                      {unreadCount} unread personal{" "}
                      {unreadCount === 1
                        ? "announcement"
                        : "announcements"}
                    </span>
                  )}
                </div>
              </div>

              {isAdmin && (
                <div className="flex shrink-0 flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowComposer((previous) => !previous);
                      setMessage("");
                    }}
                    aria-expanded={showComposer}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/20 transition hover:bg-blue-700"
                  >
                    <PlusIcon />
                    {showComposer
                      ? "Close Composer"
                      : "New Announcement"}
                  </button>

                  <span className="text-center text-xs text-slate-500">
                    Owners and admins can publish
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* FEEDBACK */}
          {message && (
            <div
              role="status"
              className="flex items-start justify-between gap-4 rounded-xl border border-blue-900/50 bg-blue-950/30 px-4 py-3 text-sm text-blue-200"
            >
              <p>{message}</p>

              <button
                type="button"
                onClick={() => setMessage("")}
                aria-label="Dismiss message"
                className="shrink-0 rounded-md px-2 text-lg text-blue-300 hover:bg-blue-900/30"
              >
                ×
              </button>
            </div>
          )}

          {/* CREATE ANNOUNCEMENT */}
          {isAdmin && showComposer && (
            <section className="rounded-2xl border border-blue-500/30 bg-slate-900 p-5 shadow-xl shadow-black/10 sm:p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    Create Announcement
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    Share an update with the Chamber or send a
                    personal announcement.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowComposer(false)}
                  aria-label="Close announcement composer"
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-slate-300 hover:text-white"
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={createAnnouncement}
                className="space-y-5"
              >
                <div>
                  <label className="mb-3 block text-sm font-medium text-slate-300">
                    Announcement Type
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() =>
                        setAnnouncementType("general")
                      }
                      aria-pressed={
                        announcementType === "general"
                      }
                      className={`rounded-xl border p-4 text-left transition ${
                        announcementType === "general"
                          ? "border-blue-500 bg-blue-600/15"
                          : "border-slate-700 bg-slate-800/60 hover:border-slate-600"
                      }`}
                    >
                      <span className="flex items-center gap-2 font-semibold text-white">
                        <MegaphoneIcon className="h-5 w-5 text-blue-400" />
                        General
                      </span>

                      <span className="mt-2 block text-xs text-slate-400">
                        Visible to everyone in this Chamber
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setAnnouncementType("specific")
                      }
                      aria-pressed={
                        announcementType === "specific"
                      }
                      className={`rounded-xl border p-4 text-left transition ${
                        announcementType === "specific"
                          ? "border-blue-500 bg-blue-600/15"
                          : "border-slate-700 bg-slate-800/60 hover:border-slate-600"
                      }`}
                    >
                      <span className="flex items-center gap-2 font-semibold text-white">
                        <span className="text-blue-400">◉</span>
                        Specific
                      </span>

                      <span className="mt-2 block text-xs text-slate-400">
                        Send privately to one Chamber member
                      </span>
                    </button>
                  </div>
                </div>

                {announcementType === "specific" && (
                  <div>
                    <label
                      htmlFor="announcement-recipient"
                      className="mb-2 block text-sm font-medium text-slate-300"
                    >
                      Send To
                    </label>

                    {membersLoading ? (
                      <p className="text-sm text-slate-500">
                        Loading Chamber members...
                      </p>
                    ) : (
                      <select
                        id="announcement-recipient"
                        value={recipientId}
                        onChange={(e) =>
                          setRecipientId(e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
                      >
                        <option value="">
                          Select a member
                        </option>

                        {members
                          .filter(
                            (member) =>
                              member.user_id !== currentUserId
                          )
                          .map((member) => (
                            <option
                              key={member.user_id}
                              value={member.user_id}
                            >
                              {getProfileName(member.user_id)}
                              {" — "}
                              {member.role}
                            </option>
                          ))}
                      </select>
                    )}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="announcement-title"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Title
                  </label>

                  <input
                    id="announcement-title"
                    type="text"
                    value={title}
                    onChange={(e) =>
                      setTitle(e.target.value)
                    }
                    placeholder="Enter announcement title..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="announcement-content"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Message
                  </label>

                  <textarea
                    id="announcement-content"
                    rows={5}
                    value={content}
                    onChange={(e) =>
                      setContent(e.target.value)
                    }
                    placeholder={
                      announcementType === "specific"
                        ? "Write a message for this member..."
                        : "Write an announcement for the Chamber..."
                    }
                    className="w-full resize-y rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-800 pt-5">
                  <button
                    type="button"
                    onClick={() =>
                      setShowComposer(false)
                    }
                    className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-700"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={creating}
                    className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {creating
                      ? "Sending..."
                      : announcementType === "specific"
                      ? "Send to Member"
                      : "Publish to Chamber"}
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* DIRECTORY AND FILTERS */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Announcement Feed
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Browse and find Chamber updates.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="relative block">
                  <span className="sr-only">
                    Search announcements
                  </span>

                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <SearchIcon />
                  </span>

                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) =>
                      setSearchQuery(e.target.value)
                    }
                    placeholder="Search announcements..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 sm:w-64"
                  />
                </label>

                <select
                  aria-label="Sort announcements"
                  value={sortOrder}
                  onChange={(e) =>
                    setSortOrder(e.target.value as SortType)
                  }
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-blue-500"
                >
                  <option value="newest">
                    Newest First
                  </option>
                  <option value="oldest">
                    Oldest First
                  </option>
                </select>
              </div>
            </div>

            <div
              className="mt-5 flex flex-wrap gap-2"
              aria-label="Filter announcements"
            >
              {filters.map((filter) => {
                const selected =
                  activeFilter === filter.value;

                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() =>
                      setActiveFilter(filter.value)
                    }
                    aria-pressed={selected}
                    className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition ${
                      selected
                        ? "border-blue-500 bg-blue-600 text-white"
                        : "border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600 hover:text-white"
                    }`}
                  >
                    {filter.label}

                    <span
                      className={`rounded-md px-1.5 py-0.5 text-xs ${
                        selected
                          ? "bg-white/20 text-white"
                          : "bg-slate-700 text-slate-300"
                      }`}
                    >
                      {filter.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ANNOUNCEMENT RESULTS */}
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 px-1">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Recent Announcements
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  {loading
                    ? "Loading announcements..."
                    : `Showing ${filteredAnnouncements.length} of ${announcements.length} announcements`}
                </p>
              </div>

              {unreadCount > 0 && (
                <span className="rounded-full border border-blue-500/20 bg-blue-600/10 px-3 py-1 text-xs font-semibold text-blue-300">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {loading ? (
              <div
                className="space-y-3"
                aria-label="Loading announcements"
              >
                {[0, 1, 2].map((item) => (
                  <div
                    key={item}
                    className="animate-pulse rounded-2xl border border-slate-800 bg-slate-900 p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 shrink-0 rounded-full bg-slate-800" />

                      <div className="flex-1 space-y-3">
                        <div className="h-4 w-1/3 rounded bg-slate-800" />
                        <div className="h-3 w-1/2 rounded bg-slate-800" />
                        <div className="h-3 w-full rounded bg-slate-800" />
                        <div className="h-3 w-3/4 rounded bg-slate-800" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : announcements.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 px-6 py-16 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 text-blue-400">
                  <MegaphoneIcon className="h-8 w-8" />
                </div>

                <h4 className="mt-5 text-lg font-semibold text-white">
                  No announcements yet
                </h4>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
                  Announcements for this Chamber will appear
                  here when they are published.
                </p>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setShowComposer(true)}
                    className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Create First Announcement
                  </button>
                )}
              </div>
            ) : filteredAnnouncements.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 px-6 py-14 text-center">
                <h4 className="font-semibold text-white">
                  No matching announcements
                </h4>

                <p className="mt-2 text-sm text-slate-400">
                  Try a different search or filter.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveFilter("all");
                  }}
                  className="mt-4 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAnnouncements.map((announcement) => {
                  const isPersonal =
                    announcement.announcement_type ===
                    "specific";

                  const isUnread =
                    isPersonal &&
                    announcement.recipient_id ===
                      currentUserId &&
                    !announcement.is_read;

                  const authorName = getProfileName(
                    announcement.author_id
                  );

                  const initials = getInitials(authorName);

                  return (
                    <article
                      key={announcement.id}
                      className={`rounded-2xl border p-4 transition duration-200 sm:p-5 ${
                        isUnread
                          ? "border-blue-500/50 bg-blue-950/20 shadow-sm shadow-blue-950/20"
                          : "border-slate-800 bg-slate-900 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        {/* AUTHOR AVATAR */}
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-blue-500/20 bg-blue-600/15 text-sm font-bold text-blue-200 sm:h-12 sm:w-12">
                          {initials}
                        </div>

                        <div className="min-w-0 flex-1">
                          {/* TITLE + DELETE */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="break-words text-base font-semibold leading-6 text-white sm:text-lg">
                                  {announcement.title}
                                </h4>

                                <span
                                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                                    isPersonal
                                      ? "border-blue-500/30 bg-blue-500/10 text-blue-300"
                                      : "border-slate-600 bg-slate-800 text-slate-300"
                                  }`}
                                >
                                  {isPersonal
                                    ? "Personal"
                                    : "General"}
                                </span>

                                {isUnread && (
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white">
                                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                    New
                                  </span>
                                )}
                              </div>

                              <p className="mt-2 text-xs leading-5 text-slate-400">
                                By{" "}
                                <span className="font-medium text-blue-300">
                                  {authorName}
                                </span>
                                <span className="mx-2 text-slate-600">
                                  •
                                </span>
                                {formatDate(
                                  announcement.created_at
                                )}
                              </p>
                            </div>

                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() =>
                                  deleteAnnouncement(
                                    announcement.id
                                  )
                                }
                                aria-label={`Delete announcement: ${announcement.title}`}
                                className="shrink-0 rounded-lg border border-red-900/40 bg-red-950/20 px-3 py-2 text-xs font-semibold text-red-400 transition hover:border-red-800 hover:bg-red-950/40"
                              >
                                Delete
                              </button>
                            )}
                          </div>

                          {/* ANNOUNCEMENT CONTENT */}
                          <div className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-300">
                            {announcement.content}
                          </div>

                          {/* PERSONAL ANNOUNCEMENT FOOTER */}
                          {isPersonal && (
                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-3">
                              <p className="text-xs text-blue-300">
                                Sent specifically to you
                              </p>

                              {isUnread ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    markAsRead(announcement)
                                  }
                                  className="rounded-lg border border-blue-500/30 bg-blue-600/10 px-3 py-2 text-xs font-semibold text-blue-300 transition hover:bg-blue-600/20"
                                >
                                  Mark as Read
                                </button>
                              ) : (
                                <span className="text-xs font-medium text-slate-500">
                                  Read
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* FOOTER */}
          <div className="pb-4 text-center text-xs text-slate-600">
            Chamber Announcements
          </div>
        </div>
      </div>
    </div>
  );
}
