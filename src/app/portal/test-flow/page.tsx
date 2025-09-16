
"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { getFunctions, httpsCallable, HttpsCallable } from 'firebase/functions';
import { app } from '@/lib/firebase';
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

// --- Firebase Functions ---
const functions = getFunctions(app, 'southamerica-east1');
// Para desenvolvimento local:
// import { connectFunctionsEmulator } from 'firebase/functions';
// if (process.env.NODE_ENV === 'development') {
//    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
// }

const generateLanding: HttpsCallable<any, any> = httpsCallable(functions, 'generateLanding');
// --- Fim Firebase Functions ---


export default function TestFlowPage() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleTest = () => {
    startTransition(async () => {
      setResult(null);
      setError(null);
      toast({title: "Iniciando teste...", description: "Chamando a Cloud Function 'generateLanding'..."})
      
      try {
        const testPayload = {
            plano: "basic",
            modalidade: "Jiu-Jitsu",
            nome: "Atleta Teste Flow",
            dataNascimento: "01/01/1990", // Corrigido para dataNascimento
            graduacao: "Faixa Preta",
            equipe: "Equipe de Teste",
            titulos: "Campeão Mundial de Testes",
            imagem: "https://picsum.photos/seed/test/600/400", // Imagem de placeholder
            contato: "dev@test.com",
            instagramUsername: "tester",
            facebookUsername: "tester",
        };

        const response = await generateLanding(testPayload);

        const data = response.data as { url?: string; error?: any; message?: string };

        if (data.url) {
            setResult(data);
            toast({title: "Sucesso!", description: "A página foi gerada."})
        } else {
            console.error("Resposta da função sem URL:", data);
            throw new Error(data.error?.message || data.message || 'A resposta da função não continha uma URL.');
        }

      } catch (err: any) {
        console.error('Flow Test Failed:', err);
        setError(err.message || 'Ocorreu um erro desconhecido.');
        toast({variant: "destructive", title: "Falha no Teste", description: err.message})
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader>
          <CardTitle>Teste do Fluxo de Geração de SportPage</CardTitle>
          <CardDescription>
            Clique no botão para chamar a função `generateLanding` com dados de teste e verificar se a IA e o armazenamento estão funcionando.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <Button onClick={handleTest} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testando Fluxo...
                </>
              ) : (
                "Testar Geração de Página"
              )}
            </Button>
            {result && (
              <Alert variant="default">
                <AlertTitle>Sucesso!</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p className="break-all">
                    URL da Página Gerada: 
                    <Link href={result.url} target="_blank" className="ml-2 font-mono text-blue-400 hover:underline">{result.url}</Link>
                  </p>
                  <p>ID da Página: <span className="font-mono">{result.id}</span></p>
                  <p>Usou Fallback? <span className="font-mono">{result.used_fallback ? 'Sim' : 'Não'}</span></p>
                </AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Falha no Fluxo</AlertTitle>
                <AlertDescription>
                    <p>Ocorreu um erro ao tentar gerar a página:</p>
                    <p className="font-mono mt-2">{error}</p>
                </AlertDescription>
              </Alert>
            )}
             <div className="mt-6 text-center text-sm">
                <Button variant="link" asChild className="p-0">
                    <Link href="/portal/dashboard">Voltar ao Painel</Link>
                </Button>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
