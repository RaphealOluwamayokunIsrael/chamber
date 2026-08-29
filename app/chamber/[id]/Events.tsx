"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type EventItem = {
  id: string;
  chamber_id: string;
  created_by: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  location: string | null;
  created_at: string;
};

type EventsProps = {
  chamberId: string;
};

export default function Events({
  chamberId,
}: EventsProps) {
  const [events, setEvents] = useState<EventItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [creating, setCreating] = useState(false);

  const [currentUserId, setCurrentUserId] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);

  const [title, setTitle] = useState("");

  const [description, setDescription] = useState("");

  const [eventDate, setEventDate] = useState("");

  const [eventTime, setEventTime] = useState("");

  const [location, setLocation] = useState("");

  useEffect(() => {
    if (!chamberId) return;

    initialize();
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

      await loadEvents();
    } catch (error) {
      console.error(
        "EVENTS INITIALIZATION ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadEvents() {
    if (!chamberId) return;

    try {
      setLoading(true);

      const {
        data,
        error,
      } = await supabase
        .from("events")
        .select(`
          id,
          chamber_id,
          created_by,
          title,
          description,
          event_date,
          event_time,
          location,
          created_at
        `)
        .eq(
          "chamber_id",
          chamberId
        )
        .order(
          "event_date",
          {
            ascending: true,
          }
        )
        .order(
          "event_time",
          {
            ascending: true,
          }
        );

      if (error) {
        console.error(
          "LOAD EVENTS ERROR:",
          {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          }
        );

        return;
      }

      setEvents(data || []);
    } catch (error) {
      console.error(
        "LOAD EVENTS ERROR:",
        error
      );
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

  async function createEvent(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (creating) return;

    if (!title.trim()) {
      alert(
        "Please enter an event title."
      );

      return;
    }

    if (!eventDate) {
      alert(
        "Please select an event date."
      );

      return;
    }

    try {
      setCreating(true);

      const {
        data: {
          user,
        },
      } = await supabase.auth.getUser();

      if (!user) {
        alert(
          "Please login first."
        );

        return;
      }

      const {
        error,
      } = await supabase
        .from("events")
        .insert({
          chamber_id:
            chamberId,
          created_by:
            user.id,
          title:
            title.trim(),
          description:
            description.trim() ||
            null,
          event_date:
            eventDate,
          event_time:
            eventTime ||
            null,
          location:
            location.trim() ||
            null,
        });

      if (error) {
        console.error(
          "CREATE EVENT ERROR:",
          {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          }
        );

        alert(
          `Could not create event: ${error.message}`
        );

        return;
      }

      resetForm();

      setShowCreateForm(false);

      await loadEvents();
    } catch (error) {
      console.error(
        "CREATE EVENT ERROR:",
        error
      );

      alert(
        "Something went wrong while creating the event."
      );
    } finally {
      setCreating(false);
    }
  }

  async function deleteEvent(
    eventId: string,
    createdBy: string,
    eventTitle: string
  ) {
    if (
      createdBy !==
      currentUserId
    ) {
      alert(
        "You can only delete events you created."
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Delete "${eventTitle}"?`
      );

    if (!confirmed) return;

    try {
      const {
        error,
      } = await supabase
        .from("events")
        .delete()
        .eq(
          "id",
          eventId
        )
        .eq(
          "created_by",
          currentUserId
        );

      if (error) {
        console.error(
          "DELETE EVENT ERROR:",
          {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          }
        );

        alert(
          `Could not delete event: ${error.message}`
        );

        return;
      }

      await loadEvents();
    } catch (error) {
      console.error(
        "DELETE EVENT ERROR:",
        error
      );

      alert(
        "Something went wrong while deleting the event."
      );
    }
  }

  function formatDate(
    date: string
  ) {
    const parsedDate =
      new Date(
        `${date}T00:00:00`
      );

    return parsedDate.toLocaleDateString(
      undefined,
      {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  }

  function formatTime(
    time: string | null
  ) {
    if (!time) {
      return "";
    }

    const parsedTime =
      new Date(
        `1970-01-01T${time}`
      );

    return parsedTime.toLocaleTimeString(
      undefined,
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  }

  function isPast(
    eventDate: string,
    eventTime: string | null
  ) {
    const dateTime = eventTime
      ? new Date(
          `${eventDate}T${eventTime}`
        )
      : new Date(
          `${eventDate}T23:59:59`
        );

    return (
      dateTime.getTime() <
      Date.now()
    );
  }

  const upcomingEvents =
    events.filter(
      (event) =>
        !isPast(
          event.event_date,
          event.event_time
        )
    );

  const pastEvents =
    events.filter(
      (event) =>
        isPast(
          event.event_date,
          event.event_time
        )
    );

  return (
    <div className="h-full overflow-y-auto p-6">

      <div className="mx-auto max-w-5xl">

        {/* HEADER */}

        <div className="flex flex-wrap items-center justify-between gap-4">

          <div>
            <h2 className="text-2xl font-bold text-white">
              Events
            </h2>

            <p className="mt-2 text-slate-400">
              Create and manage events for this Chamber.
            </p>
          </div>

          <div className="flex items-center gap-2">

            <button
              type="button"
              onClick={
                loadEvents
              }
              disabled={
                loading
              }
              className="rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
            >
              Refresh
            </button>

            <button
              type="button"
              onClick={() =>
                setShowCreateForm(
                  (value) =>
                    !value
                )
              }
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              {showCreateForm
                ? "Close"
                : "+ Create Event"}
            </button>

          </div>

        </div>

        {/* CREATE EVENT FORM */}

        {showCreateForm && (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="mb-6">

              <h3 className="text-xl font-bold text-white">
                Create Event
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Add an event that Chamber members can see.
              </p>

            </div>

            <form
              onSubmit={
                createEvent
              }
              className="space-y-5"
            >

              {/* TITLE */}

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Event Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value
                    )
                  }
                  placeholder="e.g. Monthly Chamber Meeting"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                  required
                />

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Description
                </label>

                <textarea
                  value={
                    description
                  }
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  placeholder="Describe the event..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                />

              </div>

              {/* DATE + TIME */}

              <div className="grid gap-5 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Date
                  </label>

                  <input
                    type="date"
                    value={
                      eventDate
                    }
                    onChange={(event) =>
                      setEventDate(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                    required
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Time
                  </label>

                  <input
                    type="time"
                    value={
                      eventTime
                    }
                    onChange={(event) =>
                      setEventTime(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  />

                </div>

              </div>

              {/* LOCATION */}

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Location
                </label>

                <input
                  type="text"
                  value={
                    location
                  }
                  onChange={(event) =>
                    setLocation(
                      event.target.value
                    )
                  }
                  placeholder="e.g. Chamber Hall / Online"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                />

              </div>

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowCreateForm(
                      false
                    );
                  }}
                  className="rounded-xl bg-slate-800 px-5 py-3 font-semibold text-white hover:bg-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    creating
                  }
                  className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creating
                    ? "Creating..."
                    : "Create Event"}
                </button>

              </div>

            </form>

          </div>
        )}

        {/* LOADING */}

        {loading ? (
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">

            <p className="text-slate-400">
              Loading events...
            </p>

          </div>
        ) : (
          <>
            {/* UPCOMING EVENTS */}

            <div className="mt-8">

              <div className="mb-4 flex items-center justify-between">

                <h3 className="text-lg font-bold text-white">
                  Upcoming Events
                </h3>

                <span className="rounded-full bg-blue-600/10 px-3 py-1 text-xs font-semibold text-blue-400">
                  {upcomingEvents.length}
                </span>

              </div>

              {upcomingEvents.length ===
              0 ? (
                <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-10 text-center">

                  <div className="text-5xl">
                    📅
                  </div>

                  <p className="mt-4 font-semibold text-white">
                    No upcoming events
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    Create an event to let Chamber members know what is happening.
                  </p>

                </div>
              ) : (
                <div className="space-y-4">

                  {upcomingEvents.map(
                    (event) => (
                      <div
                        key={
                          event.id
                        }
                        className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-700"
                      >

                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                          <div className="min-w-0">

                            <div className="flex items-start gap-4">

                              <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-blue-600/10 text-blue-400">

                                <span className="text-xs font-semibold uppercase">
                                  {new Date(
                                    `${event.event_date}T00:00:00`
                                  ).toLocaleDateString(
                                    undefined,
                                    {
                                      month:
                                        "short",
                                    }
                                  )}
                                </span>

                                <span className="text-xl font-bold">
                                  {new Date(
                                    `${event.event_date}T00:00:00`
                                  ).getDate()}
                                </span>

                              </div>

                              <div className="min-w-0">

                                <h4 className="text-lg font-bold text-white">
                                  {event.title}
                                </h4>

                                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400">

                                  <span>
                                    📅{" "}
                                    {formatDate(
                                      event.event_date
                                    )}
                                  </span>

                                  {event.event_time && (
                                    <span>
                                      🕐{" "}
                                      {formatTime(
                                        event.event_time
                                      )}
                                    </span>
                                  )}

                                  {event.location && (
                                    <span>
                                      📍{" "}
                                      {event.location}
                                    </span>
                                  )}

                                </div>

                              </div>

                            </div>

                            {event.description && (
                              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-400">
                                {
                                  event.description
                                }
                              </p>
                            )}

                          </div>

                          {event.created_by ===
                            currentUserId && (
                            <button
                              type="button"
                              onClick={() =>
                                deleteEvent(
                                  event.id,
                                  event.created_by,
                                  event.title
                                )
                              }
                              className="rounded-lg bg-red-600/10 px-3 py-2 text-sm font-semibold text-red-400 hover:bg-red-600/20"
                            >
                              Delete
                            </button>
                          )}

                        </div>

                      </div>
                    )
                  )}

                </div>
              )}

            </div>

            {/* PAST EVENTS */}

            {pastEvents.length >
              0 && (
              <div className="mt-10">

                <div className="mb-4 flex items-center justify-between">

                  <h3 className="text-lg font-bold text-white">
                    Past Events
                  </h3>

                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-400">
                    {pastEvents.length}
                  </span>

                </div>

                <div className="space-y-3">

                  {pastEvents.map(
                    (event) => (
                      <div
                        key={
                          event.id
                        }
                        className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 opacity-75"
                      >

                        <div className="flex items-start justify-between gap-4">

                          <div>

                            <h4 className="font-semibold text-white">
                              {event.title}
                            </h4>

                            <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">

                              <span>
                                📅{" "}
                                {formatDate(
                                  event.event_date
                                )}
                              </span>

                              {event.event_time && (
                                <span>
                                  🕐{" "}
                                  {formatTime(
                                    event.event_time
                                  )}
                                </span>
                              )}

                              {event.location && (
                                <span>
                                  📍{" "}
                                  {event.location}
                                </span>
                              )}

                            </div>

                          </div>

                          {event.created_by ===
                            currentUserId && (
                            <button
                              type="button"
                              onClick={() =>
                                deleteEvent(
                                  event.id,
                                  event.created_by,
                                  event.title
                                )
                              }
                              className="rounded-lg bg-red-600/10 px-3 py-2 text-sm font-semibold text-red-400 hover:bg-red-600/20"
                            >
                              Delete
                            </button>
                          )}

                        </div>

                      </div>
                    )
                  )}

                </div>

              </div>
            )}

          </>
        )}

      </div>

    </div>
  );
}