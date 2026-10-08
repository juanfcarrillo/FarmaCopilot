import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Farmaenlace · Registro en caja', description: 'Identificación por QR o datos dictados en una demostración de Vendix.', robots: { index: false, follow: false }, referrer: 'no-referrer' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="es"><body>{children}</body></html>; }
