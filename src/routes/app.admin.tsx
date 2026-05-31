import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Store, Users, Calendar } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/admin")({
  component: AdminPage,
});

function AdminPage() {
  const { roles, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ businesses: 0, appointments: 0, users: 0 });
  const [businesses, setBusinesses] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !roles.includes("super_admin")) navigate({ to: "/app" });
  }, [roles, loading, navigate]);

  const load = async () => {
    const [{ count: b }, { count: a }, { count: u }, { data: list }] = await Promise.all([
      supabase.from("businesses").select("id", { count: "exact", head: true }),
      supabase.from("appointments").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("businesses").select("*").order("created_at", { ascending: false }).limit(50),
    ]);
    setStats({ businesses: b ?? 0, appointments: a ?? 0, users: u ?? 0 });
    setBusinesses(list ?? []);
  };
  useEffect(() => { if (roles.includes("super_admin")) load(); }, [roles]);

  const toggleStatus = async (id: string, status: string) => {
    const next = status === "active" ? "paused" : "active";
    const { error } = await supabase.from("businesses").update({ status: next as any }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Status atualizado");
    load();
  };

  if (!roles.includes("super_admin")) return null;

  return (
    <div className="mx-auto max-w-6xl p-6 md:p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-ember shadow-ember">
          <Shield className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">Super Admin</h1>
          <p className="text-muted-foreground">Visão global da plataforma.</p>
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          { l: "Estabelecimentos", v: stats.businesses, i: Store },
          { l: "Agendamentos", v: stats.appointments, i: Calendar },
          { l: "Usuários", v: stats.users, i: Users },
        ].map((c) => (
          <Card key={c.l} className="border-border/60 bg-surface p-5">
            <c.i className="h-5 w-5 text-ember" />
            <div className="mt-3 font-display text-2xl font-bold">{c.v}</div>
            <div className="text-sm text-muted-foreground">{c.l}</div>
          </Card>
        ))}
      </div>

      <Card className="border-border/60 bg-surface p-5">
        <h2 className="font-display mb-4 text-lg font-semibold">Todos os estabelecimentos</h2>
        <div className="space-y-2">
          {businesses.map((b) => (
            <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border/60 bg-background p-3">
              <div>
                <div className="font-medium">{b.name}</div>
                <div className="text-xs text-muted-foreground capitalize">/{b.slug} · {b.category.replace("_", " ")}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={b.status === "active" ? "border-ember/40 bg-ember/10 text-ember" : ""}>{b.status}</Badge>
                <Button size="sm" variant="outline" onClick={() => toggleStatus(b.id, b.status)}>
                  {b.status === "active" ? "Pausar" : "Ativar"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
