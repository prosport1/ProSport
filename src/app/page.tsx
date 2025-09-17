
"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

export default function CoverPage() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Garante que o vídeo seja reproduzido após a montagem do componente no cliente.
    // Esta abordagem é mais robusta contra re-renderizações rápidas.
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        // O AbortError é comum em React e pode ser ignorado com segurança.
        // Ele acontece se o componente for re-renderizado enquanto o vídeo está carregando.
        if (error.name !== 'AbortError') {
          console.error("Erro ao tentar reproduzir o vídeo automaticamente:", error);
        }
      });
    }
  }, []);

  return (
    <div className="relative h-screen w-full">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        poster="https://storage.googleapis.com/aip-dev-buddy-user-assets/images/de4a9b5f-a0a8-42bd-9c7a-59f77f0a6d1c.png"
        className="absolute left-0 top-0 h-full w-full object-cover"
      >
        <source src="https://videos.pexels.com/video-files/4779282/4779282-hd_1920_1080_25fps.mp4" type="video/mp4" />
        Your browser does not support the video tag.
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
          <Link href="/athlete/login">Entrar</Link>
        </Button>
      </div>
    </div>
  );
}
