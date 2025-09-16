
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function PortalPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the athlete login page, which is the main entry for the portal
    router.replace('/portal/athlete/login');
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
