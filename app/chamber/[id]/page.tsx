"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

import AIAssistant from "./AIAssistant";
import Announcements from "./Announcements";
import Events from "./Events";
import Polls from "./Polls";

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

export default function ChamberPage() {
  const params = useParams();
  const router = useRouter();

  const chamberId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const [activeSection, setActiveSection] =
    useState<ChamberSection>("chat");

  const [showSidebar, setShowSidebar] =
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

  useEffect(() => {
    if (
      !chamberId ||
      !authorized ||
      activeSection !== "files"
    ) {
      return;
    }

    loadFiles();
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
          (
            member
          ) => ({
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

  function handleSectionChange(
    section: ChamberSection
  ) {
    setActiveSection(section);

    if (
      typeof window !== "undefined" &&
      window.innerWidth < 768
    ) {
      setShowSidebar(false);
    }
  }

  function handleSidebarToggle() {
    setShowSidebar(
      (previous) =>
        !previous
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-slate-500">
            Loading Chamber...
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

  return (
    <main className="relative flex h-screen min-h-0 overflow-hidden bg-slate-100 text-slate-900">

      {/* TOPBAR + MAIN WORKSPACE */}
      <div className="relative flex min-w-0 flex-1 flex-col">

        <Topbar
          chamberName={
            chamber.chamber_name
          }
          onSidebarToggle={
            handleSidebarToggle
          }
        />

        {/* MAIN WORKSPACE */}
        <div className="relative min-h-0 flex-1 p-2 sm:p-3">

          <div className="relative h-full min-h-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            {activeSection ===
              "chat" && (
              <Chat
                chamberId={
                  chamber.id
                }
              />
            )}

            {activeSection ===
              "announcements" && (
              <Announcements
                chamberId={
                  chamber.id
                }
              />
            )}

            {activeSection ===
              "members" && (
              <div className="h-full overflow-y-auto bg-slate-50 p-4 sm:p-6">

                <div className="mx-auto max-w-5xl">

                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">
                      Chamber Members
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      People who belong to this Chamber.
                    </p>
                  </div>

                  {membersLoading ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                      <p className="text-slate-500">
                        Loading members...
                      </p>
                    </div>
                  ) : membersError ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                      <p className="text-red-600">
                        {membersError}
                      </p>
                    </div>
                  ) : members.length ===
                    0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                      <p className="text-slate-500">
                        No members found.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                      {members.map(
                        (
                          member
                        ) => (
                          <div
                            key={
                              member.id
                            }
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                          >

                            <div className="flex items-center gap-4">

                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-600">
                                {member.full_name
                                  ?.charAt(
                                    0
                                  )
                                  ?.toUpperCase() ||
                                  "C"}
                              </div>

                              <div className="min-w-0">

                                <p className="truncate font-semibold text-slate-900">
                                  {member.full_name}
                                </p>

                                <p className="mt-1 text-xs capitalize text-slate-500">
                                  {member.role}
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
            )}

            {activeSection ===
              "files" && (
              <div className="h-full overflow-y-auto bg-slate-50 p-4 sm:p-6">

                <div className="mx-auto max-w-5xl">

                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">
                      Chamber Files
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Upload and access files shared in this Chamber.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <h3 className="text-lg font-semibold text-slate-900">
                      Upload File
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Maximum file size: 10 MB.
                    </p>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">

                      <input
                        type="file"
                        onChange={(
                          event
                        ) =>
                          setSelectedFile(
                            event.target.files?.[0] ||
                              null
                          )
                        }
                        className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:font-semibold file:text-white hover:file:bg-blue-700"
                      />

                      <button
                        type="button"
                        onClick={
                          uploadFile
                        }
                        disabled={
                          uploadingFile ||
                          !selectedFile
                        }
                        className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {uploadingFile
                          ? "Uploading..."
                          : "Upload File"}
                      </button>

                    </div>

                    {selectedFile && (
                      <p className="mt-3 text-sm text-slate-500">
                        Selected:{" "}
                        {selectedFile.name}
                      </p>
                    )}

                  </div>

                  <div className="mt-6">

                    {filesLoading ? (
                      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                        <p className="text-slate-500">
                          Loading files...
                        </p>
                      </div>
                    ) : files.length ===
                      0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">

                        <div className="text-5xl">
                          📁
                        </div>

                        <p className="mt-4 font-semibold text-slate-900">
                          No files yet
                        </p>

                        <p className="mt-2 text-sm text-slate-500">
                          Uploaded Chamber files will appear here.
                        </p>

                      </div>
                    ) : (
                      <div className="space-y-3">

                        {files.map(
                          (
                            file
                          ) => (
                            <div
                              key={
                                file.id
                              }
                              className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                            >

                              <div className="flex min-w-0 items-center gap-4">

                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl">
                                  📄
                                </div>

                                <div className="min-w-0">

                                  <p className="truncate font-semibold text-slate-900">
                                    {file.file_name}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-500">
                                    {formatFileSize(
                                      file.file_size
                                    )}{" "}
                                    •{" "}
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
                                  className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
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
                                    className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
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
            )}

            {activeSection ===
              "events" && (
              <Events
                chamberId={
                  chamber.id
                }
              />
            )}

            {activeSection ===
              "polls" && (
              <Polls
                chamberId={
                  chamber.id
                }
              />
            )}

            {activeSection ===
              "ai" && (
              <AIAssistant
                chamberId={
                  chamber.id
                }
                chamberName={
                  chamber.chamber_name
                }
                chamberDescription={
                  chamber.description
                }
                memberCount={
                  members.length
                }
              />
            )}

            {activeSection ===
              "settings" && (
              <div className="h-full overflow-y-auto bg-slate-50 p-4 sm:p-6">

                <div className="mx-auto max-w-4xl">

                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                    <h2 className="text-2xl font-bold text-slate-900">
                      Chamber Settings
                    </h2>

                    <p className="mt-2 text-slate-500">
                      Chamber settings and management options.
                    </p>

                    <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">

                      <p className="text-sm text-slate-500">
                        Chamber:
                      </p>

                      <p className="mt-1 font-semibold text-slate-900">
                        {chamber.chamber_name}
                      </p>

                    </div>

                  </div>

                </div>

              </div>
            )}

          </div>

        </div>

      </div>

      {/* OVERLAY SIDEBAR */}
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
        onToggle={
          handleSidebarToggle
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

    </main>
  );
}