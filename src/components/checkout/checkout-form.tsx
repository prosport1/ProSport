
'use client';

import { useState, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/hooks/use-toast';
import { CreditCard } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { getFunctions, httpsCallable, HttpsCallable } from 'firebase/functions';
import { app } from '@/lib/firebase';

const planDetails = {
  basic: { name: "Básico", monthlyPrice: 9.90, annualPrice: 99.90 },
  plus: { name: "Plus", monthlyPrice: 29.90, annualPrice: 299.90 },
  premium: { name: "Premium", monthlyPrice: 59.90, annualPrice: 599.90 },
  pro: { name: "Pro", monthlyPrice: 2000.00, annualPrice: 20000.00 },
};

// --- Firebase Functions ---
const functions = getFunctions(app, 'southamerica-east1');
// Em desenvolvimento, descomente a linha abaixo para usar o emulador
// import { connectFunctionsEmulator } from 'firebase/functions';
// if (process.env.NODE_ENV === 'development') {
//    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
// }

const createStripeCheckoutSession: HttpsCallable<any, any> = httpsCallable(functions, 'createStripeCheckoutSession');
// --- Fim Firebase Functions ---


export function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const plan = searchParams.get('plan') as keyof typeof planDetails | null;
  const [isAnnual, setIsAnnual] = useState(false);
  const [isProcessing, startTransition] = useTransition();

  if (!plan || !planDetails[plan]) {
    const defaultPlanPath = plan === 'pro' ? '/portal/company/plans' : '/portal/plans';
    return (
        <Card>
            <CardHeader>
                <CardTitle>Plano não encontrado</CardTitle>
                <CardDescription>Por favor, selecione um plano válido.</CardDescription>
            </CardHeader>
            <CardFooter>
                <Button onClick={() => router.push(defaultPlanPath)}>Ver Planos</Button>
            </CardFooter>
        </Card>
    );
  }

  const details = planDetails[plan];
  const totalPrice = isAnnual ? details.annualPrice : details.monthlyPrice;
  const isCompanyPlan = plan === 'pro';

  const handleCreateCheckoutSession = async () => {
    startTransition(async () => {
      try {
          const result = await createStripeCheckoutSession({ planId: plan, isAnnual });
          const data = result.data as { url?: string };
          
          if (data.url) {
              router.push(data.url);
          } else {
               throw new Error('Não foi possível obter a URL de checkout.');
          }

      } catch (error: any) {
          console.error("Erro no checkout:", error);
          toast({
              variant: 'destructive',
              title: 'Erro no Pagamento',
              description: error.message || 'Não foi possível iniciar o pagamento. Por favor, tente novamente.',
          });
      }
    });
  }

  return (
    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
      <div className="flex flex-col gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Finalize sua Assinatura</CardTitle>
            <CardDescription>Você está a um passo de impulsionar sua carreira ou encontrar novos talentos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-bold text-lg">Plano Selecionado</h3>
              <p className="text-primary font-bold text-xl">{details.name}</p>
            </div>
            <div className="flex items-center space-x-4 rounded-lg border p-4">
                <Label htmlFor="billing-frequency" className="flex flex-col">
                  <span>Mensal</span>
                  <span className="font-bold">R$ {details.monthlyPrice.toFixed(2)}</span>
                </Label>
                <Switch
                    id="billing-frequency"
                    checked={isAnnual}
                    onCheckedChange={setIsAnnual}
                    aria-label="Alterar para cobrança anual"
                />
                <Label htmlFor="billing-frequency" className="flex flex-col">
                  <span>Anual</span>
                  <span className="font-bold">R$ {details.annualPrice.toFixed(2)}</span>
                  { !isCompanyPlan && <span className="text-xs text-green-400">Economize 2 meses!</span>}
                </Label>
            </div>
          </CardContent>
          <CardFooter>
            <div className="w-full space-y-2">
                <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>R$ {totalPrice.toFixed(2)}</span>
                </div>
            </div>
          </CardFooter>
        </Card>
      </div>

      <div className="flex flex-col gap-8">
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Pagamento Seguro</CardTitle>
                    <CreditCard className="h-6 w-6 text-muted-foreground" />
                </div>
                <CardDescription>Você será redirecionado para nossa página de pagamento segura para concluir a compra.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    Ao clicar no botão abaixo, você será levado a uma página de checkout segura da Stripe para inserir os detalhes do seu cartão de crédito e finalizar a assinatura.
                </p>
            </CardContent>
            <CardFooter>
                <Button className="w-full font-headline" onClick={handleCreateCheckoutSession} disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isProcessing ? 'Processando...' : 'Pagar com Cartão'}
                </Button>
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}
