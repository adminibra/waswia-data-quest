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

const initialSurveys: Survey[] = [
  {
    id: 1,
    title: "Village des Jeux des Îles de l'Océan Indien 2027",
    description:
      "Madame, Monsieur, La Banque Centrale des Comores (BCC), dans le cadre de la valorisation post-JIOI 2027 du Village des Jeux de Mwandzaza Djumbe, mandate WASWIA pour mesurer l'intérêt des Comoriens — résidents et diaspora — pour l'acquisition d'une villa issue de ce projet.",
    questions: 20,
    active: false,
    isPublic: true,
  },
  { id: 2, title: "Entreprise/Institution/ONG", description: "Pas de description", questions: 19, active: false },
  { id: 3, title: "PARTICULIER", description: "Pas de description", questions: 46, active: false },
];

const investigatorSeed: Array<[string, string]> = [
  ["Abdou Mhadji", "mhadjiabdou19@gmail.com"], ["Boura Ahamadi Ismaila", "bouraismaila54@gmail.com"],
  ["Said Saendia", "saendiasaidlinda@gmail.com"], ["Moutuinllah Faouzi", "moutuinllahfaouzi@gmail.com"],
  ["Hamidi Said Bahia", "bahia@gmail.com"], ["Chamsouddine Anli-Yachrout", "anliyachourtu123@gmail.com"],
  ["Daniel Abdoul Madji", "abdoulaniel51@gmail.com"], ["Narmine Mohamed Chabane", "chabane@gmail.com"],
  ["Hassani Mo inssalama", "moinsalama@gmail.com"], ["Fatima Ahmed", "fatima.ahmed@gmail.com"],
  ["Ali Soilihi", "ali.soilihi@gmail.com"], ["Mariam Said", "mariam.said@gmail.com"],
];
const initialInvestigators: Investigator[] = investigatorSeed.map(([name, email], index) => ({ id: index + 1, name, email, surveys: 0 }));

const names = ["Daniel Abdoul Madji", "Hamidi Said Bahia", "Abdou Mhadji", "Said Saendia"];
const initialResponses: FieldResponse[] = Array.from({ length: 24 }, (_, index) => ({
  id: index + 1,
  survey: index % 5 === 0 ? "PARTICULIER" : "Entreprise/Institution/ONG",
  investigator: names[index % names.length] ?? "Abdou Mhadji",
  date: `02/04/2026 ${19 - Math.floor(index / 4)}:${String(26 - (index * 7) % 27).padStart(2, "0")}`,
  gps: index % 3 === 0 ? "11.7172, 43.2473" : "-",
  status: "Terminé",
}));

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