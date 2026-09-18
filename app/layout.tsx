import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://chamber-rouge.vercel.app"),

  title: {
    default: "Chamber — Where Organization Meets Focus",
    template: "%s | Chamber",
  },

  description:
    "Chamber is a focused organizational workspace for communication, collaboration, announcements, members, files, events and more.",

  keywords: [
    "Chamber",
    "Chamber workspace",
    "organization management",
    "organizational collaboration",
    "team collaboration",
    "community management",
    "communication platform",
    "organization workspace",
  ],

  authors: [{ name: "RIO LAB" }],
  creator: "RIO LAB",
  publisher: "RIO LAB",

  alternates: {
    canonical: "https://chamber-rouge.vercel.app/",
  },

  openGraph: {
    type: "website",
    url: "https://chamber-rouge.vercel.app/",
    siteName: "Chamber",
    title: "Chamber — Where Organization Meets Focus",
    description:
      "A focused workspace for organizations to communicate, collaborate, share resources, manage activities and stay organized.",
  },

  twitter: {
    card: "summary",
    title: "Chamber — Where Organization Meets Focus",
    description:
      "A focused workspace for organizations to communicate, collaborate, share resources, manage activities and stay organized.",
  },

  icons: {
    icon: "/chamber-icon.svg.png",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}