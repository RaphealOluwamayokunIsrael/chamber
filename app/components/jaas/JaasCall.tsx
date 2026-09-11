"use client";

import { useEffect, useState } from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { supabase } from "@/lib/supabase";

interface JaasCallProps {
  chamberId: string;
  participantName?: string;
  onLeave?: () => void;
}

export default function JaasCall({
  chamberId,
  participantName = "Chamber User",
  onLeave,
}: JaasCallProps) {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [currentUserId, setCurrentUserId] = useState("");
  const [displayName, setDisplayName] = useState("");

  const appId =
    "vpaas-magic-cookie-f78222245d8e45b8b47402dd57660eac";

  const roomName = `${appId}/${chamberId}`;

  /*
   * Get the currently logged-in user
   * and resolve their real Chamber name.
   */
  useEffect(() => {
    async function getCurrentUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setDisplayName(participantName);
          return;
        }

        setCurrentUserId(user.id);

        /*
         * Get the user's real name from the profiles table.
         */
        const { data: profile, error: profileError } =
          await supabase
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

        if (profile?.full_name?.trim()) {
          setDisplayName(profile.full_name.trim());
          return;
        }

        /*
         * Fallback to Supabase auth metadata.
         */
        const metadataName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name;

        if (
          typeof metadataName === "string" &&
          metadataName.trim()
        ) {
          setDisplayName(metadataName.trim());
          return;
        }

        /*
         * Final fallback.
         */
        if (user.email) {
          setDisplayName(
            user.email.split("@")[0]
          );
          return;
        }

        setDisplayName(participantName);
      } catch (error) {
        console.error(
          "GET CURRENT USER ERROR:",
          error
        );

        setDisplayName(participantName);
      }
    }

    getCurrentUser();
  }, [participantName]);

  /*
   * Generate the JaaS token only after
   * the participant name has been resolved.
   */
  useEffect(() => {
    if (!displayName) {
      return;
    }

    let cancelled = false;

    async function getToken() {
      try {
        setError("");

        const response = await fetch("/api/jaas-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomName,
            participantName: displayName,
          }),
        });

        const result = await response.json();

        console.log("JAAS TOKEN RESPONSE:", result);

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
  }, [roomName, displayName]);

  /*
   * End the Chamber call in Supabase.
   *
   * IMPORTANT:
   * Only the person who started the call
   * should mark the call as ended.
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

      /*
       * Find the active call started by this user.
       */
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
       * There is no active call started by
       * this user.
       *
       * This normally means this user is
       * simply joining somebody else's call.
       */
      if (!activeCall) {
        console.log(
          "No active call owned by this user."
        );

        return;
      }

      /*
       * End the call.
       */
      const { error: updateError } =
        await supabase
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
   * JaaS is ready to close.
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

  if (error) {
    return (
      <div className="flex min-h-[500px] items-center justify-center rounded-2xl bg-slate-950 p-8 text-center">
        <div>
          <div className="text-5xl">⚠️</div>

          <h2 className="mt-4 text-2xl font-bold text-white">
            Call Connection Failed
          </h2>

          <p className="mt-3 text-slate-400">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex min-h-[500px] items-center justify-center rounded-2xl bg-slate-950">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

          <p className="mt-4 text-slate-400">
            Connecting to Chamber call...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[600px] w-full overflow-hidden rounded-2xl bg-slate-950">
      <JitsiMeeting
        domain="8x8.vc"
        roomName={roomName}
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
          displayName: displayName,

          email: `${displayName
            .toLowerCase()
            .replace(/\s+/g, ".")}@chamber.local`,
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
