import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, CalendarDays, ClipboardCheck, Download, RefreshCw, TrendingUp, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { exportCsv, exportExcel } from "@/lib/export-responses";
import { useWaswia } from "@/lib/waswia-store";

export const Route = createFileRoute("/admin/reporting")({ head: () => ({ meta: [{ title: "Reporting — WASWIA" }, { name: "description", content: "Analyse et statistiques des données collectées avec WASWIA." }, { property: "og:title", content: "Reporting — WASWIA" }, { property: "og:description", content: "Analyse et statistiques des données collectées avec WASWIA." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }), component: Reporting });

function Reporting() {
  const { surveys, investigators, responses } = useWaswia();
  const [tab, setTab] = useState("Tendances");
  const [updated, setUpdated] = useState(false);
  const [survey, setSurvey] = useState("");
  const [investigator, setInvestigator] = useState("");
  const [island, setIsland] = useState("");

  const islandOf = (id?: string | null) => investigators.find((p) => p.id === id)?.island ?? "";
  const filtered = useMemo(
    () =>
      responses.filter(
        (item) =>
          (!survey || item.survey === survey) &&
          (!investigator || item.investigator === investigator) &&
          (!island || islandOf(item.investigatorId) === island),
      ),
    [responses, survey, investigator, island, investigators],
  );

  const stats = useMemo(() => {
    const done = filtered.filter((r) => r.status === "Terminé").length;
    const rate = filtered.length ? Math.round((done / filtered.length) * 100) : 0;
    const active = new Set(filtered.map((r) => r.investigatorId || r.investigator)).size;
    return [
      { label: "Réponses totales", value: String(filtered.length), detail: `${done} terminées`, icon: ClipboardCheck, tone: "bg-primary/10 text-primary" },
      { label: "Taux d'achèvement", value: `${rate}%`, detail: "des enquêtes terminées", icon: TrendingUp, tone: "bg-success-soft text-success" },
      { label: "Enquêteurs actifs", value: String(active), detail: "sur la période", icon: Users, tone: "bg-cyan-soft text-cyan" },
      { label: "Enquêtes réalisées", value: String(done), detail: "statut Terminé", icon: CalendarDays, tone: "bg-warning-soft text-warning" },
    ];
  }, [filtered]);

  const chartData = useMemo(() => {
    const counts = new Map<string, { ts: number; value: number }>();
    for (const r of filtered) {
      const d = new Date(r.collectedAt);
      const key = d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
      const prev = counts.get(key);
      counts.set(key, { ts: d.setHours(0, 0, 0, 0), value: (prev?.value ?? 0) + 1 });
    }
    return [...counts.entries()].map(([day, v]) => ({ day, ...v })).sort((a, b) => a.ts - b.ts);
  }, [filtered]);

  const breakdown = useMemo(() => {
    if (tab === "Par enquête") {
      return surveys.map((s) => ({ name: s.title, value: filtered.filter((r) => r.survey === s.title).length }));
    }
    if (tab === "Par enquêteur") {
      return investigators.map((p) => ({ name: p.name, value: filtered.filter((r) => r.investigator === p.name).length }));
    }
    return [];
  }, [tab, surveys, investigators, filtered]);

  return <div className="space-y-6"><PageHeading title="Reporting" subtitle="Analyse et statistiques des données collectées" actions={<div className="hidden gap-2 sm:flex"><Button variant="outline" onClick={() => { setUpdated(true); window.setTimeout(() => setUpdated(false), 700); }}><RefreshCw className={updated ? "animate-spin" : ""} /> Actualiser</Button><Button variant="outline" onClick={() => exportCsv(filtered, surveys)}><Download /> CSV</Button><Button variant="outline" onClick={() => exportExcel(filtered, surveys)}><BarChart3 /> Excel</Button></div>} /><section className="rounded-xl bg-card p-6 shadow-md"><h2 className="font-bold">Filtres</h2><div className="mt-4 grid gap-4 lg:grid-cols-[280px_200px_200px_200px]"><div className="flex h-10 items-center gap-3 rounded-lg border border-input px-4 text-sm"><CalendarDays className="h-4 w-4" />11 août - 10 sept. 2026</div><select value={island} onChange={(e) => setIsland(e.target.value)} className="h-10 rounded-lg border border-input bg-background px-3 text-sm"><option value="">Toutes les îles</option><option value="Ngazidja">Ngazidja</option><option value="Anjouan">Anjouan</option><option value="Mohéli">Mohéli</option></select><select value={survey} onChange={(e) => setSurvey(e.target.value)} className="h-10 rounded-lg border border-input bg-background px-3 text-sm"><option value="">Toutes les enquêtes</option>{surveys.map((s) => <option key={s.id}>{s.title}</option>)}</select><select value={investigator} onChange={(e) => setInvestigator(e.target.value)} className="h-10 rounded-lg border border-input bg-background px-3 text-sm"><option value="">Tous les enquêteurs</option>{investigators.map((p) => <option key={p.id}>{p.name}</option>)}</select></div></section><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map((stat) => <article key={stat.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center rounded-xl bg-card p-6 shadow-md"><div><p className="text-sm text-muted-foreground">{stat.label}</p><p className="mt-1 text-3xl font-bold">{stat.value}</p><p className="mt-2 text-xs text-muted-foreground">{stat.detail}</p></div><span className={`grid h-12 w-12 place-items-center rounded-xl ${stat.tone}`}><stat.icon /></span></article>)}</section><div className="inline-flex rounded-lg bg-muted p-1">{["Tendances", "Par enquête", "Par enquêteur"].map((item) => <Button key={item} variant="ghost" size="sm" onClick={() => setTab(item)} className={tab === item ? "bg-card shadow-sm" : "text-muted-foreground"}>{item}</Button>)}</div><section className="rounded-xl bg-card p-6 shadow-md"><h2 className="text-2xl font-bold">{tab === "Tendances" ? "Évolution des réponses" : tab}</h2><p className="mt-1 text-sm text-muted-foreground">{tab === "Tendances" ? "Nombre de réponses collectées par jour" : "Réponses selon le filtre actif"}</p>{tab === "Tendances" ? <div className="mt-6 h-[320px] w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><defs><linearGradient id="waswiaChart" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25}/><stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="day" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} allowDecimals={false} /><Tooltip /><Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={3} fill="url(#waswiaChart)" /></AreaChart></ResponsiveContainer></div> : <div className="mt-6 space-y-3">{breakdown.length === 0 && <p className="text-sm text-muted-foreground">Aucune donnée.</p>}{breakdown.map((row) => { const max = Math.max(1, ...breakdown.map((b) => b.value)); return <div key={row.name} className="grid grid-cols-[minmax(120px,240px)_minmax(0,1fr)_3rem] items-center gap-3"><span className="truncate text-sm">{row.name}</span><span className="h-3 rounded-full bg-muted"><span className="block h-3 rounded-full bg-primary" style={{ width: `${Math.round((row.value / max) * 100)}%` }} /></span><span className="text-right text-sm font-bold">{row.value}</span></div>; })}</div>}</section></div>;
}
