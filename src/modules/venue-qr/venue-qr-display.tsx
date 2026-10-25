"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { FiRefreshCw, FiAlertCircle } from "react-icons/fi";

interface QrApiResponse {
  success: boolean;
  data?: {
    token: string;
    expires_in_seconds: number;
    refresh_interval_seconds: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

export default function VenueQrDisplay() {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [status, setStatus] = useState<"loading" | "live" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [refreshInterval, setRefreshInterval] = useState<number>(25);
  const [countdown, setCountdown] = useState<number>(25);

  const isFetchingRef = useRef(false);

  // Fetch venue QR token
  const fetchVenueQrToken = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setErrorMessage(null);

    try {
      const res = await fetch("/api/display/venue/qr-token", {
        cache: "no-store",
      });

      const json: QrApiResponse = await res.json();

      if (!res.ok || !json.success || !json.data) {
        throw new Error(
          json.error?.message ||
            `Gagal mengambil token (Status: ${res.status})`
        );
      }

      const receivedToken = json.data.token;
      const intervalSec = json.data.refresh_interval_seconds || 25;

      setRefreshInterval(intervalSec);
      setCountdown(intervalSec);

      const dataUrl = await QRCode.toDataURL(receivedToken, {
        width: 480,
        margin: 2,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
        errorCorrectionLevel: "M",
      });

      setQrDataUrl(dataUrl);
      setStatus("live");
    } catch (err) {
      console.error("Gagal memuat QR code:", err);
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Terjadi kesalahan saat memuat QR."
      );
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const loadInitialToken = async () => {
      if (!ignore) {
        await fetchVenueQrToken();
      }
    };
    void loadInitialToken();

    return () => {
      ignore = true;
    };
  }, [fetchVenueQrToken]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchVenueQrToken();
          return refreshInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [fetchVenueQrToken, refreshInterval]);

  const progressPercent = Math.max(
    0,
    Math.min(100, (countdown / (refreshInterval || 25)) * 100)
  );

  return (
    <main className="min-h-screen w-full bg-[#0a192f] text-white flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-sm rounded-2xl bg-[#0f1f33] border border-cyan-500/30 p-6 shadow-2xl flex flex-col items-center text-center">
        <div className="flex flex-col items-center gap-2 mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#033647] border border-cyan-400/40 text-cyan-300 text-xs font-semibold">
            <span
              className={`h-2 w-2 rounded-full ${
                status === "live"
                  ? "bg-emerald-400 animate-pulse"
                  : status === "loading"
                  ? "bg-amber-400 animate-pulse"
                  : "bg-red-400"
              }`}
            />
            <span>
              {status === "live"
                ? "VENUE CHECK-IN"
                : status === "loading"
                ? "MEMPERBARUI..."
                : "TERPUTUS"}
            </span>
          </div>

          <h1 className="text-xl font-bold tracking-tight text-white">
            PORSENIGAMA 2026
          </h1>
          <p className="text-xs text-cyan-200/70">
            Scan untuk Check-In (+100 EXP)
          </p>
        </div>

        <div className="relative w-64 h-64 rounded-xl bg-white p-3 shadow-md flex items-center justify-center overflow-hidden">
          {qrDataUrl && status !== "loading" && (
            <img
              src={qrDataUrl}
              alt="Venue QR Code"
              className="w-full h-full object-contain pointer-events-none select-none"
            />
          )}

          {status === "loading" && (
            <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center gap-2">
              <FiRefreshCw className="text-3xl text-cyan-700 animate-spin" />
              <span className="text-xs font-bold text-slate-700">
                Memuat QR...
              </span>
            </div>
          )}

          {status === "error" && (
            <div className="absolute inset-0 bg-red-50 p-4 flex flex-col items-center justify-center gap-2">
              <FiAlertCircle className="text-3xl text-red-500" />
              <p className="text-xs text-red-700 font-semibold">
                {errorMessage || "Gagal memuat QR Code"}
              </p>
              <button
                type="button"
                onClick={fetchVenueQrToken}
                className="mt-1 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold cursor-pointer"
              >
                Coba Lagi
              </button>
            </div>
          )}
        </div>

        <div className="w-full mt-4 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-cyan-200/80">
            <span>Refresh otomatis:</span>
            <span className="font-mono font-bold text-amber-300">
              {countdown}s
            </span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-cyan-400 transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={fetchVenueQrToken}
          disabled={status === "loading"}
          className="w-full mt-5 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-md"
        >
          <FiRefreshCw
            className={`text-sm ${
              status === "loading" ? "animate-spin text-amber-300" : ""
            }`}
          />
          <span>Refresh Sekarang</span>
        </button>
      </div>
    </main>
  );
}
