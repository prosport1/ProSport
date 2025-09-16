
"use client";

import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { Icons } from "@/components/icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AthleteLoginPage() {
  return (
    <div 
      className="relative flex min-h-screen flex-col"
      style={{
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.85)), url('https://storage.googleapis.com/aip-dev-buddy-user-assets/images/de4a9b5f-a0a8-42bd-9c7a-59f77f0a6d1c.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl">
            <CardHeader className="text-center">
              <div className="mb-4 flex justify-center">
                <Icons.logo className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="font-headline text-3xl font-bold">
                Login do Atleta
              </CardTitle>
              <CardDescription>
                Faça login para gerenciar seu perfil de atleta.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm userType="athlete" />
              <div className="mt-4 text-center text-sm">
                Não tem uma conta?{" "}
                <Button variant="link" asChild className="p-0">
                  <Link href="/signup">Cadastre-se</Link>
                </Button>
              </div>
              <div className="mt-6 text-center text-sm">
                <Button variant="link" asChild className="p-0">
                  <Link href="/portal">Voltar ao portal</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
