"use client";

import React, { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const profileFormSchema = z.object({
  fullName: z.string().min(2, "O nome completo deve ter pelo menos 2 caracteres."),
  dateOfBirth: z.date({
    required_error: "A data de nascimento é obrigatória.",
  }),
  sport: z.string().min(2, "O esporte é obrigatório."),
  isAmateur: z.string({ required_error: "Por favor, selecione um status." }),
  details: z.string().min(10, "Os detalhes devem ter pelo menos 10 caracteres."),
  achievements: z.string().min(10, "As conquistas devem ter pelo menos 10 caracteres."),
  stats: z.string().min(5, "As estatísticas devem ter pelo menos 5 caracteres."),
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

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: "onChange",
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
    const values = form.getValues();
    startBasicTransition(async () => {
      const result = await createBasicPresentation({
        ...values,
        dateOfBirth: format(values.dateOfBirth, "PPP"),
        isAmateur: values.isAmateur === "true",
      });
      if (result.error) {
        toast({ variant: "destructive", title: "Erro", description: result.error });
      } else {
        setBasicHtml(result.presentation || "");
        toast({ title: "Sucesso", description: "Página esportiva básica gerada!" });
      }
    });
  };

  const handleGeneratePlus = () => {
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
      const result = await createEnhancedSportpage({
        ...values,
        dateOfBirth: format(values.dateOfBirth, "PPP"),
        isAmateur: values.isAmateur === "true",
        photoDataUri,
      });
      if (result.error) {
        toast({ variant: "destructive", title: "Erro", description: result.error });
      } else {
        setPlusHtml(result.sportpageHtml || "");
        toast({ title: "Sucesso", description: "Página Esportiva Melhorada gerada!" });
      }
    });
  };
  

  return (
    <Card>
      <CardContent className="p-6">
        <Tabs defaultValue="profile">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="basic" disabled={!form.formState.isValid}>Página Básica</TabsTrigger>
            <TabsTrigger value="plus" disabled={!form.formState.isValid}>Página Plus</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="font-headline">Seu Perfil</CardTitle>
                <CardDescription>
                  Complete seu perfil para gerar suas Páginas Esportivas. Esta informação será usada para atrair patrocinadores.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form className="space-y-8">
                    {/* Form fields here */}
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
                                    {field.value ? format(field.value, "PPP") : <span>Escolha uma data</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus />
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
                    <FormField control={form.control} name="stats" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estatísticas</FormLabel>
                        <FormControl><Textarea placeholder="Forneça estatísticas importantes como recorde de vitórias/derrotas, recordes pessoais, etc." className="resize-none" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="photo" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Foto do Perfil (para o Plano Plus)</FormLabel>
                        <FormControl><Input type="file" accept="image/*" onChange={handleFileChange} /></FormControl>
                        <FormDescription>Uma foto de alta qualidade para sua Página Esportiva melhorada. Máx 4MB.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="basic">
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="font-headline">Página Esportiva Básica</CardTitle>
                <CardDescription>Gere uma página limpa e profissional para compartilhar com potenciais patrocinadores.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <Button onClick={handleGenerateBasic} disabled={isBasicPending || !form.formState.isValid}>
                  {isBasicPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Gerar Página Básica
                </Button>
                {basicHtml && (
                  <div className="mt-4">
                    <h3 className="mb-2 text-lg font-semibold font-headline">Pré-visualização</h3>
                    <div className="rounded-lg border bg-background">
                       <iframe srcDoc={basicHtml} className="w-full h-[600px] border-0 rounded-lg" sandbox="" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plus">
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="font-headline">Página Esportiva Melhorada (Plano Plus)</CardTitle>
                <CardDescription>Crie uma apresentação visualmente deslumbrante, no estilo NFL/NBA, para impressionar os patrocinadores.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <Button onClick={handleGeneratePlus} disabled={isPlusPending || !form.formState.isValid || !photoDataUri}>
                  {isPlusPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Gerar Página Melhorada
                </Button>
                {plusHtml && (
                  <div className="mt-4">
                    <h3 className="mb-2 text-lg font-semibold font-headline">Pré-visualização</h3>
                    <div className="rounded-lg border bg-background">
                      <iframe srcDoc={plusHtml} className="w-full h-[600px] border-0 rounded-lg" sandbox="" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </CardContent>
    </Card>
  );
}
