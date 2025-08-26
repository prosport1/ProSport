import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Portfólio ProSport',
  description: 'Crie páginas esportivas profissionais para atrair patrocinadores.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans&display=swap" rel="stylesheet" />
      </head>
      <body
        className={cn(
          "min-h-screen font-body antialiased flex flex-col"
        )}
      >
        <div className="flex-1">
            {children}
        </div>
        <Toaster />
        <footer className="w-full bg-card/80 backdrop-blur-sm p-4 text-center text-muted-foreground text-sm mt-auto">
          © {new Date().getFullYear()} Direitos Reservados ProSport
        </footer>
      </body>
    </html>
  );
}
