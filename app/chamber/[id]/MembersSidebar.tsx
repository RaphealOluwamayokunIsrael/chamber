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

  /*
   * BASIC PAGE STATE
   */
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  /*
   * SIDEBAR
   */
  const [activeSection, setActiveSection] =
    useState<ChamberSection>("chat");

  const [showSidebar, setShowSidebar] =
    useState(true);

  /*
   * AI
   */
  const [showAI, setShowAI] =
    useState(true);

  /*
   * CHAMBER
   */
  const [chamber, setChamber] =
    useState<Chamber | null>(null);

  const [currentUserId, setCurrentUserId] =
    useState("");

  /*
   * CALL
   */
  const [activeCall, setActiveCall] =
    useState<ChamberCall | null>(null);

  const [callLoading, setCallLoading] =
    useState(false);

  /*
   * MEMBERS
   */
  const [members, setMembers] =
    useState<Member[]>([]);

  const [membersLoading, setMembersLoading] =
    useState(false);

  const [membersError, setMembersError] =
    useState("");

  /*
   * LOAD CHAMBER
   */
  useEffect(() => {
    if (!chamberId) return;

    loadChamber();
  }, [chamberId]);

  /*
   * LOAD ACTIVE CALL + REALTIME
   */
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
        console.log(
          "CALL REALTIME STATUS:",
          status
        );
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chamberId, authorized]);

  /*
   * LOAD MEMBERS WHEN MEMBERS SECTION IS OPENED
   */
  useEffect(() => {
    if (
      !chamberId ||
      !authorized ||
      activeSection !== "members"
    ) {
      return;
    }

    loadMembers();
  }, [
    chamberId,
    authorized,
    activeSection,
  ]);

  /*
   * LOAD CHAMBER
   */
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

      /*
       * CHECK MEMBERSHIP
       */
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
        console.error(
          "MEMBERSHIP CHECK ERROR:",
          memberError
        );
      }

      if (!member) {
        setLoading(false);
        return;
      }

      /*
       * LOAD CHAMBER
       */
      const {
        data,
        error,
      } = await supabase
        .from("chambers")
        .select("*")
        .eq("id", chamberId)
        .single();

      if (error) {
        console.error(
          "CHAMBER ERROR:",
          error
        );
        return;
      }

      if (data) {
        setAuthorized(true);
        setChamber(data);
      }
    } catch (error) {
      console.error(
        "LOAD CHAMBER ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * LOAD MEMBERS
   */
  async function loadMembers() {
    try {
      setMembersLoading(true);
      setMembersError("");

      /*
       * GET MEMBERS
       */
      const {
        data: memberRows,
        error: memberError,
      } = await supabase
        .from("members")
        .select(
          "id, user_id, role"
        )
        .eq(
          "chamber_id",
          chamberId
        );

      if (memberError) {
        console.error(
          "MEMBERS ERROR:",
          memberError
        );

        setMembersError(
          memberError.message
        );

        return;
      }

      if (
        !memberRows ||
        memberRows.length === 0
      ) {
        setMembers([]);
        return;
      }

      /*
       * GET USER IDS
       */
      const userIds =
        memberRows.map(
          (member) =>
            member.user_id
        );

      /*
       * GET PROFILES
       */
      const {
        data: profiles,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select(
          "id, full_name"
        )
        .in(
          "id",
          userIds
        );

      if (profileError) {
        console.error(
          "PROFILES ERROR:",
          profileError
        );

        setMembersError(
          profileError.message
        );

        return;
      }

      /*
       * COMBINE MEMBERS + PROFILES
       */
      const combinedMembers: Member[] =
        memberRows.map(
          (member) => {
            const profile =
              profiles?.find(
                (profile) =>
                  profile.id ===
                  member.user_id
              );

            return {
              id: member.id,
              user_id:
                member.user_id,
              role:
                member.role ||
                "Member",
              full_name:
                profile?.full_name ||
                "Chamber Member",
            };
          }
        );

      setMembers(
        combinedMembers
      );

      console.log(
        "CHAMBER MEMBERS:",
        combinedMembers
      );
    } catch (error) {
      console.error(
        "LOAD MEMBERS ERROR:",
        error
      );

      setMembersError(
        "Unable to load chamber members."
      );
    } finally {
      setMembersLoading(false);
    }
  }

  /*
   * LOAD ACTIVE CALL
   */
  async function loadActiveCall() {
    try {
      const {
        data,
        error,
      } = await supabase
        .from("chamber_calls")
        .select(`
          id,
          chamber_id,
          room_name,
          started_by,
          status
        `)
        .eq(
          "chamber_id",
          chamberId
        )
        .eq(
          "status",
          "active"
        )
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error(
          "ACTIVE CALL ERROR:",
          error
        );

        setActiveCall(null);
        return;
      }

      if (!data) {
        setActiveCall(null);
        return;
      }

      setActiveCall(data);
    } catch (error) {
      console.error(
        "LOAD ACTIVE CALL ERROR:",
        error
      );

      setActiveCall(null);
    }
  }

  /*
   * START CALL
   */
  async function startCall() {
    if (callLoading) return;

    try {
      setCallLoading(true);

      /*
       * CHECK EXISTING CALL
       */
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
        .eq(
          "chamber_id",
          chamberId
        )
        .eq(
          "status",
          "active"
        )
        .limit(1)
        .maybeSingle();

      if (existingCallError) {
        console.error(
          "CHECK EXISTING CALL ERROR:",
          existingCallError
        );

        return;
      }

      /*
       * CALL ALREADY EXISTS
       */
      if (existingCall) {
        setActiveCall(
          existingCall
        );

        router.push(
          `/voice/${chamberId}`
        );

        return;
      }

      /*
       * CREATE NEW CALL
       */
      const roomName =
        `chamber-${chamberId}`;

      const {
        data: newCall,
        error: createError,
      } = await supabase
        .from("chamber_calls")
        .insert({
          chamber_id:
            chamberId,
          room_name:
            roomName,
          started_by:
            currentUserId,
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

      if (createError) {
        console.error(
          "CREATE CHAMBER CALL ERROR:",
          createError
        );

        await loadActiveCall();
        return;
      }

      if (newCall) {
        setActiveCall(
          newCall
        );

        router.push(
          `/voice/${chamberId}`
        );
      }
    } catch (error) {
      console.error(
        "START CALL ERROR:",
        error
      );
    } finally {
      setCallLoading(false);
    }
  }

  /*
   * JOIN CALL
   */
  function joinCall() {
    if (!activeCall) return;

    router.push(
      `/voice/${chamberId}`
    );
  }

  /*
   * SIDEBAR SECTION
   */
  function handleSectionChange(
    section: ChamberSection
  ) {
    setActiveSection(section);
  }

  /*
   * LOADING
   */
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <p className="text-xl font-semibold text-white">
          Loading Chamber...
        </p>
      </main>
    );
  }

  /*
   * ACCESS DENIED
   */
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
            onClick={() =>
              router.push("/join")
            }
            className="mt-8 rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Join a Chamber
          </button>

        </div>
      </main>
    );
  }

  /*
   * CHAMBER NOT FOUND
   */
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
    activeCall?.started_by ===
    currentUserId;

  return (
    <main className="flex min-h-screen overflow-hidden bg-slate-950">

      {/* =========================================
          LEFT SIDEBAR
          ========================================= */}

      <Sidebar
        activeSection={
          activeSection
        }
        onSectionChange={
          handleSectionChange
        }
        collapsed={
          !showSidebar
        }
        onToggle={() =>
          setShowSidebar(
            (value) => !value
          )
        }
      />

      {/* =========================================
          MAIN CENTER AREA
          ========================================= */}

      <section className="flex min-w-0 flex-1 flex-col">

        {/* TOPBAR */}
        <Topbar />

        {/* =====================================
            CHAMBER HEADER
            ===================================== */}

        <div className="flex items-center justify-between gap-6 px-8 pt-6">

          {/* CHAMBER INFORMATION */}
          <div className="min-w-0">

            <h1 className="truncate text-3xl font-bold text-white">
              {chamber.chamber_name}
            </h1>

            <p className="mt-2 truncate text-slate-400">
              {chamber.description}
            </p>

          </div>

          {/* =================================
              RIGHT CONTROLS
              ================================= */}

          <div className="flex shrink-0 items-center gap-3">

            {/* START CALL */}
            {!activeCall && (
              <button
                type="button"
                onClick={
                  startCall
                }
                disabled={
                  callLoading
                }
                title="Start call"
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-lg transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="text-lg">
                  📞
                </span>

                <span>
                  {callLoading
                    ? "Starting..."
                    : "Start Call"}
                </span>
              </button>
            )}

            {/* JOIN CALL */}
            {activeCall &&
              !isCallStarter && (
                <button
                  type="button"
                  onClick={
                    joinCall
                  }
                  title="Join ongoing call"
                  className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white shadow-lg transition hover:bg-green-700"
                >
                  <span className="text-lg">
                    📞
                  </span>

                  <span>
                    Join Call
                  </span>
                </button>
              )}

            {/* CALL STARTER */}
            {activeCall &&
              isCallStarter && (
                <button
                  type="button"
                  onClick={
                    joinCall
                  }
                  title="Return to ongoing call"
                  className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white shadow-lg transition hover:bg-red-700"
                >
                  <span className="text-lg">
                    🔴
                  </span>

                  <span>
                    Call Ongoing
                  </span>
                </button>
              )}

            {/* AI TOGGLE */}
            <button
              type="button"
              onClick={() =>
                setShowAI(
                  (value) =>
                    !value
                )
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

        {/* =====================================
            ACTIVE CALL NOTICE
            ===================================== */}

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
              onClick={
                joinCall
              }
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              Join
            </button>

          </div>
        )}

        {/* =====================================
            MAIN CONTENT
            ===================================== */}

        <div className="mt-6 flex min-h-0 flex-1 overflow-hidden">

          {/* ===================================
              CENTER CONTENT
              =================================== */}

          <div className="min-w-0 flex-1 overflow-hidden">

            {/* ===============================
                GENERAL CHAT
                =============================== */}

            {activeSection ===
              "chat" && (
              <Chat
                chamberId={
                  chamber.id
                }
              />
            )}

            {/* ===============================
                ANNOUNCEMENTS
                =============================== */}

            {activeSection ===
              "announcements" && (
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

            {/* ===============================
                MEMBERS
                =============================== */}

            {activeSection ===
              "members" && (
              <div className="h-full overflow-y-auto p-6">

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

                  <div className="flex items-center justify-between">

                    <div>

                      <h2 className="text-2xl font-bold text-white">
                        Chamber Members
                      </h2>

                      <p className="mt-2 text-slate-400">
                        Members of this Chamber.
                      </p>

                    </div>

                    <div className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white">
                      {members.length}
                    </div>

                  </div>

                  {/* MEMBERS LOADING */}
                  {membersLoading && (
                    <div className="mt-6 rounded-xl bg-slate-800 p-5">
                      <p className="text-slate-400">
                        Loading members...
                      </p>
                    </div>
                  )}

                  {/* MEMBERS ERROR */}
                  {!membersLoading &&
                    membersError && (
                      <div className="mt-6 rounded-xl border border-red-800 bg-red-950/40 p-5">

                        <p className="font-medium text-red-300">
                          Unable to load members.
                        </p>

                        <p className="mt-2 text-sm text-red-400">
                          {membersError}
                        </p>

                      </div>
                    )}

                  {/* NO MEMBERS */}
                  {!membersLoading &&
                    !membersError &&
                    members.length === 0 && (
                      <div className="mt-6 rounded-xl bg-slate-800 p-5">

                        <p className="text-slate-400">
                          No members found in this Chamber.
                        </p>

                      </div>
                    )}

                  {/* MEMBER LIST */}
                  {!membersLoading &&
                    !membersError &&
                    members.length > 0 && (
                      <div className="mt-6 grid gap-4 sm:grid-cols-2">

                        {members.map(
                          (member) => (
                            <div
                              key={
                                member.id
                              }
                              className="flex items-center gap-4 rounded-2xl border border-slate-700 bg-slate-800 p-4 transition hover:border-slate-600 hover:bg-slate-750"
                            >

                              {/* AVATAR */}
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                                {member.full_name
                                  .charAt(
                                    0
                                  )
                                  .toUpperCase()}
                              </div>

                              {/* MEMBER DETAILS */}
                              <div className="min-w-0 flex-1">

                                <p className="truncate font-semibold text-white">
                                  {member.full_name}
                                </p>

                                <p className="mt-1 text-sm text-slate-400">
                                  {member.role}
                                </p>

                              </div>

                              {/* ONLINE INDICATOR */}
                              <div
                                className="h-3 w-3 shrink-0 rounded-full bg-green-500"
                                title="Online"
                              />

                            </div>
                          )
                        )}

                      </div>
                    )}

                </div>

              </div>
            )}

            {/* ===============================
                FILES
                =============================== */}

            {activeSection ===
              "files" && (
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

            {/* ===============================
                EVENTS
                =============================== */}

            {activeSection ===
              "events" && (
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

            {/* ===============================
                POLLS
                =============================== */}

            {activeSection ===
              "polls" && (
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

          {/* ===================================
              RIGHT SIDE — CHAMBER AI
              =================================== */}

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