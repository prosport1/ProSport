
import Link from "next/link";
import { Icons } from "@/components/icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PortalPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <Icons.logo className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="font-headline text-3xl font-bold">
              Bem-vindo ao ProSport
            </CardTitle>
            <CardDescription>
              Conectando atletas, patrocinadores e clubes para criar oportunidades.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Button asChild className="w-full font-headline" size="lg">
              <Link href="/athlete/login">Sou Atleta</Link>
            </Button>
            <Button asChild className="w-full font-headline" size="lg" variant="outline">
              <Link href="/company/login">Sou Patrocinador</Link>
            </Button>
            <Button asChild className="w-full font-headline md:col-span-1" size="lg" variant="outline">
               <Link href="/club/login">Empresas/Clubes</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
