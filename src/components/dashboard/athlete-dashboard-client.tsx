
"use client";

import React, { useState, useTransition, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Loader2, Sparkles, ArrowLeft, ExternalLink, Upload, Image as ImageIcon, Edit, HelpCircle } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { CopyButton } from "@/components/ui/copy-button";
import { HttpsCallable } from "firebase/functions";
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';
import { getAuth } from "firebase/auth";

// Validações com Zod - Agora espelhando o backend
const requiredString = z.string().min(1, "Este campo é obrigatório.");

const profileFormSchema = z.object({
  fullName: requiredString,
  dateOfBirth: z.date({
    required_error: "A data de nascimento é obrigatória.",
  }),
  sport: requiredString,
  isAmateur: z.string({ required_error: "Por favor, selecione um status." }),
  details: requiredString,
  team: requiredString,
  achievements: requiredString,
  photo: z.any().refine(val => val, { message: "A foto do perfil é obrigatória." }),
  extraPhotos: z.any(),
  youtubeLink: z.string().url("O link do YouTube deve ser uma URL válida.").optional().or(z.literal('')),
  instagramUsername: requiredString,
  facebookUsername: requiredString,
  contato: requiredString, 
}).superRefine((data, ctx) => {
    // Validação condicional para plano Premium
    if (typeof window !== 'undefined' && sessionStorage.getItem("userPlan") === 'premium') {
       if (!data.extraPhotos || data.extraPhotos.length === 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['extraPhotos'],
            message: 'A galeria de imagens é obrigatória para o plano Premium.',
        });
       }
    }
});


type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface AthleteDashboardClientProps {
  onPageGenerated: (url: string | null) => void;
  generatePageFunction: HttpsCallable<any, any>;
}

// Crie uma função helper de upload
async function uploadImageToStorage(dataUri: string): Promise<string> {
  const storage = getStorage();
  const fileExtension = dataUri.split(';')[0].split('/')[1];
  const fileName = `athlete-images/${uuidv4()}.${fileExtension}`;
  const storageRef = ref(storage, fileName);

  const uploadResult = await uploadString(storageRef, dataUri, 'data_url');
  const downloadURL = await getDownloadURL(uploadResult.ref);
  
  return downloadURL;
}

