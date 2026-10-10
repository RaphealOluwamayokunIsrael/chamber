
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

import AIAssistant from "./AIAssistant";
import Sidebar, {
  ChamberSection,
} from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import Chat from "./Chat";

type Chamber = {
  id: string;
  chamber_name: string;
  description: string;
};

type ChamberCall = {
  id: string;
  chamber_id: string;
  room_name: string;
  started_by: string;
  status: string;
};

type Member = {
  id: string;
  user_id: string;
  role: string;
  full_name: string;
};

export default function ChamberPage() {
  const params = useParams();
  const router = useRouter();

  const chamberId = params.id as string;

  // BASIC PAGE STATE
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  // SIDEBAR
  const [activeSection, setActiveSection] =
    useState<ChamberSection>("chat");
  const [showSidebar, setShowSidebar] = useState(true);

  // AI
  const [showAI, setShowAI] = useState(true);

  // CHAMBER
  const [chamber, setChamber] = useState<Chamber | null>(null);
  const [currentUserId, setCurrentUserId] = useState("");

  // CALL
  const [activeCall, setActiveCall] =
    useState<ChamberCall | null>(null);
  const [callLoading, setCallLoading] = useState(false);

  // MEMBERS
  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState("");

  // MEMBERS UI CONTROLS
  const [memberSearch, setMemberSearch] = useState("");
  const [memberRoleFilter, setMemberRoleFilter] = useState("all");

  // LOAD CHAMBER
  useEffect(() => {
    if (!chamberId) return;
    loadChamber();
  }, [chamberId]);

  // LOAD ACTIVE CALL + REALTIME
  useEffect(() => {
    if (!chamberId || !authorized) return;

    loadActiveCall();

    const channel = supabase
      .channel(`chamber-call-${chamberId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chamber_calls",
          filter: `chamber_id=eq.${chamberId}`,
        },
        () => {
          loadActiveCall();
        }
      )
      .subscribe((status) => {
        console.log("CALL REALTIME STATUS:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chamberId, authorized]);

  // LOAD MEMBERS WHEN MEMBERS SECTION IS OPENED
  useEffect(() => {
    if (
      !chamberId ||
      !authorized ||
      activeSection !== "members"
    ) {
      return;
    }

    loadMembers();
  }, [chamberId, authorized, activeSection]);

  // LOAD CHAMBER
  async function loadChamber() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setCurrentUserId(user.id);

      // CHECK MEMBERSHIP
      const {
        data: member,
        error: memberError,
      } = await supabase
        .from("members")
        .select("id")
        .eq("chamber_id", chamberId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (memberError) {
        console.error("MEMBERSHIP CHECK ERROR:", memberError);
      }

      if (!member) {
        setLoading(false);
        return;
      }

      // LOAD CHAMBER
      const { data, error } = await supabase
        .from("chambers")
        .select("*")
        .eq("id", chamberId)
        .single();

      if (error) {
        console.error("CHAMBER ERROR:", error);
        return;
      }

      if (data) {
        setAuthorized(true);
        setChamber(data);
      }
    } catch (error) {
      console.error("LOAD CHAMBER ERROR:", error);
    } finally {
      setLoading(false);
    }
  }

  // LOAD MEMBERS
  async function loadMembers() {
    try {
      setMembersLoading(true);
      setMembersError("");

      // GET MEMBERS
      const {
        data: memberRows,
        error: memberError,
      } = await supabase
        .from("members")
        .select("id, user_id, role")
        .eq("chamber_id", chamberId);

      if (memberError) {
        console.error("MEMBERS ERROR:", memberError);
        setMembersError(memberError.message);
        return;
      }

      if (!memberRows || memberRows.length === 0) {
        setMembers([]);
        return;
      }

      // GET USER IDS
      const userIds = memberRows.map(
        (member) => member.user_id
      );

      // GET PROFILES
      const {
        data: profiles,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      if (profileError) {
        console.error("PROFILES ERROR:", profileError);
        setMembersError(profileError.message);
        return;
      }

      // COMBINE MEMBERS + PROFILES
      const combinedMembers: Member[] = memberRows.map(
        (member) => {
          const profile = profiles?.find(
            (profile) => profile.id === member.user_id
          );

          return {
            id: member.id,
            user_id: member.user_id,
            role: member.role || "Member",
            full_name: profile?.full_name || "Chamber Member",
          };
        }
      );

      setMembers(combinedMembers);

      console.log("CHAMBER MEMBERS:", combinedMembers);
    } catch (error) {
      console.error("LOAD MEMBERS ERROR:", error);
      setMembersError("Unable to load chamber members.");
    } finally {
      setMembersLoading(false);
    }
  }

  // LOAD ACTIVE CALL
  async function loadActiveCall() {
    try {
      const { data, error } = await supabase
        .from("chamber_calls")
        .select(`
          id,
          chamber_id,
          room_name,
          started_by,
          status
        `)
        .eq("chamber_id", chamberId)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("ACTIVE CALL ERROR:", error);
        setActiveCall(null);
        return;
      }

      if (!data) {
        setActiveCall(null);
        return;
      }

      setActiveCall(data);
    } catch (error) {
      console.error("LOAD ACTIVE CALL ERROR:", error);
      setActiveCall(null);
    }
  }

  // START CALL
  async function startCall() {
    if (callLoading) return;

    try {
      setCallLoading(true);

      // CHECK FOR AN EXISTING ACTIVE CALL
      const {
        data: existingCall,
        error: existingCallError,
      } = await supabase
        .from("chamber_calls")
        .select(`
          id,
          chamber_id,
          room_name,
          started_by,
          status
        `)
        .eq("chamber_id", chamberId)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      if (existingCallError) {
        console.error(
          "CHECK EXISTING CALL ERROR:",
          existingCallError
        );
        await loadActiveCall();
        return;
      }

      // JOIN EXISTING CALL
      if (existingCall) {
        setActiveCall(existingCall);

        router.push(
          `/voice/${chamberId}?room=${encodeURIComponent(
            existingCall.room_name
          )}`
        );

        return;
      }

      // CREATE UNIQUE CALL ROOM
      const roomName = `chamber-${chamberId}-${Date.now()}`;

      const {
        data: newCall,
        error: createError,
      } = await supabase
        .from("chamber_calls")
        .insert({
          chamber_id: chamberId,
          room_name: roomName,
          started_by: currentUserId,
          status: "active",
        })
        .select(`
          id,
          chamber_id,
          room_name,
          started_by,
          status
        `)
        .single();

      // RELOAD IF ANOTHER MEMBER STARTED A CALL FIRST
      if (createError) {
        console.error(
          "CREATE CHAMBER CALL ERROR:",
          createError
        );
        await loadActiveCall();
        return;
      }

      if (newCall) {
        setActiveCall(newCall);

        router.push(
          `/voice/${chamberId}?room=${encodeURIComponent(
            newCall.room_name
          )}`
        );
      }
    } catch (error) {
      console.error("START CALL ERROR:", error);
      await loadActiveCall();
    } finally {
      setCallLoading(false);
    }
  }

  // JOIN ACTIVE CALL
  function joinCall() {
    if (!activeCall) return;

    router.push(
      `/voice/${chamberId}?room=${encodeURIComponent(
        activeCall.room_name
      )}`
    );
  }

  // SIDEBAR SECTION
  function handleSectionChange(section: ChamberSection) {
    setActiveSection(section);
  }

  // MEMBERS FILTERING — CLIENT SIDE ONLY
  const filteredMembers = members.filter((member) => {
    const matchesName = member.full_name
      .toLowerCase()
      .includes(memberSearch.trim().toLowerCase());

    const matchesRole =
      memberRoleFilter === "all" ||
      member.role.toLowerCase() === memberRoleFilter;

    return matchesName && matchesRole;
  });

  // LOADING
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <p className="text-xl font-semibold text-white">
          Loading Chamber...
        </p>
      </main>
    );
  }

  // ACCESS DENIED
  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">
            Access Denied
          </h1>

          <p className="mt-4 text-slate-400">
            You are not a member of this Chamber.
          </p>

          <button
            type="button"
            onClick={() => router.push("/join")}
            className="mt-8 rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Join a Chamber
          </button>
        </div>
      </main>
    );
  }

  // CHAMBER NOT FOUND
  if (!chamber) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <p className="text-xl text-white">
          Chamber not found.
        </p>
      </main>
    );
  }

  const isCallStarter =
    activeCall?.started_by === currentUserId;

  return (
    <main className="flex min-h-screen overflow-hidden bg-slate-950">
      {/* LEFT SIDEBAR */}
      <Sidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        collapsed={!showSidebar}
        onToggle={() =>
          setShowSidebar((value) => !value)
        }
      />

      {/* MAIN CENTER AREA */}
      <section className="flex min-w-0 flex-1 flex-col">
        {/* TOPBAR */}
        <Topbar />

        {/* CHAMBER HEADER */}
        <div className="flex items-center justify-between gap-6 px-8 pt-6">
          <div className="min-w-0">
            <h1 className="truncate text-3xl font-bold text-white">
              {chamber.chamber_name}
            </h1>

            <p className="mt-2 truncate text-slate-400">
              {chamber.description}
            </p>
          </div>

          {/* RIGHT CONTROLS */}
          <div className="flex shrink-0 items-center gap-3">
            {/* START CALL */}
            {!activeCall && (
              <button
                type="button"
                onClick={startCall}
                disabled={callLoading}
                title="Start call"
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-lg transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="text-lg">📞</span>
                <span>
                  {callLoading ? "Starting..." : "Start Call"}
                </span>
              </button>
            )}

            {/* JOIN CALL */}
            {activeCall && !isCallStarter && (
              <button
                type="button"
                onClick={joinCall}
                title="Join ongoing call"
                className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white shadow-lg transition hover:bg-green-700"
              >
                <span className="text-lg">📞</span>
                <span>Join Call</span>
              </button>
            )}

            {/* CALL STARTER */}
            {activeCall && isCallStarter && (
              <button
                type="button"
                onClick={joinCall}
                title="Return to ongoing call"
                className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white shadow-lg transition hover:bg-red-700"
              >
                <span className="text-lg">🔴</span>
                <span>Call Ongoing</span>
              </button>
            )}

            {/* AI TOGGLE */}
            <button
              type="button"
              onClick={() =>
                setShowAI((value) => !value)
              }
              className={
                showAI
                  ? "rounded-xl bg-purple-600 px-4 py-3 font-semibold text-white hover:bg-purple-700"
                  : "rounded-xl bg-slate-800 px-4 py-3 font-semibold text-white hover:bg-slate-700"
              }
              title="Toggle Chamber AI"
            >
              ✨ AI
            </button>
          </div>
        </div>

        {/* ACTIVE CALL NOTICE */}
        {activeCall && (
          <div className="mx-8 mt-4 flex items-center justify-between rounded-xl border border-green-800/50 bg-green-950/40 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 animate-pulse rounded-full bg-green-500" />

              <div>
                <p className="font-semibold text-green-300">
                  Call Ongoing
                </p>
                <p className="text-sm text-green-400/70">
                  A call is currently active in this Chamber.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={joinCall}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              Join
            </button>
          </div>
        )}

        {/* MAIN CONTENT */}
        <div className="mt-6 flex min-h-0 flex-1 overflow-hidden">
          {/* CENTER CONTENT */}
          <div className="min-w-0 flex-1 overflow-hidden">
            {/* GENERAL CHAT */}
            {activeSection === "chat" && (
              <Chat chamberId={chamber.id} />
            )}

            {/* ANNOUNCEMENTS */}
            {activeSection === "announcements" && (
              <div className="h-full overflow-y-auto p-6">
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                  <h2 className="text-2xl font-bold text-white">
                    Announcements
                  </h2>

                  <p className="mt-2 text-slate-400">
                    Chamber announcements will appear here.
                  </p>
                </div>
              </div>
            )}

            {/* =====================================
                REDESIGNED MEMBERS SECTION
                ===================================== */}

            {activeSection === "members" && (
              <div className="h-full overflow-y-auto bg-slate-950 px-4 py-6 text-white sm:px-6">
                <div className="mx-auto max-w-6xl space-y-5">
                  {/* MEMBERS OVERVIEW */}
                  <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-7">
                    <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl" />

                    <div className="relative flex flex-wrap items-center justify-between gap-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-600/15 text-blue-400">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-7 w-7"
                            aria-hidden="true"
                          >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                        </div>

                        <div>
                          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                            Chamber Members
                          </h2>

                          <p className="mt-1 text-sm text-slate-400">
                            The people who make this Chamber a community.
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-700 bg-slate-800/80 px-5 py-3 text-center">
                        <p className="text-2xl font-bold text-white">
                          {membersLoading ? "—" : members.length}
                        </p>

                        <p className="text-xs font-medium text-slate-400">
                          Total members
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* MEMBER DIRECTORY CONTROLS */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          Member Directory
                        </h3>

                        <p className="mt-1 text-sm text-slate-400">
                          Find people by name or browse their roles.
                        </p>
                      </div>

                      <label className="relative block w-full lg:max-w-xs">
                        <span className="sr-only">
                          Search members
                        </span>

                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                          aria-hidden="true"
                        >
                          <circle cx="11" cy="11" r="7" />
                          <path d="m20 20-4-4" />
                        </svg>

                        <input
                          type="search"
                          value={memberSearch}
                          onChange={(event) =>
                            setMemberSearch(event.target.value)
                          }
                          placeholder="Search members..."
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
                        />
                      </label>
                    </div>

                    {/* ROLE FILTERS */}
                    <div
                      className="mt-5 flex flex-wrap gap-2"
                      aria-label="Filter members by role"
                    >
                      {[
                        { value: "all", label: "All Members" },
                        { value: "owner", label: "Owners" },
                        { value: "admin", label: "Admins" },
                        { value: "member", label: "Members" },
                      ].map((filter) => {
                        const count =
                          filter.value === "all"
                            ? members.length
                            : members.filter(
                                (member) =>
                                  member.role.toLowerCase() ===
                                  filter.value
                              ).length;

                        const selected =
                          memberRoleFilter === filter.value;

                        return (
                          <button
                            key={filter.value}
                            type="button"
                            onClick={() =>
                              setMemberRoleFilter(filter.value)
                            }
                            aria-pressed={selected}
                            className={`rounded-xl border px-3.5 py-2 text-sm font-medium transition ${
                              selected
                                ? "border-blue-500 bg-blue-600 text-white shadow-sm shadow-blue-950/30"
                                : "border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600 hover:text-white"
                            }`}
                          >
                            {filter.label}

                            <span
                              className={`ml-2 rounded-md px-1.5 py-0.5 text-xs ${
                                selected
                                  ? "bg-white/20 text-white"
                                  : "bg-slate-700 text-slate-300"
                              }`}
                            >
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* MEMBERS LOADING */}
                  {membersLoading ? (
                    <div
                      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                      aria-label="Loading members"
                    >
                      {[0, 1, 2, 3, 4, 5].map((item) => (
                        <div
                          key={item}
                          className="animate-pulse rounded-2xl border border-slate-800 bg-slate-900 p-5"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-slate-800" />

                            <div className="flex-1 space-y-3">
                              <div className="h-3 w-2/3 rounded bg-slate-800" />
                              <div className="h-3 w-1/3 rounded bg-slate-800" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : membersError ? (
                    /* MEMBERS ERROR */
                    <div
                      role="alert"
                      className="rounded-2xl border border-red-900/70 bg-red-950/30 p-6"
                    >
                      <p className="font-semibold text-red-300">
                        Unable to load members.
                      </p>

                      <p className="mt-2 text-sm text-red-400">
                        {membersError}
                      </p>

                      <button
                        type="button"
                        onClick={loadMembers}
                        className="mt-4 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                      >
                        Try again
                      </button>
                    </div>
                  ) : members.length === 0 ? (
                    /* EMPTY STATE */
                    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 px-5 py-14 text-center">
                      <p className="font-semibold text-white">
                        No members found
                      </p>

                      <p className="mt-2 text-sm text-slate-400">
                        There are no members to display in this
                        Chamber yet.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* RESULTS COUNT */}
                      <div className="flex items-center justify-between gap-3 px-1">
                        <p className="text-sm text-slate-400">
                          Showing{" "}
                          <span className="font-semibold text-slate-200">
                            {filteredMembers.length}
                          </span>{" "}
                          of {members.length} members
                        </p>
                      </div>

                      {/* NO MATCHING MEMBERS */}
                      {filteredMembers.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 px-5 py-12 text-center">
                          <p className="font-semibold text-white">
                            No matching members
                          </p>

                          <p className="mt-2 text-sm text-slate-400">
                            Try another name or role filter.
                          </p>

                          <button
                            type="button"
                            onClick={() => {
                              setMemberSearch("");
                              setMemberRoleFilter("all");
                            }}
                            className="mt-4 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                          >
                            Clear filters
                          </button>
                        </div>
                      ) : (
                        /* MEMBER CARDS */
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                          {filteredMembers.map((member) => {
                            const role = member.role.toLowerCase();

                            const initials =
                              member.full_name
                                .trim()
                                .split(/\s+/)
                                .slice(0, 2)
                                .map((part) => part.charAt(0))
                                .join("")
                                .toUpperCase() || "?";

                            const roleStyle =
                              role === "owner"
                                ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
                                : role === "admin"
                                ? "border-blue-500/20 bg-blue-500/10 text-blue-300"
                                : "border-slate-600 bg-slate-800 text-slate-300";

                            return (
                              <article
                                key={member.id}
                                className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-blue-500/40 hover:shadow-lg hover:shadow-black/10"
                              >
                                <div className="flex items-center gap-4">
                                  {/* AVATAR */}
                                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-blue-500/20 bg-blue-600/20 text-base font-bold tracking-wide text-blue-200">
                                    {initials}
                                  </div>

                                  {/* MEMBER INFORMATION */}
                                  <div className="min-w-0 flex-1">
                                    <h4
                                      className="truncate font-semibold text-white"
                                      title={member.full_name}
                                    >
                                      {member.full_name}
                                    </h4>

                                    {/* ROLE BADGE */}
                                    <span
                                      className={`mt-2 inline-flex rounded-lg border px-2.5 py-1 text-xs font-semibold capitalize ${roleStyle}`}
                                    >
                                      {member.role}
                                    </span>
                                  </div>
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* FILES */}
            {activeSection === "files" && (
              <div className="h-full overflow-y-auto p-6">
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                  <h2 className="text-2xl font-bold text-white">
                    Files
                  </h2>

                  <p className="mt-2 text-slate-400">
                    Chamber files will appear here.
                  </p>
                </div>
              </div>
            )}

            {/* EVENTS */}
            {activeSection === "events" && (
              <div className="h-full overflow-y-auto p-6">
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                  <h2 className="text-2xl font-bold text-white">
                    Events
                  </h2>

                  <p className="mt-2 text-slate-400">
                    Chamber events will appear here.
                  </p>
                </div>
              </div>
            )}

            {/* POLLS */}
            {activeSection === "polls" && (
              <div className="h-full overflow-y-auto p-6">
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                  <h2 className="text-2xl font-bold text-white">
                    Polls
                  </h2>

                  <p className="mt-2 text-slate-400">
                    Chamber polls will appear here.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDE — CHAMBER AI */}
          {showAI && (
            <aside className="w-[360px] shrink-0 overflow-hidden border-l border-slate-800">
              <AIAssistant
                chamberId={chamberId}
                chamberName={chamber?.chamber_name || ""}
                chamberDescription={chamber?.description || ""}
                memberCount={members.length}
              />
            </aside>
          )}
        </div>
      </section>
    </main>
  );
}
