import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Scissors, Car, Sparkles, Flower2, Clock, Users, BarChart3, Shield, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Agendai — SaaS de agendamento para barbearias e salões" },
      { name: "description", content: "A plataforma de agendamento online para barbearias, lava-jatos, manicures e salões. Comece grátis." },
      { property: "og:title", content: "Agendai — Agendamento online sem fricção" },
      { property: "og:description", content: "Painel completo para o estabelecimento, página pública de agendamento para clientes, e visão geral para o super admin." },
    ],
  }),
  component: LandingPage,
});

const segmentos = [
  { icon: Scissors, label: "Barbearia", desc: "Corte, barba, combos." },
  { icon: Car, label: "Lava-jato", desc: "Lavagem, polimento, vitrificação." },
  { icon: Sparkles, label: "Manicure", desc: "Mãos, pés, esmaltação em gel." },
  { icon: Flower2, label: "Salão de beleza", desc: "Cabelo, coloração, tratamentos." },
];

const recursos = [
  { icon: Calendar, t: "Agenda inteligente", d: "Bloqueios automáticos por duração do serviço e profissional." },
  { icon: Users, t: "Múltiplos profissionais", d: "Cada um com sua agenda, sua escala e seus serviços." },
  { icon: Clock, t: "Lembretes e confirmações", d: "Reduza no-show com notificações automáticas (em breve)." },
  { icon: BarChart3, t: "Relatórios em tempo real", d: "Faturamento, ocupação e ranking de serviços." },
  { icon: Shield, t: "Multi-estabelecimento", d: "Gerencie uma ou várias unidades com isolamento total de dados." },
  { icon: Sparkles, t: "Página pública linda", d: "Cada estabelecimento ganha sua URL pronta para receber clientes." },
];

function LandingPage() {
  const [businesses, setBusinesses] = useState<Array<{ id: string; name: string; slug: string; category: string; cover_url: string | null; description: string | null }>>([]);

  useEffect(() => {
    supabase
      .from("businesses")
      .select("id,name,slug,category,cover_url,description")
      .eq("status", "active")
      .limit(8)
      .then(({ data }) => setBusinesses(data ?? []));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-gradient-dark grain" />
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-ember/20 blur-3xl" />
        <div className="absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-ember/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 md:py-32">
          <Badge variant="outline" className="mb-6 border-ember/40 bg-ember/10 text-ember">
            Plataforma multi-segmento
          </Badge>
          <h1 className="font-display max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
            Agendamento online <span className="text-ember">sem fricção</span><br />
            para o seu estabelecimento.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Barbearias, lava-jatos, manicures e salões. Painel completo para o dono, página pública linda para o cliente, e relatórios para todos.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-gradient-ember text-primary-foreground shadow-ember hover:opacity-90">
              <Link to="/auth" search={{ tab: "signup" }}>
                Criar conta grátis <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#segmentos">Ver como funciona</a>
            </Button>
          </div>
        </div>
      </section>

      {/* SEGMENTOS */}
      <section id="segmentos" className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-12 max-w-2xl">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Feito para o seu segmento</h2>
          <p className="mt-3 text-muted-foreground">Configurações pré-prontas que se adaptam ao seu serviço.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {segmentos.map((s) => (
            <Card key={s.label} className="group relative overflow-hidden border-border/60 bg-surface p-6 transition hover:border-ember/40">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-ember/10 text-ember transition group-hover:bg-gradient-ember group-hover:text-primary-foreground">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold">{s.label}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* RECURSOS */}
      <section id="recursos" className="border-y border-border/60 bg-surface/40 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 max-w-2xl">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Tudo o que você precisa para gerir sua agenda</h2>
            <p className="mt-3 text-muted-foreground">Recursos pensados para reduzir ausências e aumentar o faturamento.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recursos.map((r) => (
              <div key={r.t} className="rounded-xl border border-border/60 bg-card p-6">
                <r.icon className="mb-4 h-5 w-5 text-ember" />
                <h3 className="font-display text-lg font-semibold">{r.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{r.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ESTABELECIMENTOS */}
      {businesses.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-20">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold md:text-4xl">Estabelecimentos na plataforma</h2>
              <p className="mt-3 text-muted-foreground">Clique para agendar agora.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {businesses.map((b) => (
              <Link
                key={b.id}
                to="/b/$slug"
                params={{ slug: b.slug }}
                className="group overflow-hidden rounded-xl border border-border/60 bg-card transition hover:border-ember/40 hover:shadow-ember"
              >
                <div className="aspect-[4/3] bg-gradient-ember opacity-80" style={b.cover_url ? { backgroundImage: `url(${b.cover_url})`, backgroundSize: "cover" } : undefined} />
                <div className="p-4">
                  <Badge variant="secondary" className="mb-2 text-xs capitalize">{b.category.replace("_", " ")}</Badge>
                  <h3 className="font-display font-semibold group-hover:text-ember">{b.name}</h3>
                  {b.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{b.description}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* PRECOS / CTA */}
      <section id="precos" className="mx-auto max-w-6xl px-4 py-20">
        <Card className="relative overflow-hidden border-ember/30 bg-gradient-dark p-10 md:p-16">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-ember/20 blur-3xl" />
          <div className="relative">
            <h2 className="font-display max-w-2xl text-3xl font-bold md:text-5xl">
              Comece agora, <span className="text-ember">sem cartão</span>.
            </h2>
            <p className="mt-4 max-w-xl text-muted-foreground">
              Crie seu estabelecimento em menos de 2 minutos e receba seu primeiro agendamento ainda hoje.
            </p>
            <Button asChild size="lg" className="mt-8 bg-gradient-ember text-primary-foreground shadow-ember hover:opacity-90">
              <Link to="/auth" search={{ tab: "signup" }}>
                Criar minha conta <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Card>
      </section>

      <SiteFooter />
    </div>
  );
}
