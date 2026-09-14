"use client";

import { useEffect, useState } from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { supabase } from "@/lib/supabase";

interface JaasCallProps {
  chamberId: string;
  roomName: string;
  onLeave?: () => void;
}

export default function JaasCall({
  chamberId,
  roomName,
  onLeave,
}: JaasCallProps) {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [currentUserId, setCurrentUserId] = useState("");
  const [displayName, setDisplayName] = useState("");

  const appId =
    "vpaas-magic-cookie-f78222245d8e45b8b47402dd57660eac";

  /*
   * JaaS expects the App ID before the room name.
   *
   * Example:
   * vpaas-magic-cookie-.../chamber-abc-123456789
   */
  const jaasRoomName = `${appId}/${roomName}`;

  /*
   * Get the currently logged-in user
   * and resolve their real name.
   */
  useEffect(() => {
    let cancelled = false;

    async function getCurrentUser() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error(
            "GET AUTH USER ERROR:",
            userError
          );
        }

        if (!user) {
          if (!cancelled) {
            setError(
              "You must be signed in to join this call."
            );
          }

          return;
        }

        if (!cancelled) {
          setCurrentUserId(user.id);
        }

        /*
         * First choice:
         * Get the user's real name from profiles.
         */
        const {
          data: profile,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error(
            "PROFILE NAME ERROR:",
            profileError
          );
        }

        if (
          profile?.full_name &&
          profile.full_name.trim()
        ) {
          if (!cancelled) {
            setDisplayName(
              profile.full_name.trim()
            );
          }

          return;
        }

        /*
         * Second choice:
         * Supabase authentication metadata.
         */
        const metadataName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name;

        if (
          typeof metadataName === "string" &&
          metadataName.trim()
        ) {
          if (!cancelled) {
            setDisplayName(
              metadataName.trim()
            );
          }

          return;
        }

        /*
         * Third choice:
         * Use the email username.
         */
        if (user.email) {
          const emailName =
            user.email.split("@")[0];

          if (!cancelled) {
            setDisplayName(emailName);
          }

          return;
        }

        /*
         * We should almost never reach this.
         */
        if (!cancelled) {
          setDisplayName("Chamber User");
        }
      } catch (error) {
        console.error(
          "GET CURRENT USER ERROR:",
          error
        );

        if (!cancelled) {
          setError(
            "Unable to identify your Chamber account."
          );
        }
      }
    }

    getCurrentUser();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Generate the JaaS token after we know:
   *
   * 1. The user's real name
   * 2. The user's Supabase ID
   * 3. The correct Chamber room
   */
  useEffect(() => {
    if (!displayName || !currentUserId) {
      return;
    }

    let cancelled = false;

    async function getToken() {
      try {
        setError("");
        setToken(null);

        const response = await fetch(
          "/api/jaas-token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              roomName: jaasRoomName,
              participantName: displayName,
              participantId: currentUserId,
            }),
          }
        );

        const result = await response.json();

        console.log(
          "JAAS TOKEN RESPONSE:",
          result
        );

        if (!response.ok) {
          throw new Error(
            result?.error ||
              "Unable to create JaaS token."
          );
        }

        if (!result?.token) {
          throw new Error(
            "JaaS server did not return a token."
          );
        }

        if (!cancelled) {
          setToken(result.token);
        }
      } catch (err) {
        console.error(
          "JAAS TOKEN ERROR:",
          err
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to connect to Chamber call."
          );
        }
      }
    }

    getToken();

    return () => {
      cancelled = true;
    };
  }, [
    jaasRoomName,
    displayName,
    currentUserId,
  ]);

  /*
   * End the Chamber call in Supabase.
   *
   * Only the person who originally started
   * the call should mark it as ended.
   */
  async function endChamberCall() {
    try {
      if (!currentUserId) {
        console.log(
          "No current user ID. Cannot determine call starter."
        );

        return;
      }

      console.log(
        "ENDING CHAMBER CALL FOR USER:",
        currentUserId
      );

      const {
        data: activeCall,
        error: findError,
      } = await supabase
        .from("chamber_calls")
        .select(
          "id, chamber_id, room_name, started_by, status"
        )
        .eq("chamber_id", chamberId)
        .eq("started_by", currentUserId)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      if (findError) {
        console.error(
          "FIND ACTIVE CALL ERROR:",
          findError
        );

        return;
      }

      /*
       * If no call belongs to this user,
       * they are simply a participant.
       */
      if (!activeCall) {
        console.log(
          "No active call owned by this user."
        );

        return;
      }

      const {
        error: updateError,
      } = await supabase
        .from("chamber_calls")
        .update({
          status: "ended",
        })
        .eq("id", activeCall.id);

      if (updateError) {
        console.error(
          "END CHAMBER CALL ERROR:",
          updateError
        );

        return;
      }

      console.log(
        "CHAMBER CALL SUCCESSFULLY ENDED:",
        activeCall.id
      );
    } catch (error) {
      console.error(
        "END CHAMBER CALL EXCEPTION:",
        error
      );
    }
  }

  /*
   * JaaS has closed.
   */
  async function handleReadyToClose() {
    console.log(
      "JAAS CALL CLOSED. CHECKING WHETHER USER STARTED THE CALL..."
    );

    await endChamberCall();

    if (onLeave) {
      onLeave();
    }
  }

  /*
   * Display an error.
   */
  if (error) {
    return (
      <div className="flex min-h-[500px] items-center justify-center rounded-2xl bg-slate-950 p-8 text-center">
        <div>
          <div className="text-5xl">
            ⚠️
          </div>

          <h2 className="mt-4 text-2xl font-bold text-white">
            Call Connection Failed
          </h2>

          <p className="mt-3 text-slate-400">
            {error}
          </p>

          <button
            type="button"
            onClick={onLeave}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Back to Chamber
          </button>
        </div>
      </div>
    );
  }

  /*
   * Wait while the user identity
   * and JaaS token are being prepared.
   */
  if (!token) {
    return (
      <div className="flex min-h-[500px] items-center justify-center rounded-2xl bg-slate-950">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

          <p className="mt-4 text-slate-400">
            Connecting to Chamber call...
          </p>

          {displayName && (
            <p className="mt-2 text-sm text-slate-500">
              Joining as {displayName}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[600px] w-full overflow-hidden rounded-2xl bg-slate-950">
      <JitsiMeeting
        domain="8x8.vc"
        roomName={jaasRoomName}
        jwt={token}
        configOverwrite={{
          startWithAudioMuted: false,
          startWithVideoMuted: true,

          disableModeratorIndicator: true,

          prejoinConfig: {
            enabled: false,
          },
        }}
        interfaceConfigOverwrite={{
          TOOLBAR_BUTTONS: [
            "microphone",
            "camera",
            "desktop",
            "chat",
            "raisehand",
            "tileview",
            "hangup",
          ],

          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
        }}
        userInfo={{
          /*
           * This is the real name that will
           * appear to other participants.
           */
          displayName: displayName,

          /*
           * Use the Supabase user ID as the
           * stable identity behind the participant.
           */
          email: `${currentUserId}@chamber.local`,
        }}
        getIFrameRef={(iframeRef) => {
          iframeRef.style.height = "600px";
          iframeRef.style.width = "100%";
          iframeRef.style.border = "0";
        }}
        onReadyToClose={handleReadyToClose}
      />
    </div>
  );
}