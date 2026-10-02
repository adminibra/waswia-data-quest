import type { FieldResponse, Survey } from "@/lib/waswia-store";

function cell(v: unknown) {
  if (v === undefined || v === null) return "";
  return Array.isArray(v) ? v.join("; ") : String(v);
}

/** Une question = une colonne, une enquête réalisée = une ligne. */
export function buildTable(responses: FieldResponse[], surveys: Survey[]) {
  const labels: string[] = [];
  const add = (l: string) => { if (l && !labels.includes(l)) labels.push(l); };
  const ids = new Set(responses.map((r) => r.surveyId));
  for (const s of surveys) if (ids.has(s.id)) (s.content ?? []).forEach((q, i) => add(q.label || `Question ${q.id ?? i + 1}`));
  for (const r of responses) Object.keys(r.answers).forEach(add);
  const header = ["ID", "Enquête", "Enquêteur", "Date", "Latitude/Longitude (GPS)", "Statut", ...labels];
  const rows = responses.map((r) => [r.id, r.survey, r.investigator, r.date, r.gps, r.status, ...labels.map((l) => cell(r.answers[l]))]);
  return [header, ...rows];
}

function download(content: string, name: string, type: string) {
  const url = URL.createObjectURL(new Blob(["\ufeff" + content], { type }));
  const a = document.createElement("a"); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
}

export function exportCsv(responses: FieldResponse[], surveys: Survey[]) {
  const t = buildTable(responses, surveys);
  download(t.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n"), "reponses-waswia.csv", "text/csv;charset=utf-8");
}

export function exportExcel(responses: FieldResponse[], surveys: Survey[]) {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const t = buildTable(responses, surveys);
  const html = `<html><head><meta charset="utf-8"></head><body><table border="1">${t.map((r, i) => `<tr>${r.map((c) => i === 0 ? `<th>${esc(String(c))}</th>` : `<td>${esc(String(c))}</td>`).join("")}</tr>`).join("")}</table></body></html>`;
  download(html, "reponses-waswia.xls", "application/vnd.ms-excel");
}
