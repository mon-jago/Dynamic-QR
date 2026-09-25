import { redirect } from "next/navigation";
import { verifyQrToken } from "@/lib/qr-token";

export const dynamic = "force-dynamic";

type QrPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function QrRedirectPage({
  searchParams,
}: QrPageProps) {
  const { token } = await searchParams;
  const payload = token ? verifyQrToken(token) : null;

  if (!payload) {
    return (
      <main>
        <h1>QR code sudah kedaluwarsa</h1>
        <p>Silakan scan QR code terbaru.</p>
      </main>
    );
  }

  redirect(payload.destination);
}
