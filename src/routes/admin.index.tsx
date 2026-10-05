import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, ClipboardCheck, ClipboardList, TrendingUp, Users } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { useWaswia } from "@/lib/waswia-store";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [
    { title: "Dashboard — WASWIA" }, { name: "description", content: "Vue d'ensemble de l'activité WASWIA." },
    { property: "og:title", content: "Dashboard — WASWIA" }, { property: "og:description", content: "Vue d'ensemble de l'activité WASWIA." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: Dashboard,
});

function Dashboard() {
  const { surveys, investigators, responses } = useWaswia();
  const today = new Date().toLocaleDateString("fr-FR");
  const todayCount = responses.filter((response) => response.date.startsWith(today)).length;
  const stats = [
    { label: "Enquêtes", value: surveys.length, detail: `${surveys.filter((s) => s.active).length} actifs`, icon: ClipboardList, tone: "bg-primary/10 text-primary" },
    { label: "Enquêteurs", value: investigators.length, detail: "Utilisateurs actifs", icon: Users, tone: "bg-cyan-soft text-cyan" },
    { label: "Réponses totales", value: responses.length, detail: "Collectées", icon: ClipboardCheck, tone: "bg-success-soft text-success" },
    { label: "Aujourd'hui", value: todayCount, detail: "Nouvelles réponses", icon: TrendingUp, tone: "bg-warning-soft text-warning" },
  ];
  return <div className="space-y-6"><PageHeading title="Dashboard" subtitle="Vue d'ensemble de votre activité" /><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map((stat) => <article key={stat.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center rounded-xl bg-card p-6 shadow-md"><div className="min-w-0"><p className="text-sm text-muted-foreground">{stat.label}</p><p className="mt-1 text-3xl font-bold">{stat.value}</p><p className="mt-1 text-xs text-muted-foreground">{stat.detail}</p></div><span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${stat.tone}`}><stat.icon /></span></article>)}</section><section className="rounded-xl bg-card p-6 shadow-md"><h2 className="flex items-center gap-2 text-2xl font-bold"><BarChart3 className="text-primary" /> Actions rapides</h2><p className="mt-1 text-sm text-muted-foreground">Gérez vos enquêtes et votre équipe</p><div className="mt-6 grid gap-4 lg:grid-cols-3">{[{ to: "/admin/surveys", title: "Créer Une enquête", detail: "Nouveau questionnaire", icon: ClipboardList, color: "text-primary" }, { to: "/admin/investigators", title: "Gérer les enquêteurs", detail: "Équipe & assignations", icon: Users, color: "text-cyan" }, { to: "/admin/responses", title: "Voir les réponses", detail: `${responses.length} réponses affichées`, icon: ClipboardCheck, color: "text-success" }].map((action) => <Link key={action.title} to={action.to} className="grid min-h-28 place-items-center rounded-xl border-2 border-dashed border-border p-4 text-center hover:border-primary/40 hover:bg-muted"><div><action.icon className={`mx-auto h-8 w-8 ${action.color}`} /><b className="mt-2 block">{action.title}</b><span className="text-sm text-muted-foreground">{action.detail}</span></div></Link>)}</div></section></div>;
}