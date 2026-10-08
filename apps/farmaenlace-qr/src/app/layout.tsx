import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Farmaenlace · Registro en caja', description: 'Identificación de clientes mediante QR y código para Vendix.', robots: { index: false, follow: false }, referrer: 'no-referrer' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="es"><body>{children}</body></html>; }
