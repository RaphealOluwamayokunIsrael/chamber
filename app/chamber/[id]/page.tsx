"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  FileText,
  MessageSquare,
  Users,
  Megaphone,
  BarChart3,
  MapPin,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

import AIAssistant from "./AIAssistant";
import Announcements from "./Announcements";
import Events from "./Events";
import Polls from "./Polls";
import Chat from "./Chat";

import Sidebar, {
  ChamberSection,
} from "../../components/Sidebar";

import Topbar from "../../components/Topbar";
import WorkspaceShell from "../WorkspaceShell";

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

type ChamberFile = {
  id: string;
  chamber_id: string;
  uploaded_by: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
};

type OverviewAnnouncement = {
  id: string;
  title: string;
  content: string;
  announcement_type: "general" | "specific";
  author_id: string;
  created_at: string;
};

type OverviewEvent = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
};

type OverviewPoll = {
  id: string;
  question: string;
  options: string[];
  expires_at: string | null;
  created_at: string;
};

export default function ChamberPage() {
  const params = useParams();
  const router = useRouter();

  const chamberId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const [activeSection, setActiveSection] =
    useState<ChamberSection>("overview");

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  const [chamber, setChamber] =
    useState<Chamber | null>(null);

  const [currentUserId, setCurrentUserId] =
    useState("");

  const [activeCall, setActiveCall] =
    useState<ChamberCall | null>(null);

  const [callLoading, setCallLoading] =
    useState(false);

  const [members, setMembers] =
    useState<Member[]>([]);

  const [membersLoading, setMembersLoading] =
    useState(false);

  const [membersError, setMembersError] =
    useState("");

  const [files, setFiles] =
    useState<ChamberFile[]>([]);

  const [filesLoading, setFilesLoading] =
    useState(false);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [uploadingFile, setUploadingFile] =
    useState(false);

  /*
   * Overview dashboard data
   */
  const [latestAnnouncement, setLatestAnnouncement] =
    useState<OverviewAnnouncement | null>(null);

  const [announcementAuthor, setAnnouncementAuthor] =
    useState("Chamber Member");

  const [nextEvent, setNextEvent] =
    useState<OverviewEvent | null>(null);

  const [activePoll, setActivePoll] =
    useState<OverviewPoll | null>(null);

  const [activePollVotes, setActivePollVotes] =
    useState(0);

  const [overviewLoading, setOverviewLoading] =
    useState(false);

  useEffect(() => {
    if (!chamberId) return;

    loadChamber();
  }, [chamberId]);

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
          "CHAMBER CALL REALTIME:",
          status
        );
      });

    const interval = setInterval(() => {
      loadActiveCall();
    }, 3000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [chamberId, authorized]);

  useEffect(() => {
    if (
      !chamberId ||
      !authorized ||
      (activeSection !== "members" &&
        activeSection !== "overview")
    ) {
      return;
    }

    loadMembers();
  }, [
    chamberId,
    authorized,
    activeSection,
  ]);

  useEffect(() => {
    if (
      !chamberId ||
      !authorized ||
      (activeSection !== "files" &&
        activeSection !== "overview")
    ) {
      return;
    }

    loadFiles();
  }, [
    chamberId,
    authorized,
    activeSection,
  ]);

  /*
   * Load dashboard information whenever
   * Overview is active.
   */
  useEffect(() => {
    if (
      !chamberId ||
      !authorized ||
      activeSection !== "overview"
    ) {
      return;
    }

    loadOverviewData();
  }, [
    chamberId,
    authorized,
    activeSection,
  ]);

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

      const {
        data: membership,
        error: membershipError,
      } = await supabase
        .from("members")
        .select("id")
        .eq("chamber_id", chamberId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (
        membershipError ||
        !membership
      ) {
        router.push("/join");
        return;
      }

      const {
        data: chamberData,
        error: chamberError,
      } = await supabase
        .from("chambers")
        .select(
          "id, chamber_name, description"
        )
        .eq("id", chamberId)
        .single();

      if (
        chamberError ||
        !chamberData
      ) {
        console.error(
          "LOAD CHAMBER ERROR:",
          chamberError
        );

        router.push("/dashboard");
        return;
      }

      setChamber(chamberData);
      setAuthorized(true);
    } catch (error) {
      console.error(
        "CHAMBER LOAD ERROR:",
        error
      );

      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  async function loadMembers() {
    try {
      setMembersLoading(true);
      setMembersError("");

      const {
        data: memberData,
        error: memberError,
      } = await supabase
        .from("members")
        .select(
          "id, user_id, role"
        )
        .eq(
          "chamber_id",
          chamberId
        )
        .order("joined_at", {
          ascending: true,
        });

      if (memberError) {
        console.error(
          "LOAD MEMBERS ERROR:",
          memberError
        );

        setMembersError(
          memberError.message
        );

        return;
      }

      const memberRows =
        memberData || [];

      if (memberRows.length === 0) {
        setMembers([]);
        return;
      }

      const userIds =
        memberRows.map(
          (member) =>
            member.user_id
        );

      const {
        data: profileData,
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
          "LOAD MEMBER PROFILES ERROR:",
          profileError
        );
      }

      const profileMap =
        new Map(
          (profileData || []).map(
            (profile) => [
              profile.id,
              profile.full_name,
            ]
          )
        );

      setMembers(
        memberRows.map(
          (member) => ({
            id: member.id,
            user_id:
              member.user_id,
            role: member.role,
            full_name:
              profileMap.get(
                member.user_id
              ) ||
              "Chamber Member",
          })
        )
      );
    } catch (error) {
      console.error(
        "LOAD MEMBERS ERROR:",
        error
      );

      setMembersError(
        "Unable to load Chamber members."
      );
    } finally {
      setMembersLoading(false);
    }
  }

  async function loadActiveCall() {
    try {
      const {
        data,
        error,
      } = await supabase
        .from("chamber_calls")
        .select(
          "id, chamber_id, room_name, started_by, status"
        )
        .eq(
          "chamber_id",
          chamberId
        )
        .eq(
          "status",
          "active"
        )
        .maybeSingle();

      if (error) {
        console.error(
          "LOAD ACTIVE CALL ERROR:",
          error
        );

        return;
      }

      setActiveCall(
        data || null
      );
    } catch (error) {
      console.error(
        "ACTIVE CALL ERROR:",
        error
      );
    }
  }

  async function loadOverviewData() {
    try {
      setOverviewLoading(true);

      const {
        data: {
          user,
        },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      /*
       * -----------------------------------------
       * LATEST ANNOUNCEMENT
       * -----------------------------------------
       *
       * General announcements are visible to
       * everyone.
       *
       * Specific announcements are only visible
       * to their intended recipient.
       */

      const {
        data: generalAnnouncements,
        error: generalAnnouncementError,
      } = await supabase
        .from("announcements")
        .select(
          "id, title, content, announcement_type, author_id, created_at"
        )
        .eq(
          "chamber_id",
          chamberId
        )
        .eq(
          "announcement_type",
          "general"
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        )
        .limit(1);

      if (generalAnnouncementError) {
        console.error(
          "OVERVIEW GENERAL ANNOUNCEMENT ERROR:",
          generalAnnouncementError
        );
      }

      const {
        data: personalAnnouncements,
        error: personalAnnouncementError,
      } = await supabase
        .from("announcements")
        .select(
          "id, title, content, announcement_type, author_id, created_at"
        )
        .eq(
          "chamber_id",
          chamberId
        )
        .eq(
          "announcement_type",
          "specific"
        )
        .eq(
          "recipient_id",
          user.id
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        )
        .limit(1);

      if (personalAnnouncementError) {
        console.error(
          "OVERVIEW PERSONAL ANNOUNCEMENT ERROR:",
          personalAnnouncementError
        );
      }

      const announcementCandidates = [
        ...(generalAnnouncements || []),
        ...(personalAnnouncements || []),
      ];

      announcementCandidates.sort(
        (a, b) =>
          new Date(
            b.created_at
          ).getTime() -
          new Date(
            a.created_at
          ).getTime()
      );

      const newestAnnouncement =
        announcementCandidates[0] ||
        null;

      setLatestAnnouncement(
        newestAnnouncement
      );

      if (newestAnnouncement) {
        const {
          data: authorProfile,
          error: authorProfileError,
        } = await supabase
          .from("profiles")
          .select(
            "id, full_name"
          )
          .eq(
            "id",
            newestAnnouncement.author_id
          )
          .maybeSingle();

        if (
          authorProfileError
        ) {
          console.error(
            "OVERVIEW AUTHOR PROFILE ERROR:",
            authorProfileError
          );

          setAnnouncementAuthor(
            "Chamber Member"
          );
        } else {
          setAnnouncementAuthor(
            authorProfile?.full_name ||
              "Chamber Member"
          );
        }
      } else {
        setAnnouncementAuthor(
          "Chamber Member"
        );
      }

      /*
       * -----------------------------------------
       * NEXT EVENT
       * -----------------------------------------
       */

      const now = new Date().toISOString();

      const {
        data: eventData,
        error: eventError,
      } = await supabase
        .from("events")
        .select(
          "id, title, description, event_date, location"
        )
        .eq(
          "chamber_id",
          chamberId
        )
        .gte(
          "event_date",
          now
        )
        .order(
          "event_date",
          {
            ascending: true,
          }
        )
        .limit(1);

      if (eventError) {
        console.error(
          "OVERVIEW EVENT ERROR:",
          eventError
        );

        setNextEvent(null);
      } else {
        setNextEvent(
          eventData?.[0] ||
            null
        );
      }

      /*
       * -----------------------------------------
       * ACTIVE POLL
       * -----------------------------------------
       */

      const {
        data: pollData,
        error: pollError,
      } = await supabase
        .from("polls")
        .select(
          "id, question, options, expires_at, created_at"
        )
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
          "OVERVIEW POLL ERROR:",
          pollError
        );

        setActivePoll(null);
        setActivePollVotes(0);
      } else {
        const activePollData =
          (pollData || [])
            .map(
              (poll) => ({
                ...poll,
                options:
                  Array.isArray(
                    poll.options
                  )
                    ? poll.options
                    : [],
              })
            )
            .find(
              (poll) =>
                !poll.expires_at ||
                new Date(
                  poll.expires_at
                ).getTime() >
                  Date.now()
            );

        setActivePoll(
          activePollData ||
            null
        );

        if (activePollData) {
          const {
            count,
            error: voteError,
          } = await supabase
            .from("poll_votes")
            .select(
              "id",
              {
                count: "exact",
                head: true,
              }
            )
            .eq(
              "poll_id",
              activePollData.id
            );

          if (voteError) {
            console.error(
              "OVERVIEW POLL VOTES ERROR:",
              voteError
            );

            setActivePollVotes(0);
          } else {
            setActivePollVotes(
              count || 0
            );
          }
        } else {
          setActivePollVotes(0);
        }
      }
    } catch (error) {
      console.error(
        "LOAD OVERVIEW DATA ERROR:",
        error
      );
    } finally {
      setOverviewLoading(false);
    }
  }

  async function startCall() {
    if (!currentUserId) {
      return;
    }

    try {
      setCallLoading(true);

      const {
        data: existingCall,
        error: existingCallError,
      } = await supabase
        .from("chamber_calls")
        .select(
          "id, chamber_id, room_name, started_by, status"
        )
        .eq(
          "chamber_id",
          chamberId
        )
        .eq(
          "status",
          "active"
        )
        .maybeSingle();

      if (existingCallError) {
        console.error(
          "CHECK ACTIVE CALL ERROR:",
          existingCallError
        );

        return;
      }

      if (existingCall) {
        router.push(
          `/voice/${chamberId}?room=${encodeURIComponent(
            existingCall.room_name
          )}`
        );

        return;
      }

      const roomName =
        `chamber-${chamberId}-${Date.now()}`;

      const {
        data: newCall,
        error: createCallError,
      } = await supabase
        .from("chamber_calls")
        .insert({
          chamber_id:
            chamberId,
          room_name:
            roomName,
          started_by:
            currentUserId,
          status:
            "active",
        })
        .select(
          "id, chamber_id, room_name, started_by, status"
        )
        .single();

      if (createCallError) {
        console.error(
          "START CALL ERROR:",
          createCallError
        );

        if (
          createCallError.code ===
          "23505"
        ) {
          await loadActiveCall();

          const {
            data:
              activeExistingCall,
          } =
            await supabase
              .from(
                "chamber_calls"
              )
              .select(
                "id, chamber_id, room_name, started_by, status"
              )
              .eq(
                "chamber_id",
                chamberId
              )
              .eq(
                "status",
                "active"
              )
              .maybeSingle();

          if (
            activeExistingCall
          ) {
            router.push(
              `/voice/${chamberId}?room=${encodeURIComponent(
                activeExistingCall.room_name
              )}`
            );
          }
        }

        return;
      }

      setActiveCall(
        newCall
      );

      router.push(
        `/voice/${chamberId}?room=${encodeURIComponent(
          newCall.room_name
        )}`
      );
    } catch (error) {
      console.error(
        "START CALL ERROR:",
        error
      );
    } finally {
      setCallLoading(false);
    }
  }

  function joinCall() {
    if (!activeCall) return;

    router.push(
      `/voice/${chamberId}?room=${encodeURIComponent(
        activeCall.room_name
      )}`
    );
  }

  async function loadFiles() {
    try {
      setFilesLoading(true);

      const {
        data,
        error,
      } = await supabase
        .from("files")
        .select(
          "id, chamber_id, uploaded_by, file_name, file_url, file_type, file_size, created_at"
        )
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

      if (error) {
        console.error(
          "LOAD FILES ERROR:",
          error
        );

        return;
      }

      setFiles(
        data || []
      );
    } catch (error) {
      console.error(
        "FILES LOAD ERROR:",
        error
      );
    } finally {
      setFilesLoading(false);
    }
  }

  async function uploadFile() {
    if (!selectedFile) {
      alert(
        "Please select a file first."
      );
      return;
    }

    if (!currentUserId) {
      alert(
        "Please login first."
      );
      return;
    }

    if (
      selectedFile.size >
      10 * 1024 * 1024
    ) {
      alert(
        "File size must not exceed 10 MB."
      );
      return;
    }

    try {
      setUploadingFile(true);

      const safeFileName =
        selectedFile.name.replace(
          /[^a-zA-Z0-9.\-_]/g,
          "_"
        );

      const storagePath =
        `${chamberId}/${Date.now()}-${safeFileName}`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from("chamber-files")
        .upload(
          storagePath,
          selectedFile
        );

      if (uploadError) {
        console.error(
          "FILE UPLOAD ERROR:",
          uploadError
        );

        alert(
          "Unable to upload the file. Please try again."
        );

        return;
      }

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("chamber-files")
        .getPublicUrl(
          storagePath
        );

      const {
        error: databaseError,
      } = await supabase
        .from("files")
        .insert({
          chamber_id:
            chamberId,
          uploaded_by:
            currentUserId,
          file_name:
            selectedFile.name,
          file_url:
            publicUrlData.publicUrl,
          file_type:
            selectedFile.type,
          file_size:
            selectedFile.size,
        });

      if (databaseError) {
        console.error(
          "DATABASE FILE ERROR:",
          databaseError
        );

        alert(
          "The file was uploaded but could not be saved."
        );

        return;
      }

      setSelectedFile(null);

      await loadFiles();
    } catch (error) {
      console.error(
        "UPLOAD FILE ERROR:",
        error
      );

      alert(
        "Something went wrong while uploading the file."
      );
    } finally {
      setUploadingFile(false);
    }
  }

  async function deleteFile(
    file: ChamberFile
  ) {
    if (
      file.uploaded_by !==
      currentUserId
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete "${file.file_name}"?`
      );

    if (!confirmed) {
      return;
    }

    const { error } =
      await supabase
        .from("files")
        .delete()
        .eq(
          "id",
          file.id
        );

    if (error) {
      console.error(
        "DELETE FILE ERROR:",
        error
      );

      alert(
        error.message
      );

      return;
    }

    await loadFiles();
  }

  function formatFileSize(
    size: number | null
  ) {
    if (!size) {
      return "Unknown size";
    }

    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(
        size / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      size /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }

  function formatAnnouncementDate(
    date: string
  ) {
    return new Date(
      date
    ).toLocaleString(
      undefined,
      {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    );
  }

  function formatEventDate(
    date: string
  ) {
    return new Date(
      date
    ).toLocaleDateString(
      undefined,
      {
        weekday: "short",
        month: "short",
        day: "numeric",
      }
    );
  }

  function formatEventTime(
    date: string
  ) {
    return new Date(
      date
    ).toLocaleTimeString(
      undefined,
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  }

  function handleSectionChange(
    section: ChamberSection
  ) {
    setActiveSection(section);
    setMobileSidebarOpen(false);
  }

  function toggleDesktopSidebar() {
    setSidebarCollapsed(
      (previous) => !previous
    );
  }

  function toggleNavigation() {
    if (
      typeof window !== "undefined" &&
      window.innerWidth < 1024
    ) {
      setMobileSidebarOpen(
        (previous) => !previous
      );

      return;
    }

    toggleDesktopSidebar();
  }

  function renderOverview(
    currentChamber: Chamber
  ) {
    return (
      <div className="min-h-full bg-[#f3f2f0]">
        <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-7 lg:px-10 lg:py-10">

          {/* HERO */}

          <section className="border-b border-black/[0.08] pb-10">
            <div className="max-w-4xl">

              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#737773]">
                Chamber overview
              </p>

              <h2 className="text-[clamp(2.8rem,5vw,5rem)] font-medium leading-[0.95] tracking-[-0.05em] text-[#111111]">
                Where organization
                <br />
                meets focus.
              </h2>

              {currentChamber.description && (
                <p className="mt-6 max-w-2xl text-base leading-7 text-[#5f625f] sm:text-lg">
                  {currentChamber.description}
                </p>
              )}

            </div>
          </section>

          {/* STATS */}

          <section className="grid border-b border-black/[0.08] sm:grid-cols-3">

            <div className="border-b border-black/[0.08] py-7 sm:border-b-0 sm:border-r sm:pr-8">

              <div className="flex items-center gap-2 text-[#707570]">
                <Users
                  size={15}
                  strokeWidth={1.7}
                />

                <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                  Members
                </span>
              </div>

              <p className="mt-3 text-4xl font-medium tracking-[-0.04em] text-[#111111]">
                {members.length}
              </p>

              <p className="mt-1 text-xs text-[#777b77]">
                People in this Chamber
              </p>

            </div>

            <div className="border-b border-black/[0.08] py-7 sm:border-b-0 sm:border-r sm:px-8">

              <div className="flex items-center gap-2 text-[#707570]">
                <FileText
                  size={15}
                  strokeWidth={1.7}
                />

                <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                  Files
                </span>
              </div>

              <p className="mt-3 text-4xl font-medium tracking-[-0.04em] text-[#111111]">
                {files.length}
              </p>

              <p className="mt-1 text-xs text-[#777b77]">
                Shared resources
              </p>

            </div>

            <div className="py-7 sm:pl-8">

              <div className="flex items-center gap-2 text-[#707570]">
                <Activity
                  size={15}
                  strokeWidth={1.7}
                />

                <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                  Live
                </span>
              </div>

              <p className="mt-3 text-4xl font-medium tracking-[-0.04em] text-[#111111]">
                {activeCall
                  ? "ON"
                  : "—"}
              </p>

              <p className="mt-1 text-xs text-[#777b77]">
                {activeCall
                  ? "A live call is active"
                  : "No active call"}
              </p>

            </div>

          </section>

          {/* DASHBOARD INTELLIGENCE */}

          <section className="grid gap-px border-x border-b border-black/[0.08] bg-black/[0.08] lg:grid-cols-2">

            {/* LATEST ANNOUNCEMENT */}

            <div className="bg-[#f8f8f6] p-7 sm:p-9">

              <div className="flex items-start justify-between gap-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center bg-[#111111] text-white">
                    <Megaphone
                      size={17}
                      strokeWidth={1.5}
                    />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#737773]">
                      Latest announcement
                    </p>

                    <p className="mt-1 text-xs text-[#969996]">
                      {overviewLoading
                        ? "Loading..."
                        : latestAnnouncement
                          ? formatAnnouncementDate(
                              latestAnnouncement.created_at
                            )
                          : "No announcements"}
                    </p>
                  </div>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setActiveSection(
                      "announcements"
                    )
                  }
                  className="group flex items-center gap-1 text-xs font-semibold text-[#555955]"
                >
                  View all

                  <ArrowUpRight
                    size={14}
                    strokeWidth={1.7}
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </button>

              </div>

              {overviewLoading ? (
                <div className="mt-8 space-y-3">

                  <div className="h-5 w-2/3 animate-pulse bg-black/[0.06]" />

                  <div className="h-4 w-full animate-pulse bg-black/[0.04]" />

                  <div className="h-4 w-4/5 animate-pulse bg-black/[0.04]" />

                </div>
              ) : latestAnnouncement ? (
                <div className="mt-8">

                  <div className="mb-3 flex items-center gap-2">

                    <span
                      className={
                        latestAnnouncement.announcement_type ===
                        "specific"
                          ? "bg-purple-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-purple-700"
                          : "bg-blue-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-blue-700"
                      }
                    >
                      {latestAnnouncement.announcement_type ===
                      "specific"
                        ? "Personal"
                        : "General"}
                    </span>

                  </div>

                  <h3 className="text-2xl font-medium leading-tight tracking-[-0.03em] text-[#111111]">
                    {latestAnnouncement.title}
                  </h3>

                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#666a66]">
                    {latestAnnouncement.content}
                  </p>

                  <p className="mt-5 text-xs text-[#898d89]">
                    From{" "}
                    <span className="font-semibold text-[#666a66]">
                      {announcementAuthor}
                    </span>
                  </p>

                </div>
              ) : (
                <div className="mt-8">

                  <p className="text-lg font-medium text-[#444744]">
                    No announcements yet.
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#777b77]">
                    Chamber announcements will appear here when they are published.
                  </p>

                </div>
              )}

            </div>

            {/* NEXT EVENT */}

            <div className="bg-[#f8f8f6] p-7 sm:p-9">

              <div className="flex items-start justify-between gap-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center bg-[#111111] text-white">
                    <CalendarDays
                      size={17}
                      strokeWidth={1.5}
                    />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#737773]">
                      Next event
                    </p>

                    <p className="mt-1 text-xs text-[#969996]">
                      Upcoming Chamber activity
                    </p>
                  </div>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setActiveSection(
                      "events"
                    )
                  }
                  className="group flex items-center gap-1 text-xs font-semibold text-[#555955]"
                >
                  View events

                  <ArrowUpRight
                    size={14}
                    strokeWidth={1.7}
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </button>

              </div>

              {overviewLoading ? (
                <div className="mt-8 space-y-3">

                  <div className="h-5 w-2/3 animate-pulse bg-black/[0.06]" />

                  <div className="h-4 w-1/2 animate-pulse bg-black/[0.04]" />

                </div>
              ) : nextEvent ? (
                <div className="mt-8">

                  <div className="flex items-start gap-5">

                    <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center border border-black/[0.08] bg-white">

                      <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#777b77]">
                        {new Date(
                          nextEvent.event_date
                        ).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                          }
                        )}
                      </span>

                      <span className="text-2xl font-medium leading-none tracking-[-0.04em] text-[#111111]">
                        {new Date(
                          nextEvent.event_date
                        ).getDate()}
                      </span>

                    </div>

                    <div className="min-w-0">

                      <h3 className="text-2xl font-medium leading-tight tracking-[-0.03em] text-[#111111]">
                        {nextEvent.title}
                      </h3>

                      <div className="mt-3 space-y-1.5 text-sm text-[#666a66]">

                        <p>
                          {formatEventDate(
                            nextEvent.event_date
                          )}{" "}
                          ·{" "}
                          {formatEventTime(
                            nextEvent.event_date
                          )}
                        </p>

                        {nextEvent.location && (
                          <p className="flex items-center gap-1.5">
                            <MapPin
                              size={13}
                              strokeWidth={1.7}
                            />

                            {nextEvent.location}
                          </p>
                        )}

                      </div>

                    </div>

                  </div>

                  {nextEvent.description && (
                    <p className="mt-5 line-clamp-2 text-sm leading-6 text-[#777b77]">
                      {nextEvent.description}
                    </p>
                  )}

                </div>
              ) : (
                <div className="mt-8">

                  <p className="text-lg font-medium text-[#444744]">
                    No upcoming events.
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#777b77]">
                    When the Chamber schedules something, it will appear here.
                  </p>

                </div>
              )}

            </div>

            {/* ACTIVE POLL */}

            <div className="bg-[#111211] p-7 text-white sm:p-9 lg:col-span-2">

              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">

                <div className="flex items-start gap-4">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#00e676] text-[#050605]">
                    <BarChart3
                      size={19}
                      strokeWidth={1.8}
                    />
                  </div>

                  <div>

                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8d938d]">
                      Active poll
                    </p>

                    <p className="mt-1 text-xs text-[#696f69]">
                      Chamber members are being asked for input
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setActiveSection(
                      "polls"
                    )
                  }
                  className="group flex items-center gap-1 self-start text-xs font-semibold text-[#d9ddd9]"
                >
                  Open polls

                  <ArrowUpRight
                    size={14}
                    strokeWidth={1.7}
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </button>

              </div>

              {overviewLoading ? (
                <div className="mt-8 space-y-3">

                  <div className="h-6 w-3/4 animate-pulse bg-white/[0.08]" />

                  <div className="h-4 w-1/3 animate-pulse bg-white/[0.05]" />

                </div>
              ) : activePoll ? (
                <div className="mt-8">

                  <h3 className="max-w-4xl text-2xl font-medium leading-tight tracking-[-0.03em] sm:text-3xl">
                    {activePoll.question}
                  </h3>

                  <div className="mt-6 flex flex-wrap items-center gap-3">

                    <span className="border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-xs text-[#aeb4ae]">
                      {activePoll.options.length} options
                    </span>

                    <span className="border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-xs text-[#aeb4ae]">
                      {activePollVotes}{" "}
                      {activePollVotes === 1
                        ? "vote"
                        : "votes"}
                    </span>

                    {activePoll.expires_at && (
                      <span className="border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-xs text-[#aeb4ae]">
                        Closes{" "}
                        {formatAnnouncementDate(
                          activePoll.expires_at
                        )}
                      </span>
                    )}

                  </div>

                  <div className="mt-7 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">

                    {activePoll.options
                      .slice(0, 6)
                      .map(
                        (
                          option,
                          index
                        ) => (
                          <div
                            key={
                              index
                            }
                            className="border border-white/[0.08] bg-white/[0.03] px-4 py-3"
                          >

                            <div className="flex items-center gap-3">

                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-xs font-semibold text-[#bfc4bf]">
                                {String.fromCharCode(
                                  65 +
                                    index
                                )}
                              </span>

                              <span className="truncate text-sm text-[#d8ddd8]">
                                {option}
                              </span>

                            </div>

                          </div>
                        )
                      )}

                  </div>

                </div>
              ) : (
                <div className="mt-8">

                  <p className="text-xl font-medium text-[#dce1dc]">
                    No active polls.
                  </p>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-[#858b85]">
                    Active Chamber polls will appear here so members can quickly see what needs their input.
                  </p>

                </div>
              )}

            </div>

          </section>

          {/* QUICK WORKSPACE */}

          <section className="grid gap-px border-x border-b border-black/[0.08] bg-black/[0.08] lg:grid-cols-2">

            <button
              type="button"
              onClick={() =>
                setActiveSection("chat")
              }
              className="group bg-[#f8f8f6] p-7 text-left transition hover:bg-white sm:p-9"
            >

              <div className="flex items-start justify-between">

                <MessageSquare
                  size={22}
                  strokeWidth={1.5}
                />

                <ArrowUpRight
                  size={19}
                  strokeWidth={1.6}
                  className="text-[#8a8d8a] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                />

              </div>

              <h3 className="mt-12 text-2xl font-medium tracking-[-0.03em] text-[#111111]">
                Conversation
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-[#666a66]">
                Keep the Chamber&apos;s conversations focused, accessible, and connected to the work.
              </p>

            </button>

            <button
              type="button"
              onClick={() =>
                setActiveSection(
                  "announcements"
                )
              }
              className="group bg-[#f8f8f6] p-7 text-left transition hover:bg-white sm:p-9"
            >

              <div className="flex items-start justify-between">

                <CalendarDays
                  size={22}
                  strokeWidth={1.5}
                />

                <ArrowUpRight
                  size={19}
                  strokeWidth={1.6}
                  className="text-[#8a8d8a] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                />

              </div>

              <h3 className="mt-12 text-2xl font-medium tracking-[-0.03em] text-[#111111]">
                Organize
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-[#666a66]">
                Announcements, events, and polls give the Chamber structure beyond conversation.
              </p>

            </button>

            <button
              type="button"
              onClick={() =>
                setActiveSection("files")
              }
              className="group bg-[#f8f8f6] p-7 text-left transition hover:bg-white sm:p-9"
            >

              <div className="flex items-start justify-between">

                <FileText
                  size={22}
                  strokeWidth={1.5}
                />

                <ArrowUpRight
                  size={19}
                  strokeWidth={1.6}
                  className="text-[#8a8d8a] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                />

              </div>

              <h3 className="mt-12 text-2xl font-medium tracking-[-0.03em] text-[#111111]">
                Information
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-[#666a66]">
                Files and members remain available as part of the same organizational space.
              </p>

            </button>

            <button
              type="button"
              onClick={() =>
                setActiveSection("ai")
              }
              className="group bg-[#111211] p-7 text-left text-[#f5f5f2] transition hover:bg-[#171817] sm:p-9"
            >

              <div className="flex items-start justify-between">

                <span className="flex h-9 w-9 items-center justify-center bg-[#00e676] text-[#050605]">
                  <span className="text-sm font-bold">
                    AI
                  </span>
                </span>

                <ArrowUpRight
                  size={19}
                  strokeWidth={1.6}
                  className="text-[#a5aaa5] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                />

              </div>

              <h3 className="mt-12 text-2xl font-medium tracking-[-0.03em]">
                Chamber AI
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-[#a5aaa5]">
                Turn the Chamber&apos;s information and conversations into organizational intelligence.
              </p>

            </button>

          </section>

          {/* LIVE WORKSPACE */}

          <section className="mt-10 flex flex-col gap-5 border-t border-black/[0.08] pt-7 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#737773]">
                Live workspace
              </p>

              <p className="mt-2 text-sm text-[#5f625f]">
                {activeCall
                  ? "A Chamber call is currently active."
                  : "Start a call whenever the organization needs to meet live."}
              </p>

            </div>

            <button
              type="button"
              onClick={
                activeCall
                  ? joinCall
                  : startCall
              }
              disabled={callLoading}
              className="inline-flex items-center justify-center gap-2 self-start bg-[#00e676] px-5 py-3 text-sm font-semibold text-[#050605] transition hover:bg-[#00cf69] disabled:cursor-not-allowed disabled:opacity-60"
            >

              {callLoading
                ? "Starting..."
                : activeCall
                  ? "Join live call"
                  : "Start a call"}

              <ArrowUpRight
                size={15}
                strokeWidth={2}
              />

            </button>

          </section>

        </div>
      </div>
    );
  }

  function renderMembers() {
    return (
      <div className="h-full overflow-y-auto bg-[#f3f2f0]">
        <div className="mx-auto max-w-[1200px] px-5 py-8 sm:px-7 lg:px-10">

          <div className="mb-8 border-b border-black/[0.08] pb-8">

            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#737773]">
              Information
            </p>

            <h2 className="mt-3 text-4xl font-medium tracking-[-0.04em] text-[#111111]">
              Members
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#666a66]">
              People who belong to this Chamber.
            </p>

          </div>

          {membersLoading ? (
            <div className="border border-black/[0.08] bg-[#f8f8f6] p-10 text-center">

              <p className="text-sm text-[#666a66]">
                Loading members...
              </p>

            </div>
          ) : membersError ? (
            <div className="border border-red-200 bg-red-50 p-6">

              <p className="text-sm text-red-700">
                {membersError}
              </p>

            </div>
          ) : members.length === 0 ? (
            <div className="border border-dashed border-black/[0.15] bg-[#f8f8f6] p-10 text-center">

              <p className="text-sm text-[#666a66]">
                No members found.
              </p>

            </div>
          ) : (
            <div className="grid gap-px border border-black/[0.08] bg-black/[0.08] sm:grid-cols-2 lg:grid-cols-3">

              {members.map(
                (member) => (
                  <div
                    key={member.id}
                    className="bg-[#f8f8f6] p-6"
                  >

                    <div className="flex items-center gap-4">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#111111] text-sm font-semibold text-white">
                        {member.full_name
                          ?.charAt(0)
                          ?.toUpperCase() ||
                          "C"}
                      </div>

                      <div className="min-w-0">

                        <p className="truncate text-sm font-semibold text-[#111111]">
                          {
                            member.full_name
                          }
                        </p>

                        <p className="mt-1 text-[11px] uppercase tracking-[0.1em] text-[#777b77]">
                          {
                            member.role
                          }
                        </p>

                      </div>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </div>
      </div>
    );
  }

  function renderFiles() {
    return (
      <div className="h-full overflow-y-auto bg-[#f3f2f0]">
        <div className="mx-auto max-w-[1200px] px-5 py-8 sm:px-7 lg:px-10">

          <div className="mb-8 border-b border-black/[0.08] pb-8">

            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#737773]">
              Information
            </p>

            <h2 className="mt-3 text-4xl font-medium tracking-[-0.04em] text-[#111111]">
              Files
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#666a66]">
              Shared resources belonging to this Chamber.
            </p>

          </div>

          <div className="border border-black/[0.08] bg-[#f8f8f6] p-6">

            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#737773]">
              Upload resource
            </p>

            <div className="mt-4 flex flex-col gap-3 lg:flex-row">

              <input
                type="file"
                onChange={(event) =>
                  setSelectedFile(
                    event.target
                      .files?.[0] ||
                      null
                  )
                }
                className="min-w-0 flex-1 border border-black/[0.1] bg-white p-3 text-sm text-[#5f625f] file:mr-4 file:border-0 file:bg-[#111111] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
              />

              <button
                type="button"
                onClick={uploadFile}
                disabled={
                  uploadingFile ||
                  !selectedFile
                }
                className="bg-[#00e676] px-5 py-3 text-sm font-semibold text-[#050605] transition hover:bg-[#00cf69] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploadingFile
                  ? "Uploading..."
                  : "Upload file"}
              </button>

            </div>

            {selectedFile && (
              <p className="mt-3 text-xs text-[#777b77]">
                Selected:{" "}
                {
                  selectedFile.name
                }
              </p>
            )}

            <p className="mt-3 text-[11px] text-[#888c88]">
              Maximum file size: 10 MB.
            </p>

          </div>

          <div className="mt-8">

            {filesLoading ? (
              <div className="border border-black/[0.08] bg-[#f8f8f6] p-10 text-center">

                <p className="text-sm text-[#666a66]">
                  Loading files...
                </p>

              </div>
            ) : files.length === 0 ? (
              <div className="border border-dashed border-black/[0.15] bg-[#f8f8f6] p-12 text-center">

                <FileText
                  size={28}
                  strokeWidth={1.4}
                  className="mx-auto text-[#777b77]"
                />

                <p className="mt-4 text-sm font-semibold text-[#111111]">
                  No files yet
                </p>

                <p className="mt-2 text-xs text-[#777b77]">
                  Uploaded Chamber resources will appear here.
                </p>

              </div>
            ) : (
              <div className="space-y-px border border-black/[0.08] bg-black/[0.08]">

                {files.map(
                  (file) => (
                    <div
                      key={file.id}
                      className="flex flex-col gap-4 bg-[#f8f8f6] p-5 sm:flex-row sm:items-center sm:justify-between"
                    >

                      <div className="flex min-w-0 items-center gap-4">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#111111] text-white">

                          <FileText
                            size={17}
                            strokeWidth={1.5}
                          />

                        </div>

                        <div className="min-w-0">

                          <p className="truncate text-sm font-semibold text-[#111111]">
                            {
                              file.file_name
                            }
                          </p>

                          <p className="mt-1 text-[11px] text-[#777b77]">
                            {formatFileSize(
                              file.file_size
                            )}{" "}
                            ·{" "}
                            {new Date(
                              file.created_at
                            ).toLocaleString()}
                          </p>

                        </div>

                      </div>

                      <div className="flex shrink-0 items-center gap-2">

                        <a
                          href={
                            file.file_url
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="border border-black/[0.1] bg-white px-4 py-2 text-xs font-semibold text-[#111111] transition hover:bg-[#f3f2f0]"
                        >
                          Open
                        </a>

                        {file.uploaded_by ===
                          currentUserId && (
                          <button
                            type="button"
                            onClick={() =>
                              deleteFile(
                                file
                              )
                            }
                            className="border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
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

        </div>
      </div>
    );
  }

  function renderSettings(
    currentChamber: Chamber
  ) {
    return (
      <div className="h-full overflow-y-auto bg-[#f3f2f0]">

        <div className="mx-auto max-w-[1000px] px-5 py-8 sm:px-7 lg:px-10">

          <div className="border-b border-black/[0.08] pb-8">

            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#737773]">
              Account
            </p>

            <h2 className="mt-3 text-4xl font-medium tracking-[-0.04em] text-[#111111]">
              Settings
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#666a66]">
              Manage this Chamber&apos;s workspace configuration.
            </p>

          </div>

          <div className="mt-8 border border-black/[0.08] bg-[#f8f8f6] p-6 sm:p-8">

            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#737773]">
              Chamber
            </p>

            <h3 className="mt-3 text-2xl font-medium tracking-[-0.03em] text-[#111111]">
              {
                currentChamber.chamber_name
              }
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#666a66]">
              {currentChamber.description ||
                "No Chamber description has been provided."}
            </p>

          </div>

        </div>

      </div>
    );
  }

  function renderMainContent(
    currentChamber: Chamber
  ) {
    switch (activeSection) {
      case "overview":
        return renderOverview(
          currentChamber
        );

      case "chat":
        return (
          <div className="h-full bg-[#f8f8f6]">
            <Chat
              chamberId={
                currentChamber.id
              }
            />
          </div>
        );

      case "announcements":
        return (
          <div className="h-full bg-[#f3f2f0]">
            <Announcements
              chamberId={
                currentChamber.id
              }
            />
          </div>
        );

      case "members":
        return renderMembers();

      case "files":
        return renderFiles();

      case "events":
        return (
          <div className="h-full bg-[#f3f2f0]">
            <Events
              chamberId={
                currentChamber.id
              }
            />
          </div>
        );

      case "polls":
        return (
          <div className="h-full bg-[#f3f2f0]">
            <Polls
              chamberId={
                currentChamber.id
              }
            />
          </div>
        );

      case "ai":
        return (
          <div className="h-full bg-[#080908]">
            <AIAssistant
              chamberId={
                currentChamber.id
              }
              chamberName={
                currentChamber.chamber_name
              }
              chamberDescription={
                currentChamber.description
              }
              memberCount={
                members.length
              }
            />
          </div>
        );

      case "settings":
        return renderSettings(
          currentChamber
        );

      default:
        return renderOverview(
          currentChamber
        );
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f3f2f0] px-6">

        <div className="text-center">

          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-black/10 border-t-[#111111]" />

          <p className="mt-5 text-xs uppercase tracking-[0.14em] text-[#777b77]">
            Loading Chamber
          </p>

        </div>

      </main>
    );
  }

  if (
    !authorized ||
    !chamber
  ) {
    return null;
  }

  const currentChamber = chamber;

  const desktopSidebar = (
    <Sidebar
      activeSection={
        activeSection
      }
      onSectionChange={
        handleSectionChange
      }
      collapsed={
        sidebarCollapsed
      }
      onToggle={
        toggleDesktopSidebar
      }
      activeCall={
        activeCall
      }
      callLoading={
        callLoading
      }
      onStartCall={
        startCall
      }
      onJoinCall={
        joinCall
      }
    />
  );

  const mobileSidebar = (
    <>
      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() =>
            setMobileSidebarOpen(false)
          }
          className="fixed inset-0 z-[55] bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-[60] w-[248px] transform transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden ${
          mobileSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {desktopSidebar}
      </aside>
    </>
  );

  return (
    <>
      <WorkspaceShell
        sidebar={
          desktopSidebar
        }
        header={
          <Topbar
            chamberName={
              currentChamber.chamber_name
            }
            onSidebarToggle={
              toggleNavigation
            }
            sidebarCollapsed={
              sidebarCollapsed
            }
          />
        }
      >
        {renderMainContent(
          currentChamber
        )}
      </WorkspaceShell>

      {mobileSidebar}
    </>
  );
}