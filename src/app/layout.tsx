import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import { Poppins, PT_Sans } from 'next/font/google';

const fontHeadline = Poppins({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-headline',
});

const fontBody = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
});


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
    <html lang="pt-BR" className={cn('h-full', fontHeadline.variable, fontBody.variable)}>
      <body className={cn("font-body antialiased h-full")}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
