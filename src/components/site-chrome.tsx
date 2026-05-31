import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Calendar, Scissors } from "lucide-react";

export function SiteHeader() {
  const { user, signOut } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-ember shadow-ember">
            <Calendar className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">Agendai</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <a href="/#segmentos" className="hover:text-foreground">Segmentos</a>
          <a href="/#recursos" className="hover:text-foreground">Recursos</a>
          <a href="/#precos" className="hover:text-foreground">Preços</a>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm"><Link to="/app">Painel</Link></Button>
              <Button onClick={signOut} variant="outline" size="sm">Sair</Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm"><Link to="/auth">Entrar</Link></Button>
              <Button asChild size="sm" className="bg-gradient-ember text-primary-foreground shadow-ember hover:opacity-90">
                <Link to="/auth" search={{ tab: "signup" }}>Começar grátis</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row">
        <div className="flex items-center gap-2">
          <Scissors className="h-4 w-4 text-ember" />
          <span>© {new Date().getFullYear()} Agendai. Todos os direitos reservados.</span>
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-foreground">Termos</a>
          <a href="#" className="hover:text-foreground">Privacidade</a>
          <a href="#" className="hover:text-foreground">Contato</a>
        </div>
      </div>
    </footer>
  );
}
