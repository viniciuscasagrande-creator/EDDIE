import React from 'react';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { MobileNavProvider } from '../components/MobileNavContext';
import { ProducerEventProvider } from '../components/ProducerEventContext';
import { AuthSessionProvider } from '../components/AuthSessionContext';
import { BuildBadge } from '../components/BuildBadge';
import { ScrollSpyProvider } from '../components/scrollspy';

export const viewport: Viewport = {
  themeColor: '#0B0F19',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'DiskIngressos PDT • Painel do Produtor',
  description: 'ERP + CRM Modular Event-Driven para Gestão de Eventos, Financeiro, Marketing e Contabilidade',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'DiskIngressos PDT',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('eddie_theme_mode') || 'light';
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                } else {
                  document.documentElement.classList.add('light');
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex min-h-screen antialiased transition-colors duration-200">
        <AuthSessionProvider>
          <ProducerEventProvider>
            <MobileNavProvider>
              <ScrollSpyProvider>
                <Sidebar />
                <div className="flex-1 flex flex-col min-w-0">
                  <Header />
                  <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-24 lg:pb-8 overflow-y-auto">{children}</main>
                  <BottomNav />
                </div>
                <BuildBadge />
              </ScrollSpyProvider>
            </MobileNavProvider>
          </ProducerEventProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
