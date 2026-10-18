import type { Metadata } from "next";
import { Barlow_Condensed, Figtree } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Providers } from "@/components/providers";
import { clerkAppearance, clerkConfigured } from "@/lib/brand";

const sans = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
});

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-barlow",
});

export const metadata: Metadata = {
  title: {
    default: "HiVis — daily safety walks",
    template: "%s · HiVis",
  },
  description: "Turn a handful of site photos into findings, corrective actions, and a daily log for a small construction crew.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "HiVis — daily safety walks",
    description: "Photo walks, crew-lead actions, and a PDF the GC can read.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const body = (
    <Providers>
      {children}
    </Providers>
  );
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full">
        {clerkConfigured() ? (
          <ClerkProvider
            appearance={clerkAppearance}
            signInUrl="/sign-in"
            signUpUrl="/sign-up"
            signInFallbackRedirectUrl="/dashboard"
            signUpFallbackRedirectUrl="/dashboard"
          >
            {body}
          </ClerkProvider>
        ) : (
          body
        )}
      </body>
    </html>
  );
}
