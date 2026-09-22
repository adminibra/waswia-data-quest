import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ChevronRight, ClipboardList, CloudDownload, CloudUpload, Database, LogOut, RotateCw, UserRound, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WaswiaLogo } from "@/components/waswia-logo";
import { useWaswia } from "@/lib/waswia-store";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Accueil terrain — WASWIA" },
    { name: "description", content: "Collectez et synchronisez vos réponses terrain avec WASWIA." },
    { property: "og:title", content: "Accueil terrain — WASWIA" },
    { property: "og:description", content: "Collectez et synchronisez vos réponses terrain avec WASWIA." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

function Index() {
  const { surveys, responses, refresh, currentInvestigator, assignedSurveys } = useWaswia();
  const visibleSurveys = currentInvestigator ? assignedSurveys(currentInvestigator.id) : surveys;
  const doneCount = responses.filter((response) => response.status === "Terminé").length;
  const pendingCount = responses.filter((response) => response.status === "En attente").length;
  const [syncing, setSyncing] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = Route.useNavigate();
  useEffect(() => { void supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? "")); }, []);
  const sync = () => { setSyncing(true); void refresh().finally(() => window.setTimeout(() => setSyncing(false), 400)); };
  return (
    <div className="min-h-screen bg-admin-background">
      <header className="flex h-[72px] items-center justify-between bg-brand-gradient px-4 shadow-md">
        <WaswiaLogo className="h-8 rounded-sm sm:h-10" />
        <div className="flex items-center gap-3"><span className="inline-flex items-center gap-2 rounded-full bg-cyan px-4 py-2 text-xs font-semibold text-primary-foreground"><Wifi className="h-3.5 w-3.5" /> En ligne</span><Button variant="ghost" size="icon" onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/auth" }); }} className="text-primary-foreground hover:bg-background/10 hover:text-primary-foreground" aria-label="Déconnexion"><LogOut /></Button></div>
      </header>
      <main className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 sm:px-6">
        <section><h1 className="text-2xl font-bold">Bonjour {currentInvestigator?.name ?? ""} 👋</h1><p className="mt-1 text-muted-foreground">{email || "Non connecté"}</p><span className="mt-2 inline-flex rounded-full bg-cyan px-3 py-1 text-xs font-bold text-primary-foreground">{currentInvestigator ? "Enquêteur" : "Admin"}</span></section>
        <section className="rounded-xl bg-card p-4 shadow-md sm:p-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4"><h2 className="flex min-w-0 items-center gap-2 font-bold"><Database className="h-5 w-5 shrink-0 text-primary" /> Synchronisation</h2><Button onClick={sync} className="bg-primary"><RotateCw className={syncing ? "animate-spin" : ""} /> <span className="hidden sm:inline">Synchroniser</span></Button></div>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><p className="flex items-center gap-2"><CloudUpload className="h-4 w-4 text-warning" /><b>0</b> réponse(s) en attente</p><p className="flex items-center gap-2 sm:justify-center"><CloudDownload className="h-4 w-4 text-success" />{syncing ? "Synchronisation..." : "Dernière sync: 09/09/2026 14:35"}</p></div>
        </section>
        <section className="grid gap-3 sm:grid-cols-3">
          {[{ icon: ClipboardList, value: visibleSurveys.length, label: "Sondages", color: "text-primary" }, { icon: CheckCircle2, value: doneCount, label: "Terminés", color: "text-success" }, { icon: RotateCw, value: pendingCount, label: "En attente", color: "text-warning" }].map((stat) => <div key={stat.label} className="grid min-h-28 place-items-center rounded-xl bg-card p-4 text-center shadow-md"><div><stat.icon className={`mx-auto h-6 w-6 ${stat.color}`} /><p className="mt-2 text-2xl font-bold">{stat.value}</p><p className="text-xs text-muted-foreground">{stat.label}</p></div></div>)}
        </section>
        {!currentInvestigator && <Button asChild variant="ghost" className="h-auto w-full justify-start rounded-xl bg-linear-to-r from-primary/10 to-cyan/10 px-4 py-4 shadow-md hover:bg-muted"><Link to="/admin" className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10"><UserRound className="text-primary" /></span><span className="min-w-0 text-left"><b className="block">Back-Office</b><span className="block truncate text-xs font-normal text-muted-foreground">Gérer les sondages et enquêteurs</span></span><ChevronRight /></Link></Button>}
        <section><h2 className="mb-4 text-lg font-bold">Mes sondages</h2>{visibleSurveys.length === 0 && <p className="mb-3 rounded-xl bg-card p-4 text-sm text-muted-foreground shadow-md">Aucun sondage ne vous est assigné pour le moment.</p>}<div className="space-y-3">{visibleSurveys.map((survey) => <button key={survey.id} className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl bg-card p-4 text-left shadow-md transition-transform hover:-translate-y-0.5" onClick={() => window.alert(`Ouverture du questionnaire : ${survey.title}`)}><span className="min-w-0"><span className="flex flex-wrap items-center gap-2"><b>{survey.title}</b><span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">{survey.active ? "Actif" : "Inactif"}</span></span>{survey.description !== "Pas de description" && <span className="mt-1 block truncate text-sm text-muted-foreground">{survey.description}</span>}</span><ChevronRight className="h-5 w-5 text-muted-foreground" /></button>)}</div></section>
      </main>
    </div>
  );
}
