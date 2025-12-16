import type React from "react"
interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string
}

export default function Icon({ name, className = "", ...props }: IconProps) {
  const icons: Record<string, string> = {
    gear: "M12 6V4m0 16v-2m6-9h2m-16 0h2M7.29 7.29L5.586 5.586M18.414 18.414L16.707 16.707M16.707 7.29l1.707-1.707M5.586 18.414l1.707-1.707",
    wrench:
      "M12 8c1.104 0 2-0.896 2-2s-0.896-2-2-2-2 0.896-2 2 0.896 2 2 2zm0 2c-2.209 0-4 1.791-4 4v2h1v-2c0-1.657 1.343-3 3-3s3 1.343 3 3v2h1v-2c0-2.209-1.791-4-4-4z",
    network: "M13 10V3L4 14h7v7l9-11h-7z",
    tag: "M7 7h.01M7 3h5c1.105 0 2 .895 2 2v5c0 1.105-.895 2-2 2H7c-1.105 0-2-.895-2-2V5c0-1.105.895-2 2-2z",
    code: "M10 20v-6m4-6v6M5 10l7-7 7 7",
    home: "M3 12l9-9 9 9v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
    cloud: "M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z",
    speaker: "M9 19V5m0 0L5 9m4-4l4 4",
    microchip: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  }

  const d = icons[name] || "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"

  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d={d} />
    </svg>
  )
}
