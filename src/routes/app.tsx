import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Calendar, LayoutDashboard, Store, ReceiptText, Shield, LogOut } from "lucide-react";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, loading, roles, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-muted-foreground">
        Carregando…
      </div>
    );
  }

  const isSuper = roles.includes("super_admin");
  const navItems = [
    { to: "/app", label: "Visão geral", icon: LayoutDashboard, exact: true },
    { to: "/app/businesses", label: "Meus estabelecimentos", icon: Store },
    { to: "/app/appointments", label: "Agendamentos", icon: Calendar },
    { to: "/app/expenses", label: "Gastos", icon: ReceiptText },
    ...(isSuper ? [{ to: "/app/admin", label: "Super Admin", icon: Shield }] : []),
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-64 shrink-0 border-r border-border/60 bg-sidebar p-4 md:flex md:flex-col">
        <Link to="/" className="mb-8 flex items-center gap-2 px-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-ember shadow-ember">
            <Calendar className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold">Agendai</span>
        </Link>
        <nav className="flex-1 space-y-1">
          {navItems.map((it) => {
            const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${active ? "bg-ember/15 text-ember" : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"}`}
              >
                <it.icon className="h-4 w-4" /> {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border/60 pt-4">
          <div className="mb-3 px-2 text-xs">
            <div className="font-medium text-foreground truncate">{user.email}</div>
            <div className="text-muted-foreground">
              {isSuper
                ? "Super Admin"
                : roles.includes("business_owner")
                  ? "Proprietário"
                  : "Cliente"}
            </div>
          </div>
          <Button
            onClick={() => {
              signOut();
              navigate({ to: "/" });
            }}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>
      </aside>

      {/* mobile top bar */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border/60 bg-background px-4 md:hidden">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-gradient-ember">
              <Calendar className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold">Agendai</span>
          </Link>
          <Button
            onClick={() => {
              signOut();
              navigate({ to: "/" });
            }}
            variant="ghost"
            size="sm"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </header>
        <main className="flex-1 overflow-x-hidden">
          <Outlet />
        </main>
        {/* mobile bottom nav */}
        <nav
          className="grid border-t border-border/60 bg-sidebar md:hidden"
          style={{ gridTemplateColumns: `repeat(${Math.min(navItems.length, 5)}, minmax(0, 1fr))` }}
        >
          {navItems.slice(0, 5).map((it) => {
            const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`flex flex-col items-center gap-1 py-2 text-[10px] ${active ? "text-ember" : "text-muted-foreground"}`}
              >
                <it.icon className="h-4 w-4" />
                <span>{it.label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
