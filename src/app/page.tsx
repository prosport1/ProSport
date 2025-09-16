
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

export default function CoverPage() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-cover-video bg-cover bg-center">
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center bg-black/70 text-center text-white">
        <Icons.logo className="mx-auto h-24 w-24 text-primary" />
        <h1 className="mt-4 font-headline text-5xl font-bold tracking-tight md:text-7xl">
          ProSport
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-white/80 md:text-xl">
          Sua carreira para o próximo nível. Conectamos atletas, patrocinadores e clubes.
        </p>
        <Button asChild className="mt-8 font-headline" size="lg">
          <Link href="/portal">Entrar</Link>
        </Button>
      </div>
    </div>
  );
}
