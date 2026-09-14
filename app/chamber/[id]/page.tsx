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

  const [members, setMembers] = useState<Member[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  const [files, setFiles] = useState<ChamberFile[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const [showSidebar, setShowSidebar] = useState(false);

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
    if (!authorized || !chamberId) return;

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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authorized, chamberId]);

  useEffect(() => {
    if (!authorized || !chamberId) return;

    loadMembers();
  }, [authorized, chamberId]);

  useEffect(() => {
    if (!authorized || !chamberId) return;

    loadFiles();
  }, [authorized, chamberId]);

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

      if (membershipError) {
        console.error(
          "Membership check error:",
          membershipError
        );

        setAuthorized(false);
        return;
      }

      if (!membership) {
        setAuthorized(false);
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
        .maybeSingle();

      if (chamberError) {
        console.error(
          "Chamber loading error:",
          chamberError
        );

        setAuthorized(false);
        return;
      }

      if (!chamberData) {
        setAuthorized(true);
        setChamber(null);
        return;
      }

      setChamber(chamberData);
      setAuthorized(true);
    } catch (error) {
      console.error(
        "Unexpected chamber loading error:",
        error
      );

      setAuthorized(false);
    } finally {
      setLoading(false);
    }
  }

  async function loadActiveCall() {
    try {
      const { data, error } = await supabase
        .from("chamber_calls")
        .select("*")
        .eq("chamber_id", chamberId)
        .eq("status", "active")
        .order("created_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error(
          "Error loading active call:",
          error
        );

        return;
      }

      setActiveCall(data);
    } catch (error) {
      console.error(
        "Unexpected call loading error:",
        error
      );
    }
  }

  async function loadMembers() {
    try {
      const {
        data: membersData,
        error: membersError,
      } = await supabase
        .from("members")
        .select("id, user_id, role")
        .eq("chamber_id", chamberId);

      if (membersError) {
        console.error(
          "Error loading members:",
          membersError
        );

        return;
      }

      const loadedMembers =
        (membersData || []) as Member[];

      setMembers(loadedMembers);

      const userIds = loadedMembers.map(
        (member) => member.user_id
      );

      if (userIds.length === 0) {
        setProfiles([]);
        return;
      }

      const {
        data: profilesData,
        error: profilesError,
      } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      if (profilesError) {
        console.error(
          "Error loading profiles:",
          profilesError
        );

        return;
      }

      setProfiles(
        (profilesData || []) as Profile[]
      );
    } catch (error) {
      console.error(
        "Unexpected member loading error:",
        error
      );
    }
  }

  async function loadFiles() {
    try {
      setFilesLoading(true);

      const { data, error } = await supabase
        .from("chamber_files")
        .select("*")
        .eq("chamber_id", chamberId)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "Error loading files:",
          error
        );

        return;
      }

      setFiles(
        (data || []) as ChamberFile[]
      );
    } catch (error) {
      console.error(
        "Unexpected file loading error:",
        error
      );
    } finally {
      setFilesLoading(false);
    }
  }

  async function startCall() {
    if (!currentUserId) return;

    try {
      setCallLoading(true);

      /*
       * If a call is already active, join the
       * existing Chamber call.
       */
      if (activeCall) {
        router.push(
          `/voice/${chamberId}?room=${encodeURIComponent(
            activeCall.room_name
          )}`
        );

        return;
      }

      /*
       * Create a unique room name for this call.
       */
      const roomName =
        `chamber-${chamberId}-${Date.now()}`;

      const {
        data,
        error,
      } = await supabase
        .from("chamber_calls")
        .insert({
          chamber_id: chamberId,
          room_name: roomName,
          started_by: currentUserId,
          status: "active",
        })
        .select()
        .single();

      if (error) {
        console.error(
          "Error starting call:",
          error
        );

        alert(
          "Unable to start the call. Please try again."
        );

        return;
      }

      setActiveCall(data);

      /*
       * IMPORTANT:
       * The actual voice page is:
       *
       * /voice/[chamberId]
       *
       * NOT:
       *
       * /chamber/[chamberId]/call/[callId]
       */
      router.push(
        `/voice/${chamberId}?room=${encodeURIComponent(
          data.room_name
        )}`
      );
    } catch (error) {
      console.error(
        "Unexpected call error:",
        error
      );

      alert(
        "Something went wrong while starting the call."
      );
    } finally {
      setCallLoading(false);
    }
  }

  function joinActiveCall() {
    if (!activeCall) return;

    router.push(
      `/voice/${chamberId}?room=${encodeURIComponent(
        activeCall.room_name
      )}`
    );
  }

  function getProfileName(userId: string) {
    const profile = profiles.find(
      (item) => item.id === userId
    );

    return (
      profile?.full_name ||
      "Chamber member"
    );
  }

  function formatFileSize(
    bytes: number | null
  ) {
    if (!bytes) return "Unknown size";

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(
        bytes / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      bytes / (1024 * 1024)
    ).toFixed(1)} MB`;
  }

  async function handleFileUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) return;

    try {
      setUploadingFile(true);

      if (!currentUserId) {
        alert(
          "You must be logged in to upload a file."
        );

        return;
      }

      if (
        selectedFile.size >
        10 * 1024 * 1024
      ) {
        alert(
          "File is too large. Maximum size is 10MB."
        );

        return;
      }

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
          "File upload error:",
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
        .getPublicUrl(storagePath);

      const {
        error: databaseError,
      } = await supabase
        .from("chamber_files")
        .insert({
          chamber_id: chamberId,
          uploaded_by: currentUserId,
          file_name: selectedFile.name,
          file_url:
            publicUrlData.publicUrl,
          file_type: selectedFile.type,
          file_size: selectedFile.size,
        });

      if (databaseError) {
        console.error(
          "Database file error:",
          databaseError
        );

        alert(
          "The file was uploaded but could not be saved."
        );

        return;
      }

      event.target.value = "";

      await loadFiles();
    } catch (error) {
      console.error(
        "Unexpected upload error:",
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
    const confirmed = window.confirm(
      `Delete "${file.file_name}"?`
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("chamber_files")
        .delete()
        .eq("id", file.id);

      if (error) {
        console.error(
          "Error deleting file:",
          error
        );

        alert(
          "Unable to delete this file."
        );

        return;
      }

      await loadFiles();
    } catch (error) {
      console.error(
        "Unexpected delete error:",
        error
      );
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-sm">
          Loading Chamber...
        </p>
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold">
            Access denied
          </h1>

          <p className="mt-3 text-sm text-slate-400">
            You are not a member of this Chamber
            or you do not have permission to
            access it.
          </p>

          <button
            onClick={() =>
              router.push("/dashboard")
            }
            className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  if (!chamber) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold">
            Chamber not found
          </h1>

          <button
            onClick={() =>
              router.push("/dashboard")
            }
            className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  const currentChamber = chamber;

  function renderContent() {
    switch (activeSection) {
      case "chat":
        return (
          <Chat
            chamberId={chamberId}
          />
        );

      case "ai":
        return (
          <AIAssistant
            chamberId={chamberId}
            chamberName={
              currentChamber.chamber_name
            }
            chamberDescription={
              currentChamber.description
            }
            memberCount={members.length}
          />
        );

      case "announcements":
        return (
          <Announcements
            chamberId={chamberId}
          />
        );

      case "events":
        return (
          <Events
            chamberId={chamberId}
          />
        );

      case "polls":
        return (
          <Polls
            chamberId={chamberId}
          />
        );

      case "members":
        return (
          <section className="h-full overflow-y-auto p-6">
            <h2 className="text-xl font-bold">
              Members
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {members.length} member
              {members.length === 1
                ? ""
                : "s"} in this Chamber.
            </p>

            <div className="mt-6 space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div>
                    <p className="font-medium">
                      {getProfileName(
                        member.user_id
                      )}
                    </p>

                    <p className="mt-1 text-xs capitalize text-slate-500">
                      {member.role}
                    </p>
                  </div>

                  {member.user_id ===
                    currentUserId && (
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      You
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        );

      case "files":
        return (
          <section className="h-full overflow-y-auto p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Chamber Files
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Share and access important Chamber
                  documents.
                </p>
              </div>

              <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                {uploadingFile
                  ? "Uploading..."
                  : "Upload File"}

                <input
                  type="file"
                  className="hidden"
                  disabled={uploadingFile}
                  onChange={
                    handleFileUpload
                  }
                />
              </label>
            </div>

            <div className="mt-6">
              {filesLoading ? (
                <p className="text-sm text-slate-500">
                  Loading files...
                </p>
              ) : files.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
                  <p className="font-medium">
                    No files yet
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    Upload the first file for
                    this Chamber.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="text-2xl">
                        📄
                      </div>

                      <h3 className="mt-3 truncate font-semibold">
                        {file.file_name}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        {formatFileSize(
                          file.file_size
                        )}
                      </p>

                      <div className="mt-5 flex gap-2">
                        <button
                          onClick={() =>
                            window.open(
                              file.file_url,
                              "_blank"
                            )
                          }
                          className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                          Open
                        </button>

                        {file.uploaded_by ===
                          currentUserId && (
                          <button
                            onClick={() =>
                              deleteFile(file)
                            }
                            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        );

      case "settings":
        return (
          <section className="h-full overflow-y-auto p-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-2xl font-bold">
                Chamber Settings
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Manage settings for this Chamber.
              </p>

              <div className="mt-8 space-y-4">
                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                  <p className="font-semibold">
                    Chamber Name
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {
                      currentChamber.chamber_name
                    }
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                  <p className="font-semibold">
                    Description
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {currentChamber.description ||
                      "No description provided."}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                  <p className="font-semibold">
                    Members
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {members.length} member
                    {members.length === 1
                      ? ""
                      : "s"}
                  </p>
                </div>
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  }

  return (
    <main className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        collapsed={!showSidebar}
        onToggle={() =>
          setShowSidebar(
            (previous) => !previous
          )
        }
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />

        <div className="flex min-h-0 flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white px-6 py-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-bold">
                  {
                    currentChamber.chamber_name
                  }
                </h1>

                {currentChamber.description && (
                  <p className="mt-1 text-sm text-slate-500">
                    {
                      currentChamber.description
                    }
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {activeCall ? (
                  <button
                    onClick={joinActiveCall}
                    className="rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                  >
                    Join Call
                  </button>
                ) : (
                  <button
                    onClick={startCall}
                    disabled={callLoading}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {callLoading
                      ? "Starting..."
                      : "Start Call"}
                  </button>
                )}
              </div>
            </div>
          </header>

          {activeCall && (
            <div className="border-b border-green-200 bg-green-50 px-6 py-3 dark:border-green-900 dark:bg-green-950/30">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                    A Chamber call is currently active
                  </p>

                  <p className="text-xs text-green-700 dark:text-green-400">
                    Join the ongoing conversation.
                  </p>
                </div>

                <button
                  onClick={joinActiveCall}
                  className="rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700"
                >
                  Join
                </button>
              </div>
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-hidden">
            {renderContent()}
          </div>
        </div>
      </div>
    </main>
  );
}