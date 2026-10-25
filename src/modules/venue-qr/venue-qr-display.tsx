"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import {
  FiRefreshCw,
  FiCopy,
  FiCheck,
  FiMaximize,
  FiMinimize,
  FiZap,
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
} from "react-icons/fi";

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

interface TestScanResponse {
  success: boolean;
  data?: {
    exp_earned?: number;
    today_exp?: number;
    total_exp?: number;
    venue_name?: string;
    scanned_at?: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

export default function VenueQrDisplay() {
  const [token, setToken] = useState<string>("");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [status, setStatus] = useState<"loading" | "live" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [refreshInterval, setRefreshInterval] = useState<number>(25);
  const [expiresIn, setExpiresIn] = useState<number>(30);
  const [countdown, setCountdown] = useState<number>(25);

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [rotationCount, setRotationCount] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  // Test scan simulation state
  const [testScanning, setTestScanning] = useState<boolean>(false);
  const [testScanFeedback, setTestScanFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const isFetchingRef = useRef(false);

  // Fetch venue QR token from Next.js proxy API
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
      const expireSec = json.data.expires_in_seconds || 30;

      setToken(receivedToken);
      setRefreshInterval(intervalSec);
      setExpiresIn(expireSec);
      setCountdown(intervalSec);
      setLastUpdated(new Date());
      setRotationCount((prev) => prev + 1);

      // Generate QR data URL using qrcode package
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
      console.error("Gagal memperbarui QR code:", err);
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Terjadi kesalahan saat memuat QR."
      );
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  // Initial load
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

  // Countdown timer & auto-refresh
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

  // Copy token to clipboard
  const handleCopyToken = async () => {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Test scan venue token to verify EXP award
  const handleTestScan = async () => {
    if (!token || testScanning) return;
    setTestScanning(true);
    setTestScanFeedback(null);

    try {
      const res = await fetch("/api/display/venue/test-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const json: TestScanResponse = await res.json();

      if (!res.ok || !json.success) {
        setTestScanFeedback({
          type: "error",
          message:
            json.error?.message ||
            "Scan ditolak atau token sudah kedaluwarsa.",
        });
      } else {
        const exp = json.data?.exp_earned ?? 100;
        setTestScanFeedback({
          type: "success",
          message: `Berhasil Scan! +${exp} EXP (Total: ${
            json.data?.total_exp ?? exp
          } EXP)`,
        });
      }
    } catch (err) {
      setTestScanFeedback({
        type: "error",
        message:
          err instanceof Error ? err.message : "Gagal menghubungi server scan.",
      });
    } finally {
      setTestScanning(false);
      setTimeout(() => setTestScanFeedback(null), 5000);
    }
  };

  // Progress percentage (from 100% down to 0%)
  const progressPercent = Math.max(
    0,
    Math.min(100, (countdown / (refreshInterval || 25)) * 100)
  );

  return (
    <div className="relative min-h-screen w-full bg-linear-to-b from-[#0a192f] via-[#062033] to-[#04101e] text-white flex flex-col items-center justify-between p-4 sm:p-6 md:p-8 selection:bg-amber-400 selection:text-black">
      {/* Background ambient glowing orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-128 h-72 rounded-full bg-sky-600/15 blur-3xl" />
      </div>

      {/* TOP BAR / HEADER */}
      <header className="relative z-10 w-full max-w-4xl flex items-center justify-between gap-4 py-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#024a5e] to-[#0ea5e9] border border-cyan-400/30 shadow-lg shadow-cyan-900/40">
            <FiZap className="text-xl text-[#ffd623]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg sm:text-xl tracking-tight text-white">
                PORSENIGAMA 2026
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Venue Booth
              </span>
            </div>
            <p className="text-xs text-cyan-200/70">
              Porquest Dynamic QR Code Generator
            </p>
          </div>
        </div>

        {/* Action buttons (Fullscreen & Refresh) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchVenueQrToken}
            title="Refresh Token Sekarang"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 active:scale-95 border border-white/10 text-xs font-semibold text-cyan-100 transition-all cursor-pointer"
          >
            <FiRefreshCw
              className={`text-sm ${
                status === "loading" ? "animate-spin text-amber-300" : ""
              }`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Keluar Fullscreen" : "Layar Penuh"}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 hover:bg-white/15 active:scale-95 border border-white/10 text-cyan-100 transition-all cursor-pointer"
          >
            {isFullscreen ? (
              <FiMinimize className="text-sm" />
            ) : (
              <FiMaximize className="text-sm" />
            )}
          </button>
        </div>
      </header>

      {/* MAIN DISPLAY CARD */}
      <main className="relative z-10 w-full max-w-md my-auto flex flex-col items-center">
        {/* Glow behind card */}
        <div className="absolute inset-0 -m-3 rounded-3xl bg-linear-to-b from-cyan-500/20 via-transparent to-amber-500/10 blur-xl pointer-events-none" />

        <div className="relative w-full rounded-2xl bg-[#0f1f33]/90 border-2 border-cyan-400/30 p-6 sm:p-7 shadow-[0_12px_40px_rgba(0,0,0,0.55)] backdrop-blur-md flex flex-col items-center text-center">
          {/* Header Badge & Title */}
          <div className="flex flex-col items-center gap-1.5 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#033647] border border-cyan-400/40 text-cyan-300 text-xs font-semibold shadow-inner">
              <span className="relative flex h-2 w-2">
                <span
                  className={`absolute inline-flex h-full w-full rounded-full ${
                    status === "live"
                      ? "bg-emerald-400 animate-ping opacity-75"
                      : "bg-amber-400"
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    status === "live" ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
              </span>
              <span>
                {status === "live"
                  ? "VENUE CHECK-IN AKTIF"
                  : status === "loading"
                  ? "MEMPERBARUI TOKEN..."
                  : "GAGAL TERHUBUNG"}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-wide text-white mt-1">
              SCAN UNTUK CHECK-IN
            </h2>

            <p className="text-xs sm:text-sm text-cyan-100/80 max-w-xs">
              Buka aplikasi{" "}
              <span className="font-bold text-[#ffd623]">Porquest</span>, pilih{" "}
              <span className="font-semibold text-white">Venue Check-In</span>,
              dan arahkan kamera ke QR code ini.
            </p>
          </div>

          {/* QR CODE CONTAINER */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl bg-white p-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] border-4 border-cyan-300/60 flex items-center justify-center overflow-hidden transition-all duration-300 hover:scale-[1.01]">
            {/* Live QR Image */}
            {qrDataUrl && status !== "loading" && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt="Porquest Venue QR Code"
                className="w-full h-full object-contain select-none pointer-events-none"
              />
            )}

            {/* Loading state overlay */}
            {status === "loading" && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center gap-3">
                <FiRefreshCw className="text-4xl text-[#024a5e] animate-spin" />
                <span className="text-xs font-bold text-slate-700 tracking-wide">
                  Memuat QR Code...
                </span>
              </div>
            )}

            {/* Error state overlay */}
            {status === "error" && (
              <div className="absolute inset-0 bg-red-50 p-4 flex flex-col items-center justify-center text-center gap-2">
                <FiAlertCircle className="text-3xl text-red-500" />
                <p className="text-xs font-semibold text-red-700">
                  {errorMessage || "Gagal memuat QR Code"}
                </p>
                <button
                  type="button"
                  onClick={fetchVenueQrToken}
                  className="mt-1 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 active:scale-95 transition-all cursor-pointer"
                >
                  Coba Lagi
                </button>
              </div>
            )}
          </div>

          {/* COUNTDOWN & PROGRESS BAR */}
          <div className="w-full mt-5 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-cyan-200/70 flex items-center gap-1.5">
                <FiRefreshCw
                  className={`text-[11px] ${
                    status === "loading" ? "animate-spin text-amber-300" : ""
                  }`}
                />
                Rotasi otomatis:
              </span>
              <span className="font-mono font-bold text-[#ffd623]">
                {countdown}s{" "}
                <span className="text-[10px] text-cyan-200/60 font-sans">
                  / {refreshInterval}s
                </span>
              </span>
            </div>

            {/* Progress bar line */}
            <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden border border-cyan-400/20">
              <div
                className="h-full bg-linear-to-r from-cyan-400 via-sky-400 to-[#ffd623] transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* REWARD CALLOUT */}
          <div className="w-full mt-4 py-2 px-3 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center gap-2 text-amber-300 text-xs font-semibold">
            <span className="text-base">🎁</span>
            <span>Hadiah: +100 EXP langsung masuk ke akun peserta</span>
          </div>

          {/* ACTION BUTTONS (Copy & Test Scan) */}
          <div className="w-full mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleCopyToken}
              disabled={!token}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 border border-white/15 text-xs font-semibold text-white transition-all disabled:opacity-50 cursor-pointer"
            >
              {copied ? (
                <>
                  <FiCheck className="text-emerald-400 text-sm" />
                  <span className="text-emerald-300">Tersalin!</span>
                </>
              ) : (
                <>
                  <FiCopy className="text-sm" />
                  <span>Salin Token</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleTestScan}
              disabled={!token || testScanning}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 active:scale-95 text-white text-xs font-bold shadow-md shadow-cyan-900/40 transition-all disabled:opacity-50 cursor-pointer"
            >
              <FiZap
                className={`text-sm ${
                  testScanning ? "animate-bounce text-[#ffd623]" : ""
                }`}
              />
              <span>{testScanning ? "Menguji..." : "Test Scan Venue"}</span>
            </button>
          </div>

          {/* Test scan feedback toast */}
          {testScanFeedback && (
            <div
              className={`w-full mt-3 p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 animate-fadeIn ${
                testScanFeedback.type === "success"
                  ? "bg-emerald-950/80 border border-emerald-500/50 text-emerald-300"
                  : "bg-red-950/80 border border-red-500/50 text-red-300"
              }`}
            >
              {testScanFeedback.type === "success" ? (
                <FiCheckCircle className="text-base shrink-0 text-emerald-400" />
              ) : (
                <FiAlertCircle className="text-base shrink-0 text-red-400" />
              )}
              <span className="text-left flex-1">
                {testScanFeedback.message}
              </span>
            </div>
          )}

          {/* ACCORDION TOGGLE: Debug & Details */}
          <button
            type="button"
            onClick={() => setShowDetails((prev) => !prev)}
            className="mt-4 flex items-center gap-1.5 text-[11px] text-cyan-200/60 hover:text-cyan-200 transition-colors cursor-pointer"
          >
            <FiInfo className="text-xs" />
            <span>{showDetails ? "Sembunyikan Detail" : "Lihat Detail Token & API"}</span>
          </button>

          {/* DETAILS COLLAPSIBLE PANEL */}
          {showDetails && (
            <div className="w-full mt-3 p-3 rounded-xl bg-slate-900/80 border border-cyan-500/20 text-[11px] text-left flex flex-col gap-2 font-mono text-cyan-100/80">
              <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-1.5">
                <span className="text-slate-400">Endpoint:</span>
                <span className="text-right text-cyan-300 truncate font-semibold">
                  /api/display/venue/qr-token
                </span>
              </div>

              <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-1.5">
                <span className="text-slate-400">Token Aktif:</span>
                <span
                  className="text-right text-amber-300 truncate max-w-[190px]"
                  title={token}
                >
                  {token || "—"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-1.5">
                <span className="text-slate-400">Masa Berlaku:</span>
                <span className="text-right">{expiresIn} detik</span>
              </div>

              <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-1.5">
                <span className="text-slate-400">Interval Rotasi:</span>
                <span className="text-right">{refreshInterval} detik</span>
              </div>

              <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-1.5">
                <span className="text-slate-400">Jumlah Rotasi:</span>
                <span className="text-right text-white font-bold">
                  {rotationCount} kali
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400">Terakhir Update:</span>
                <span className="text-right">
                  {lastUpdated ? lastUpdated.toLocaleTimeString() : "—"}
                </span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 w-full max-w-4xl text-center py-2 text-xs text-cyan-200/50">
        <p>
          © 2026 Pekan Olahraga dan Seni Universitas Gadjah Mada • Divisi IT &
          Kompetisi
        </p>
      </footer>
    </div>
  );
}
