import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND_URL =
  process.env.BACKEND_INTERNAL_URL || "https://api.porsenggg.my.id";
const STAFF_API_KEY =
  process.env.STAFF_API_KEY || "sk-yang-penting-dompet-tebel";

// Fallback staff session token bawaan (berlaku tahun 2026+)
const DEFAULT_STAFF_TOKEN =
  process.env.STAFF_BEARER_TOKEN ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMDFhMTczYzktYTc1MS03MDkyLWEzYWItOTM2MzMzZDZhMTU5IiwiZW1haWwiOiJzdGFmZjE3OTI5NDM5NTY5MDJAbWFpbC51Z20uYWMuaWQiLCJ0b2tlbl92ZXJzaW9uIjoxLCJpc3MiOiJwcmFic3NzIiwiZXhwIjoxNzkzMDMwMzU3LCJuYmYiOjE3OTI5NDM5NTcsImlhdCI6MTc5Mjk0Mzk1N30.TDN2qXjR_eq0SFx2uPTeJEm3mwr0E5DL05O82mtLsX4";

let cachedAutoToken = DEFAULT_STAFF_TOKEN;

async function requestFreshToken(): Promise<string | null> {
  try {
    const rand = Math.floor(100000 + Math.random() * 900000);
    const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: `display_${rand}`,
        nim: `24/${rand}/TK/${Math.floor(10000 + Math.random() * 90000)}`,
        email: `display${rand}@mail.ugm.ac.id`,
        password: "Password123!",
        fakultas: "Fakultas Biologi",
        karakter: "nares",
        avatar_head: "anjing",
      }),
    });
    const json = await res.json();
    if (res.ok && json.success && json.data?.token) {
      cachedAutoToken = json.data.token;
      return json.data.token;
    }
  } catch (err) {
    console.error("Gagal auto-register session:", err);
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    // 1. Tentukan bearer auth (dari request header, cookie, atau fallback token)
    let authHeader = request.headers.get("authorization");
    if (!authHeader) {
      const cookieToken = request.cookies.get("token")?.value;
      if (cookieToken) {
        authHeader = `Bearer ${cookieToken}`;
      } else {
        authHeader = `Bearer ${cachedAutoToken}`;
      }
    }

    const headers: Record<string, string> = {
      "X-Staff-Api-Key": STAFF_API_KEY,
      "Content-Type": "application/json",
    };

    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    let response = await fetch(`${BACKEND_URL}/api/display/venue/qr-token`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    // Jika 401 Unauthorized, otomatis request sesi baru lalu retry 1x
    if (response.status === 401) {
      const freshToken = await requestFreshToken();
      if (freshToken) {
        headers["Authorization"] = `Bearer ${freshToken}`;
        response = await fetch(`${BACKEND_URL}/api/display/venue/qr-token`, {
          method: "GET",
          headers,
          cache: "no-store",
        });
      }
    }

    const data = await response.json();

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
