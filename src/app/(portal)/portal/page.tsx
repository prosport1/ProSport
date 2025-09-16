
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
     <div 
      className="relative flex min-h-screen flex-col items-center justify-center p-4"
      style={{
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.85)), url('https://storage.googleapis.com/aip-dev-buddy-user-assets/images/de4a9b5f-a0a8-42bd-9c7a-59f77f0a6d1c.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
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
          <CardContent className="flex flex-col gap-4">
            <Button asChild className="w-full font-headline" size="lg">
              <Link href="/athlete/login">Sou Atleta</Link>
            </Button>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Button asChild className="w-full font-headline" size="lg" variant="outline">
                  <Link href="/company/login">Sou Patrocinador</Link>
                </Button>
                <Button asChild className="w-full font-headline" size="lg" variant="outline">
                   <Link href="/company/login">Sou Clube/Empresa</Link>
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
