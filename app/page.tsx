"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

export default function Home() {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const isFetchingRef = useRef<boolean>(false);

  const fetchVenueQrToken = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const res = await fetch("/api/display/venue/qr-token", {
        cache: "no-store",
      });
      const json = await res.json();
      if (res.ok && json.success && json.data?.token) {
        const dataUrl = await QRCode.toDataURL(json.data.token, {
          width: 480,
          margin: 1,
          color: {
            dark: "#061938",
            light: "#ffffff",
          },
        });
        setQrDataUrl(dataUrl);
      }
    } catch (err) {
      console.warn("Gagal refresh dynamic QR token:", err);
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    void (async () => {
      if (!ignore) {
        await fetchVenueQrToken();
      }
    })();

    // Refresh otomatis setiap 25 detik (TOTP TTL = 30 detik)
    const interval = setInterval(() => {
      fetchVenueQrToken();
    }, 25000);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [fetchVenueQrToken]);

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[#aee2ff] p-2 sm:p-4 md:p-6 overflow-hidden select-none">
      {/* Container utama dengan rasio gambar 1512 : 982 */}
      <div className="relative w-full max-w-[1200px] aspect-[1512/982] max-h-[96dvh] flex items-center justify-center shadow-2xl rounded-2xl md:rounded-3xl overflow-hidden bg-white">
        {/* Gambar Background Resmi */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/venue-bg.png"
          alt="Venue Check In Porquest"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
        />

        {/* Kotak QR Code yang tepat berada di dalam border kotak putih background */}
        {/* Koordinat presisi berdasarkan 1512x982: top 42.67%, left 37.76%, width 24.47%, height 37.58% */}
        <div
          className="absolute z-10 flex items-center justify-center p-1 sm:p-2 overflow-hidden"
          style={{
            top: "42.67%",
            left: "37.76%",
            width: "24.47%",
            height: "37.58%",
          }}
        >
          {qrDataUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={qrDataUrl}
              alt="Dynamic QR Code Venue Check-In"
              className="w-full h-full object-contain animate-in fade-in duration-300"
            />
          ) : (
            <div className="size-8 sm:size-12 border-4 border-[#061938] border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      </div>
    </main>
  );
}
