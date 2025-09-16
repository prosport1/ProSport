
import { Header } from "@/components/header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const tutorialSteps = [
  {
    title: "Passo 1: Preencha Seu Perfil",
    content: "O primeiro passo é fornecer todas as suas informações de atleta. Preencha cada campo do formulário com atenção. Detalhes completos e precisos são essenciais para impressionar patrocinadores e clubes. Todos os campos são obrigatórios.",
  },
  {
    title: "Passo 2: Envie Suas Melhores Fotos",
    content: "A imagem é tudo. Faça o upload de uma foto de perfil profissional e, se você for um usuário Premium, adicione até 5 imagens de alta qualidade para sua galeria. Escolha fotos que mostrem você em ação ou que representem sua carreira.",
  },
  {
    title: "Passo 3: Gere a Sua SportPage com a IA",
    content: "Com o formulário preenchido e as fotos carregadas, clique no botão 'Gerar SportPage'. Nossa IA usará seus dados para criar um layout profissional e único. Lembre-se, você tem um limite de gerações, então revise seus dados antes de gerar.",
  },
  {
    title: "Passo 4: Visualize, Edite e Compartilhe",
    content: "Após a geração, sua SportPage será exibida. Você pode revisá-la, voltar para editar as informações (e gerar novamente, se tiver gerações disponíveis) ou usar o botão 'Copiar Link' para compartilhar sua página com o mundo!",
  },
];

export default function TutorialPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="container flex-1 py-12 md:py-24">
        <div className="mx-auto max-w-3xl">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="font-headline text-4xl">
                        Guia Rápido: Como Criar sua SportPage
                    </CardTitle>
                    <CardDescription className="text-lg">
                        Siga estes passos simples para criar uma página profissional e atrair patrocinadores.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <Accordion type="single" collapsible defaultValue="item-0" className="w-full">
                        {tutorialSteps.map((step, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger className="text-xl font-bold">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="h-6 w-6 text-primary" />
                                    {step.title}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-base pl-12">
                                {step.content}
                            </AccordionContent>
                        </AccordionItem>
                        ))}
                    </Accordion>
                     <div className="mt-8 text-center">
                        <Button asChild>
                            <Link href="/dashboard">Voltar ao Painel</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
