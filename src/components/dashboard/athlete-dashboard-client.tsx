"use client";

import React, { useState, useTransition, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Loader2, Sparkles } from "lucide-react";
import {
  createBasicPresentation,
  createEnhancedSportpage,
} from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CopyButton } from "@/components/ui/copy-button";
import { Separator } from "@/components/ui/separator";

const profileFormSchema = z.object({
  fullName: z.string().min(2, "O nome completo deve ter pelo menos 2 caracteres."),
  dateOfBirth: z.date({
    required_error: "A data de nascimento é obrigatória.",
  }),
  sport: z.string().min(2, "O esporte é obrigatório."),
  isAmateur: z.string({ required_error: "Por favor, selecione um status." }),
  details: z.string().min(10, "Os detalhes devem ter pelo menos 10 caracteres."),
  achievements: z.string().min(10, "As conquistas devem ter pelo menos 10 caracteres."),
  photo: z.any().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function AthleteDashboardClient() {
  const { toast } = useToast();
  const [isBasicPending, startBasicTransition] = useTransition();
  const [isPlusPending, startPlusTransition] = useTransition();

  const [basicHtml, setBasicHtml] = useState("");
  const [plusHtml, setPlusHtml] = useState("");
  const [photoDataUri, setPhotoDataUri] = useState("");
  const [basicUrl, setBasicUrl] = useState("");
  const [plusUrl, setPlusUrl] = useState("");
  
  const [userPlan, setUserPlan] = useState<"basic" | "plus" | "premium" | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const plan = sessionStorage.getItem("userPlan") as "basic" | "plus" | "premium" | null;
      // Default to basic if no plan is found
      setUserPlan(plan || "basic"); 
    }
  }, []);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      sport: "",
      isAmateur: undefined,
      details: "",
      achievements: "",
      photo: undefined,
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "Arquivo muito grande",
          description: "Por favor, envie uma imagem menor que 4MB.",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoDataUri(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateBasic = () => {
    form.trigger();
    if (!form.formState.isValid) {
      toast({
        variant: "destructive",
        title: "Formulário Inválido",
        description: "Por favor, preencha todos os campos obrigatórios.",
      });
      return;
    }
    const values = form.getValues();
    startBasicTransition(async () => {
      const result = await createBasicPresentation({
        fullName: values.fullName,
        dateOfBirth: format(values.dateOfBirth, "dd/MM/yyyy"),
        sport: values.sport,
        isAmateur: values.isAmateur === "true",
        achievements: values.achievements,
        details: values.details,
      });
      if (result.error) {
        toast({ variant: "destructive", title: "Erro", description: result.error });
      } else {
        setBasicHtml(result.presentation || "");
        setBasicUrl(result.presentationUrl || "");
        toast({ title: "Sucesso", description: "Página esportiva básica gerada!" });
      }
    });
  };

  const handleGeneratePlus = () => {
    form.trigger();
    if (!form.formState.isValid) {
       toast({
        variant: "destructive",
        title: "Formulário Inválido",
        description: "Por favor, preencha todos os campos obrigatórios.",
      });
      return;
    }
    if (!photoDataUri) {
      toast({
        variant: "destructive",
        title: "Foto necessária",
        description: "Por favor, envie uma foto para a Página Esportiva Plus.",
      });
      return;
    }
    const values = form.getValues();
    startPlusTransition(async () => {
      const dataToSend = {
        fullName: values.fullName,
        dateOfBirth: format(values.dateOfBirth, "dd/MM/yyyy"),
        sport: values.sport,
        isAmateur: values.isAmateur === "true",
        details: values.details,
        achievements: values.achievements,
        photoDataUri: photoDataUri,
      };
      
      const result = await createEnhancedSportpage(dataToSend);

      if (result.error) {
        toast({ variant: "destructive", title: "Erro", description: result.error });
      } else {
        setPlusHtml(result.sportpageHtml || "");
        setPlusUrl(result.sportpageUrl || "");
        toast({ title: "Sucesso", description: "Página Esportiva Melhorada gerada!" });
      }
    });
  };
  
  const isPlusPlan = userPlan === 'plus' || userPlan === 'premium';
  const isBasicPlan = userPlan === 'basic';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Painel do Atleta</CardTitle>
        {userPlan && (
          <CardDescription>
            Complete seu perfil para gerar suas Páginas Esportivas. Esta informação será usada para atrair patrocinadores. Seu plano atual é: <span className="font-bold capitalize">{userPlan}</span>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-6 space-y-8">
        <Form {...form}>
          <form className="space-y-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <FormField control={form.control} name="fullName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl><Input placeholder="ex: Jane Doe" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Nascimento</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar locale={ptBR} mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} captionLayout="dropdown-buttons" fromYear={1960} toYear={new Date().getFullYear()} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )} />
            </div>
            <FormField control={form.control} name="sport" render={({ field }) => (
              <FormItem>
                <FormLabel>Esporte</FormLabel>
                <FormControl><Input placeholder="ex: Jiu-Jitsu Brasileiro" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="isAmateur" render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl><RadioGroupItem value="true" /></FormControl>
                      <FormLabel className="font-normal">Amador</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl><RadioGroupItem value="false" /></FormControl>
                      <FormLabel className="font-normal">Profissional</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="details" render={({ field }) => (
              <FormItem>
                <FormLabel>Detalhes</FormLabel>
                <FormControl><Textarea placeholder="Descreva sua categoria de peso, faixa, etc." className="resize-none" {...field} /></FormControl>
                <FormDescription>Isso ajuda os patrocinadores a entenderem seu perfil atlético específico.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="achievements" render={({ field }) => (
              <FormItem>
                <FormLabel>Conquistas</FormLabel>
                <FormControl><Textarea placeholder="Liste seus títulos, campeonatos e conquistas significativas." className="resize-none" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
             <FormField control={form.control} name="photo" render={({ field }) => (
              <FormItem>
                <FormLabel>Foto do Perfil {isPlusPlan ? "(Obrigatória para o seu plano)" : ""}</FormLabel>
                <FormControl><Input type="file" accept="image/*" onChange={handleFileChange} /></FormControl>
                <FormDescription>
                  Uma foto de alta qualidade para sua Página Esportiva. Máx 4MB. 
                  {!isPlusPlan && " (O envio de fotos está disponível apenas para planos Plus e Premium)"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )} />
          </form>
        </Form>
        
        <Separator />
        
        <div className="space-y-8">
            {isBasicPlan && (
              <div className="space-y-4">
                  <CardHeader className="p-0">
                      <CardTitle className="font-headline">Sport Page Básica</CardTitle>
                      <CardDescription>Gere uma página limpa e profissional para compartilhar com potenciais patrocinadores.</CardDescription>
                  </CardHeader>
                  <Button onClick={handleGenerateBasic} disabled={isBasicPending || !form.formState.isValid}>
                      {isBasicPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                      Gerar Sport Page Básica
                  </Button>
                  {basicUrl && (
                      <div className="mt-4 space-y-4">
                      <div className="space-y-2">
                          <Label>Link Compartilhável</Label>
                          <div className="flex items-center gap-2">
                              <Input value={new URL(basicUrl, window.location.origin).href} readOnly />
                              <CopyButton textToCopy={new URL(basicUrl, window.location.origin).href}>Copiar</CopyButton>
                          </div>
                      </div>
                      </div>
                  )}
                  {basicHtml && (
                      <div className="mt-4">
                      <h3 className="mb-2 text-lg font-semibold font-headline">Pré-visualização</h3>
                      <div className="rounded-lg border bg-background">
                          <iframe srcDoc={basicHtml} className="w-full h-[600px] border-0 rounded-lg" sandbox="allow-scripts" />
                      </div>
                      </div>
                  )}
              </div>
            )}

            {isPlusPlan && (
              <div className="space-y-4">
                   <CardHeader className="p-0">
                      <CardTitle className="font-headline">Sport Page Melhorada</CardTitle>
                      <CardDescription>Crie uma apresentação visualmente deslumbrante, no estilo NFL/NBA, para impressionar os patrocinadores.</CardDescription>
                  </CardHeader>
                  <Button onClick={handleGeneratePlus} disabled={isPlusPending || !form.formState.isValid || !photoDataUri}>
                    {isPlusPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Gerar Sport Page
                  </Button>
                  {plusUrl && (
                    <div className="mt-4 space-y-4">
                      <div className="space-y-2">
                         <Label>Link Compartilhável</Label>
                         <div className="flex items-center gap-2">
                           <Input value={new URL(plusUrl, window.location.origin).href} readOnly />
                           <CopyButton textToCopy={new URL(plusUrl, window.location.origin).href}>Copiar</CopyButton>
                         </div>
                      </div>
                    </div>
                  )}
                  {plusHtml && (
                    <div className="mt-4">
                      <h3 className="mb-2 text-lg font-semibold font-headline">Pré-visualização</h3>
                      <div className="rounded-lg border bg-background">
                        <iframe srcDoc={plusHtml} className="w-full h-[600px] border-0 rounded-lg" sandbox="allow-scripts" />
                      </div>
                    </div>
                  )}
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
