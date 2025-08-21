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
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  dateOfBirth: z.date({
    required_error: "A date of birth is required.",
  }),
  sport: z.string().min(2, "Sport is required."),
  isAmateur: z.string({ required_error: "Please select a status." }),
  details: z.string().min(10, "Details must be at least 10 characters."),
  achievements: z.string().min(10, "Achievements must be at least 10 characters."),
  stats: z.string().min(5, "Stats must be at least 5 characters."),
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
          title: "File too large",
          description: "Please upload an image smaller than 4MB.",
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
        toast({ variant: "destructive", title: "Error", description: result.error });
      } else {
        setBasicHtml(result.presentation || "");
        toast({ title: "Success", description: "Basic Sportpage generated!" });
      }
    });
  };

  const handleGeneratePlus = () => {
    if (!photoDataUri) {
      toast({
        variant: "destructive",
        title: "Photo required",
        description: "Please upload a photo for the Plus Sportpage.",
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
        toast({ variant: "destructive", title: "Error", description: result.error });
      } else {
        setPlusHtml(result.sportpageHtml || "");
        toast({ title: "Success", description: "Enhanced Sportpage generated!" });
      }
    });
  };
  

  return (
    <Card>
      <CardContent className="p-6">
        <Tabs defaultValue="profile">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="basic" disabled={!form.formState.isValid}>Basic Sportpage</TabsTrigger>
            <TabsTrigger value="plus" disabled={!form.formState.isValid}>Plus Sportpage</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="font-headline">Your Profile</CardTitle>
                <CardDescription>
                  Complete your profile to generate your Sportpages. This information will be used to attract sponsors.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form className="space-y-8">
                    {/* Form fields here */}
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                       <FormField control={form.control} name="fullName" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl><Input placeholder="e.g., Jane Doe" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Date of birth</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
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
                        <FormLabel>Sport</FormLabel>
                        <FormControl><Input placeholder="e.g., Brazilian Jiu-Jitsu" {...field} /></FormControl>
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
                              <FormLabel className="font-normal">Amateur</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl><RadioGroupItem value="false" /></FormControl>
                              <FormLabel className="font-normal">Professional</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="details" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Details</FormLabel>
                        <FormControl><Textarea placeholder="Describe your weight class, martial arts rank, etc." className="resize-none" {...field} /></FormControl>
                        <FormDescription>This helps sponsors understand your specific athletic profile.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="achievements" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Achievements</FormLabel>
                        <FormControl><Textarea placeholder="List your titles, championships, and significant accomplishments." className="resize-none" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="stats" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stats</FormLabel>
                        <FormControl><Textarea placeholder="Provide key statistics like win/loss record, personal bests, etc." className="resize-none" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="photo" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Photo (for Plus Plan)</FormLabel>
                        <FormControl><Input type="file" accept="image/*" onChange={handleFileChange} /></FormControl>
                        <FormDescription>A high-quality photo for your enhanced Sportpage. Max 4MB.</FormDescription>
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
                <CardTitle className="font-headline">Basic Sportpage</CardTitle>
                <CardDescription>Generate a clean, professional page to share with potential sponsors.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <Button onClick={handleGenerateBasic} disabled={isBasicPending || !form.formState.isValid}>
                  {isBasicPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Generate Basic Page
                </Button>
                {basicHtml && (
                  <div className="mt-4">
                    <h3 className="mb-2 text-lg font-semibold font-headline">Preview</h3>
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
                <CardTitle className="font-headline">Enhanced Sportpage (Plus Plan)</CardTitle>
                <CardDescription>Create a visually stunning, NFL/NBA-style presentation to wow sponsors.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <Button onClick={handleGeneratePlus} disabled={isPlusPending || !form.formState.isValid || !photoDataUri}>
                  {isPlusPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Generate Enhanced Page
                </Button>
                {plusHtml && (
                  <div className="mt-4">
                    <h3 className="mb-2 text-lg font-semibold font-headline">Preview</h3>
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
