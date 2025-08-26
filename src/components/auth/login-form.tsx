
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  email: z.string().email({ message: "Endereço de e-mail inválido." }),
  password: z.string().min(1, { message: "A senha é obrigatória." }),
});

interface LoginFormProps {
  userType: "athlete" | "company" | "club";
}


export function LoginForm({ userType }: LoginFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Mock login logic
    console.log(values);
    if (values.email === "admin@prosport.com") {
      router.push("/admin");
    } else if (userType === 'athlete') {
      router.push("/dashboard");
    } else if (userType === 'company') {
      router.push("/company/dashboard");
    } else if (userType === 'club') {
        router.push('/club/dashboard');
    } else {
      router.push("/company/dashboard");
    }
    toast({
      title: "Login bem-sucedido",
      description: "Redirecionando para o seu painel...",
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="seu.email@exemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Senha</FormLabel>
                <Button variant="link" asChild className="p-0 text-sm h-auto">
                  <Link href="/forgot-password">Esqueceu a senha?</Link>
                </Button>
              </div>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full font-headline">
          Entrar
        </Button>
      </form>
    </Form>
  );
}
