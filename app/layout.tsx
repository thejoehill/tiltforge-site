import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TiltForge — Smart Blinds. Repairable. Affordable.",
  description:
    "Meet TiltForge — the first smart blind motor powered by a harmonic drive. Stronger. Quieter. Open. Designed to last.",
  generator: "v0.app",

  icons: {
    icon: [
      // Light / Dark PNGs
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },

      // SVG (modern browsers)
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },

      // ICO fallback (old browsers, Edge weirdness)
      {
        url: "/favicon.ico",
      },
    ],

    // Apple touch icon
    apple: "/apple-touch-icon.png",
  },

  // Web app manifest
  manifest: "/site.webmanifest",
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
