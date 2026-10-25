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

export interface Collections {
  user: { name: string; dept: string; initial: string };
  stores: Store[];
  notices: Notice[];
}

export type CollectionKey = keyof Collections;
export type Versions = Record<string, number>;

export interface BuildInfo {
  build: string;
  commit: string;
  message: string;
  builtAt: string;
}
