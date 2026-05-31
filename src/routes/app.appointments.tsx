import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/app/appointments")({
  component: AppointmentsPage,
});

interface Appt {
  id: string; customer_name: string; customer_phone: string;
  scheduled_at: string; status: string; duration_minutes: number;
  business_id: string; service_id: string;
  businesses?: { name: string } | null;
  services?: { name: string; price_cents: number } | null;
}

const statusLabel: Record<string, string> = {
  pending: "Pendente", confirmed: "Confirmado", completed: "Concluído",
  cancelled: "Cancelado", no_show: "Faltou",
};

function AppointmentsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Appt[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data: bs } = await supabase.from("businesses").select("id").eq("owner_id", user.id);
    const ids = (bs ?? []).map((b) => b.id);
    if (ids.length === 0) { setItems([]); setLoading(false); return; }
    const { data } = await supabase
      .from("appointments")
      .select("*, businesses(name), services(name, price_cents)")
      .in("business_id", ids)
      .order("scheduled_at", { ascending: false })
      .limit(100);
    setItems((data ?? []) as Appt[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, [user]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("appointments").update({ status: status as any }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Status atualizado");
    load();
  };

  return (
    <div className="mx-auto max-w-6xl p-6 md:p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">Agendamentos</h1>
        <p className="text-muted-foreground">Todos os agendamentos das suas unidades.</p>
      </div>

      {loading ? <p className="text-muted-foreground">Carregando…</p> : items.length === 0 ? (
        <Card className="border-dashed bg-surface p-12 text-center text-muted-foreground">Nenhum agendamento ainda.</Card>
      ) : (
        <div className="space-y-2">
          {items.map((a) => {
            const dt = new Date(a.scheduled_at);
            return (
              <Card key={a.id} className="flex flex-wrap items-center justify-between gap-4 border-border/60 bg-surface p-4">
                <div className="min-w-0">
                  <div className="font-display text-base font-semibold">{a.customer_name}</div>
                  <div className="text-xs text-muted-foreground">{a.customer_phone} · {a.businesses?.name} · {a.services?.name}</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">{dt.toLocaleDateString("pt-BR")} {dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</div>
                  <div className="text-xs text-muted-foreground">{a.duration_minutes} min</div>
                </div>
                <Badge variant="outline" className={
                  a.status === "confirmed" ? "border-ember/40 bg-ember/10 text-ember" :
                  a.status === "completed" ? "border-green-500/40 bg-green-500/10 text-green-400" :
                  a.status === "cancelled" || a.status === "no_show" ? "border-destructive/40 bg-destructive/10 text-destructive" : ""
                }>{statusLabel[a.status]}</Badge>
                <div className="flex gap-1">
                  {a.status === "pending" && <Button size="sm" onClick={() => updateStatus(a.id, "confirmed")} className="bg-gradient-ember text-primary-foreground">Confirmar</Button>}
                  {a.status === "confirmed" && <Button size="sm" variant="outline" onClick={() => updateStatus(a.id, "completed")}>Concluir</Button>}
                  {(a.status === "pending" || a.status === "confirmed") && <Button size="sm" variant="ghost" onClick={() => updateStatus(a.id, "cancelled")}>Cancelar</Button>}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
