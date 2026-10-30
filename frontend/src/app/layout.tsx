import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Ichimliklar Do'koni — Mini-ERP Tizimi",
  description: "Ombor qoldiqlari (dona va blokda), savdo, xarid, inventarizatsiya va sof foyda (P&L) hisobi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className="h-full bg-slate-50 antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