export function AthleteDashboardClient({ onPageGenerated, generatePageFunction }: AthleteDashboardClientProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [generatedPageUrl, setGeneratedPageUrl] = useState<string | null>(null);
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
  const [extraPhotosDataUris, setExtraPhotosDataUris] = useState<string[]>([]);
  const [generationCount, setGenerationCount] = useState(0);
  const GENERATION_LIMIT = 2;


  const [userPlan, setUserPlan] = useState<"basic" | "plus" | "premium" | "pro">("basic");

  useEffect(() => {
    const planFromSession = sessionStorage.getItem("userPlan") as "basic" | "plus" | "premium" | "pro" | null;
    if (planFromSession) {
      setUserPlan(planFromSession);
    }
  }, []);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: "onChange",
     defaultValues: {
      fullName: "Atleta Teste",
      sport: "Jiu-Jitsu",
      isAmateur: "false",
      details: "Faixa Preta, Peso Pesado",
      team: "Equipe Teste",
      achievements: "Campeão Mundial 2023, Campeão Panamericano 2022",
      dateOfBirth: new Date(1990, 0, 1),
      youtubeLink: "",
      photo: undefined,
      extraPhotos: undefined,
      instagramUsername: "prosport_oficial",
      facebookUsername: "prosport.oficial",
      contato: "5521999998888"
    }
  });
  
  useEffect(() => {
    form.setValue('photo', photoDataUri, { shouldValidate: true });
  }, [photoDataUri, form]);

  useEffect(() => {
    form.setValue('extraPhotos', extraPhotosDataUris, { shouldValidate: true });
  }, [extraPhotosDataUris, form]);


  const fileToDataUri = (file: File): Promise<string> => {
     return new Promise((resolve, reject) => {
        if (file.size > 4 * 1024 * 1024) {
            const errorMsg = `O arquivo ${file.name} excede o limite de 4MB.`;
            toast({ variant: "destructive", title: "Arquivo muito grande", description: errorMsg });
            reject(new Error(errorMsg));
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const uri = await fileToDataUri(file);
        setPhotoDataUri(uri);
        form.setValue('photo', uri, { shouldValidate: true });
        toast({ title: "Imagem Pronta", description: "Sua foto foi carregada." });
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleExtraFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
        if (files.length > 5) {
            toast({
                variant: "destructive",
                title: "Limite de arquivos excedido",
                description: "Você pode enviar no máximo 5 imagens para a galeria."
            });
            return;
        }
        
        startTransition(async () => {
            try {
                const uris = await Promise.all(Array.from(files).map(fileToDataUri));
                setExtraPhotosDataUris(uris);
                form.setValue('extraPhotos', uris, { shouldValidate: true });
                toast({ title: "Galeria Pronta", description: `${uris.length} imagens foram carregadas.`});
            } catch (error) {
                console.error("Erro ao carregar imagens da galeria:", error);
            }
        });
    }
  };
  
  const handleGenerate = () => {
    form.trigger();
    
    if (!photoDataUri) {
        toast({
            variant: "destructive",
            title: "Foto Obrigatória",
            description: "Por favor, faça o upload de uma imagem de perfil para gerar a página.",
        });
        return;
    }

    if (!form.formState.isValid) {
      const errorFields = Object.keys(form.formState.errors);
      toast({
        variant: "destructive",
        title: "Formulário Inválido",
        description: `Por favor, corrija os campos: ${errorFields.join(', ')}`,
      });
      return;
    }
    
    if (generationCount >= GENERATION_LIMIT) {
        toast({
            variant: "destructive",
            title: "Limite Atingido",
            description: "Você já atingiu o limite de gerações de SportPages."
        });
        return;
    }

    startTransition(async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (!currentUser) {
            console.error("DIAGNÓSTICO: Tentativa de upload SEM um utilizador autenticado!");
            toast({
                variant: "destructive",
                title: "Erro de Autenticação",
                description: "O seu login expirou ou não foi confirmado. Por favor, atualize a página ou faça login novamente.",
            });
            return;
        }
        
        console.log("DIAGNÓSTICO: Upload iniciado pelo utilizador:", currentUser.uid);

        setGeneratedPageUrl(null);
        onPageGenerated(null);
        
        toast({ title: "A fazer upload da imagem...", description: "Um momento, por favor." });
        
        const imageUrl = await uploadImageToStorage(photoDataUri!);
        
        let extraImageUrls: string[] = [];
        if (userPlan === 'premium' && extraPhotosDataUris.length > 0) {
            toast({ title: "A fazer upload da galeria...", description: "Isso pode levar alguns segundos." });
            extraImageUrls = await Promise.all(extraPhotosDataUris.map(uri => uploadImageToStorage(uri)));
        }

        toast({ title: "Gerando sua página...", description: "A IA está trabalhando. Isso pode levar um momento." });

        const values = form.getValues();
        
        const payload: { [key: string]: any } = {
            plano: userPlan,
            modalidade: values.sport,
            nome: values.fullName,
            data_nascimento: format(values.dateOfBirth, "dd/MM/yyyy"),
            graduacao: values.details,
            equipe: values.team,
            titulos: values.achievements,
            imagem: imageUrl,
            contato: values.contato,
            instagramUrl: `https://instagram.com/${values.instagramUsername}`,
            facebookUrl: `https://facebook.com/${values.facebookUsername}`,
        };
        
        if (values.isAmateur === "true" || values.isAmateur === "false") {
            payload.status = values.isAmateur === "true" ? "Amador" : "Profissional";
        }
        if (values.youtubeLink) {
            payload.youtubeLink = values.youtubeLink;
        }
        if (extraImageUrls.length > 0) {
            payload.imagensExtra = extraImageUrls;
        }
        
        console.log("EVIDÊNCIA DO PAYLOAD ENVIADO:", JSON.stringify(payload, null, 2));

        const result = await generatePageFunction(payload);
        
        if (result.data.error) {
          throw new Error(result.data.error);
        }
            
        if (!result.data.url) {
            throw new Error("A URL da página não foi retornada pelo servidor.");
        }

        setGeneratedPageUrl(result.data.url);
        onPageGenerated(result.data.url);
        setGenerationCount(prev => prev + 1);
        toast({ title: "Sucesso!", description: `Página gerada e salva! (${generationCount + 1}/${GENERATION_LIMIT} gerações usadas)` });

      } catch (error: any) {
        console.error("Firebase retornou o erro:", error);
        toast({
          variant: "destructive",
          title: "Erro ao gerar a página",
          description: error.message || "Ocorreu um erro inesperado. Verifique o console.",
        });
      }
    });
  }

  const handleBackToDashboard = () => {
    setGeneratedPageUrl(null);
    onPageGenerated(null);
  };
  
  const handleEdit = () => {
    setGeneratedPageUrl(null);
    onPageGenerated(null);
  };


  if (generatedPageUrl) {
    return (
      <div className="w-full">
        <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
            <Button variant="outline" onClick={handleBackToDashboard}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Painel
            </Button>
             <div className="flex flex-wrap gap-2">
                 <Button variant="secondary" onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                </Button>
                 <CopyButton variant="secondary" textToCopy={generatedPageUrl}>
                    Copiar Link
                </CopyButton>
                <Button asChild>
                    <Link href={generatedPageUrl} target="_blank">
                        Abrir em Nova Aba <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </div>
        <Card>
            <CardContent className="p-0">
                <iframe
                src={generatedPageUrl}
                className="w-full h-[calc(100vh-12rem)] border-0 rounded-lg"
                sandbox="allow-scripts allow-same-origin"
                />
            </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="font-headline">Painel do Atleta</CardTitle>
                <CardDescription>
                    Complete seu perfil para gerar suas Páginas Esportivas.
                </CardDescription>
            </div>
             <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" asChild>
                    <Link href="/portal/tutorial">
                        <HelpCircle className="mr-2 h-4 w-4" />
                        Ver Tutorial
                    </Link>
                </Button>
                {userPlan && (
                    <div className="text-right">
                        <span className="text-sm text-muted-foreground">Plano Atual</span>
                        <p className="font-bold capitalize text-primary">{userPlan}</p>
                    </div>
                )}
            </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-8">
        <Form {...form}>
          <form className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Nascimento</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "PPP", { locale: ptBR })
                            ) : (
                              <span>Escolha uma data</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                          locale={ptBR}
                          captionLayout="dropdown-buttons"
                          fromYear={1960}
                          toYear={new Date().getFullYear()}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                    control={form.control}
                    name="sport"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Esporte</FormLabel>
                        <FormControl>
                        <Input placeholder="ex: Jiu-Jitsu Brasileiro" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="team"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Equipe/Clube</FormLabel>
                        <FormControl>
                        <Input placeholder="ex: Gracie Barra" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
            <FormField
              control={form.control}
              name="isAmateur"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="true" />
                        </FormControl>
                        <FormLabel className="font-normal">Amador</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="false" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Profissional
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detalhes (Graduação, Categoria, etc.)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva sua categoria de peso, faixa, etc."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="achievements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conquistas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Liste seus títulos, campeonatos e conquistas significativas."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="photo"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Foto do Perfil</FormLabel>
                    <FormControl>
                        <div className="relative">
                        <Input id="picture" type="file" accept="image/*" onChange={handleFileChange} className="pl-10" />
                        <label htmlFor="picture" className="absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground">
                            <Upload className="h-4 w-4" />
                        </label>
                        </div>
                    </FormControl>
                    <FormDescription>
                        Uma foto de alta qualidade para sua Página Esportiva. Máx 4MB.
                        {photoDataUri && <img src={photoDataUri} alt="Pré-visualização" className="mt-4 rounded-md max-h-40" />}
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
             />
             {userPlan === 'premium' && (
              <FormField
                control={form.control}
                name="extraPhotos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Galeria de Imagens</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input id="extraPictures" type="file" accept="image/*" multiple onChange={handleExtraFilesChange} className="pl-10" />
                        <label htmlFor="extraPictures" className="absolute left-3 top-1-2 -translate-y-1/2 cursor-pointer text-muted-foreground">
                          <ImageIcon className="h-4 w-4" />
                        </label>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Envie até 5 imagens para sua galeria. Máx 4MB por imagem.
                    </FormDescription>
                    {extraPhotosDataUris.length > 0 && (
                      <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                        {extraPhotosDataUris.map((uri, index) => (
                          <img key={index} src={uri} alt={`Pré-visualização da galeria ${index + 1}`} className="rounded-md h-20 w-full object-cover" />
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
                control={form.control}
                name="youtubeLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link do Vídeo do YouTube (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.youtube.com/watch?v=..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
            />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                    control={form.control}
                    name="instagramUsername"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Usuário do Instagram</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">@</span>
                                <Input placeholder="seu_usuario" {...field} className="pl-7" />
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="facebookUsername"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Usuário do Facebook</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">@</span>
                                <Input placeholder="seu.usuario" {...field} className="pl-7" />
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
             </div>
              <FormField
                control={form.control}
                name="contato"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp para Contato</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="5521999998888" {...field} />
                    </FormControl>
                     <FormDescription>
                        Inclua o código do país e o DDD.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </form>
        </Form>
        
        <Separator />
        
        <div className="space-y-8">
            <CardHeader className="p-0">
                <CardTitle className="font-headline">Geração da SportPage</CardTitle>
                <CardDescription>
                    Clique no botão para gerar sua página com base no seu plano. Os dados do formulário acima serão enviados para a IA.
                </CardDescription>
            </CardHeader>
            <div className="flex flex-wrap gap-4 items-center">
                 <Button onClick={() => handleGenerate()} disabled={isPending || generationCount >= GENERATION_LIMIT}>
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Gerar SportPage
                </Button>
                 {generationCount >= GENERATION_LIMIT && (
                    <Alert variant="destructive" className="w-full md:w-auto">
                        <AlertTitle>Você atingiu o limite de gerações com IA.</AlertTitle>
                    </Alert>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
