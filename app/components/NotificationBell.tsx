
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  MessageSquare,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Notification = {
  id: string;
  chamber_id: string;
  title: string;
  body: string | null;
  is_read: boolean;
  created_at: string;
  type: string;
};

export default function NotificationBell() {
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  useEffect(() => {
    let mounted = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function initializeNotifications() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        if (mounted) {
          setLoading(false);
        }
        return;
      }

      // Store the ID separately so TypeScript knows it is not null.
      const currentUserId = user.id;

      async function loadNotifications() {
        const { data, error } = await supabase
          .from("notifications")
          .select(
            "id, chamber_id, title, body, is_read, created_at, type"
          )
          .eq("user_id", currentUserId)
          .order("created_at", { ascending: false })
          .limit(30);

        if (error) {
          console.error("Error loading notifications:", error);
          return;
        }

        if (mounted) {
          setNotifications((data || []) as Notification[]);
          setLoading(false);
        }
      }

      await loadNotifications();

      if (!mounted) return;

      channel = supabase
        .channel(`notifications-${currentUserId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${currentUserId}`,
          },
          () => {
            void loadNotifications();
          }
        )
        .subscribe((status) => {
          if (status === "CHANNEL_ERROR") {
            console.error("Notification realtime connection failed.");
          }
        });
    }

    void initializeNotifications();

    return () => {
      mounted = false;

      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, []);

  async function markAsRead(notificationId: string) {
    const { error } = await supabase.rpc("mark_notification_read", {
      target_notification_id: notificationId,
    });

    if (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }

    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === notificationId
          ? { ...notification, is_read: true }
          : notification
      )
    );

    return true;
  }

  async function markAllAsRead() {
    if (unreadCount === 0 || markingAll) return;

    setMarkingAll(true);

    const { error } = await supabase.rpc(
      "mark_all_notifications_read"
    );

    if (error) {
      console.error("Error marking all notifications as read:", error);
      setMarkingAll(false);
      return;
    }

    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        is_read: true,
      }))
    );

    setMarkingAll(false);
  }

  async function openNotification(notification: Notification) {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    setOpen(false);

    router.push(`/chamber/${notification.chamber_id}`);
  }

  function formatTime(date: string) {
    const notificationDate = new Date(date);
    const now = new Date();

    const difference = now.getTime() - notificationDate.getTime();

    const minutes = Math.floor(difference / 60000);
    const hours = Math.floor(difference / 3600000);
    const days = Math.floor(difference / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return notificationDate.toLocaleDateString();
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
        className="relative flex h-9 w-9 items-center justify-center border border-black/[0.08] bg-white text-[#5f625f] transition hover:bg-[#f3f2f0]"
      >
        <Bell size={16} strokeWidth={1.7} />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#e5484d] px-1 text-[10px] font-semibold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {open && (
        <>
          <button
            type="button"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />

          <div className="absolute right-0 top-12 z-50 w-[min(360px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.14)]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black/[0.06] px-4 py-4">
              <div>
                <h3 className="text-[14px] font-semibold text-[#20211f]">
                  Notifications
                </h3>

                <p className="mt-0.5 text-[11px] text-[#92938f]">
                  {unreadCount > 0
                    ? `${unreadCount} unread notification${
                        unreadCount === 1 ? "" : "s"
                      }`
                    : "You're all caught up"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    disabled={markingAll}
                    className="flex items-center gap-1 text-[11px] font-medium text-[#555b52] transition hover:text-black disabled:opacity-50"
                  >
                    <CheckCheck size={14} />
                    {markingAll ? "Please wait..." : "Mark all read"}
                  </button>
                )}

                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[#92938f] transition hover:bg-[#f3f2f0]"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-[420px] overflow-y-auto">
              {loading ? (
                <div className="px-4 py-12 text-center">
                  <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-[#d8d8d4] border-t-[#555b52]" />
                  <p className="mt-3 text-xs text-[#92938f]">
                    Loading notifications...
                  </p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#f3f2f0] text-[#777a73]">
                    <Bell size={19} />
                  </div>

                  <p className="mt-3 text-sm font-medium text-[#383a36]">
                    No notifications yet
                  </p>

                  <p className="mt-1 text-xs text-[#999b96]">
                    New messages in your Chambers will appear here.
                  </p>
                </div>
              ) : (
                <div>
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() =>
                        void openNotification(notification)
                      }
                      className={`flex w-full gap-3 border-b border-black/[0.04] px-4 py-3 text-left transition hover:bg-[#f7f7f5] ${
                        !notification.is_read ? "bg-[#f8faf7]" : "bg-white"
                      }`}
                    >
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eef1eb] text-[#59634f]">
                        <MessageSquare size={16} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[12px] font-semibold text-[#30322e]">
                            {notification.title}
                          </p>

                          {!notification.is_read && (
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#00a86b]" />
                          )}
                        </div>

                        {notification.body && (
                          <p className="mt-1 line-clamp-2 text-[11px] leading-[1.5] text-[#777a73]">
                            {notification.body}
                          </p>
                        )}

                        <p className="mt-1.5 text-[10px] text-[#a0a19c]">
                          {formatTime(notification.created_at)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-black/[0.06] px-4 py-3">
                <p className="text-center text-[10px] text-[#a0a19c]">
                  Showing your latest {notifications.length} notifications
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
