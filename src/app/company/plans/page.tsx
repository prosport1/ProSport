
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";

const plan = {
  id: "pro",
  name: "Plano Pro",
  price: "R$ 2.000/mês",
  annualPrice: "R$ 20.000/ano",
  description: "Acesso total e irrestrito à nossa base de talentos, com as melhores ferramentas para encontrar seu próximo campeão.",
  features: [
    "Acesso completo a todas as SportPages",
    "Imagens em alta resolução (4K e 6K)",
    "Animações avançadas e efeitos visuais",
    "Download de dados e informações detalhadas dos atletas",
    "Filtros de pesquisa avançados e premium",
    "Acesso a vídeos e documentos dos atletas",
    "Suporte Prioritário",
  ],
  cta: "Assinar Plano",
};

export default function CompanyPlansPage() {
  // For now, this is a static page. State for monthly/annual toggle would be added here.
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header plansPath="/company/plans" dashboardPath="/company/dashboard" />
      <main className="flex-1">
        <section className="container flex flex-col items-center gap-6 py-12 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-headline text-4xl font-bold md:text-5xl">
              Plano para Empresas e Patrocinadores
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Um plano completo para garantir que você encontre o talento ideal para sua marca.
            </p>
          </div>
          <div className="flex w-full max-w-2xl justify-center">
            <Card className="flex w-full flex-col border-primary shadow-2xl">
              <CardHeader>
                <CardTitle className="font-headline text-center">{plan.name}</CardTitle>
                <CardDescription className="text-center">{plan.description}</CardDescription>
                <div className="pt-4 text-center">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <p className="text-sm text-muted-foreground">ou {plan.annualPrice} (2 meses de desconto)</p>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="mr-2 mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full font-headline">
                  <Link href={`/checkout?plan=${plan.id}`}>{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
