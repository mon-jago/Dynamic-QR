import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export interface VenueQrTokenResponse {
  success: boolean;
  data?: {
    token: string;
    expires_in_seconds: number;
    refresh_interval_seconds: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const backendUrl =
      process.env.BACKEND_INTERNAL_URL || "https://api.porsenggg.my.id";
    const staffApiKey =
      process.env.STAFF_API_KEY || "sk-yang-penting-dompet-tebel";

    // 1. Ambil session token (Bearer token / Cookie / Fallback staff token)
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

    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      headers["Cookie"] = cookieHeader;
    }

    const response = await fetch(`${backendUrl}/api/display/venue/qr-token`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const data: VenueQrTokenResponse = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Error fetching venue qr token:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Gagal mengambil venue QR token dari backend.",
        },
      },
      { status: 500 }
    );
  }
}
