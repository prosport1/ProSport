
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    id: "basic_company",
    name: "Plano Básico",
    price: "R$ 199/ano",
    description: "Ideal para empresas pequenas ou novos patrocinadores.",
    features: [
      "Acesso limitado às SportPages",
      "Visualização de nome, modalidade e conquistas",
      "Qualidade de imagem 4K",
      "Filtros de pesquisa por modalidade e localização",
    ],
    cta: "Assinar Plano Básico",
  },
  {
    id: "plus_company",
    name: "Plano Plus",
    price: "R$ 499/ano",
    description: "Acesso completo com animações e dados detalhados.",
    features: [
      "Tudo do plano Básico",
      "Acesso completo às SportPages",
      "Imagens 4K com animações",
      "Download de dados dos atletas",
      "Filtros de pesquisa avançada",
    ],
    cta: "Assinar Plano Plus",
    featured: true,
  },
  {
    id: "premium_company",
    name: "Plano Premium",
    price: "R$ 999/ano",
    description: "Acesso total com a melhor experiência e visibilidade.",
    features: [
      "Tudo do plano Plus",
      "Imagens 6K com efeitos avançados",
      "Acesso a vídeos e documentos",
      "Filtros de pesquisa Premium",
      "Suporte Prioritário",
    ],
    cta: "Assinar Plano Premium",
  },
];

export default function CompanyPlansPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1">
        <section className="container flex flex-col items-center gap-6 py-12 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-headline text-4xl font-bold md:text-5xl">
              Planos para Patrocinadores
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Escolha o plano anual que abre as portas para os maiores talentos do esporte.
            </p>
          </div>
          <div className="grid w-full max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`flex flex-col ${plan.featured ? "border-primary shadow-2xl" : ""}`}
              >
                <CardHeader>
                  <CardTitle className="font-headline">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="pt-4">
                    <span className="text-3xl font-bold">{plan.price}</span>
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
                  <Button asChild className="w-full font-headline" variant={plan.featured ? "default" : "outline"}>
                    <Link href={`/checkout?plan=${plan.id}`}>{plan.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
