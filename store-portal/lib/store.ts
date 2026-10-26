"use client";
import { create } from "zustand";
import type { Collections, Versions } from "./types";

type ArrayCollections = Exclude<keyof Collections, "user" | "pageAccess">;
interface Identified { id: string }

interface State {
  ready: boolean;
  collections: Partial<Collections>;
  versions: Versions;
  setAll: (data: Partial<Collections>, v: Versions) => void;
  merge: (data: Partial<Collections>, v: Versions) => void;
  setVersions: (v: Versions) => void;
  snapshot: () => { collections: Partial<Collections>; versions: Versions };
  // 楽観的更新: 対象アイテムを patch し、ロールバック用に直前の値を返す
  patchItem: <K extends ArrayCollections>(collection: K, id: string, patch: Partial<Collections[K][number]>) => Collections[K][number] | undefined;
  // ロールバック: 直前の値で復元
  restoreItem: <K extends ArrayCollections>(collection: K, prev: Collections[K][number]) => void;
  // 楽観的追加 / 追加のロールバック
  addItem: <K extends ArrayCollections>(collection: K, item: Collections[K][number]) => void;
  removeItem: <K extends ArrayCollections>(collection: K, id: string) => void;
}

export const useStore = create<State>((set, get) => ({
  ready: false,
  collections: {},
  versions: {},
  setAll: (data, v) => set({ collections: data, versions: v, ready: true }),
  merge: (data, v) =>
    set((s) => ({
      collections: { ...s.collections, ...data },
      versions: { ...s.versions, ...v },
      ready: true,
    })),
  setVersions: (v) => set((s) => ({ versions: { ...s.versions, ...v } })),
  snapshot: () => ({ collections: get().collections, versions: get().versions }),

  patchItem: (collection, id, patch) => {
    const list = (get().collections[collection] as Identified[] | undefined) ?? [];
    const prev = list.find((x) => x.id === id);
    if (!prev) return undefined;
    const next = list.map((x) => (x.id === id ? { ...x, ...patch } : x));
    set((s) => ({ collections: { ...s.collections, [collection]: next } }));
    return prev as never;
  },

  restoreItem: (collection, prev) => {
    const list = (get().collections[collection] as Identified[] | undefined) ?? [];
    const next = list.map((x) => (x.id === (prev as Identified).id ? prev : x));
    set((s) => ({ collections: { ...s.collections, [collection]: next } }));
  },

  addItem: (collection, item) => {
    const list = (get().collections[collection] as Identified[] | undefined) ?? [];
    set((s) => ({ collections: { ...s.collections, [collection]: [item as Identified, ...list] } }));
  },

  removeItem: (collection, id) => {
    const list = (get().collections[collection] as Identified[] | undefined) ?? [];
    set((s) => ({ collections: { ...s.collections, [collection]: list.filter((x) => x.id !== id) } }));
  },
}));
