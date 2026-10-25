import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
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
        "Cache-Control": "no-store, no-cache, must-revalidate",
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
