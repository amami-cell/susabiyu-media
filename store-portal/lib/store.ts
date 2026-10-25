"use client";
import { create } from "zustand";
import type { Collections, Versions } from "./types";

interface State {
  ready: boolean;
  collections: Partial<Collections>;
  versions: Versions;
  setAll: (data: Partial<Collections>, v: Versions) => void;
  merge: (data: Partial<Collections>, v: Versions) => void;
  snapshot: () => { collections: Partial<Collections>; versions: Versions };
}

export const useStore = create<State>((set, get) => ({
  ready: false,
  collections: {},
  versions: {},
  setAll: (data, v) => set({ collections: data, versions: v, ready: true }),
  // 差分のあるコレクションだけ置換（仕様書 5-3 の merge）
  merge: (data, v) =>
    set((s) => ({
      collections: { ...s.collections, ...data },
      versions: { ...s.versions, ...v },
      ready: true,
    })),
  snapshot: () => ({ collections: get().collections, versions: get().versions }),
}));
