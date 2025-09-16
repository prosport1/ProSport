
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

export default function CoverPage() {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute left-0 top-0 z-0 h-full w-full object-cover"
        poster="https://storage.googleapis.com/aip-dev-buddy-user-assets/images/de4a9b5f-a0a8-42bd-9c7a-59f77f0a6d1c.png"
      >
        <source src="https://videos.pexels.com/video-files/2499282/2499282-hd_1920_1080_25fps.mp4" type="video/mp4" />
        Seu navegador não suporta vídeos HTML5.
      </video>
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
