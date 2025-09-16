
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function SuccessPage() {
  // In a real application, you would use this page to verify the payment
  // with another Cloud Function call (to capture the payment) and update the user's status.
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-2xl">
        <CardHeader className="items-center">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          <CardTitle className="mt-4 font-headline text-3xl">Pagamento Bem-Sucedido!</CardTitle>
          <CardDescription className="mt-2">
            Sua assinatura foi ativada. Você será redirecionado para o seu painel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/portal/dashboard">Ir para o Painel</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
