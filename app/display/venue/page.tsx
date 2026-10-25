import VenueQrDisplay from "@/modules/venue-qr/venue-qr-display";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Venue Check-In QR Code | Porsenigama 2026",
  description: "Dynamic QR Code generator for Porquest Venue Check-In",
};

export const dynamic = "force-dynamic";

export default function VenueDisplayPage() {
  return <VenueQrDisplay />;
}
