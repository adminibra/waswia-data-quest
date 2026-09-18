import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Survey = {
  id: string;
  title: string;
  description: string;
  questions: number;
  active: boolean;
  isPublic?: boolean;
};

export type Investigator = { id: string; name: string; email: string; surveys: number };
export type FieldResponse = {
  id: string;
  survey: string;
  investigator: string;
  date: string;
  gps: string;
  status: "Terminé" | "En attente";
};

export type Assignments = Record<string, string[]>;

type Store = {
  loading: boolean;
  surveys: Survey[];
  investigators: Investigator[];
  responses: FieldResponse[];
  assignments: Assignments;
  refresh: () => Promise<void>;
  assignedSurveys: (investigatorId: string) => Survey[];
  assignSurvey: (investigatorId: string, surveyId: string) => void;
  unassignSurvey: (investigatorId: string, surveyId: string) => void;
  addSurvey: (survey: Omit<Survey, "id">) => void;
  updateSurvey: (survey: Survey) => void;
  toggleSurvey: (id: string) => void;
  deleteSurvey: (id: string) => void;
  addInvestigator: (person: Omit<Investigator, "id" | "surveys">) => void;
  deleteInvestigator: (id: string) => void;
  deleteResponse: (id: string) => void;
};

const WaswiaContext = createContext<Store | null>(null);

function formatDate(value: string) {
  const date = new Date(value);
  return `${date.toLocaleDateString("fr-FR")} ${date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
}

export function WaswiaProvider({ children }: { children: ReactNode }) {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [investigators, setInvestigators] = useState<Omit<Investigator, "surveys">[]>([]);
  const [responses, setResponses] = useState<FieldResponse[]>([]);
  const [assignments, setAssignments] = useState<Assignments>({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [surveyRows, investigatorRows, responseRows, assignmentRows] = await Promise.all([
      supabase.from("surveys").select("*").order("created_at", { ascending: true }),
      supabase.from("investigators").select("*").order("created_at", { ascending: true }),
      supabase.from("responses").select("*").order("collected_at", { ascending: false }),
      supabase.from("assignments").select("*"),
    ]);
    setSurveys((surveyRows.data ?? []).map((row) => ({ id: row.id, title: row.title, description: row.description, questions: row.questions, active: row.active, isPublic: row.is_public })));
    setInvestigators((investigatorRows.data ?? []).map((row) => ({ id: row.id, name: row.name, email: row.email })));
    setResponses((responseRows.data ?? []).map((row) => ({ id: row.id, survey: row.survey_title, investigator: row.investigator_name, date: formatDate(row.collected_at), gps: row.gps, status: row.status === "En attente" ? "En attente" : "Terminé" })));
    const map: Assignments = {};
    for (const row of assignmentRows.data ?? []) {
      map[row.investigator_id] = [...(map[row.investigator_id] ?? []), row.survey_id];
    }
    setAssignments(map);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") void refresh();
    });
    return () => data.subscription.unsubscribe();
  }, [refresh]);

  const run = useCallback(async (action: () => PromiseLike<unknown>) => { await action(); await refresh(); }, [refresh]);

  const value = useMemo<Store>(() => ({
    loading,
    surveys,
    investigators: investigators.map((person) => ({ ...person, surveys: assignments[person.id]?.length ?? 0 })),
    responses,
    assignments,
    refresh,
    assignedSurveys: (investigatorId) => surveys.filter((survey) => (assignments[investigatorId] ?? []).includes(survey.id)),
    assignSurvey: (investigatorId, surveyId) => { void run(() => supabase.from("assignments").insert({ investigator_id: investigatorId, survey_id: surveyId }).then()); },
    unassignSurvey: (investigatorId, surveyId) => { void run(() => supabase.from("assignments").delete().eq("investigator_id", investigatorId).eq("survey_id", surveyId).then()); },
    addSurvey: (survey) => { void run(() => supabase.from("surveys").insert({ title: survey.title, description: survey.description, questions: survey.questions, active: survey.active, is_public: survey.isPublic ?? false }).then()); },
    updateSurvey: (survey) => { void run(() => supabase.from("surveys").update({ title: survey.title, description: survey.description, questions: survey.questions, active: survey.active, is_public: survey.isPublic ?? false }).eq("id", survey.id).then()); },
    toggleSurvey: (id) => { const current = surveys.find((item) => item.id === id); if (!current) return; void run(() => supabase.from("surveys").update({ active: !current.active }).eq("id", id).then()); },
    deleteSurvey: (id) => { void run(() => supabase.from("surveys").delete().eq("id", id).then()); },
    addInvestigator: (person) => { void run(() => supabase.from("investigators").insert({ name: person.name, email: person.email }).then()); },
    deleteInvestigator: (id) => { void run(() => supabase.from("investigators").delete().eq("id", id).then()); },
    deleteResponse: (id) => { void run(() => supabase.from("responses").delete().eq("id", id).then()); },
  }), [loading, surveys, investigators, responses, assignments, refresh, run]);

  return <WaswiaContext.Provider value={value}>{children}</WaswiaContext.Provider>;
}

export function useWaswia() {
  const value = useContext(WaswiaContext);
  if (!value) throw new Error("useWaswia must be used inside WaswiaProvider");
  return value;
}
