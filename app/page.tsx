"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

export default function Home() {
  const [isOn, setIsOn] = useState<boolean>(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isFetchingRef = useRef<boolean>(false);

  const fetchVenueQrToken = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/display/venue/qr-token", {
        cache: "no-store",
      });
      const json = await res.json();
      if (res.ok && json.success && json.data?.token) {
        const dataUrl = await QRCode.toDataURL(json.data.token, {
          width: 320,
          margin: 1,
        });
        setQrDataUrl(dataUrl);
      } else {
        const msg =
          json?.error?.message || `Gagal memuat QR (Status ${res.status})`;
        setErrorMessage(msg);
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Gagal menghubungi server QR."
      );
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!isOn) return;

    let ignore = false;
    void (async () => {
      if (!ignore) {
        await fetchVenueQrToken();
      }
    })();

    const interval = setInterval(() => {
      fetchVenueQrToken();
    }, 25000);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [isOn, fetchVenueQrToken]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 gap-4 bg-white text-black font-sans">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsOn((prev) => !prev)}
          className={`px-4 py-2 rounded text-sm font-medium border cursor-pointer transition-colors ${
            isOn
              ? "bg-green-600 text-white border-green-700"
              : "bg-gray-200 text-gray-700 border-gray-300"
          }`}
        >
          QR: {isOn ? "ON" : "OFF"}
        </button>

        <button
          type="button"
          onClick={fetchVenueQrToken}
          disabled={!isOn || loading}
          className="px-4 py-2 rounded text-sm font-medium border border-gray-300 bg-white text-black hover:bg-gray-50 active:bg-gray-100 disabled:opacity-40 cursor-pointer transition-colors"
        >
          {loading ? "Memuat..." : "Refresh"}
        </button>
      </div>

      <div className="w-[320px] h-[320px] flex flex-col items-center justify-center border border-gray-300 rounded bg-white p-2">
        {isOn ? (
          qrDataUrl && !loading ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt="Venue QR Code"
              className="w-full h-full object-contain"
            />
          ) : errorMessage ? (
            <div className="flex flex-col items-center gap-2 p-4 text-center">
              <p className="text-xs text-red-600 font-semibold">{errorMessage}</p>
              <button
                type="button"
                onClick={fetchVenueQrToken}
                className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-medium cursor-pointer"
              >
                Coba Lagi
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Memuat QR...</p>
          )
        ) : (
          <p className="text-sm text-gray-400">QR Code OFF</p>
        )}
      </div>
    </main>
  );
}
