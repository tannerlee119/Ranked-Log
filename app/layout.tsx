import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'League Bot Lane Tracker',
  description: 'Track your League of Legends bot lane performance',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-gray-100">{children}</body>
    </html>
  );
}
