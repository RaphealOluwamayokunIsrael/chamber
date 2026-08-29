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
};

type Profile = {
  id: string;
  full_name: string | null;
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

  const [members, setMembers] =
    useState<Member[]>([]);

  const [profiles, setProfiles] =
    useState<Profile[]>([]);

  const [files, setFiles] =
    useState<ChamberFile[]>([]);

  const [filesLoading, setFilesLoading] =
    useState(false);

  const [uploadingFile, setUploadingFile] =
    useState(false);

  const [showSidebar, setShowSidebar] =
    useState(false);

  const [showAI, setShowAI] =
    useState(true);

  const [chamber, setChamber] =
    useState<Chamber | null>(null);

  const [currentUserId, setCurrentUserId] =
    useState("");

  const [activeCall, setActiveCall] =
    useState<ChamberCall | null>(null);

  const [callLoading, setCallLoading] =
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
          "CALL REALTIME STATUS:",
          status
        );
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chamberId, authorized]);

  useEffect(() => {
    if (!chamberId || !authorized) return;

    loadMembers();
  }, [chamberId, authorized]);

  useEffect(() => {
    if (!chamberId || !authorized) return;

    loadFiles();
  }, [chamberId, authorized]);

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

  async function loadMembers() {
    if (!chamberId) return;

    const {
      data,
      error,
    } = await supabase
      .from("members")
      .select(
        "id, user_id, role"
      )
      .eq(
        "chamber_id",
        chamberId
      )
      .order(
        "joined_at",
        {
          ascending: true,
        }
      );

    if (error) {
      console.error(
        "LOAD MEMBERS ERROR:",
        error
      );
      return;
    }

    const memberList = data || [];

    setMembers(memberList);

    const userIds = memberList.map(
      (member) => member.user_id
    );

    if (userIds.length === 0) {
      setProfiles([]);
      return;
    }

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
      return;
    }

    setProfiles(
      profileData || []
    );
  }

  function getProfileName(
    userId: string
  ) {
    const profile =
      profiles.find(
        (item) =>
          item.id === userId
      );

    return (
      profile?.full_name ||
      "Chamber Member"
    );
  }

  function getInitials(
    name: string
  ) {
    if (!name) return "CM";

    const parts =
      name.trim().split(/\s+/);

    if (parts.length === 1) {
      return parts[0]
        .slice(0, 2)
        .toUpperCase();
    }

    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();
  }

  async function loadFiles() {
    if (!chamberId) return;

    try {
      setFilesLoading(true);

      const {
        data,
        error,
      } = await supabase
        .from("files")
        .select(`
          id,
          chamber_id,
          uploaded_by,
          file_name,
          file_url,
          file_type,
          file_size,
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

      if (error) {
        console.error(
          "LOAD FILES ERROR:",
          error
        );
        return;
      }

      setFiles(data || []);
    } catch (error) {
      console.error(
        "LOAD FILES ERROR:",
        error
      );
    } finally {
      setFilesLoading(false);
    }
  }

  async function handleFileUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      alert(
        "File is too large. Maximum size is 10 MB."
      );

      event.target.value = "";
      return;
    }

    try {
      setUploadingFile(true);

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

      const safeFileName =
        file.name.replace(
          /[^a-zA-Z0-9._-]/g,
          "_"
        );

      const filePath =
        `${chamberId}/${Date.now()}-${safeFileName}`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from("chamber-files")
        .upload(
          filePath,
          file
        );

      if (uploadError) {
        console.error(
          "FILE UPLOAD ERROR:",
          uploadError
        );

        alert(
          `File upload failed: ${uploadError.message}`
        );

        return;
      }

      const {
        error: databaseError,
      } = await supabase
        .from("files")
        .insert({
          chamber_id:
            chamberId,
          uploaded_by:
            user.id,
          file_name:
            file.name,
          file_url:
            filePath,
          file_type:
            file.type || null,
          file_size:
            file.size,
        });

      if (databaseError) {
        console.error(
          "FILE DATABASE ERROR:",
          databaseError
        );

        await supabase.storage
          .from("chamber-files")
          .remove([
            filePath,
          ]);

        alert(
          `File information could not be saved: ${databaseError.message}`
        );

        return;
      }

      alert(
        "File uploaded successfully."
      );

      await loadFiles();
    } catch (error) {
      console.error(
        "UPLOAD ERROR:",
        error
      );

      alert(
        "Something went wrong while uploading the file."
      );
    } finally {
      setUploadingFile(false);
      event.target.value = "";
    }
  }

  async function openFile(
    file: ChamberFile
  ) {
    try {
      const {
        data,
        error,
      } = await supabase.storage
        .from("chamber-files")
        .createSignedUrl(
          file.file_url,
          60 * 60
        );

      if (error) {
        console.error(
          "SIGNED URL ERROR:",
          error
        );

        alert(
          "Could not open this file."
        );

        return;
      }

      if (data?.signedUrl) {
        window.open(
          data.signedUrl,
          "_blank"
        );
      }
    } catch (error) {
      console.error(
        "OPEN FILE ERROR:",
        error
      );

      alert(
        "Could not open this file."
      );
    }
  }

  async function deleteFile(
    file: ChamberFile
  ) {
    if (
      file.uploaded_by !==
      currentUserId
    ) {
      alert(
        "You can only delete files you uploaded."
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Delete "${file.file_name}"?`
      );

    if (!confirmed) return;

    try {
      const {
        error: storageError,
      } = await supabase.storage
        .from("chamber-files")
        .remove([
          file.file_url,
        ]);

      if (storageError) {
        console.error(
          "DELETE STORAGE ERROR:",
          storageError
        );

        alert(
          "Could not delete the file."
        );

        return;
      }

      const {
        error: databaseError,
      } = await supabase
        .from("files")
        .delete()
        .eq(
          "id",
          file.id
        );

      if (databaseError) {
        console.error(
          "DELETE FILE DATABASE ERROR:",
          databaseError
        );

        alert(
          "File was removed from storage but its record could not be deleted."
        );

        return;
      }

      await loadFiles();
    } catch (error) {
      console.error(
        "DELETE FILE ERROR:",
        error
      );

      alert(
        "Something went wrong while deleting the file."
      );
    }
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

    if (
      size <
      1024 * 1024
    ) {
      return `${(
        size / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      size /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }

  function getFileIcon(
    type: string | null
  ) {
    if (!type) return "📄";

    if (type.includes("pdf")) {
      return "📕";
    }

    if (
      type.includes("word") ||
      type.includes("document")
    ) {
      return "📘";
    }

    if (
      type.includes("spreadsheet") ||
      type.includes("excel")
    ) {
      return "📗";
    }

    if (
      type.includes("presentation") ||
      type.includes("powerpoint")
    ) {
      return "📙";
    }

    if (
      type.startsWith("image/")
    ) {
      return "🖼️";
    }

    if (
      type.startsWith("video/")
    ) {
      return "🎬";
    }

    if (
      type.startsWith("audio/")
    ) {
      return "🎵";
    }

    return "📄";
  }

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

      setActiveCall(
        data || null
      );
    } catch (error) {
      console.error(
        "LOAD ACTIVE CALL ERROR:",
        error
      );

      setActiveCall(null);
    }
  }

  async function startCall() {
    if (callLoading) return;

    try {
      setCallLoading(true);

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

      if (existingCall) {
        setActiveCall(
          existingCall
        );

        router.push(
          `/voice/${chamberId}`
        );

        return;
      }

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
          status:
            "active",
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

  function joinCall() {
    if (!activeCall) return;

    router.push(
      `/voice/${chamberId}`
    );
  }

  function handleSectionChange(
    section: ChamberSection
  ) {
    setActiveSection(section);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <p className="text-xl font-semibold text-white">
          Loading Chamber...
        </p>
      </main>
    );
  }

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

      <section className="flex min-w-0 flex-1 flex-col">

        <div className="flex items-center justify-between border-b border-slate-800">

          <Topbar />

          <button
            type="button"
            onClick={() =>
              setShowSidebar(
                (value) => !value
              )
            }
            className="mr-4 rounded-xl bg-slate-800 px-4 py-3 text-white transition hover:bg-slate-700"
            title={
              showSidebar
                ? "Collapse sidebar"
                : "Open sidebar"
            }
          >
            ☰
          </button>

        </div>

        <div className="flex items-center justify-between gap-6 px-8 pt-6">

          <div className="min-w-0">

            <h1 className="truncate text-3xl font-bold text-white">
              {chamber.chamber_name}
            </h1>

            <p className="mt-2 truncate text-slate-400">
              {chamber.description}
            </p>

          </div>

          <div className="flex shrink-0 items-center gap-3">

            {!activeCall && (
              <button
                type="button"
                onClick={
                  startCall
                }
                disabled={
                  callLoading
                }
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-lg transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                📞

                <span>
                  {callLoading
                    ? "Starting..."
                    : "Start Call"}
                </span>
              </button>
            )}

            {activeCall &&
              !isCallStarter && (
                <button
                  type="button"
                  onClick={
                    joinCall
                  }
                  className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white shadow-lg transition hover:bg-green-700"
                >
                  📞

                  <span>
                    Join Call
                  </span>
                </button>
              )}

            {activeCall &&
              isCallStarter && (
                <button
                  type="button"
                  onClick={
                    joinCall
                  }
                  className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white shadow-lg transition hover:bg-red-700"
                >
                  🔴

                  <span>
                    Call Ongoing
                  </span>
                </button>
              )}

            <button
              type="button"
              onClick={() =>
                setShowAI(
                  (value) => !value
                )
              }
              className={
                showAI
                  ? "rounded-xl bg-purple-600 px-4 py-3 font-semibold text-white hover:bg-purple-700"
                  : "rounded-xl bg-slate-800 px-4 py-3 font-semibold text-white hover:bg-slate-700"
              }
            >
              ✨ AI
            </button>

          </div>

        </div>

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

        <div className="mt-6 flex min-h-0 flex-1 overflow-hidden">

          <div className="min-w-0 flex-1 overflow-hidden">

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
              <div className="h-full overflow-y-auto p-6">

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

                  <div className="flex items-center justify-between">

                    <div>

                      <h2 className="text-2xl font-bold text-white">
                        Members
                      </h2>

                      <p className="mt-2 text-slate-400">
                        {members.length}{" "}
                        {members.length === 1
                          ? "member"
                          : "members"}{" "}
                        in this Chamber.
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={
                        loadMembers
                      }
                      className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                    >
                      Refresh
                    </button>

                  </div>

                  <div className="mt-6 space-y-3">

                    {members.length ===
                    0 ? (
                      <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center">

                        <p className="text-slate-400">
                          No members found.
                        </p>

                      </div>
                    ) : (
                      members.map(
                        (member) => {

                          const name =
                            getProfileName(
                              member.user_id
                            );

                          return (
                            <div
                              key={
                                member.id
                              }
                              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-4"
                            >

                              <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                                  {getInitials(
                                    name
                                  )}
                                </div>

                                <div>

                                  <p className="font-medium text-white">
                                    {name}
                                  </p>

                                  <p className="text-xs text-slate-500">
                                    Chamber Member
                                  </p>

                                </div>

                              </div>

                              <span
                                className={
                                  member.role
                                    .toLowerCase()
                                    .includes(
                                      "admin"
                                    ) ||
                                  member.role
                                    .toLowerCase()
                                    .includes(
                                      "owner"
                                    )
                                    ? "rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400"
                                    : "rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300"
                                }
                              >
                                {member.role}
                              </span>

                            </div>
                          );
                        }
                      )
                    )}

                  </div>

                </div>

              </div>
            )}

            {activeSection ===
              "files" && (
              <div className="h-full overflow-y-auto p-6">

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

                  <div className="flex items-center justify-between gap-4">

                    <div>

                      <h2 className="text-2xl font-bold text-white">
                        Files
                      </h2>

                      <p className="mt-2 text-slate-400">
                        Share documents and files with Chamber members.
                      </p>

                    </div>

                    <label className="cursor-pointer rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700">

                      {uploadingFile
                        ? "Uploading..."
                        : "Upload File"}

                      <input
                        type="file"
                        className="hidden"
                        disabled={
                          uploadingFile
                        }
                        onChange={
                          handleFileUpload
                        }
                      />

                    </label>

                  </div>

                  <div className="mt-8">

                    {filesLoading ? (
                      <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-8 text-center">

                        <p className="text-slate-400">
                          Loading files...
                        </p>

                      </div>
                    ) : files.length ===
                      0 ? (
                      <div className="rounded-xl border border-dashed border-slate-700 p-10 text-center">

                        <div className="text-4xl">
                          📁
                        </div>

                        <p className="mt-4 font-medium text-white">
                          No files yet
                        </p>

                        <p className="mt-2 text-sm text-slate-500">
                          Upload the first file to this Chamber.
                        </p>

                      </div>
                    ) : (
                      <div className="space-y-3">

                        {files.map(
                          (file) => (
                            <div
                              key={
                                file.id
                              }
                              className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4"
                            >

                              <div className="flex min-w-0 items-center gap-4">

                                <div className="text-3xl">
                                  {getFileIcon(
                                    file.file_type
                                  )}
                                </div>

                                <div className="min-w-0">

                                  <p className="truncate font-medium text-white">
                                    {file.file_name}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-500">
                                    {formatFileSize(
                                      file.file_size
                                    )}
                                    {" • "}
                                    {new Date(
                                      file.created_at
                                    ).toLocaleDateString()}
                                  </p>

                                </div>

                              </div>

                              <div className="flex shrink-0 items-center gap-2">

                                <button
                                  type="button"
                                  onClick={() =>
                                    openFile(
                                      file
                                    )
                                  }
                                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                                >
                                  Open
                                </button>

                                {file.uploaded_by ===
                                  currentUserId && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      deleteFile(
                                        file
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

          </div>

          {showAI && (
            <aside className="w-[360px] shrink-0 overflow-hidden border-l border-slate-800">
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
            </aside>
          )}

        </div>

      </section>

    </main>
  );
}