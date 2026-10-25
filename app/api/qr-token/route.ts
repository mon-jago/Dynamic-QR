import { NextRequest, NextResponse } from "next/server";
import { createQrToken, isValidDestination } from "@/lib/qr-token";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const destination = requestUrl.searchParams.get("destination")?.trim();

  // Mode 1: Jika ada destination parameter (backward-compatible prototype)
  if (destination) {
    if (!isValidDestination(destination)) {
      return NextResponse.json(
        { error: "Destination harus berupa URL http atau https." },
        { status: 400 }
      );
    }

    const token = createQrToken(destination);
    const appOrigin = process.env.NEXT_PUBLIC_APP_URL ?? requestUrl.origin;
    const redirectUrl = new URL("/qr", appOrigin);
    redirectUrl.searchParams.set("token", token);

    return NextResponse.json(
      { url: redirectUrl.toString() },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }

  // Mode 2: Dynamic Venue QR Token untuk Porquest
  const backendUrl =
    process.env.BACKEND_INTERNAL_URL || "https://api.porsenggg.my.id";
  const staffApiKey =
    process.env.STAFF_API_KEY || "sk-yang-penting-dompet-tebel";

  let authHeader = request.headers.get("authorization");
  if (!authHeader) {
    const cookieToken = request.cookies.get("token")?.value;
    if (cookieToken) {
      authHeader = `Bearer ${cookieToken}`;
    } else if (process.env.STAFF_BEARER_TOKEN) {
      authHeader = `Bearer ${process.env.STAFF_BEARER_TOKEN}`;
    }
  }

  const headers: Record<string, string> = {
    "X-Staff-Api-Key": staffApiKey,
    "Content-Type": "application/json",
  };

  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  try {
    const response = await fetch(`${backendUrl}/api/display/venue/qr-token`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const data = await response.json();
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch venue qr token",
        },
      },
      { status: 500 }
    );
  }
}
