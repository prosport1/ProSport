import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Icons } from "@/components/icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <Icons.logo className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="font-headline text-3xl font-bold">
              Esqueceu sua Senha?
            </CardTitle>
            <CardDescription>
              Sem problemas. Insira seu e-mail e enviaremos um link para você
              resetar sua senha.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ForgotPasswordForm />
             <div className="mt-4 text-center text-sm">
              Lembrou sua senha?{" "}
              <Button variant="link" asChild className="p-0">
                <Link href="/">Faça login</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
