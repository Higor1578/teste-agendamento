import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { getCategoryFromNiche } from "@/lib/business-niches";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowLeft, MapPin, Phone, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

interface Business {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  cover_url: string | null;
  open_time: string;
  close_time: string;
}
interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_cents: number;
}
interface Professional {
  id: string;
  name: string;
  role: string | null;
  avatar_url: string | null;
}

type BusinessCategory = Database["public"]["Enums"]["business_category"];

export function BusinessPublicPage({ slug, niche }: { slug: string; niche?: string }) {
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundFlag, setNotFoundFlag] = useState(false);

  const [step, setStep] = useState<"service" | "form" | "done">("service");
  const [selService, setSelService] = useState<Service | null>(null);
  const [selPro, setSelPro] = useState<string | "any">("any");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setNotFoundFlag(false);

      const category = niche ? getCategoryFromNiche(niche) : null;
      if (niche && !category) {
        setNotFoundFlag(true);
        setLoading(false);
        return;
      }

      let query = supabase.from("businesses").select("*").eq("slug", slug).eq("status", "active");
      if (category) query = query.eq("category", category as BusinessCategory);

      const { data: b } = await query.maybeSingle();
      if (!b) {
        setNotFoundFlag(true);
        setLoading(false);
        return;
      }

      setBusiness(b as Business);
      const [{ data: s }, { data: p }] = await Promise.all([
        supabase
          .from("services")
          .select("*")
          .eq("business_id", b.id)
          .eq("active", true)
          .order("created_at"),
        supabase
          .from("professionals")
          .select("*")
          .eq("business_id", b.id)
          .eq("active", true)
          .order("created_at"),
      ]);
      setServices((s ?? []) as Service[]);
      setProfessionals((p ?? []) as Professional[]);
      setLoading(false);
    })();
  }, [slug, niche]);

  useEffect(() => {
    if (user?.email) setEmail((current) => current || user.email!);
  }, [user]);

  if (loading)
    return (
      <div className="grid min-h-screen place-items-center bg-background text-muted-foreground">
        Carregando...
      </div>
    );
  if (notFoundFlag || !business) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold">Estabelecimento não encontrado</h1>
          <Link to="/" className="mt-4 inline-block text-ember hover:underline">
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selService || !date || !time) return toast.error("Preencha data e horário");
    const parsed = z
      .object({
        name: z.string().trim().min(2).max(120),
        phone: z.string().trim().min(8).max(30),
        email: z.string().trim().email().max(255).optional().or(z.literal("")),
      })
      .safeParse({ name, phone, email });
    if (!parsed.success) return toast.error("Verifique nome, telefone e e-mail");

    const scheduled = new Date(`${date}T${time}:00`);
    if (scheduled <= new Date()) return toast.error("Escolha um horário futuro");

    setSubmitting(true);
    const { error } = await supabase.from("appointments").insert({
      business_id: business.id,
      service_id: selService.id,
      professional_id: selPro === "any" ? null : selPro,
      customer_id: user?.id ?? null,
      customer_name: name.trim(),
      customer_phone: phone.trim(),
      customer_email: email.trim() || null,
      scheduled_at: scheduled.toISOString(),
      duration_minutes: selService.duration_minutes,
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    setStep("done");
  };

  return (
    <div className="min-h-screen bg-background">
      <div
        className="relative h-60 bg-gradient-ember md:h-80"
        style={
          business.cover_url
            ? {
                backgroundImage: `url(${business.cover_url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <Link
          to="/"
          className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-md bg-background/70 px-3 py-1.5 text-sm backdrop-blur hover:bg-background"
        >
          <ArrowLeft className="h-4 w-4" /> Início
        </Link>
      </div>

      <div className="mx-auto -mt-20 max-w-5xl px-4 pb-20">
        <Card className="border-border/60 bg-surface p-6 md:p-8">
          <Badge variant="outline" className="border-ember/40 bg-ember/10 capitalize text-ember">
            {business.category.replace("_", " ")}
          </Badge>
          <h1 className="font-display mt-3 text-3xl font-bold md:text-4xl">{business.name}</h1>
          {business.description && (
            <p className="mt-2 text-muted-foreground">{business.description}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            {business.address && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {business.address}
              </span>
            )}
            {business.phone && (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-4 w-4" /> {business.phone}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> {business.open_time.slice(0, 5)} -{" "}
              {business.close_time.slice(0, 5)}
            </span>
          </div>
        </Card>

        {step === "done" ? (
          <Card className="mt-6 border-ember/40 bg-surface p-10 text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-ember" />
            <h2 className="font-display mt-4 text-2xl font-bold">Agendamento solicitado!</h2>
            <p className="mt-2 text-muted-foreground">
              Enviamos a solicitação para o estabelecimento. Você receberá uma confirmação em breve.
            </p>
            <Button asChild className="mt-6 bg-gradient-ember text-primary-foreground">
              <Link to="/">Voltar ao início</Link>
            </Button>
          </Card>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-[1fr_360px]">
            <Card className="border-border/60 bg-surface p-6">
              <h2 className="font-display mb-4 text-xl font-semibold">Serviços</h2>
              {services.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum serviço cadastrado ainda.</p>
              ) : (
                <div className="space-y-2">
                  {services.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSelService(s);
                        setStep("form");
                      }}
                      className={`flex w-full items-center justify-between rounded-lg border p-4 text-left transition ${selService?.id === s.id ? "border-ember bg-ember/10" : "border-border/60 hover:border-ember/40"}`}
                    >
                      <div>
                        <div className="font-medium">{s.name}</div>
                        {s.description && (
                          <div className="text-sm text-muted-foreground">{s.description}</div>
                        )}
                        <div className="mt-1 text-xs text-muted-foreground">
                          {s.duration_minutes} min
                        </div>
                      </div>
                      <div className="font-display text-lg font-bold text-ember">
                        {(s.price_cents / 100).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </Card>

            <Card className="h-fit border-border/60 bg-surface p-6">
              <h2 className="font-display mb-4 text-xl font-semibold">Reservar</h2>
              {!selService ? (
                <p className="text-sm text-muted-foreground">Escolha um serviço para começar.</p>
              ) : (
                <form onSubmit={submitBooking} className="space-y-3">
                  <div className="rounded-md bg-background p-3 text-sm">
                    <div className="text-muted-foreground">Serviço</div>
                    <div className="font-medium">{selService.name}</div>
                  </div>
                  {professionals.length > 0 && (
                    <div className="space-y-1.5">
                      <Label>Profissional</Label>
                      <select
                        value={selPro}
                        onChange={(e) => setSelPro(e.target.value)}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="any">Qualquer disponível</option>
                        {professionals.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label>Data</Label>
                      <Input
                        type="date"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Hora</Label>
                      <Input
                        type="time"
                        required
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Seu nome</Label>
                    <Input required value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Telefone</Label>
                    <Input
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>E-mail (opcional)</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-ember text-primary-foreground shadow-ember"
                  >
                    <Calendar className="mr-2 h-4 w-4" />{" "}
                    {submitting ? "Enviando..." : "Confirmar agendamento"}
                  </Button>
                </form>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
