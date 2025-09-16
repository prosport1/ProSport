
"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { getFunctions, httpsCallable, HttpsCallable } from 'firebase/functions';
import { app } from '@/lib/firebase';
import Link from "next/link";

// --- Firebase Functions ---
const functions = getFunctions(app, 'southamerica-east1');
// Para desenvolvimento local, pode ser útil conectar ao emulador:
// import { connectFunctionsEmulator } from 'firebase/functions';
// if (process.env.NODE_ENV === 'development') {
//    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
// }

const createStripeCheckoutSession: HttpsCallable<any, any> = httpsCallable(functions, 'createStripeCheckoutSession');
// --- Fim Firebase Functions ---


export default function TestStripePage() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTest = () => {
    startTransition(async () => {
      setResult(null);
      setError(null);
      
      try {
        const response = await createStripeCheckoutSession({
            planId: 'basic', // Usamos um plano fixo para o teste
            isAnnual: false,
        });

        const data = response.data as { url?: string; error?: string; message?: string };

        if (data.url) {
            setResult(data.url);
        } else {
            throw new Error(data.error || data.message || 'A URL de checkout não foi retornada.');
        }

      } catch (err: any) {
        console.error('Stripe Test Failed:', err);
        setError(err.message || 'Ocorreu um erro desconhecido.');
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader>
          <CardTitle>Teste de Integração com o Stripe</CardTitle>
          <CardDescription>
            Clique no botão abaixo para criar uma sessão de checkout de teste para o "Plano Básico".
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <Button onClick={handleTest} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testando...
                </>
              ) : (
                "Testar Integração com Stripe"
              )}
            </Button>
            {result && (
              <Alert variant="default">
                <AlertTitle>Sucesso!</AlertTitle>
                <AlertDescription className="break-all">
                  URL de Checkout gerada. Clique no link para abrir a página de pagamento do Stripe.
                  <br />
                  <Link href={result} target="_blank" className="font-mono text-blue-400 hover:underline">{result}</Link>
                </AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Falha na Integração</AlertTitle>
                <AlertDescription>
                    <p>Ocorreu um erro ao tentar criar a sessão de checkout:</p>
                    <p className="font-mono mt-2">{error}</p>
                    <p className="mt-4 text-xs text-muted-foreground">
                        <strong>Possíveis Causas:</strong><br/>
                        1. As chaves de API do Stripe não foram configuradas no arquivo .env.<br/>
                        2. O ID do plano ('basic') não corresponde a um preço criado no seu painel do Stripe.<br/>
                        3. A Cloud Function não foi implantada corretamente.<br/>
                        4. Verifique os logs da função 'createStripeCheckoutSession' no console do Firebase para mais detalhes.
                    </p>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
