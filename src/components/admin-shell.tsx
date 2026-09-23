import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { BarChart3, ClipboardList, FileText, KeyRound, LayoutDashboard, LogOut, Menu, PanelLeftClose, PanelLeftOpen, Users, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WaswiaLogo } from "@/components/waswia-logo";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useWaswia } from "@/lib/waswia-store";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/surveys", label: "Sondages", icon: ClipboardList },
  { to: "/admin/investigators", label: "Enquêteurs", icon: Users },
  { to: "/admin/responses", label: "Réponses", icon: FileText },
  { to: "/admin/reporting", label: "Reporting", icon: BarChart3 },
] as const;

export function AdminShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { loading, currentInvestigator } = useWaswia();
  const navigate = useNavigate();
  useEffect(() => { if (!loading && currentInvestigator) void navigate({ to: "/", replace: true }); }, [loading, currentInvestigator, navigate]);
  useEffect(() => { void supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? "")); }, []);

  const changePassword = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true); setPasswordMessage(null);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);
    if (error) { setPasswordMessage({ ok: false, text: error.message }); return; }
    setPasswordMessage({ ok: true, text: "Mot de passe mis à jour." });
    setNewPassword("");
  };
  if (currentInvestigator) return null;
  return (
    <div className="min-h-screen bg-admin-background">
      <Button variant="outline" size="icon" className="fixed left-4 top-4 z-40 md:hidden" onClick={() => setMobileOpen(true)} aria-label="Ouvrir le menu"><Menu /></Button>
      {mobileOpen && <div className="fixed inset-0 z-40 bg-overlay md:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={cn("fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card transition-all md:translate-x-0", collapsed ? "w-[76px]" : "w-64", mobileOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex h-[76px] items-center justify-between border-b border-border px-4">
          <WaswiaLogo className={cn("h-10 rounded-sm", collapsed && "px-2")} />
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(false)} aria-label="Fermer le menu"><X /></Button>
        </div>
        <nav className="flex-1 space-y-1 px-4 py-5">
          {links.map((item) => {
            const active = item.to === "/admin" ? pathname === item.to || pathname === "/admin/" : pathname.startsWith(item.to);
            return <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)} title={collapsed ? item.label : undefined} className={cn("flex h-12 items-center gap-3 rounded-lg px-4 text-muted-foreground transition-colors hover:bg-muted", active && "bg-primary text-primary-foreground hover:bg-primary", collapsed && "justify-center px-0")}><item.icon className="h-5 w-5 shrink-0" />{!collapsed && <span>{item.label}</span>}</Link>;
          })}
        </nav>
        <div className="border-t border-border p-4">
          <div className={cn("mb-4 flex items-center gap-3", collapsed && "justify-center")}>
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-gradient text-sm font-semibold text-primary-foreground">{(email[0] ?? "A").toUpperCase()}</div>
            {!collapsed && <div className="min-w-0"><p className="truncate text-sm font-medium">{email || "Administrateur"}</p><p className="text-xs text-muted-foreground">Administrateur</p></div>}
          </div>
          {!collapsed && <Button variant="ghost" className="mb-2 w-full justify-start text-muted-foreground" onClick={() => { setPasswordOpen(true); setPasswordMessage(null); }}><KeyRound className="h-4 w-4" /> Changer le mot de passe</Button>}
          <div className={cn("grid gap-2", collapsed ? "grid-cols-1" : "grid-cols-[1fr_auto]")}>
            <Button variant="outline" asChild className={cn("w-full", collapsed && "px-0")}><Link to="/">‹ {!collapsed && "App"}</Link></Button>
            <Button variant="ghost" size="icon" asChild aria-label="Se déconnecter"><Link to="/auth"><LogOut /></Link></Button>
          </div>
        </div>
        <Button variant="outline" size="icon" className="absolute -right-4 top-24 hidden rounded-full md:inline-flex" onClick={() => setCollapsed((v) => !v)} aria-label={collapsed ? "Déployer le menu" : "Réduire le menu"}>{collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}</Button>
      </aside>
      <main className={cn("min-h-screen transition-[margin]", collapsed ? "md:ml-[76px]" : "md:ml-64")}><div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8 md:px-10"><Outlet /></div></main>
    </div>
  );
}