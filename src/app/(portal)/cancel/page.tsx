
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "lucide-react";
import Link from "next/link";

export default function CancelPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-2xl">
        <CardHeader className="items-center">
            <XCircle className="h-16 w-16 text-destructive" />
          <CardTitle className="mt-4 font-headline text-3xl">Pagamento Cancelado</CardTitle>
          <CardDescription className="mt-2">
            Você cancelou o processo de pagamento. Sua assinatura não foi ativada. Se isso foi um engano, você pode tentar novamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/plans">Ver Planos</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
