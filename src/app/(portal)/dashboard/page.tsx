
"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { AthleteDashboardClient } from "@/components/dashboard/athlete-dashboard-client";
import { getFunctions, httpsCallable, HttpsCallable } from 'firebase/functions';
import { app } from '@/lib/firebase';


// Obtém as funções do Firebase, conectando-se ao emulador se estiver em desenvolvimento.
const functions = getFunctions(app, 'southamerica-east1');
// if (process.env.NODE_ENV === 'development') {
//   connectFunctionsEmulator(functions, '127.0.0.1', 5001);
// }


export default function DashboardPage() {
  const [sportPageUrl, setSportPageUrl] = useState<string | null>(null);

  // Expõe a função `httpsCallable` para os componentes filhos, se necessário,
  // ou pode ser usada diretamente aqui para chamar as funções.
  const callGenerateLanding: HttpsCallable<any, any> = httpsCallable(functions, 'generateLanding');
  // Adicione outras funções chamáveis aqui se precisar.


  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header sportPageUrl={sportPageUrl} dashboardPath="/portal/dashboard" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="font-headline text-2xl font-bold">Painel do Atleta</h1>
        </div>
        <AthleteDashboardClient 
            onPageGenerated={setSportPageUrl} 
            generatePageFunction={callGenerateLanding} 
        />
      </main>
    </div>
  );
}
