import { createQrToken, isValidDestination } from "@/lib/qr-token";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const destination = requestUrl.searchParams.get("destination")?.trim();

  if (!destination || !isValidDestination(destination)) {
    return Response.json(
      { error: "Destination harus berupa URL http atau https." },
      { status: 400 },
    );
  }

  const token = createQrToken(destination);
  const appOrigin = process.env.NEXT_PUBLIC_APP_URL ?? requestUrl.origin;
  const redirectUrl = new URL("/qr", appOrigin);
  redirectUrl.searchParams.set("token", token);

  return Response.json(
    { url: redirectUrl.toString() },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
