import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Store, TrendingUp, Users } from "lucide-react";

export const Route = createFileRoute("/app/")({
  component: AppHome,
});

function AppHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    businesses: 0,
    todayAppointments: 0,
    totalAppointments: 0,
    revenueCents: 0,
  });
  const [expenseCents, setExpenseCents] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: businesses } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_id", user.id);
      const businessIds = (businesses ?? []).map((b) => b.id);
      let todayAppointments = 0,
        totalAppointments = 0,
        revenueCents = 0;
      if (businessIds.length > 0) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        const { count: today } = await supabase
          .from("appointments")
          .select("id", { count: "exact", head: true })
          .in("business_id", businessIds)
          .gte("scheduled_at", startOfDay.toISOString())
          .lte("scheduled_at", endOfDay.toISOString());
        const { data: all } = await supabase
          .from("appointments")
          .select("id, service_id, status")
          .in("business_id", businessIds);
        totalAppointments = all?.length ?? 0;
        const completedIds = (all ?? [])
          .filter((a) => a.status === "completed")
          .map((a) => a.service_id);
        if (completedIds.length) {
          const { data: services } = await supabase
            .from("services")
            .select("id, price_cents")
            .in("id", completedIds);
          const priceMap = new Map((services ?? []).map((s) => [s.id, s.price_cents]));
          revenueCents = completedIds.reduce((sum, id) => sum + (priceMap.get(id) ?? 0), 0);
        }
        todayAppointments = today ?? 0;

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const { data: expenses } = await supabase
          .from("expenses")
          .select("amount_cents")
          .in("business_id", businessIds)
          .gte("spent_on", startOfMonth.toISOString().slice(0, 10));
        setExpenseCents((expenses ?? []).reduce((sum, item) => sum + item.amount_cents, 0));
      }
      setStats({
        businesses: businesses?.length ?? 0,
        todayAppointments,
        totalAppointments,
        revenueCents,
      });
    })();
  }, [user]);

  const cards = [
    { label: "Estabelecimentos", value: stats.businesses, icon: Store },
    { label: "Hoje", value: stats.todayAppointments, icon: Calendar },
    { label: "Total agendamentos", value: stats.totalAppointments, icon: Users },
    {
      label: "Faturamento",
      value: (stats.revenueCents / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
      icon: TrendingUp,
    },
    {
      label: "Gastos do mês",
      value: (expenseCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
      icon: TrendingUp,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl p-6 md:p-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Visão geral</h1>
          <p className="text-muted-foreground">Resumo da sua operação.</p>
        </div>
        <Button asChild className="bg-gradient-ember text-primary-foreground shadow-ember">
          <Link to="/app/businesses">Gerenciar estabelecimentos</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <Card key={c.label} className="border-border/60 bg-surface p-5">
            <c.icon className="h-5 w-5 text-ember" />
            <div className="mt-3 font-display text-2xl font-bold">{c.value}</div>
            <div className="text-sm text-muted-foreground">{c.label}</div>
          </Card>
        ))}
      </div>

      {stats.businesses === 0 && (
        <Card className="mt-8 border-ember/30 bg-gradient-dark p-8 text-center">
          <h2 className="font-display text-2xl font-bold">Bem-vindo ao Agendai!</h2>
          <p className="mt-2 text-muted-foreground">
            Crie seu primeiro estabelecimento para começar a receber agendamentos.
          </p>
          <Button asChild className="mt-6 bg-gradient-ember text-primary-foreground shadow-ember">
            <Link to="/app/businesses">Criar estabelecimento</Link>
          </Button>
        </Card>
      )}
    </div>
  );
}
