import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function base64UrlEncode(input: string | Buffer): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function createJwt(
  payload: Record<string, unknown>,
  privateKey: string,
  keyId: string
): string {
  const header = {
    alg: "RS256",
    kid: keyId,
    typ: "JWT",
  };

  const encodedHeader = base64UrlEncode(
    JSON.stringify(header)
  );

  const encodedPayload = base64UrlEncode(
    JSON.stringify(payload)
  );

  const unsignedToken =
    `${encodedHeader}.${encodedPayload}`;

  const signer = crypto.createSign("RSA-SHA256");

  signer.update(unsignedToken);
  signer.end();

  const signature = signer.sign(privateKey);

  return `${unsignedToken}.${base64UrlEncode(
    signature
  )}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const roomName = body?.roomName;

    const participantName =
      body?.participantName || "Chamber User";

    const participantId =
      body?.participantId || crypto.randomUUID();

    if (!roomName) {
      return NextResponse.json(
        {
          error: "roomName is required.",
        },
        { status: 400 }
      );
    }

    const appId = process.env.JAAS_APP_ID;
    const keyId = process.env.JAAS_KEY_ID;
    const privateKey = process.env.JAAS_PRIVATE_KEY;

    if (!appId) {
      return NextResponse.json(
        {
          error: "JAAS_APP_ID is not configured.",
        },
        { status: 500 }
      );
    }

    if (!keyId) {
      return NextResponse.json(
        {
          error: "JAAS_KEY_ID is not configured.",
        },
        { status: 500 }
      );
    }

    if (!privateKey) {
      return NextResponse.json(
        {
          error: "JAAS_PRIVATE_KEY is not configured.",
        },
        { status: 500 }
      );
    }

    // Convert literal "\n" into real line breaks.
    const formattedPrivateKey =
      privateKey.replace(/\\n/g, "\n");

    /*
     * The frontend sends the room name as:
     *
     * APP_ID/ROOM_NAME
     *
     * The JWT "room" claim must contain
     * only ROOM_NAME.
     */
    const expectedPrefix = `${appId}/`;

    if (!roomName.startsWith(expectedPrefix)) {
      return NextResponse.json(
        {
          error:
            "Invalid JaaS room name. The room must belong to this App ID.",
        },
        { status: 400 }
      );
    }

    const jaasRoomName =
      roomName.substring(expectedPrefix.length);

    if (!jaasRoomName) {
      return NextResponse.json(
        {
          error: "JaaS room name cannot be empty.",
        },
        { status: 400 }
      );
    }

    const now = Math.floor(
      Date.now() / 1000
    );

    const payload = {
      aud: "jitsi",

      exp: now + 60 * 60,

      iss: "chat",

      nbf: now - 10,

      sub: appId,

      room: jaasRoomName,

      context: {
        user: {
          id: participantId,
          name: participantName,
          email: `${participantId}@chamber.local`,
          moderator: "false",
        },

        features: {
          livestreaming: false,
          recording: false,
          transcription: false,
          "sip-inbound-call": false,
          "sip-outbound-call": false,
          "inbound-call": false,
          "outbound-call": false,
          "file-upload": false,
        },
      },
    };

    const token = createJwt(
      payload,
      formattedPrivateKey,
      keyId
    );

    console.log(
      "JAAS JWT ROOM:",
      jaasRoomName
    );

    console.log(
      "JAAS SDK ROOM:",
      roomName
    );

    console.log(
      "JAAS PARTICIPANT:",
      participantId
    );

    return NextResponse.json({
      token,
      appId,
      roomName,
      jaasRoomName,
      participantId,
    });
  } catch (error) {
    console.error(
      "JAAS TOKEN ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to generate JaaS token.",
      },
      { status: 500 }
    );
  }
}