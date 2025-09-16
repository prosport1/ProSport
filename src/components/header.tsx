
import Link from "next/link";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  plansPath?: string;
  dashboardPath?: string;
  sportPageUrl?: string | null;
}

export function Header({
  plansPath = "/plans",
  dashboardPath = "/dashboard",
  sportPageUrl,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link href={dashboardPath} className="flex items-center space-x-2">
            <Icons.logo className="h-6 w-6 text-primary" />
            <span className="inline-block font-headline font-bold">
              ProSport
            </span>
          </Link>
          <nav className="hidden gap-6 md:flex">
            <Link
              href={dashboardPath}
              className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Painel
            </Link>
            {sportPageUrl && (
              <Link
                href={sportPageUrl}
                target="_blank"
                className="flex items-center text-sm font-medium text-primary transition-colors hover:text-foreground"
              >
                SportPage
              </Link>
            )}
            <Link
              href={plansPath}
              className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Planos
            </Link>
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://placehold.co/40x40.png" alt="@atleta" data-ai-hint="person user" />
                    <AvatarFallback>A</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Atleta</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      atleta@prosport.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/">Sair</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>
    </header>
  );
}
