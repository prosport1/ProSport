
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


const formSchema = z
  .object({
    companyName: z.string().min(1, { message: "O nome da empresa é obrigatório." }),
    cnpj: z.string().min(1, { message: "O CNPJ é obrigatório." }),
    sponsorshipType: z.string().min(1, { message: "Selecione o tipo de patrocínio." }),
    sportInterest: z.string().min(1, { message: "A modalidade de interesse é obrigatória." }),
    email: z.string().min(1, { message: "O e-mail é obrigatório." }).email({ message: "Endereço de e-mail inválido." }),
    password: z
      .string()
      .min(8, { message: "A senha deve ter pelo menos 8 caracteres." }),
    confirmPassword: z.string().min(1, { message: "A confirmação da senha é obrigatória." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export function CompanySignupForm() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      cnpj: "",
      sponsorshipType: "",
      sportInterest: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Mock signup logic
    console.log(values);
    
    toast({
      title: "Conta Criada",
      description: "Bem-vindo! Redirecionando para a escolha de planos...",
    });
    router.push("/portal/company/plans");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Empresa</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Nike" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cnpj"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CNPJ</FormLabel>
              <FormControl>
                <Input placeholder="00.000.000/0000-00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="sponsorshipType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Patrocínio</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="financial">Financeiro</SelectItem>
                  <SelectItem value="material">Material/Equipamento</SelectItem>
                  <SelectItem value="services">Serviços</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="sportInterest"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Modalidade de Interesse</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Futebol, Artes Marciais" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Corporativo</FormLabel>
              <FormControl>
                <Input placeholder="contato@suaempresa.com" {...field} />
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
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar Senha</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full font-headline">
          Cadastrar e Ver Planos
        </Button>
      </form>
    </Form>
  );
}
