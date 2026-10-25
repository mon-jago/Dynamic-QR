import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const backendUrl =
      process.env.BACKEND_INTERNAL_URL || "https://api.porsenggg.my.id";
    const body = await request.json();
    const token = body?.token;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_FAILED",
            message: "Token wajib disertakan.",
          },
        },
        { status: 400 }
      );
    }

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
      "Content-Type": "application/json",
    };

    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      headers["Cookie"] = cookieHeader;
    }

    const response = await fetch(`${backendUrl}/api/quests/venue/scan`, {
      method: "POST",
      headers,
      body: JSON.stringify({ token: token.trim() }),
      cache: "no-store",
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error submitting test scan:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Gagal submit scan ke backend.",
        },
      },
      { status: 500 }
    );
  }
}
