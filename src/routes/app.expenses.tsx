import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CalendarDays, Plus, ReceiptText, Trash2, WalletCards } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/expenses")({
  component: ExpensesPage,
});

interface BusinessOption {
  id: string;
  name: string;
}

interface Expense {
  id: string;
  business_id: string;
  description: string;
  category: string;
  amount_cents: number;
  spent_on: string;
  notes: string | null;
  businesses?: { name: string } | null;
}

const expenseSchema = z.object({
  business_id: z.string().uuid(),
  description: z.string().trim().min(2).max(140),
  category: z.string().trim().min(2).max(60),
  amount: z.number().min(0.01),
  spent_on: z.string().min(10),
  notes: z.string().max(500).optional(),
});

function currency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function ExpensesPage() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<BusinessOption[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data: bs, error: businessError } = await supabase
      .from("businesses")
      .select("id, name")
      .eq("owner_id", user.id)
      .order("name");

    if (businessError) {
      setLoading(false);
      return toast.error(businessError.message);
    }

    const ids = (bs ?? []).map((b) => b.id);
    setBusinesses((bs ?? []) as BusinessOption[]);

    if (ids.length === 0) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("expenses")
      .select("*, businesses(name)")
      .in("business_id", ids)
      .order("spent_on", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(150);

    if (error) toast.error(error.message);
    setExpenses((data ?? []) as Expense[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const totals = useMemo(() => {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return expenses.reduce(
      (acc, item) => {
        acc.total += item.amount_cents;
        if (item.spent_on.startsWith(monthKey)) acc.month += item.amount_cents;
        return acc;
      },
      { total: 0, month: 0 },
    );
  }, [expenses]);

  const remove = async (id: string) => {
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Gasto removido");
    load();
  };

  return (
    <div className="mx-auto max-w-6xl p-6 md:p-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Gastos</h1>
          <p className="text-muted-foreground">Registre os valores gastos por estabelecimento.</p>
        </div>
        <AddExpenseDialog businesses={businesses} onSaved={load} />
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <Card className="border-border/60 bg-surface p-5">
          <WalletCards className="h-5 w-5 text-ember" />
          <div className="mt-3 font-display text-2xl font-bold">{currency(totals.month)}</div>
          <div className="text-sm text-muted-foreground">Gastos deste mes</div>
        </Card>
        <Card className="border-border/60 bg-surface p-5">
          <ReceiptText className="h-5 w-5 text-ember" />
          <div className="mt-3 font-display text-2xl font-bold">{currency(totals.total)}</div>
          <div className="text-sm text-muted-foreground">Total registrado</div>
        </Card>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : businesses.length === 0 ? (
        <Card className="border-dashed bg-surface p-12 text-center text-muted-foreground">
          Crie um estabelecimento antes de registrar gastos.
        </Card>
      ) : expenses.length === 0 ? (
        <Card className="border-dashed bg-surface p-12 text-center text-muted-foreground">
          Nenhum gasto registrado ainda.
        </Card>
      ) : (
        <div className="space-y-2">
          {expenses.map((expense) => (
            <Card
              key={expense.id}
              className="flex flex-wrap items-center justify-between gap-4 border-border/60 bg-surface p-4"
            >
              <div className="min-w-0">
                <div className="font-display text-base font-semibold">{expense.description}</div>
                <div className="text-xs text-muted-foreground">
                  {expense.businesses?.name} - {expense.category}
                </div>
                {expense.notes && (
                  <div className="mt-1 text-xs text-muted-foreground">{expense.notes}</div>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                {new Date(`${expense.spent_on}T00:00:00`).toLocaleDateString("pt-BR")}
              </div>
              <Badge variant="outline" className="border-ember/40 bg-ember/10 text-ember">
                {currency(expense.amount_cents)}
              </Badge>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => remove(expense.id)}
                aria-label="Remover gasto"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function AddExpenseDialog({
  businesses,
  onSaved,
}: {
  businesses: BusinessOption[];
  onSaved: () => void;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    business_id: "",
    description: "",
    category: "Geral",
    amount: 0,
    spent_on: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  useEffect(() => {
    if (!form.business_id && businesses[0])
      setForm((current) => ({ ...current, business_id: businesses[0].id }));
  }, [businesses, form.business_id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const parsed = expenseSchema.safeParse(form);
    if (!parsed.success) return toast.error("Confira os dados do gasto");

    setSaving(true);
    const { error } = await supabase.from("expenses").insert({
      owner_id: user.id,
      business_id: parsed.data.business_id,
      description: parsed.data.description,
      category: parsed.data.category,
      amount_cents: Math.round(parsed.data.amount * 100),
      spent_on: parsed.data.spent_on,
      notes: parsed.data.notes?.trim() || null,
    });
    setSaving(false);

    if (error) return toast.error(error.message);
    toast.success("Gasto registrado");
    setOpen(false);
    setForm({
      business_id: businesses[0]?.id ?? "",
      description: "",
      category: "Geral",
      amount: 0,
      spent_on: new Date().toISOString().slice(0, 10),
      notes: "",
    });
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={businesses.length === 0}
          className="bg-gradient-ember text-primary-foreground shadow-ember"
        >
          <Plus className="mr-2 h-4 w-4" /> Novo gasto
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-surface">
        <DialogHeader>
          <DialogTitle className="font-display">Novo gasto</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Estabelecimento</Label>
            <select
              value={form.business_id}
              onChange={(e) => setForm({ ...form, business_id: e.target.value })}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              required
            >
              {businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Descricao</Label>
            <Input
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Categoria</Label>
              <Input
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                min={0.01}
                step="0.01"
                required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Data</Label>
            <Input
              type="date"
              required
              value={form.spent_on}
              onChange={(e) => setForm({ ...form, spent_on: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Observacoes</Label>
            <Textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <Button
            type="submit"
            disabled={saving}
            className="w-full bg-gradient-ember text-primary-foreground"
          >
            {saving ? "Salvando..." : "Salvar gasto"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
