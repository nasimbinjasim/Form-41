import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "নেসকো — অনলাইন আবেদন ব্যবস্থাপনা",
  description: "Form-41 Online Application Management — NESCO Commercial Operations"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <body>{children}</body>
    </html>
  );
}
