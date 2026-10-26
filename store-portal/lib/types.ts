export type StatusKey = "g" | "p" | "a" | "x" | "r";

export interface Store {
  id: string;
  name: string;
  code: string;
  dept: string;
  area: string;
  genre: string;
  status: string;
  statusKey: StatusKey;
  tel: string;
  open: string;
  warn: number;
  media?: string;
  note?: string;
}

export interface Notice {
  id: string;
  date: string;
  text: string;
  tag: "NEW" | "更新" | "期限" | "完了";
}

export interface ScheduleEvent {
  id: string;
  date: string; // MM/DD
  time: string;
  title: string;
  store: string;
  kind: "MS" | "試食" | "会議" | "点検" | "その他";
}

export interface MediaRow {
  id: string;
  store: string;
  source: "食べログ" | "ぐるなび" | "Google" | "Instagram";
  rating: number; // 0-5
  reviews: number;
  synced: boolean;
}

export interface Review {
  id: string;
  store: string;
  source: MediaRow["source"];
  rating: number;
  date: string;
  author: string;
  text: string;
}

export interface ChangeRequest {
  id: string;
  store: string;
  field: string;
  to: string;
  applicant: string;
  status: "申請中" | "承認" | "差戻し";
  date: string;
}

export interface Task {
  id: string;
  title: string;
  assignee: string;
  due: string;
  status: "未着手" | "進行中" | "完了";
  priority: "高" | "中" | "低";
}

export interface Alert {
  id: string;
  store: string;
  kind: string;
  due: string;
  level: "critical" | "warn";
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  contact: string;
  tel: string;
  stores: number;
}

export interface Equipment {
  id: string;
  item: string;
  store: string;
  qty: number;
  status: "貸与中" | "在庫" | "修理" | "廃棄";
  assignedTo: string;
}

export interface Vehicle {
  id: string;
  name: string;
  plate: string;
  store: string;
  inspection: string; // 車検満了
  insurance: string; // 任意保険満了
}

export interface Credential {
  id: string;
  service: string;
  store: string;
  loginId: string;
  password: string;
  url: string;
}

export interface Minute {
  id: string;
  date: string;
  title: string;
  attendees: string;
  summary: string;
}

export interface User {
  name: string;
  dept: string;
  initial: string;
  role: string;
}

export interface Collections {
  user: User;
  pageAccess: Record<string, boolean>;
  stores: Store[];
  notices: Notice[];
  schedule: ScheduleEvent[];
  media: MediaRow[];
  reviews: Review[];
  changes: ChangeRequest[];
  tasks: Task[];
  alerts: Alert[];
  vendors: Vendor[];
  equipment: Equipment[];
  vehicles: Vehicle[];
  credentials: Credential[];
  minutes: Minute[];
}

export type CollectionKey = keyof Collections;
export type Versions = Record<string, number>;

export interface BuildInfo {
  build: string;
  commit: string;
  message: string;
  builtAt: string;
}

export interface SessionInfo {
  authed: boolean;
  user: User | null;
}
