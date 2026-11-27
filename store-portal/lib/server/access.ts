// pageAccess（ページ権限）とデータコレクションの対応表。
// read(/api/state) と write(/api/mutate) の双方で同じ表を使って権限を強制する。
export const PAGE_TO_COLLECTION: Record<string, string> = {
  stores: "stores", schedule: "schedule", media: "media", reviews: "reviews",
  idpw: "credentials", vendors: "vendors", equipment: "equipment", vehicles: "vehicles",
  capex: "capex", properties: "properties", minutes: "minutes", tasks: "tasks",
  alerts: "alerts", ms: "ms", change: "changes", userreq: "userreq", feedback: "feedback",
  corp: "corp", history: "history", drawings: "drawings", manual: "manual",
};

export const COLLECTION_TO_PAGE: Record<string, string> = Object.fromEntries(
  Object.entries(PAGE_TO_COLLECTION).map(([page, col]) => [col, page])
);
