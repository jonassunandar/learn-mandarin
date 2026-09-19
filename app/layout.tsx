import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LearningProvider } from "@/components/LearningProvider";
import { Shell } from "@/components/Shell";
export const metadata: Metadata = {
  title: "Hanzi100 — A little, every day",
  description:
    "Learn your first 100 Mandarin words through handwriting and spaced repetition.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Hanzi100" },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/apple-touch-icon.png" },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8f2" },
    { media: "(prefers-color-scheme: dark)", color: "#171f1b" },
  ],
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <LearningProvider>
          <Shell>{children}</Shell>
        </LearningProvider>
      </body>
    </html>
  );
}
