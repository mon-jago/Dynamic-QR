import { redirect } from "next/navigation";
import { verifyQrToken } from "@/lib/qr-token";
import VenueQrDisplay from "@/modules/venue-qr/venue-qr-display";

export const dynamic = "force-dynamic";

type QrPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function QrRedirectPage({
  searchParams,
}: QrPageProps) {
  const { token } = await searchParams;

  // Jika tidak ada query token, tampilkan Venue QR Display
  if (!token) {
    return <VenueQrDisplay />;
  }

  const payload = verifyQrToken(token);

  if (!payload) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-900 text-white text-center">
        <h1 className="text-2xl font-bold text-red-400 mb-2">
          QR code sudah kedaluwarsa
        </h1>
        <p className="text-sm text-slate-300">
          Silakan scan QR code terbaru yang tampil di venue.
        </p>
      </main>
    );
  }

  redirect(payload.destination);
}
