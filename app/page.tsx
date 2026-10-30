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
        // Background transparan (#00000000) dan margin 0 untuk menghilangkan semua kotak/border putih pada QR
        const dataUrl = await QRCode.toDataURL(json.data.token, {
          width: 500,
          margin: 0,
          color: {
            dark: "#061938",
            light: "#00000000",
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
    <main className="h-dvh w-full flex items-center justify-center bg-[#061938] p-0 m-0 overflow-hidden select-none">
      {/* Container utama dengan rasio gambar 1512 : 982 tanpa padding atau border putih */}
      <div className="relative w-full max-w-[1400px] aspect-[1512/982] max-h-dvh flex items-center justify-center bg-transparent overflow-hidden">
        {/* Gambar Background Resmi */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/venue-bg.png"
          alt="Venue Check In Porquest"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
        />

        {/* Kotak QR Code transparan presisi di dalam border kotak background (tanpa padding/border putih) */}
        {/* Koordinat presisi berdasarkan 1512x982: top 43.1%, left 38.2%, width 23.6%, height 36.6% */}
        <div
          className="absolute z-10 flex items-center justify-center p-0 m-0 overflow-hidden"
          style={{
            top: "43.1%",
            left: "38.2%",
            width: "23.6%",
            height: "36.6%",
          }}
        >
          {qrDataUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={qrDataUrl}
              alt="Dynamic QR Code Venue Check-In"
              className="w-full h-full object-contain animate-in fade-in duration-200"
            />
          ) : (
            <div className="size-8 sm:size-12 border-4 border-[#061938] border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      </div>
    </main>
  );
}
