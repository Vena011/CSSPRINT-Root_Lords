import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "@fontsource/plus-jakarta-sans/800.css";
import "./globals.css";
import { LangProvider } from "@/components/LangProvider";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://reroot-rootlords.vercel.app"),
  title: "ReRoot · Tirang ulam malapit sa iyo",
  description: "Reserve surplus dishes from carinderias near UST. No app, no account.",
  manifest: "/manifest.json",
  icons: { icon: [{ url: "/favicon.ico", sizes: "any" }, { url: "/icon.svg", type: "image/svg+xml" }], apple: "/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "ReRoot", statusBarStyle: "default" },
  openGraph: {
    title: "ReRoot",
    description: "May tirang ulam malapit sa iyo. Reserve from carinderias near UST.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

export const viewport = { themeColor: "#2F7D4F", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <LangProvider>
          <div className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col bg-bg shadow-[0_0_40px_rgba(30,36,32,.06)]">
            {children}
          </div>
        </LangProvider>
      </body>
    </html>
  );
}
