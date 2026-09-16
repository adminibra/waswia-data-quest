import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Eye, GripVertical, Layers3, Plus, Save, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useWaswia } from "@/lib/waswia-store";

export const Route = createFileRoute("/admin/surveys/$surveyId")({
  head: () => ({ meta: [
    { title: "Éditeur de sondage — WASWIA" },
    { name: "description", content: "Créez et organisez les questions d’un sondage WASWIA." },
    { property: "og:title", content: "Éditeur de sondage — WASWIA" },
    { property: "og:description", content: "Créez et organisez les questions d’un sondage WASWIA." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: SurveyEditor,
});

type Question = { id: number; label: string; type: string; required: boolean; options: string[]; other: boolean };

function SurveyEditor() {
  const { surveyId } = Route.useParams();
  const navigate = useNavigate();
  const { surveys, addSurvey, updateSurvey } = useWaswia();
  const survey = surveys.find((item) => String(item.id) === surveyId);
  const [title, setTitle] = useState(survey?.title ?? "X");
  const [parts, setParts] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [saved, setSaved] = useState(false);
  const nextId = useMemo(() => Math.max(0, ...questions.map((item) => item.id)) + 1, [questions]);

  const addQuestion = () => setQuestions((items) => [...items, { id: nextId, label: "", type: "Choix unique", required: true, options: ["Option 1", "Option 2"], other: false }]);
  const updateQuestion = (id: number, patch: Partial<Question>) => setQuestions((items) => items.map((item) => item.id === id ? { ...item, ...patch } : item));
  const save = () => {
    if (survey) updateSurvey({ ...survey, title: title.trim() || "Sans titre", questions: questions.length });
    else addSurvey({ title: title.trim() || "Sans titre", description: "Pas de description", questions: questions.length, active: false, isPublic: true });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 900);
  };

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-5">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/admin/surveys" })} aria-label="Retour aux sondages"><ArrowLeft /></Button>
          <div className="min-w-0">
            <Input value={title} onChange={(event) => setTitle(event.target.value)} className="h-8 border-0 bg-transparent p-0 text-2xl font-bold shadow-none focus-visible:ring-0" aria-label="Titre du sondage" />
            <p className="text-sm text-muted-foreground">{parts} parties · {questions.length} question{questions.length > 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 lg:justify-end">
          <Button variant="outline" onClick={() => setParts((value) => value + 1)}><Layers3 /> Ajouter une partie</Button>
          <Button variant="outline"><Eye /> Prévisualiser</Button>
          <Button className="bg-brand-gradient" onClick={save}><Save /> {saved ? "Enregistré" : "Enregistrer"}</Button>
        </div>
      </header>

      {questions.length > 0 && <p className="text-sm text-muted-foreground">Questions sans section</p>}
      <div className="space-y-3">
        {questions.map((question, index) => (
          <article key={question.id} className="rounded-xl bg-card p-5 shadow-md sm:p-7">
            <div className="grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-3">
              <GripVertical className="h-5 w-5 text-muted-foreground" />
              <span className="grid h-6 min-w-7 place-items-center rounded-full border border-border px-2 text-xs">{index + 1}</span>
              <Input value={question.label} onChange={(event) => updateQuestion(question.id, { label: event.target.value })} placeholder="Question..." />
              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setQuestions((items) => items.filter((item) => item.id !== question.id))} aria-label="Supprimer la question"><Trash2 /></Button>
            </div>
            <div className="ml-0 mt-3 flex flex-wrap items-center gap-4 sm:ml-16">
              <select value={question.type} onChange={(event) => updateQuestion(question.id, { type: event.target.value })} className="h-10 min-w-56 rounded-lg border border-input bg-background px-3 text-sm">
                <option>Choix unique</option><option>Choix multiple</option><option>Texte libre</option><option>Nombre</option>
              </select>
              <label className="flex items-center gap-2 text-sm"><Switch checked={question.required} onCheckedChange={(required) => updateQuestion(question.id, { required })} /> Obligatoire</label>
            </div>
            {question.type.includes("Choix") && <div className="ml-0 mt-5 space-y-2 sm:ml-16">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Options</p>
              {question.options.map((option, optionIndex) => <div key={`${question.id}-${optionIndex}`} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3"><span className="h-4 w-4 rounded-full border-2 border-border" /><Input value={option} onChange={(event) => updateQuestion(question.id, { options: question.options.map((item, itemIndex) => itemIndex === optionIndex ? event.target.value : item) })} /><Button variant="ghost" size="icon" onClick={() => updateQuestion(question.id, { options: question.options.filter((_, itemIndex) => itemIndex !== optionIndex) })} aria-label="Supprimer l’option"><Trash2 /></Button></div>)}
              <Button variant="ghost" size="sm" onClick={() => updateQuestion(question.id, { options: [...question.options, `Option ${question.options.length + 1}`] })}><Plus /> Ajouter une option</Button>
              <label className="flex items-center gap-2 pt-2 text-sm"><Switch checked={question.other} onCheckedChange={(other) => updateQuestion(question.id, { other })} /> Ajouter une option « Autre (à préciser) »</label>
            </div>}
          </article>
        ))}
      </div>
      <Button variant="outline" onClick={addQuestion} className="h-20 w-full border-2 border-dashed text-muted-foreground"><span className="flex flex-col items-center gap-1"><Plus /> Ajouter une question</span></Button>
    </div>
  );
}