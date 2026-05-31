import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Store, ExternalLink, Trash2, Scissors, Settings } from "lucide-react";
import { toast } from "sonner";
import { getBusinessPublicPath } from "@/lib/business-niches";

export const Route = createFileRoute("/app/businesses")({
  component: BusinessesPage,
});

interface Business {
  id: string;
  name: string;
  slug: string;
  category: string;
  status: string;
  description: string | null;
  address: string | null;
  phone: string | null;
}
interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  price_cents: number;
  active: boolean;
}
interface Professional {
  id: string;
  name: string;
  role: string | null;
  active: boolean;
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function BusinessesPage() {
  const { user, refreshRoles } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Business | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("businesses")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });
    setBusinesses((data ?? []) as Business[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user]);

  if (selected)
    return (
      <BusinessDetail
        business={selected}
        onBack={() => {
          setSelected(null);
          load();
        }}
      />
    );

  return (
    <div className="mx-auto max-w-6xl p-6 md:p-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Meus estabelecimentos</h1>
          <p className="text-muted-foreground">Gerencie suas unidades, serviços e profissionais.</p>
        </div>
        <NewBusinessDialog
          onCreated={async () => {
            await refreshRoles();
            load();
          }}
        />
      </div>

      {loading ? (
        <p className="text-muted-foreground">Carregando…</p>
      ) : businesses.length === 0 ? (
        <Card className="border-dashed border-border bg-surface p-12 text-center">
          <Store className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 font-display text-xl font-semibold">Nenhum estabelecimento ainda</h2>
          <p className="mt-2 text-sm text-muted-foreground">Comece criando sua primeira unidade.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {businesses.map((b) => (
            <Card key={b.id} className="border-border/60 bg-surface p-5">
              <div className="mb-3 flex items-start justify-between">
                <Badge variant="outline" className="capitalize">
                  {b.category.replace("_", " ")}
                </Badge>
                <Badge
                  variant={b.status === "active" ? "default" : "secondary"}
                  className={b.status === "active" ? "bg-ember/20 text-ember" : ""}
                >
                  {b.status === "active" ? "Ativo" : "Pausado"}
                </Badge>
              </div>
              <h3 className="font-display text-lg font-bold">{b.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">/{b.slug}</p>
              {b.description && (
                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{b.description}</p>
              )}
              <div className="mt-4 flex gap-2">
                <Button
                  onClick={() => setSelected(b)}
                  size="sm"
                  className="flex-1 bg-gradient-ember text-primary-foreground"
                >
                  <Settings className="mr-1.5 h-3.5 w-3.5" /> Gerenciar
                </Button>
                <Button asChild size="sm" variant="outline">
                  <a
                    href={getBusinessPublicPath(b.category, b.slug)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function NewBusinessDialog({ onCreated }: { onCreated: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "barbearia",
    description: "",
    address: "",
    phone: "",
  });
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const parsed = z
      .object({
        name: z.string().trim().min(2).max(120),
        category: z.enum(["barbearia", "lava_jato", "manicure", "salao_beleza"]),
      })
      .safeParse(form);
    if (!parsed.success) return toast.error("Informe nome e categoria");
    setSaving(true);
    const slug = `${slugify(form.name)}-${Math.random().toString(36).slice(2, 6)}`;
    const { error } = await supabase.from("businesses").insert({
      owner_id: user.id,
      name: form.name.trim(),
      slug,
      category: parsed.data.category,
      description: form.description.trim() || null,
      address: form.address.trim() || null,
      phone: form.phone.trim() || null,
    });
    if (!error) {
      await supabase
        .from("user_roles")
        .insert({ user_id: user.id, role: "business_owner" })
        .select();
    }
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Estabelecimento criado!");
    setOpen(false);
    setForm({ name: "", category: "barbearia", description: "", address: "", phone: "" });
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-ember text-primary-foreground shadow-ember">
          <Plus className="mr-2 h-4 w-4" /> Novo estabelecimento
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-surface">
        <DialogHeader>
          <DialogTitle className="font-display">Novo estabelecimento</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Categoria</Label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="barbearia">Barbearia</option>
              <option value="lava_jato">Lava-jato</option>
              <option value="manicure">Manicure</option>
              <option value="salao_beleza">Salão de beleza</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Endereço</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Telefone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={saving}
            className="w-full bg-gradient-ember text-primary-foreground"
          >
            {saving ? "Criando..." : "Criar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function BusinessDetail({ business, onBack }: { business: Business; onBack: () => void }) {
  const [services, setServices] = useState<Service[]>([]);
  const [pros, setPros] = useState<Professional[]>([]);

  const load = async () => {
    const [{ data: s }, { data: p }] = await Promise.all([
      supabase.from("services").select("*").eq("business_id", business.id).order("created_at"),
      supabase.from("professionals").select("*").eq("business_id", business.id).order("created_at"),
    ]);
    setServices((s ?? []) as Service[]);
    setPros((p ?? []) as Professional[]);
  };
  useEffect(() => {
    load();
  }, [business.id]);

  const addService = async (form: { name: string; duration: number; price: number }) => {
    const { error } = await supabase.from("services").insert({
      business_id: business.id,
      name: form.name,
      duration_minutes: form.duration,
      price_cents: Math.round(form.price * 100),
    });
    if (error) return toast.error(error.message);
    toast.success("Serviço adicionado");
    load();
  };
  const deleteService = async (id: string) => {
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };
  const addPro = async (name: string, role: string) => {
    const { error } = await supabase
      .from("professionals")
      .insert({ business_id: business.id, name, role: role || null });
    if (error) return toast.error(error.message);
    toast.success("Profissional adicionado");
    load();
  };
  const deletePro = async (id: string) => {
    const { error } = await supabase.from("professionals").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div className="mx-auto max-w-5xl p-6 md:p-8">
      <button onClick={onBack} className="mb-4 text-sm text-muted-foreground hover:text-foreground">
        ← Voltar
      </button>
      <div className="mb-6">
        <Badge variant="outline" className="capitalize">
          {business.category.replace("_", " ")}
        </Badge>
        <h1 className="font-display mt-2 text-3xl font-bold">{business.name}</h1>
        <a
          href={getBusinessPublicPath(business.category, business.slug)}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-flex items-center gap-1 text-sm text-ember hover:underline"
        >
          Ver página pública <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Serviços */}
        <Card className="border-border/60 bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display flex items-center gap-2 text-lg font-semibold">
              <Scissors className="h-4 w-4 text-ember" /> Serviços
            </h2>
            <AddServiceDialog onAdd={addService} />
          </div>
          <div className="space-y-2">
            {services.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum serviço.</p>
            ) : (
              services.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-md border border-border/60 bg-background p-3"
                >
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {s.duration_minutes} min ·{" "}
                      {(s.price_cents / 100).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => deleteService(s.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Profissionais */}
        <Card className="border-border/60 bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Profissionais</h2>
            <AddProDialog onAdd={addPro} />
          </div>
          <div className="space-y-2">
            {pros.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum profissional.</p>
            ) : (
              pros.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-md border border-border/60 bg-background p-3"
                >
                  <div>
                    <div className="font-medium">{p.name}</div>
                    {p.role && <div className="text-xs text-muted-foreground">{p.role}</div>}
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => deletePro(p.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function AddServiceDialog({
  onAdd,
}: {
  onAdd: (f: { name: string; duration: number; price: number }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", duration: 30, price: 0 });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-surface">
        <DialogHeader>
          <DialogTitle>Novo serviço</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (form.name.trim().length < 2) return;
            onAdd(form);
            setOpen(false);
            setForm({ name: "", duration: 30, price: 0 });
          }}
          className="space-y-3"
        >
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Duração (min)</Label>
              <Input
                type="number"
                min={5}
                required
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Preço (R$)</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              />
            </div>
          </div>
          <Button type="submit" className="w-full bg-gradient-ember text-primary-foreground">
            Adicionar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddProDialog({ onAdd }: { onAdd: (name: string, role: string) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-surface">
        <DialogHeader>
          <DialogTitle>Novo profissional</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim().length < 2) return;
            onAdd(name, role);
            setOpen(false);
            setName("");
            setRole("");
          }}
          className="space-y-3"
        >
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Função</Label>
            <Input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Ex: Barbeiro sênior"
            />
          </div>
          <Button type="submit" className="w-full bg-gradient-ember text-primary-foreground">
            Adicionar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
