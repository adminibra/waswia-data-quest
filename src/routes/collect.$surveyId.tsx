import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, MapPin, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useWaswia } from "@/lib/waswia-store";

export const Route = createFileRoute("/collect/$surveyId")({
  head: () => ({ meta: [
    { title: "Collecte d'enquête — WASWIA" },
    { name: "description", content: "Remplissez une enquête terrain avec position GPS automatique." },
    { property: "og:title", content: "Collecte d'enquête — WASWIA" },
    { property: "og:description", content: "Remplissez une enquête terrain avec position GPS automatique." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Collect,
});

type Pos = { lat: number; lng: number; acc: number };

function Collect() {
  const { surveyId } = Route.useParams();
  const navigate = useNavigate();
  const { surveys, currentInvestigator, refresh, loading } = useWaswia();
  const survey = surveys.find((s) => s.id === surveyId);
  const questions = survey?.content ?? [];
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [others, setOthers] = useState<Record<number, string>>({});
  const [pos, setPos] = useState<Pos | null>(null);
  const [gpsMsg, setGpsMsg] = useState("Recherche de la position…");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [step, setStep] = useState(0);
  const isEmpty = (qid: number) => { const v = answers[qid]; return v === undefined || v === "" || (Array.isArray(v) && v.length === 0); };
  const next = () => { const q = questions[step]; if (q?.required && isEmpty(q.id)) { setError("Cette question est obligatoire."); return; } setError(""); if (step < questions.length - 1) setStep(step + 1); else void submit(); };

  useEffect(() => { void supabase.auth.getUser().then(({ data }) => { if (!data.user) navigate({ to: "/auth", replace: true }); }); }, [navigate]);

  useEffect(() => {
    if (!navigator.geolocation) { setGpsMsg("GPS non disponible sur cet appareil"); return; }
    const id = navigator.geolocation.watchPosition(
      (p) => { setPos({ lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy }); setGpsMsg(""); },
      () => setGpsMsg("Position refusée ou indisponible — autorisez la localisation"),
      { enableHighAccuracy: true, timeout: 20000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  const toggleMulti = (qid: number, opt: string) => setAnswers((a) => {
    const cur = Array.isArray(a[qid]) ? (a[qid] as string[]) : [];
    return { ...a, [qid]: cur.includes(opt) ? cur.filter((o) => o !== opt) : [...cur, opt] };
  });

  const submit = async () => {
    setError("");
    const final: Record<string, string | string[]> = {};
    for (const q of questions) {
      let v = answers[q.id];
      if (v === "__other") v = `Autre: ${others[q.id] ?? ""}`;
      if (Array.isArray(v) && v.includes("__other")) v = v.map((o) => o === "__other" ? `Autre: ${others[q.id] ?? ""}` : o);
      const empty = v === undefined || v === "" || (Array.isArray(v) && v.length === 0);
      if (q.required && empty) { setError(`Question obligatoire : ${q.label || "sans titre"}`); return; }
      final[q.label || `Question ${q.id}`] = v ?? "";
    }
    setSaving(true);
    const { error: err } = await supabase.from("responses").insert({
      survey_id: survey!.id, survey_title: survey!.title,
      investigator_id: currentInvestigator?.id ?? null,
      investigator_name: currentInvestigator?.name ?? "Admin",
      answers: final as never,
      gps: pos ? `${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}` : "-",
      latitude: pos?.lat ?? null, longitude: pos?.lng ?? null, accuracy: pos?.acc ?? null,
      status: "Terminé",
    });
    setSaving(false);
    if (err) { setError(err.message); return; }
    await refresh();
    setDone(true);
  };

  if (loading) return <p className="p-6 text-muted-foreground">Chargement…</p>;
  if (!survey) return <div className="p-6"><p>Enquête introuvable.</p><Button className="mt-4" onClick={() => navigate({ to: "/" })}>Retour</Button></div>;

  return (
    <div className="min-h-screen bg-admin-background">
      <header className="flex h-[72px] items-center gap-3 bg-brand-gradient px-4 text-primary-foreground shadow-md">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/" })} className="text-primary-foreground hover:bg-background/10 hover:text-primary-foreground" aria-label="Retour"><ArrowLeft /></Button>
        <h1 className="truncate text-lg font-bold">{survey.title}</h1>
      </header>
      <main className="mx-auto max-w-2xl space-y-4 px-4 py-6">
        <div className="flex items-center gap-2 rounded-xl bg-card p-4 text-sm shadow-md">
          <MapPin className={pos ? "h-5 w-5 text-success" : "h-5 w-5 text-warning"} />
          {pos ? <span>Position enregistrée : {pos.lat.toFixed(5)}, {pos.lng.toFixed(5)} (±{Math.round(pos.acc)} m)</span> : <span>{gpsMsg}</span>}
        </div>
        {done ? (
          <div className="rounded-xl bg-card p-8 text-center shadow-md">
            <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
            <p className="mt-3 text-lg font-bold">Réponse enregistrée</p>
            <div className="mt-5 flex justify-center gap-2">
              <Button variant="outline" onClick={() => { setAnswers({}); setOthers({}); setStep(0); setDone(false); }}>Nouvelle collecte</Button>
              <Button onClick={() => navigate({ to: "/" })}>Accueil</Button>
            </div>
          </div>
        ) : (
          <>
            {questions.length === 0 && <p className="rounded-xl bg-card p-4 text-sm text-muted-foreground shadow-md">Cette enquête ne contient encore aucune question. L'administrateur doit ajouter des questions puis enregistrer.</p>}
            {questions.length > 0 && <div><p className="text-sm font-semibold">Question {step + 1} sur {questions.length}</p><div className="mt-2 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${((step + 1) / questions.length) * 100}%` }} /></div></div>}
            {questions.map((q, i) => i !== step ? null : (
              <section key={q.id} className="rounded-xl bg-card p-5 shadow-md">
                <p className="font-semibold">{i + 1}. {q.label || "Question sans titre"} {q.required && <span className="text-destructive">*</span>}</p>
                <div className="mt-3 space-y-2">
                  {q.type === "Texte libre" && <Input value={(answers[q.id] as string) ?? ""} onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))} />}
                  {q.type === "Nombre" && <Input type="number" value={(answers[q.id] as string) ?? ""} onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))} />}
                  {q.type.includes("Choix") && [...q.options, ...(q.other ? ["__other"] : [])].map((opt) => {
                    const multi = q.type === "Choix multiple";
                    const checked = multi ? Array.isArray(answers[q.id]) && (answers[q.id] as string[]).includes(opt) : answers[q.id] === opt;
                    return (
                      <label key={opt} className="flex items-center gap-3 text-sm">
                        <input type={multi ? "checkbox" : "radio"} name={`q${q.id}`} checked={checked} onChange={() => multi ? toggleMulti(q.id, opt) : setAnswers((a) => ({ ...a, [q.id]: opt }))} className="h-4 w-4 accent-primary" />
                        {opt === "__other" ? "Autre (à préciser)" : opt}
                      </label>
                    );
                  })}
                  {q.other && (answers[q.id] === "__other" || (Array.isArray(answers[q.id]) && (answers[q.id] as string[]).includes("__other"))) && <Input placeholder="Précisez…" value={others[q.id] ?? ""} onChange={(e) => setOthers((o) => ({ ...o, [q.id]: e.target.value }))} />}
                </div>
              </section>
            ))}
            {error && <p className="text-sm text-destructive">{error}</p>}
            {questions.length > 0 && <div className="flex gap-2"><Button variant="outline" className="flex-1" disabled={step === 0 || saving} onClick={() => { setError(""); setStep(step - 1); }}>Précédent</Button><Button className="flex-1 bg-brand-gradient" disabled={saving} onClick={next}>{step === questions.length - 1 ? <><Send /> {saving ? "Envoi…" : "Terminer l’enquête"}</> : "Suivant"}</Button></div>}
          </>
        )}
      </main>
    </div>
  );
}
