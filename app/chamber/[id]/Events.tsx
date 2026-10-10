
"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

type EventItem = {
  id: string;
  chamber_id: string;
  created_by: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  created_at: string;
};

type EventsProps = {
  chamberId: string;
};

type EventFilter = "upcoming" | "past" | "all";

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: "calendar" | "plus" | "search" | "clock" | "pin" | "refresh" | "trash" | "close" | "arrow";
  className?: string;
}) {
  const paths: Record<typeof name, ReactNode> = {
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4M17 3v4M3 10h18" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    pin: (
      <>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 7v5h-5M4 17v-5h5" />
        <path d="M5.5 9A7 7 0 0 1 18 7l2 5M4 12l2 5a7 7 0 0 0 12.5-2" />
      </>
    ),
    trash: (
      <>
        <path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6" />
      </>
    ),
    close: <path d="M5 5l14 14M19 5 5 19" />,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  };

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
      {paths[name]}
    </svg>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function EventCard({
  event,
  isPast,
  canDelete,
  onDelete,
}: {
  event: EventItem;
  isPast: boolean;
  canDelete: boolean;
  onDelete: (event: EventItem) => void;
}) {
  const date = new Date(event.event_date);

  return (
    <article
      className={`group overflow-hidden rounded-2xl border transition duration-200 ${
        isPast
          ? "border-slate-800 bg-slate-900/60"
          : "border-slate-800 bg-slate-900 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-950/10"
      }`}
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:gap-5 sm:p-5">
        <div
          className={`flex h-[76px] w-[76px] shrink-0 flex-col items-center justify-center rounded-2xl border ${
            isPast
              ? "border-slate-700 bg-slate-800 text-slate-300"
              : "border-blue-500/20 bg-blue-600/10 text-blue-300"
          }`}
        >
          <span className="text-xs font-bold uppercase tracking-widest">
            {date.toLocaleDateString(undefined, {
              month: "short",
            })}
          </span>
          <span className="mt-0.5 text-3xl font-bold leading-none">
            {date.getDate()}
          </span>
          <span className="mt-1 text-[10px] text-slate-400">
            {date.getFullYear()}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="break-words text-lg font-semibold text-white">
              {event.title}
            </h4>

            <span
              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                isPast
                  ? "border-slate-700 bg-slate-800 text-slate-400"
                  : "border-blue-500/25 bg-blue-600/10 text-blue-300"
              }`}
            >
              {isPast ? "Completed" : "Upcoming"}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-400">
            <span className="inline-flex items-center gap-2">
              <Icon name="calendar" className="h-4 w-4 text-blue-400" />
              {formatDate(event.event_date)}
            </span>

            <span className="inline-flex items-center gap-2">
              <Icon name="clock" className="h-4 w-4 text-blue-400" />
              {formatTime(event.event_date)}
            </span>

            {event.location && (
              <span className="inline-flex min-w-0 items-center gap-2">
                <Icon name="pin" className="h-4 w-4 shrink-0 text-blue-400" />
                <span className="break-words">{event.location}</span>
              </span>
            )}
          </div>

          {event.description && (
            <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-slate-300">
              {event.description}
            </p>
          )}
        </div>

        {canDelete && (
          <div className="flex shrink-0 items-start">
            <button
              type="button"
              onClick={() => onDelete(event)}
              aria-label={`Delete event ${event.title}`}
              className="inline-flex items-center gap-2 rounded-xl border border-red-900/40 bg-red-950/20 px-3 py-2 text-xs font-semibold text-red-400 transition hover:border-red-800 hover:bg-red-950/40"
            >
              <Icon name="trash" className="h-4 w-4" />
              Delete
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export default function Events({ chamberId }: EventsProps) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [location, setLocation] = useState("");

  const [activeFilter, setActiveFilter] = useState<EventFilter>("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!chamberId) return;

    let active = true;

    async function initialize() {
      try {
        setLoading(true);
        setMessage("");

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!active) return;

        if (!user) {
          setCurrentUserId("");
          setEvents([]);
          setMessage("Please sign in to view Chamber events.");
          return;
        }

        setCurrentUserId(user.id);

        const { data, error } = await supabase
          .from("events")
          .select(
            "id, chamber_id, created_by, title, description, event_date, location, created_at"
          )
          .eq("chamber_id", chamberId)
          .order("event_date", { ascending: true });

        if (!active) return;

        if (error) {
          console.error("LOAD EVENTS ERROR:", error);
          setMessage(error.message);
          return;
        }

        setEvents(data || []);
        setNow(Date.now());
      } catch (error) {
        console.error("EVENTS INITIALIZATION ERROR:", error);

        if (active) {
          setMessage("Unable to load Chamber events.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    initialize();

    return () => {
      active = false;
    };
  }, [chamberId]);

  async function loadEvents() {
    if (!chamberId) return;

    try {
      setLoading(true);
      setMessage("");

      const { data, error } = await supabase
        .from("events")
        .select(
          "id, chamber_id, created_by, title, description, event_date, location, created_at"
        )
        .eq("chamber_id", chamberId)
        .order("event_date", { ascending: true });

      if (error) {
        console.error("LOAD EVENTS ERROR:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });

        setMessage(error.message);
        return;
      }

      setEvents(data || []);
      setNow(Date.now());
    } catch (error) {
      console.error("LOAD EVENTS ERROR:", error);
      setMessage("Unable to load Chamber events.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setEventDate("");
    setEventTime("");
    setLocation("");
  }

  async function createEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (creating) return;

    setMessage("");

    if (!title.trim()) {
      setMessage("Please enter an event title.");
      return;
    }

    if (!eventDate) {
      setMessage("Please select an event date.");
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

      // Preserve the original event_date timestamp format.
      const eventDateTime = eventTime
        ? `${eventDate}T${eventTime}:00`
        : `${eventDate}T00:00:00`;

      const { error } = await supabase.from("events").insert({
        chamber_id: chamberId,
        created_by: user.id,
        title: title.trim(),
        description: description.trim() || null,
        event_date: eventDateTime,
        location: location.trim() || null,
      });

      if (error) {
        console.error("CREATE EVENT ERROR:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });

        setMessage(`Could not create event: ${error.message}`);
        return;
      }

      resetForm();
      setShowCreateForm(false);
      setActiveFilter("upcoming");
      setSearchQuery("");
      setMessage("Event created successfully.");

      await loadEvents();
    } catch (error) {
      console.error("CREATE EVENT ERROR:", error);
      setMessage("Something went wrong while creating the event.");
    } finally {
      setCreating(false);
    }
  }

  async function deleteEvent(event: EventItem) {
    if (event.created_by !== currentUserId) {
      setMessage("You can only delete events you created.");
      return;
    }

    const confirmed = window.confirm(
      `Delete "${event.title}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(event.id);
      setMessage("");

      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", event.id)
        .eq("chamber_id", chamberId)
        .eq("created_by", currentUserId);

      if (error) {
        console.error("DELETE EVENT ERROR:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });

        setMessage(`Could not delete event: ${error.message}`);
        return;
      }

      setMessage("Event deleted successfully.");
      await loadEvents();
    } catch (error) {
      console.error("DELETE EVENT ERROR:", error);
      setMessage("Something went wrong while deleting the event.");
    } finally {
      setDeletingId(null);
    }
  }

  const upcomingEvents = useMemo(
    () =>
      events
        .filter(
          (event) =>
            new Date(event.event_date).getTime() >= now
        )
        .sort(
          (a, b) =>
            new Date(a.event_date).getTime() -
            new Date(b.event_date).getTime()
        ),
    [events, now]
  );

  const pastEvents = useMemo(
    () =>
      events
        .filter(
          (event) =>
            new Date(event.event_date).getTime() < now
        )
        .sort(
          (a, b) =>
            new Date(b.event_date).getTime() -
            new Date(a.event_date).getTime()
        ),
    [events, now]
  );

  const filteredEvents = useMemo(() => {
    const source =
      activeFilter === "upcoming"
        ? upcomingEvents
        : activeFilter === "past"
        ? pastEvents
        : [...upcomingEvents, ...pastEvents];

    const query = searchQuery.trim().toLowerCase();

    if (!query) return source;

    return source.filter(
      (event) =>
        event.title.toLowerCase().includes(query) ||
        (event.description || "").toLowerCase().includes(query) ||
        (event.location || "").toLowerCase().includes(query)
    );
  }, [
    activeFilter,
    upcomingEvents,
    pastEvents,
    searchQuery,
  ]);

  const nextEvent = upcomingEvents[0];

  const inputClass =
    "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500";

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-950 text-white">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl space-y-5 px-4 py-5 sm:px-6 sm:py-7">
          {/* HERO */}
          <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-7">
            <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />

            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-600/15 text-blue-400 sm:h-16 sm:w-16">
                  <Icon name="calendar" className="h-8 w-8" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Events
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                    Plan, discover, and stay connected with
                    everything happening in your Chamber.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={loadEvents}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-700 disabled:opacity-50"
                >
                  <Icon name="refresh" className="h-4 w-4" />
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setShowCreateForm((value) => !value)
                  }
                  aria-expanded={showCreateForm}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <Icon
                    name={showCreateForm ? "close" : "plus"}
                    className="h-4 w-4"
                  />
                  {showCreateForm ? "Close Form" : "Create Event"}
                </button>
              </div>
            </div>
          </section>

          {/* SUMMARY */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">
                Total Events
              </p>
              <p className="mt-2 text-3xl font-bold text-white">
                {events.length}
              </p>
            </div>

            <div className="rounded-2xl border border-blue-500/20 bg-blue-950/20 p-5">
              <p className="text-sm text-blue-300">
                Upcoming Events
              </p>
              <p className="mt-2 text-3xl font-bold text-white">
                {upcomingEvents.length}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">
                Past Events
              </p>
              <p className="mt-2 text-3xl font-bold text-white">
                {pastEvents.length}
              </p>
            </div>
          </div>

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
                className="rounded-lg px-2 text-lg text-blue-300 hover:bg-blue-900/30"
              >
                ×
              </button>
            </div>
          )}

          {/* CREATE FORM */}
          {showCreateForm && (
            <section className="rounded-2xl border border-blue-500/30 bg-slate-900 p-5 sm:p-6">
              <div className="mb-6 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold">
                    Create a New Event
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    Share the details of your next Chamber event.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  aria-label="Close event form"
                  className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:bg-slate-700"
                >
                  <Icon name="close" className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={createEvent} className="space-y-5">
                <div>
                  <label
                    htmlFor="chamber-event-title"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Event Title
                  </label>

                  <input
                    id="chamber-event-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Monthly Chamber Meeting"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="chamber-event-description"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Description
                  </label>

                  <textarea
                    id="chamber-event-description"
                    value={description}
                    onChange={(e) =>
                      setDescription(e.target.value)
                    }
                    placeholder="Describe the event..."
                    rows={4}
                    className={`${inputClass} resize-y`}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="chamber-event-date"
                      className="mb-2 block text-sm font-medium text-slate-300"
                    >
                      Date
                    </label>

                    <input
                      id="chamber-event-date"
                      type="date"
                      value={eventDate}
                      onChange={(e) =>
                        setEventDate(e.target.value)
                      }
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="chamber-event-time"
                      className="mb-2 block text-sm font-medium text-slate-300"
                    >
                      Time
                    </label>

                    <input
                      id="chamber-event-time"
                      type="time"
                      value={eventTime}
                      onChange={(e) =>
                        setEventTime(e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="chamber-event-location"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Location
                  </label>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Icon name="pin" className="h-4 w-4" />
                    </span>

                    <input
                      id="chamber-event-location"
                      type="text"
                      value={location}
                      onChange={(e) =>
                        setLocation(e.target.value)
                      }
                      placeholder="e.g. Chamber Hall / Online"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-3 border-t border-slate-800 pt-5">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setShowCreateForm(false);
                    }}
                    className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-700"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={creating}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Icon name="plus" className="h-4 w-4" />
                    {creating ? "Creating..." : "Create Event"}
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* NEXT EVENT */}
          {!loading && nextEvent && (
            <section className="relative overflow-hidden rounded-2xl border border-blue-500/25 bg-gradient-to-r from-blue-950/50 via-slate-900 to-slate-900 p-5 sm:p-6">
              <div className="pointer-events-none absolute -right-10 -top-16 h-52 w-52 rounded-full bg-blue-600/10 blur-3xl" />

              <div className="relative">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-300">
                    Next Upcoming Event
                  </span>
                </div>

                <h3 className="mt-3 break-words text-xl font-bold text-white sm:text-2xl">
                  {nextEvent.title}
                </h3>

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-300">
                  <span className="inline-flex items-center gap-2">
                    <Icon
                      name="calendar"
                      className="h-4 w-4 text-blue-400"
                    />
                    {formatDate(nextEvent.event_date)}
                  </span>

                  <span className="inline-flex items-center gap-2">
                    <Icon
                      name="clock"
                      className="h-4 w-4 text-blue-400"
                    />
                    {formatTime(nextEvent.event_date)}
                  </span>

                  {nextEvent.location && (
                    <span className="inline-flex items-center gap-2">
                      <Icon
                        name="pin"
                        className="h-4 w-4 text-blue-400"
                      />
                      {nextEvent.location}
                    </span>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* SEARCH + FILTERS */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  Explore Events
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Find upcoming activities and previous events.
                </p>
              </div>

              <label className="relative block">
                <span className="sr-only">Search events</span>

                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icon name="search" className="h-4 w-4" />
                </span>

                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(e.target.value)
                  }
                  placeholder="Search events..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500 lg:w-72"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {(
                [
                  {
                    value: "upcoming",
                    label: "Upcoming",
                    count: upcomingEvents.length,
                  },
                  {
                    value: "past",
                    label: "Past Events",
                    count: pastEvents.length,
                  },
                  {
                    value: "all",
                    label: "All Events",
                    count: events.length,
                  },
                ] as const
              ).map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() =>
                    setActiveFilter(filter.value)
                  }
                  aria-pressed={
                    activeFilter === filter.value
                  }
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                    activeFilter === filter.value
                      ? "border-blue-500 bg-blue-600 text-white"
                      : "border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600 hover:text-white"
                  }`}
                >
                  {filter.label}

                  <span
                    className={`rounded-md px-1.5 py-0.5 text-xs ${
                      activeFilter === filter.value
                        ? "bg-white/20 text-white"
                        : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* EVENT LIST */}
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 px-1">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {activeFilter === "upcoming"
                    ? "Upcoming Events"
                    : activeFilter === "past"
                    ? "Past Events"
                    : "All Events"}
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  {loading
                    ? "Loading events..."
                    : `${filteredEvents.length} ${
                        filteredEvents.length === 1
                          ? "event"
                          : "events"
                      }`}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="space-y-3" aria-label="Loading events">
                {[0, 1, 2].map((item) => (
                  <div
                    key={item}
                    className="animate-pulse rounded-2xl border border-slate-800 bg-slate-900 p-5"
                  >
                    <div className="flex gap-4">
                      <div className="h-16 w-16 shrink-0 rounded-xl bg-slate-800" />
                      <div className="flex-1 space-y-3">
                        <div className="h-4 w-1/2 rounded bg-slate-800" />
                        <div className="h-3 w-2/3 rounded bg-slate-800" />
                        <div className="h-3 w-full rounded bg-slate-800" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 px-6 py-14 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 text-blue-400">
                  <Icon name="calendar" className="h-8 w-8" />
                </div>

                <h4 className="mt-5 text-lg font-semibold text-white">
                  {searchQuery.trim()
                    ? "No matching events"
                    : activeFilter === "upcoming"
                    ? "No upcoming events"
                    : activeFilter === "past"
                    ? "No past events"
                    : "No events yet"}
                </h4>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
                  {searchQuery.trim()
                    ? "Try searching with a different title, location, or keyword."
                    : activeFilter === "upcoming"
                    ? "New Chamber events will appear here when they are scheduled."
                    : "There are no events to display in this section."}
                </p>

                {searchQuery.trim() && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="mt-5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isPast={
                      new Date(event.event_date).getTime() < now
                    }
                    canDelete={
                      event.created_by === currentUserId &&
                      deletingId !== event.id
                    }
                    onDelete={deleteEvent}
                  />
                ))}
              </div>
            )}
          </section>

          <p className="pb-4 text-center text-xs text-slate-600">
            Chamber Events
          </p>
        </div>
      </div>
    </div>
  );
}
