import { collections, versions } from "@/lib/mockData";
import type { Collections, Versions } from "@/lib/types";

// ── データソース抽象 ──
// 既定はモック（サーバー内メモリ）。環境変数 DATA_SOURCE=http かつ API_BASE を設定すると
// 外部バックエンドへ委譲する。ルートはこのインターフェイスだけに依存するので、
// 本番接続は http 実装に API_BASE を向けるだけで済む（クライアントは変更不要）。
export interface DataSource {
  getState(keys?: string[]): Promise<{ collections: Partial<Collections>; v: Versions }>;
  update(collection: string, id: string, patch: Record<string, unknown>): Promise<{ v: Versions } | "notfound">;
  create(collection: string, item: { id: string }): Promise<{ v: Versions } | "dup">;
}

const mock: DataSource = {
  async getState(keys) {
    if (!keys || keys.length === 0) return { collections, v: versions };
    const c: Partial<Collections> = {};
    const v: Versions = {};
    for (const k of keys) {
      if (k in collections) {
        (c as Record<string, unknown>)[k] = (collections as unknown as Record<string, unknown>)[k];
        v[k] = versions[k];
      }
    }
    return { collections: c, v };
  },
  async update(collection, id, patch) {
    const list = (collections as unknown as Record<string, { id: string }[]>)[collection];
    const item = list?.find((x) => x.id === id);
    if (!item) return "notfound";
    Object.assign(item, patch);
    versions[collection] = Date.now();
    return { v: { [collection]: versions[collection] } };
  },
  async create(collection, item) {
    const list = (collections as unknown as Record<string, { id: string }[]>)[collection];
    if (list.some((x) => x.id === item.id)) return "dup";
    list.unshift(item);
    versions[collection] = Date.now();
    return { v: { [collection]: versions[collection] } };
  },
};

const base = process.env.API_BASE?.replace(/\/$/, "") ?? "";
const http: DataSource = {
  async getState(keys) {
    const qs = keys && keys.length ? `?keys=${keys.join(",")}` : "";
    const r = await fetch(`${base}/state${qs}`, { cache: "no-store" });
    if (!r.ok) throw new Error(`state ${r.status}`);
    return r.json();
  },
  async update(collection, id, patch) {
    const r = await fetch(`${base}/mutate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "update", collection, id, patch }),
    });
    if (r.status === 404) return "notfound";
    if (!r.ok) throw new Error(`update ${r.status}`);
    return r.json();
  },
  async create(collection, item) {
    const r = await fetch(`${base}/mutate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "create", collection, item }),
    });
    if (r.status === 409) return "dup";
    if (!r.ok) throw new Error(`create ${r.status}`);
    return r.json();
  },
};

export const dataSource: DataSource = process.env.DATA_SOURCE === "http" && base ? http : mock;
