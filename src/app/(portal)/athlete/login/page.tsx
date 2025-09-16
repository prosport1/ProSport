
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
                  <Link href="/portal/signup">Cadastre-se</Link>
                </Button>
              </div>
              <div className="mt-6 text-center text-sm">
                <Button variant="link" asChild className="p-0">
                  <Link href="/">Voltar</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
