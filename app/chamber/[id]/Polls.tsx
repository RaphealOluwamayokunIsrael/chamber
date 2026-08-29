"use client";

import { useEffect, useState } from "react";
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

export default function Polls({
  chamberId,
}: PollsProps) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [votes, setVotes] = useState<PollVote[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [creating, setCreating] =
    useState(false);

  const [question, setQuestion] =
    useState("");

  const [options, setOptions] =
    useState<string[]>([
      "",
      "",
    ]);

  const [expiresAt, setExpiresAt] =
    useState("");

  const [currentUserId, setCurrentUserId] =
    useState("");

  useEffect(() => {
    if (!chamberId) return;

    loadPolls();
  }, [chamberId]);

  async function loadPolls() {
    try {
      setLoading(true);

      const {
        data: {
          user,
        },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      setCurrentUserId(user.id);

      const {
        data: pollData,
        error: pollError,
      } = await supabase
        .from("polls")
        .select(`
          id,
          chamber_id,
          created_by,
          question,
          options,
          expires_at,
          created_at
        `)
        .eq(
          "chamber_id",
          chamberId
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        );

      if (pollError) {
        console.error(
          "LOAD POLLS ERROR:",
          pollError
        );
        return;
      }

      setPolls(
        (pollData || []).map(
          (poll) => ({
            ...poll,
            options: Array.isArray(
              poll.options
            )
              ? poll.options
              : [],
          })
        )
      );

      const pollIds =
        (pollData || []).map(
          (poll) => poll.id
        );

      if (pollIds.length === 0) {
        setVotes([]);
        return;
      }

      const {
        data: voteData,
        error: voteError,
      } =
        await supabase
          .from("poll_votes")
          .select(`
            id,
            poll_id,
            user_id,
            option_index
          `)
          .in(
            "poll_id",
            pollIds
          );

      if (voteError) {
        console.error(
          "LOAD POLL VOTES ERROR:",
          voteError
        );
        return;
      }

      setVotes(
        voteData || []
      );
    } catch (error) {
      console.error(
        "LOAD POLLS ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  function addOption() {
    if (options.length >= 6) {
      alert(
        "A poll can have a maximum of 6 options."
      );
      return;
    }

    setOptions([
      ...options,
      "",
    ]);
  }

  function removeOption(
    index: number
  ) {
    if (options.length <= 2) {
      alert(
        "A poll must have at least 2 options."
      );
      return;
    }

    setOptions(
      options.filter(
        (_, optionIndex) =>
          optionIndex !== index
      )
    );
  }

  function updateOption(
    index: number,
    value: string
  ) {
    setOptions(
      options.map(
        (option, optionIndex) =>
          optionIndex === index
            ? value
            : option
      )
    );
  }

  async function createPoll() {
    const cleanQuestion =
      question.trim();

    const cleanOptions =
      options
        .map(
          (option) =>
            option.trim()
        )
        .filter(
          (option) =>
            option.length > 0
        );

    if (!cleanQuestion) {
      alert(
        "Please enter a poll question."
      );
      return;
    }

    if (
      cleanOptions.length < 2
    ) {
      alert(
        "Please provide at least 2 options."
      );
      return;
    }

    if (
      new Set(
        cleanOptions.map(
          (option) =>
            option.toLowerCase()
        )
      ).size !==
      cleanOptions.length
    ) {
      alert(
        "Poll options must be different."
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
        .from("polls")
        .insert({
          chamber_id:
            chamberId,
          created_by:
            user.id,
          question:
            cleanQuestion,
          options:
            cleanOptions,
          expires_at:
            expiresAt
              ? new Date(
                  expiresAt
                ).toISOString()
              : null,
        });

      if (error) {
        console.error(
          "CREATE POLL ERROR:",
          error
        );

        alert(
          `Could not create poll: ${error.message}`
        );

        return;
      }

      setQuestion("");

      setOptions([
        "",
        "",
      ]);

      setExpiresAt("");

      await loadPolls();
    } catch (error) {
      console.error(
        "CREATE POLL ERROR:",
        error
      );

      alert(
        "Something went wrong while creating the poll."
      );
    } finally {
      setCreating(false);
    }
  }

  function getPollVotes(
    pollId: string
  ) {
    return votes.filter(
      (vote) =>
        vote.poll_id ===
        pollId
    );
  }

  function getOptionVotes(
    pollId: string,
    optionIndex: number
  ) {
    return getPollVotes(
      pollId
    ).filter(
      (vote) =>
        vote.option_index ===
        optionIndex
    ).length;
  }

  function getTotalVotes(
    pollId: string
  ) {
    return getPollVotes(
      pollId
    ).length;
  }

  function getVotePercentage(
    pollId: string,
    optionIndex: number
  ) {
    const total =
      getTotalVotes(
        pollId
      );

    if (total === 0) {
      return 0;
    }

    const optionVotes =
      getOptionVotes(
        pollId,
        optionIndex
      );

    return Math.round(
      (optionVotes / total) *
        100
    );
  }

  function getUserVote(
    pollId: string
  ) {
    return votes.find(
      (vote) =>
        vote.poll_id ===
          pollId &&
        vote.user_id ===
          currentUserId
    );
  }

  function isExpired(
    poll: Poll
  ) {
    if (!poll.expires_at) {
      return false;
    }

    return (
      new Date(
        poll.expires_at
      ).getTime() <=
      Date.now()
    );
  }

  async function vote(
    poll: Poll,
    optionIndex: number
  ) {
    if (isExpired(poll)) {
      alert(
        "This poll has expired."
      );
      return;
    }

    if (!currentUserId) {
      alert(
        "Please login first."
      );
      return;
    }

    const existingVote =
      getUserVote(
        poll.id
      );

    try {
      if (existingVote) {
        if (
          existingVote.option_index ===
          optionIndex
        ) {
          return;
        }

        const {
          error,
        } = await supabase
          .from("poll_votes")
          .update({
            option_index:
              optionIndex,
          })
          .eq(
            "id",
            existingVote.id
          );

        if (error) {
          console.error(
            "UPDATE POLL VOTE ERROR:",
            error
          );

          alert(
            `Could not change vote: ${error.message}`
          );

          return;
        }
      } else {
        const {
          error,
        } = await supabase
          .from("poll_votes")
          .insert({
            poll_id:
              poll.id,
            user_id:
              currentUserId,
            option_index:
              optionIndex,
          });

        if (error) {
          console.error(
            "CREATE POLL VOTE ERROR:",
            error
          );

          alert(
            `Could not vote: ${error.message}`
          );

          return;
        }
      }

      await loadPolls();
    } catch (error) {
      console.error(
        "VOTE ERROR:",
        error
      );

      alert(
        "Something went wrong while voting."
      );
    }
  }

  async function deletePoll(
    pollId: string
  ) {
    const confirmed =
      window.confirm(
        "Delete this poll?"
      );

    if (!confirmed) {
      return;
    }

    try {
      const {
        error,
      } = await supabase
        .from("polls")
        .delete()
        .eq(
          "id",
          pollId
        );

      if (error) {
        console.error(
          "DELETE POLL ERROR:",
          error
        );

        alert(
          `Could not delete poll: ${error.message}`
        );

        return;
      }

      await loadPolls();
    } catch (error) {
      console.error(
        "DELETE POLL ERROR:",
        error
      );

      alert(
        "Something went wrong while deleting the poll."
      );
    }
  }

  function formatDate(
    date: string
  ) {
    return new Date(
      date
    ).toLocaleString();
  }

  return (
    <div className="h-full overflow-y-auto p-6">

      <div className="mx-auto max-w-4xl">

        {/* CREATE POLL */}

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-2xl font-bold text-white">
                Chamber Polls
              </h2>

              <p className="mt-2 text-slate-400">
                Ask members a question and collect their votes.
              </p>
            </div>

            <div className="rounded-full bg-purple-600/20 px-3 py-1 text-xs font-semibold text-purple-300">
              Poll
            </div>

          </div>

          <div className="mt-6">

            <label className="text-sm font-semibold text-slate-300">
              Question
            </label>

            <input
              type="text"
              value={question}
              onChange={(event) =>
                setQuestion(
                  event.target.value
                )
              }
              placeholder="What should the Chamber focus on next?"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-purple-500"
            />

          </div>

          <div className="mt-6">

            <div className="flex items-center justify-between">

              <label className="text-sm font-semibold text-slate-300">
                Options
              </label>

              <span className="text-xs text-slate-500">
                {options.length}/6
              </span>

            </div>

            <div className="mt-3 space-y-3">

              {options.map(
                (
                  option,
                  index
                ) => (
                  <div
                    key={index}
                    className="flex gap-2"
                  >

                    <input
                      type="text"
                      value={option}
                      onChange={(
                        event
                      ) =>
                        updateOption(
                          index,
                          event.target
                            .value
                        )
                      }
                      placeholder={`Option ${
                        index + 1
                      }`}
                      className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-purple-500"
                    />

                    {options.length >
                      2 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeOption(
                            index
                          )
                        }
                        className="rounded-xl bg-red-600/10 px-4 py-2 font-semibold text-red-400 hover:bg-red-600/20"
                      >
                        Remove
                      </button>
                    )}

                  </div>
                )
              )}

            </div>

            {options.length <
              6 && (
              <button
                type="button"
                onClick={
                  addOption
                }
                className="mt-3 rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
              >
                + Add Option
              </button>
            )}

          </div>

          <div className="mt-6">

            <label className="text-sm font-semibold text-slate-300">
              Expiry{" "}
              <span className="font-normal text-slate-500">
                (optional)
              </span>
            </label>

            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(
                event
              ) =>
                setExpiresAt(
                  event.target
                    .value
                )
              }
              className="mt-2 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-purple-500"
            />

          </div>

          <button
            type="button"
            onClick={
              createPoll
            }
            disabled={
              creating
            }
            className="mt-6 w-full rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating
              ? "Creating Poll..."
              : "Create Poll"}
          </button>

        </div>

        {/* POLL LIST */}

        <div className="mt-6">

          {loading ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">

              <p className="text-slate-400">
                Loading polls...
              </p>

            </div>
          ) : polls.length ===
            0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-10 text-center">

              <div className="text-5xl">
                📊
              </div>

              <p className="mt-4 font-semibold text-white">
                No polls yet
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Create the first poll for this Chamber.
              </p>

            </div>
          ) : (
            <div className="space-y-5">

              {polls.map(
                (poll) => {
                  const userVote =
                    getUserVote(
                      poll.id
                    );

                  const expired =
                    isExpired(
                      poll
                    );

                  return (
                    <div
                      key={
                        poll.id
                      }
                      className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div className="min-w-0">

                          <h3 className="text-xl font-bold text-white">
                            {poll.question}
                          </h3>

                          <p className="mt-2 text-xs text-slate-500">
                            Created{" "}
                            {formatDate(
                              poll.created_at
                            )}
                          </p>

                        </div>

                        <div className="flex shrink-0 items-center gap-2">

                          {expired ? (
                            <span className="rounded-full bg-red-600/10 px-3 py-1 text-xs font-semibold text-red-400">
                              Expired
                            </span>
                          ) : (
                            <span className="rounded-full bg-green-600/10 px-3 py-1 text-xs font-semibold text-green-400">
                              Active
                            </span>
                          )}

                          {poll.created_by ===
                            currentUserId && (
                            <button
                              type="button"
                              onClick={() =>
                                deletePoll(
                                  poll.id
                                )
                              }
                              className="rounded-lg bg-red-600/10 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-600/20"
                            >
                              Delete
                            </button>
                          )}

                        </div>

                      </div>

                      <div className="mt-6 space-y-3">

                        {poll.options.map(
                          (
                            option,
                            optionIndex
                          ) => {
                            const count =
                              getOptionVotes(
                                poll.id,
                                optionIndex
                              );

                            const percentage =
                              getVotePercentage(
                                poll.id,
                                optionIndex
                              );

                            const selected =
                              userVote?.option_index ===
                              optionIndex;

                            return (
                              <button
                                key={
                                  optionIndex
                                }
                                type="button"
                                disabled={
                                  expired
                                }
                                onClick={() =>
                                  vote(
                                    poll,
                                    optionIndex
                                  )
                                }
                                className={`relative w-full overflow-hidden rounded-xl border p-4 text-left transition ${
                                  selected
                                    ? "border-purple-500 bg-purple-600/10"
                                    : "border-slate-700 bg-slate-950/60 hover:border-slate-600"
                                } ${
                                  expired
                                    ? "cursor-not-allowed opacity-70"
                                    : ""
                                }`}
                              >

                                <div
                                  className="absolute inset-y-0 left-0 bg-purple-600/10 transition-all"
                                  style={{
                                    width: `${percentage}%`,
                                  }}
                                />

                                <div className="relative flex items-center justify-between gap-4">

                                  <div className="flex min-w-0 items-center gap-3">

                                    <span
                                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                        selected
                                          ? "bg-purple-600 text-white"
                                          : "bg-slate-800 text-slate-300"
                                      }`}
                                    >
                                      {String.fromCharCode(
                                        65 +
                                          optionIndex
                                      )}
                                    </span>

                                    <span className="truncate font-medium text-white">
                                      {option}
                                    </span>

                                  </div>

                                  <div className="shrink-0 text-right">

                                    <p className="font-bold text-white">
                                      {percentage}%
                                    </p>

                                    <p className="text-xs text-slate-500">
                                      {count}{" "}
                                      {count ===
                                      1
                                        ? "vote"
                                        : "votes"}
                                    </p>

                                  </div>

                                </div>

                              </button>
                            );
                          }
                        )}

                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-4">

                        <p className="text-sm text-slate-500">
                          {getTotalVotes(
                            poll.id
                          )}{" "}
                          {getTotalVotes(
                            poll.id
                          ) === 1
                            ? "total vote"
                            : "total votes"}
                        </p>

                        {userVote && (
                          <p className="text-sm font-medium text-purple-400">
                            Your vote:
                            {" "}
                            {
                              poll
                                .options[
                                userVote
                                  .option_index
                              ]
                            }
                          </p>
                        )}

                      </div>

                      {poll.expires_at && (
                        <p className="mt-3 text-xs text-slate-500">
                          {expired
                            ? "Poll expired on "
                            : "Poll closes on "}
                          {formatDate(
                            poll.expires_at
                          )}
                        </p>
                      )}

                    </div>
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