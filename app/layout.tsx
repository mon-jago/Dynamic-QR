import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const lesFlos = localFont({
  src: "../src/fonts/les-flos/les-flos.otf",
  variable: "--font-les-flos",
});

const lesFlosSans = localFont({
  src: "../src/fonts/les-flos/les-flos-sans.otf",
  variable: "--font-les-flos-sans",
});

const lesFlosChaos = localFont({
  src: "../src/fonts/les-flos/les-flos-chaos.otf",
  variable: "--font-les-flos-chaos",
});

export const axiforma = localFont({
  src: [
    {
      path: "../src/fonts/axiforma/axiforma-thin.otf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../src/fonts/axiforma/axiforma-light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../src/fonts/axiforma/axiforma-regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../src/fonts/axiforma/axiforma-medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../src/fonts/axiforma/axiforma-semibold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../src/fonts/axiforma/axiforma-bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../src/fonts/axiforma/axiforma-extrabold.otf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../src/fonts/axiforma/axiforma-black.otf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-axiforma",
});

export const metadata: Metadata = {
  title: "PORSENIGAMA 2026",
  description: "Pekan Olahraga dan Seni Gadjah Mada 2026",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${axiforma.variable} ${lesFlosSans.variable} ${lesFlos.variable} ${lesFlosChaos.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
