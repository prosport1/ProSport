
'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { CopyButton } from '@/components/ui/copy-button';
import { useToast } from '@/hooks/use-toast';
import { AmexIcon, EloIcon, MastercardIcon, VisaIcon } from '@/components/icons/credit-cards';

const planDetails = {
  basic: { name: "Básico", monthlyPrice: 9.90, annualPrice: 99.90 },
  plus: { name: "Plus", monthlyPrice: 29.90, annualPrice: 299.90 },
  premium: { name: "Premium", monthlyPrice: 59.90, annualPrice: 599.90 },
  pro: { name: "Pro", monthlyPrice: 2000.00, annualPrice: 20000.00 },
};

export function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const plan = searchParams.get('plan') as keyof typeof planDetails | null;
  const [isAnnual, setIsAnnual] = useState(false);

  if (!plan || !planDetails[plan]) {
    const defaultPlanPath = plan === 'pro' ? '/company/plans' : '/plans';
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

  const handleSubscription = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("userPlan", plan);
    }
    
    toast({
      title: "Inscrição realizada com sucesso!",
      description: `Bem-vindo ao plano ${details.name}. Você será redirecionado para o painel.`,
    });
    router.push('/dashboard');
  }

  const handleCompanySubscription = () => {
     toast({
      title: "Inscrição realizada com sucesso!",
      description: `Bem-vindo ao plano ${details.name}. Você será redirecionado para o painel.`,
    });
    router.push('/company/dashboard');
  }

  const isCompanyPlan = plan === 'pro';

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
        <Tabs defaultValue="credit-card" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="credit-card">Cartão de Crédito</TabsTrigger>
            <TabsTrigger value="pix">PIX</TabsTrigger>
          </TabsList>
          <TabsContent value="credit-card">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Pagamento com Cartão</CardTitle>
                    <div className="flex items-center gap-2">
                        <VisaIcon className="h-6" />
                        <MastercardIcon className="h-6" />
                        <AmexIcon className="h-6" />
                        <EloIcon className="h-6" />
                    </div>
                </div>
                <CardDescription>Insira os dados do seu cartão de crédito.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="card-number">Número do Cartão</Label>
                  <Input id="card-number" placeholder="0000 0000 0000 0000" />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="card-name">Nome no Cartão</Label>
                  <Input id="card-name" placeholder="Ex: M. Jordan" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="expiry-date">Validade</Label>
                    <Input id="expiry-date" placeholder="MM/AA" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input id="cvc" placeholder="123" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full font-headline" onClick={isCompanyPlan ? handleCompanySubscription : handleSubscription}>Assinar Agora</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="pix">
            <Card>
              <CardHeader>
                <CardTitle>Pagamento com PIX</CardTitle>
                <CardDescription>Escaneie o QR Code ou copie o código abaixo.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <div className="rounded-lg bg-white p-4">
                    <img src="https://placehold.co/200x200.png" alt="QR Code PIX" data-ai-hint="qr code" />
                </div>
                <div className="w-full space-y-2">
                    <Label>Código PIX (Copia e Cola)</Label>
                    <div className="flex items-center gap-2">
                        <Input readOnly value="00020126...br.gov.bcb.pix...52040000" />
                        <CopyButton variant="outline" textToCopy="00020126...br.gov.bcb.pix...52040000">Copiar</CopyButton>
                    </div>
                </div>
              </CardContent>
               <CardFooter>
                <p className="text-xs text-muted-foreground text-center">
                    Após o pagamento, sua assinatura será ativada automaticamente.
                </p>
               </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
