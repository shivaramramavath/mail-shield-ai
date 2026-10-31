import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MailShield AI — Email Intelligence",
  description: "Analyze spam, improve email writing, and review suspicious messages with MailShield AI.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
