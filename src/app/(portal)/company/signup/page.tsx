"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { CompanySignupForm } from "@/components/auth/company-signup-form";

export default function CompanySignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <Icons.logo className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="font-headline text-3xl font-bold">
              Crie sua Conta de Clube/Empresa
            </CardTitle>
            <CardDescription>
              Junte-se à ProSport e encontre seu próximo campeão.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CompanySignupForm />
            <div className="mt-4 text-center text-sm">
              Já tem uma conta?{" "}
              <Button variant="link" asChild className="p-0">
                <Link href="/company/login">Faça login</Link>
              </Button>
            </div>
             <div className="mt-6 text-center text-sm">
              <Button variant="link" asChild className="p-0">
                <Link href="/">Voltar ao portal</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
