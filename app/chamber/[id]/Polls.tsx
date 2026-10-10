
"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "@/lib/supabase";

type Poll = {
  id: string;
  chamber_id: string;
  created_by: string;
  question: string;
  options: string[];
  expires_at: string | null;
  created_at: string;
};

type PollVote = {
  id: string;
  poll_id: string;
  user_id: string;
  option_index: number;
};

type PollsProps = {
  chamberId: string;
};

type Filter = "active" | "expired" | "all";

const dateLabel = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

export default function Polls({ chamberId }: PollsProps) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [votes, setVotes] = useState<PollVote[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [busyPollId, setBusyPollId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [showCreator, setShowCreator] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [expiresAt, setExpiresAt] = useState("");

  const [filter, setFilter] = useState<Filter>("active");
  const [search, setSearch] = useState("");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!chamberId) return;

    let active = true;

    setPolls([]);
    setVotes([]);
    setCurrentUserId("");
    setLoading(true);

    async function initialize() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!active) return;

        if (!user) {
          setError("Please sign in to view polls.");
          setLoading(false);
          return;
        }

        setCurrentUserId(user.id);

        const { data: pollData, error: pollError } =
          await supabase
            .from("polls")
            .select(
              "id,chamber_id,created_by,question,options,expires_at,created_at"
            )
            .eq("chamber_id", chamberId)
            .order("created_at", { ascending: false });

        if (pollError) throw pollError;
        if (!active) return;

        const normalized: Poll[] = (pollData || []).map(
          (poll) => ({
            ...poll,
            options: Array.isArray(poll.options)
              ? poll.options.filter(
                  (option: unknown): option is string =>
                    typeof option === "string"
                )
              : [],
          })
        );

        setPolls(normalized);

        if (normalized.length) {
          const { data: voteData, error: voteError } =
            await supabase
              .from("poll_votes")
              .select("id,poll_id,user_id,option_index")
              .in(
                "poll_id",
                normalized.map((poll) => poll.id)
              );

          if (voteError) throw voteError;
          if (!active) return;
          setVotes(voteData || []);
        } else {
          setVotes([]);
        }

        setError("");
        setNow(Date.now());
      } catch (err) {
        console.error("LOAD POLLS ERROR:", err);
        if (active) setError("Unable to load Chamber polls.");
      } finally {
        if (active) setLoading(false);
      }
    }

    initialize();

    return () => {
      active = false;
    };
  }, [chamberId]);

  async function refreshPolls(showLoading = false) {
    if (!chamberId) return;

    if (showLoading) setLoading(true);

    try {
      const { data: pollData, error: pollError } =
        await supabase
          .from("polls")
          .select(
            "id,chamber_id,created_by,question,options,expires_at,created_at"
          )
          .eq("chamber_id", chamberId)
          .order("created_at", { ascending: false });

      if (pollError) throw pollError;

      const normalized: Poll[] = (pollData || []).map(
        (poll) => ({
          ...poll,
          options: Array.isArray(poll.options)
            ? poll.options.filter(
                (option: unknown): option is string =>
                  typeof option === "string"
              )
            : [],
        })
      );

      let nextVotes: PollVote[] = [];

      if (normalized.length) {
        const { data, error: voteError } = await supabase
          .from("poll_votes")
          .select("id,poll_id,user_id,option_index")
          .in(
            "poll_id",
            normalized.map((poll) => poll.id)
          );

        if (voteError) throw voteError;
        nextVotes = data || [];
      }

      setPolls(normalized);
      setVotes(nextVotes);
      setNow(Date.now());
      setError("");
    } catch (err) {
      console.error("REFRESH POLLS ERROR:", err);
      setError("Unable to refresh polls.");
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  function addOption() {
    if (options.length >= 6) return;
    setOptions((previous) => [...previous, ""]);
  }

  function removeOption(index: number) {
    if (options.length <= 2) return;
    setOptions((previous) =>
      previous.filter((_, i) => i !== index)
    );
  }

  function updateOption(index: number, value: string) {
    setOptions((previous) =>
      previous.map((option, i) =>
        i === index ? value : option
      )
    );
  }

  async function createPoll(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (creating) return;

    setError("");
    setNotice("");

    const cleanQuestion = question.trim();
    const cleanOptions = options
      .map((option) => option.trim())
      .filter(Boolean);

    if (!cleanQuestion) {
      setError("Please enter a poll question.");
      return;
    }

    if (cleanOptions.length < 2) {
      setError("A poll must have at least two options.");
      return;
    }

    if (
      new Set(cleanOptions.map((option) => option.toLowerCase()))
        .size !== cleanOptions.length
    ) {
      setError("Poll options must be different.");
      return;
    }

    if (
      expiresAt &&
      new Date(expiresAt).getTime() <= Date.now()
    ) {
      setError("Please select a future expiry date.");
      return;
    }

    try {
      setCreating(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Please sign in first.");
        return;
      }

      const { error: insertError } = await supabase
        .from("polls")
        .insert({
          chamber_id: chamberId,
          created_by: user.id,
          question: cleanQuestion,
          options: cleanOptions,
          expires_at: expiresAt
            ? new Date(expiresAt).toISOString()
            : null,
        });

      if (insertError) throw insertError;

      setQuestion("");
      setOptions(["", ""]);
      setExpiresAt("");
      setShowCreator(false);
      setFilter("active");
      setSearch("");
      setNotice("Poll created successfully.");

      await refreshPolls();
    } catch (err) {
      console.error("CREATE POLL ERROR:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create poll."
      );
    } finally {
      setCreating(false);
    }
  }

  async function vote(poll: Poll, optionIndex: number) {
    if (busyPollId) return;

    if (
      poll.expires_at &&
      new Date(poll.expires_at).getTime() <= Date.now()
    ) {
      setError("This poll has expired.");
      setNow(Date.now());
      return;
    }

    if (!currentUserId) {
      setError("Please sign in before voting.");
      return;
    }

    const existingVote = votes.find(
      (item) =>
        item.poll_id === poll.id &&
        item.user_id === currentUserId
    );

    if (existingVote?.option_index === optionIndex) return;

    try {
      setBusyPollId(poll.id);
      setError("");
      setNotice("");

      if (existingVote) {
        const { error: updateError } = await supabase
          .from("poll_votes")
          .update({ option_index: optionIndex })
          .eq("id", existingVote.id)
          .eq("user_id", currentUserId);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("poll_votes")
          .insert({
            poll_id: poll.id,
            user_id: currentUserId,
            option_index: optionIndex,
          });

        if (insertError) throw insertError;
      }

      await refreshPolls();
      setNotice(
        existingVote
          ? "Your vote has been updated."
          : "Your vote has been recorded."
      );
    } catch (err) {
      console.error("POLL VOTE ERROR:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit your vote."
      );
    } finally {
      setBusyPollId(null);
    }
  }

  async function deletePoll(poll: Poll) {
    if (poll.created_by !== currentUserId) return;
    if (busyPollId) return;

    if (!window.confirm(`Delete "${poll.question}"?`)) return;

    try {
      setBusyPollId(poll.id);
      setError("");
      setNotice("");

      const { error: deleteError } = await supabase
        .from("polls")
        .delete()
        .eq("id", poll.id)
        .eq("chamber_id", chamberId)
        .eq("created_by", currentUserId);

      if (deleteError) throw deleteError;

      await refreshPolls();
      setNotice("Poll deleted successfully.");
    } catch (err) {
      console.error("DELETE POLL ERROR:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete poll."
      );
    } finally {
      setBusyPollId(null);
    }
  }

  const activePolls = useMemo(
    () =>
      polls.filter(
        (poll) =>
          !poll.expires_at ||
          new Date(poll.expires_at).getTime() > now
      ),
    [polls, now]
  );

  const expiredPolls = useMemo(
    () =>
      polls.filter(
        (poll) =>
          !!poll.expires_at &&
          new Date(poll.expires_at).getTime() <= now
      ),
    [polls, now]
  );

  const visiblePolls = useMemo(() => {
    const source =
      filter === "active"
        ? activePolls
        : filter === "expired"
        ? expiredPolls
        : polls;

    const query = search.trim().toLowerCase();

    return source.filter(
      (poll) =>
        !query ||
        poll.question.toLowerCase().includes(query) ||
        poll.options.some((option) =>
          option.toLowerCase().includes(query)
        )
    );
  }, [filter, activePolls, expiredPolls, polls, search]);

  const totalVotes = votes.length;
  const inputClass =
    "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500";

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-950 text-white">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl space-y-5 px-4 py-5 sm:px-6 sm:py-7">
          {/* HEADER */}
          <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-7">
            <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl" />

            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-600/15 text-blue-400 sm:h-16 sm:w-16">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-8 w-8"
                    aria-hidden="true"
                  >
                    <path d="M4 20V10M10 20V4M16 20v-8M22 20v-5" />
                  </svg>
                </div>

                <div>
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Chamber Polls
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                    Share your opinion, vote on important
                    decisions, and see what your Chamber thinks.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => refreshPolls(true)}
                  disabled={loading}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-700 disabled:opacity-50"
                >
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreator((value) => !value)}
                  aria-expanded={showCreator}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  {showCreator ? "Close Form" : "+ Create Poll"}
                </button>
              </div>
            </div>
          </section>

          {/* STATISTICS */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Total Polls", value: polls.length },
              { label: "Active Polls", value: activePolls.length },
              { label: "Expired Polls", value: expiredPolls.length },
              { label: "Votes Recorded", value: totalVotes },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5"
              >
                <p className="text-xs text-slate-400 sm:text-sm">
                  {stat.label}
                </p>
                <p className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* MESSAGES */}
          {(error || notice) && (
            <div
              role="status"
              className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
                error
                  ? "border-red-900/50 bg-red-950/20 text-red-300"
                  : "border-blue-900/50 bg-blue-950/20 text-blue-300"
              }`}
            >
              <span>{error || notice}</span>
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setNotice("");
                }}
                aria-label="Dismiss message"
                className="shrink-0 text-lg"
              >
                ×
              </button>
            </div>
          )}

          {/* CREATE POLL */}
          {showCreator && (
            <section className="rounded-2xl border border-blue-500/30 bg-slate-900 p-5 sm:p-6">
              <h3 className="text-xl font-semibold">
                Create a New Poll
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Ask a question and give members options to vote on.
              </p>

              <form onSubmit={createPoll} className="mt-6 space-y-5">
                <div>
                  <label
                    htmlFor="poll-question"
                    className="mb-2 block text-sm font-semibold text-slate-300"
                  >
                    Poll Question
                  </label>
                  <input
                    id="poll-question"
                    value={question}
                    onChange={(event) =>
                      setQuestion(event.target.value)
                    }
                    placeholder="What should our Chamber focus on next?"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-300">
                      Voting Options
                    </label>
                    <span className="text-xs text-slate-500">
                      {options.length} of 6
                    </span>
                  </div>

                  <div className="mt-3 space-y-3">
                    {options.map((option, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-xs font-bold text-blue-300">
                          {String.fromCharCode(65 + index)}
                        </span>

                        <input
                          value={option}
                          onChange={(event) =>
                            updateOption(index, event.target.value)
                          }
                          placeholder={`Option ${index + 1}`}
                          aria-label={`Option ${index + 1}`}
                          className={`${inputClass} min-w-0 flex-1`}
                        />

                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(index)}
                            aria-label={`Remove option ${index + 1}`}
                            className="rounded-xl border border-red-900/40 bg-red-950/20 px-3 py-3 text-xs font-semibold text-red-400 hover:bg-red-950/40"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {options.length < 6 && (
                    <button
                      type="button"
                      onClick={addOption}
                      className="mt-3 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-blue-300 hover:bg-slate-700"
                    >
                      + Add Option
                    </button>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="poll-expiry"
                    className="mb-2 block text-sm font-semibold text-slate-300"
                  >
                    Poll Expiry{" "}
                    <span className="font-normal text-slate-500">
                      (optional)
                    </span>
                  </label>
                  <input
                    id="poll-expiry"
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(event) =>
                      setExpiresAt(event.target.value)
                    }
                    className={inputClass}
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Leave blank to keep this poll open indefinitely.
                  </p>
                </div>

                <div className="flex flex-wrap justify-end gap-3 border-t border-slate-800 pt-5">
                  <button
                    type="button"
                    onClick={() => setShowCreator(false)}
                    className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {creating ? "Creating Poll..." : "Publish Poll"}
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* FILTERS */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  Explore Polls
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Browse questions and participate in Chamber decisions.
                </p>
              </div>

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search polls..."
                aria-label="Search polls"
                className={`${inputClass} lg:w-72`}
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {(
                [
                  {
                    value: "active",
                    label: "Active",
                    count: activePolls.length,
                  },
                  {
                    value: "expired",
                    label: "Expired",
                    count: expiredPolls.length,
                  },
                  {
                    value: "all",
                    label: "All Polls",
                    count: polls.length,
                  },
                ] as const
              ).map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  aria-pressed={filter === item.value}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                    filter === item.value
                      ? "border-blue-500 bg-blue-600 text-white"
                      : "border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600"
                  }`}
                >
                  {item.label}
                  <span className="ml-2 rounded-md bg-white/10 px-1.5 py-0.5 text-xs">
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* POLL LIST */}
          <section className="space-y-4">
            <div className="px-1">
              <h3 className="text-lg font-semibold">
                {filter === "active"
                  ? "Active Polls"
                  : filter === "expired"
                  ? "Expired Polls"
                  : "All Polls"}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {loading
                  ? "Loading polls..."
                  : `${visiblePolls.length} polls displayed`}
              </p>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((item) => (
                  <div
                    key={item}
                    className="animate-pulse rounded-2xl border border-slate-800 bg-slate-900 p-6"
                  >
                    <div className="h-5 w-1/2 rounded bg-slate-800" />
                    <div className="mt-5 h-12 rounded-xl bg-slate-800" />
                    <div className="mt-3 h-12 rounded-xl bg-slate-800" />
                  </div>
                ))}
              </div>
            ) : visiblePolls.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 px-6 py-14 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/10 text-3xl">
                  📊
                </div>
                <h4 className="mt-4 text-lg font-semibold">
                  {search.trim()
                    ? "No matching polls"
                    : filter === "active"
                    ? "No active polls"
                    : filter === "expired"
                    ? "No expired polls"
                    : "No polls yet"}
                </h4>
                <p className="mt-2 text-sm text-slate-400">
                  {search.trim()
                    ? "Try a different search term."
                    : "Polls will appear here when they are created."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {visiblePolls.map((poll) => {
                  const pollVotes = votes.filter(
                    (vote) => vote.poll_id === poll.id
                  );
                  const total = pollVotes.length;
                  const userVote = pollVotes.find(
                    (vote) =>
                      vote.user_id === currentUserId
                  );
                  const expired =
                    !!poll.expires_at &&
                    new Date(poll.expires_at).getTime() <= now;
                  const busy = busyPollId === poll.id;

                  return (
                    <article
                      key={poll.id}
                      className="rounded-2xl border border-slate-800 bg-slate-900 p-4 transition hover:border-slate-700 sm:p-6"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="mb-3 flex flex-wrap gap-2">
                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                                expired
                                  ? "border-slate-700 bg-slate-800 text-slate-400"
                                  : "border-blue-500/25 bg-blue-600/10 text-blue-300"
                              }`}
                            >
                              {expired ? "Expired" : "Active"}
                            </span>

                            {userVote && (
                              <span className="rounded-full border border-blue-500/20 bg-blue-950/30 px-3 py-1 text-xs font-semibold text-blue-300">
                                Voted
                              </span>
                            )}
                          </div>

                          <h4 className="break-words text-lg font-bold text-white sm:text-xl">
                            {poll.question}
                          </h4>

                          <p className="mt-2 text-xs text-slate-500">
                            Created {dateLabel(poll.created_at)}
                          </p>
                        </div>

                        {poll.created_by === currentUserId && (
                          <button
                            type="button"
                            onClick={() => deletePoll(poll)}
                            disabled={!!busyPollId}
                            className="rounded-xl border border-red-900/40 bg-red-950/20 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/40 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        )}
                      </div>

                      <div className="mt-6 space-y-3">
                        {poll.options.map((option, index) => {
                          const count = pollVotes.filter(
                            (vote) =>
                              vote.option_index === index
                          ).length;

                          const percentage = total
                            ? Math.round((count / total) * 100)
                            : 0;

                          const selected =
                            userVote?.option_index === index;

                          return (
                            <button
                              key={index}
                              type="button"
                              disabled={expired || !!busyPollId}
                              onClick={() => vote(poll, index)}
                              aria-pressed={selected}
                              className={`relative w-full overflow-hidden rounded-xl border p-4 text-left transition ${
                                selected
                                  ? "border-blue-500 bg-blue-600/10"
                                  : "border-slate-700 bg-slate-950/60 hover:border-blue-500/40"
                              } ${
                                expired || busy
                                  ? "cursor-not-allowed opacity-75"
                                  : ""
                              }`}
                            >
                              <div
                                className="absolute inset-y-0 left-0 bg-blue-600/15 transition-all"
                                style={{ width: `${percentage}%` }}
                              />

                              <div className="relative flex items-center justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-3">
                                  <span
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                      selected
                                        ? "bg-blue-600 text-white"
                                        : "bg-slate-800 text-slate-300"
                                    }`}
                                  >
                                    {selected
                                      ? "✓"
                                      : String.fromCharCode(65 + index)}
                                  </span>

                                  <span className="min-w-0 break-words text-sm font-medium text-white">
                                    {option}
                                  </span>
                                </div>

                                <div className="shrink-0 text-right">
                                  <p className="font-bold text-white">
                                    {percentage}%
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    {count} {count === 1 ? "vote" : "votes"}
                                  </p>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
                        <p className="text-sm text-slate-400">
                          {total} {total === 1 ? "total vote" : "total votes"}
                        </p>

                        {userVote ? (
                          <p className="text-xs font-medium text-blue-300">
                            Your vote:{" "}
                            {poll.options[userVote.option_index] || "Unknown"}
                            {!expired && " · Select another option to change"}
                          </p>
                        ) : (
                          <p className="text-xs text-slate-500">
                            {expired
                              ? "Voting is closed"
                              : "Select an option to vote"}
                          </p>
                        )}
                      </div>

                      {poll.expires_at && (
                        <p className="mt-3 text-xs text-slate-500">
                          {expired ? "Closed " : "Closes "}
                          {dateLabel(poll.expires_at)}
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <p className="pb-4 text-center text-xs text-slate-600">
            Chamber Polls
          </p>
        </div>
      </div>
    </div>
  );
}
