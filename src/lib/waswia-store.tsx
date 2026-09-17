import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type Survey = {
  id: number;
  title: string;
  description: string;
  questions: number;
  active: boolean;
  isPublic?: boolean;
};

export type Investigator = { id: number; name: string; email: string; surveys: number };
export type FieldResponse = {
  id: number;
  survey: string;
  investigator: string;
  date: string;
  gps: string;
  status: "Terminé" | "En attente";
};

const initialSurveys: Survey[] = [];
const initialInvestigators: Investigator[] = [];
const initialResponses: FieldResponse[] = [];

export type Assignments = Record<number, number[]>;

type Store = {
  surveys: Survey[];
  investigators: Investigator[];
  responses: FieldResponse[];
  assignments: Assignments;
  assignedSurveys: (investigatorId: number) => Survey[];
  assignSurvey: (investigatorId: number, surveyId: number) => void;
  unassignSurvey: (investigatorId: number, surveyId: number) => void;
  addSurvey: (survey: Omit<Survey, "id">) => void;
  updateSurvey: (survey: Survey) => void;
  toggleSurvey: (id: number) => void;
  deleteSurvey: (id: number) => void;
  addInvestigator: (person: Omit<Investigator, "id" | "surveys">) => void;
  deleteInvestigator: (id: number) => void;
  deleteResponse: (id: number) => void;
};

const WaswiaContext = createContext<Store | null>(null);

export function WaswiaProvider({ children }: { children: ReactNode }) {
  const [surveys, setSurveys] = useState(initialSurveys);
  const [investigators, setInvestigators] = useState(initialInvestigators);
  const [responses, setResponses] = useState(initialResponses);
  const [assignments, setAssignments] = useState<Assignments>({});
  const value = useMemo<Store>(() => ({
    surveys,
    investigators: investigators.map((person) => ({ ...person, surveys: assignments[person.id]?.length ?? 0 })),
    responses,
    assignments,
    assignedSurveys: (investigatorId) => surveys.filter((survey) => (assignments[investigatorId] ?? []).includes(survey.id)),
    assignSurvey: (investigatorId, surveyId) => setAssignments((items) => ({ ...items, [investigatorId]: [...new Set([...(items[investigatorId] ?? []), surveyId])] })),
    unassignSurvey: (investigatorId, surveyId) => setAssignments((items) => ({ ...items, [investigatorId]: (items[investigatorId] ?? []).filter((id) => id !== surveyId) })),
    addSurvey: (survey) => setSurveys((items) => [...items, { ...survey, id: Date.now() }]),
    updateSurvey: (survey) => setSurveys((items) => items.map((item) => item.id === survey.id ? survey : item)),
    toggleSurvey: (id) => setSurveys((items) => items.map((item) => item.id === id ? { ...item, active: !item.active } : item)),
    deleteSurvey: (id) => setSurveys((items) => items.filter((item) => item.id !== id)),
    addInvestigator: (person) => setInvestigators((items) => [...items, { ...person, id: Date.now(), surveys: 0 }]),
    deleteInvestigator: (id) => setInvestigators((items) => items.filter((item) => item.id !== id)),
    deleteResponse: (id) => setResponses((items) => items.filter((item) => item.id !== id)),
  }), [surveys, investigators, responses, assignments]);
  return <WaswiaContext.Provider value={value}>{children}</WaswiaContext.Provider>;
}

export function useWaswia() {
  const value = useContext(WaswiaContext);
  if (!value) throw new Error("useWaswia must be used inside WaswiaProvider");
  return value;
}