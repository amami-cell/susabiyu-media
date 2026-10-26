import fs from "fs";
import path from "path";
import { collections as seedCollections, versions as seedVersions } from "@/lib/mockData";
import type { Collections, Versions } from "@/lib/types";
import type { DataSource } from "./datasource";

// JSON ファイル永続のデータソース（自己ホスト/Docker 向け）。
// 単一プロセス前提。書き込みは一時ファイル→rename でアトミックに保存。
// サーバーレス（読み取り専用FS/コールドスタート）では使わず http を推奨。
const DIR = process.env.DATA_DIR || path.join(process.cwd(), ".data");
const FILE = path.join(DIR, "state.json");

let mem: { collections: Collections; versions: Versions } | null = null;

function ensure() {
  if (mem) return mem;
  try {
    mem = JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch {
    mem = { collections: structuredClone(seedCollections), versions: { ...seedVersions } };
    persist();
  }
  return mem!;
}

function persist() {
  try {
    fs.mkdirSync(DIR, { recursive: true });
    fs.writeFileSync(`${FILE}.tmp`, JSON.stringify(mem));
    fs.renameSync(`${FILE}.tmp`, FILE);
  } catch (e) {
    console.error("[filestore] 永続化に失敗しました:", e);
  }
}

export const fileSource: DataSource = {
  async getState(keys) {
    const { collections, versions } = ensure();
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
    const db = ensure();
    const list = (db.collections as unknown as Record<string, { id: string }[]>)[collection];
    const item = list?.find((x) => x.id === id);
    if (!item) return "notfound";
    Object.assign(item, patch);
    db.versions[collection] = Date.now();
    persist();
    return { v: { [collection]: db.versions[collection] } };
  },
  async create(collection, item) {
    const db = ensure();
    const list = (db.collections as unknown as Record<string, { id: string }[]>)[collection];
    if (list.some((x) => x.id === item.id)) return "dup";
    list.unshift(item);
    db.versions[collection] = Date.now();
    persist();
    return { v: { [collection]: db.versions[collection] } };
  },
};
