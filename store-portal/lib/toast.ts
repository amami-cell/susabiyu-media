"use client";
import { create } from "zustand";

export interface Toast {
  id: number;
  msg: string;
  kind: "ok" | "err";
}

interface ToastState {
  toasts: Toast[];
  show: (msg: string, kind?: Toast["kind"]) => void;
  dismiss: (id: number) => void;
}

let seq = 1;

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  show: (msg, kind = "ok") => {
    const id = seq++;
    set((s) => ({ toasts: [...s.toasts, { id, msg, kind }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 2600);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
