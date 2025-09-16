
"use client";

import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { Icons } from "@/components/icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  return (
    <div 
      className="relative flex min-h-screen flex-col items-center justify-center p-4"
    >
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <Icons.logo className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="font-headline text-3xl font-bold">
              Crie Seu Perfil
            </CardTitle>
            <CardDescription>
              Junte-se ao ProSport e comece a se conectar com patrocinadores.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignupForm />
            <div className="mt-4 text-center text-sm">
              Já tem uma conta?{" "}
              <Button variant="link" asChild className="p-0">
                <Link href="/portal/athlete/login">Faça login</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
