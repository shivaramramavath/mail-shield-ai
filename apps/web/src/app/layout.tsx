import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'MailShield AI', description: 'Email spam detection and AI assistant' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
