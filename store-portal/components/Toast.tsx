"use client";
import { useToast } from "@/lib/toast";
import { Icon } from "./Icon";

export default function Toast() {
  const toasts = useToast((s) => s.toasts);
  const dismiss = useToast((s) => s.dismiss);
  return (
    <div className="toasts">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.kind}`} onClick={() => dismiss(t.id)}>
          <Icon name={t.kind === "ok" ? "ClipboardCheck" : "TriangleAlert"} size={15} />
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}
