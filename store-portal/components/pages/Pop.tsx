"use client";
import { useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import popRaw from "@/lib/popData.json";

interface PopPerf { month: string; kind: string; totalQty: number; totalSales: number; count: number; top: [string, number, number][] }
interface PopItem {
  id: string; title: string; kind: string; kindLabel: string;
  period: string; sortKey: number; size: number;
  view: string; preview: string; thumb: string; modified: string;
  perf?: PopPerf | null;
}
const POP = popRaw as unknown as { brand: string; updated: string; count: number; items: PopItem[]; perfNote?: string; perfStores?: string[] };

const KINDS: { key: string; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "kisetsu", label: "季節メニュー" },
  { key: "cake", label: "ケーキ" },
  { key: "parfait", label: "パフェ" },
];
const KIND_COLOR: Record<string, string> = { kisetsu: "#257de0", cake: "#ee7fac", parfait: "#f2a600", other: "#9aa4b2" };

function fmtSize(n: number) {
  return n >= 1_000_000 ? (n / 1_048_576).toFixed(1) + "MB" : Math.round(n / 1024) + "KB";
}
const fmtYen = (n: number) => "¥" + Math.round(n).toLocaleString();

export default function Pop() {
  const [kind, setKind] = useState("all");
  const [preview, setPreview] = useState<PopItem | null>(null);

  const items = useMemo(() => {
    const list = kind === "all" ? POP.items : POP.items.filter((i) => i.kind === kind);
    return list;
  }, [kind]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: POP.items.length };
    for (const i of POP.items) c[i.kind] = (c[i.kind] ?? 0) + 1;
    return c;
  }, []);

  return (
    <div className="pg">
      <div className="page-head">
        <h2>販促物POP一覧</h2>
        <span className="sp">{POP.brand} · {POP.count}点 · メニューPOP／ケーキ／パフェ（Google Drive連携）</span>
      </div>

      <div className="card" style={{ padding: "12px 14px", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {KINDS.map((k) => (
            <button
              key={k.key}
              onClick={() => setKind(k.key)}
              className="pop-chip"
              style={{
                padding: "6px 12px", borderRadius: 999, fontSize: 13, cursor: "pointer",
                border: "1px solid " + (kind === k.key ? "transparent" : "var(--line,#e3e7ee)"),
                background: kind === k.key ? "var(--accent,#1f5fa6)" : "transparent",
                color: kind === k.key ? "#fff" : "var(--ink2,#5b6472)", fontWeight: kind === k.key ? 600 : 500,
              }}
            >
              {k.label}<span style={{ opacity: 0.7, marginLeft: 6 }}>{counts[k.key] ?? 0}</span>
            </button>
          ))}
          <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--muted,#8a93a0)" }}>
            <Icon name="Info" size={13} /> 取得時期 {POP.updated}
          </span>
        </div>
      </div>

      <div className="pop-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 14 }}>
        {items.map((it) => (
          <div key={it.id} className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <button
              onClick={() => setPreview(it)}
              style={{ border: 0, padding: 0, cursor: "pointer", background: "#f3f5f8", display: "block", position: "relative", aspectRatio: "3 / 4", overflow: "hidden" }}
              title="プレビュー"
            >
              <img
                src={it.thumb}
                alt={it.title}
                loading="lazy"
                referrerPolicy="no-referrer"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                onError={(e) => {
                  const el = e.currentTarget;
                  el.style.display = "none";
                  const ph = el.nextElementSibling as HTMLElement | null;
                  if (ph) ph.style.display = "flex";
                }}
              />
              <div
                style={{ display: "none", position: "absolute", inset: 0, flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: KIND_COLOR[it.kind] }}
              >
                <Icon name="FileText" size={40} />
                <span style={{ fontSize: 12, color: "var(--ink2,#5b6472)" }}>{it.kindLabel}</span>
              </div>
              <span
                style={{ position: "absolute", top: 8, left: 8, fontSize: 11, fontWeight: 700, color: "#fff", background: KIND_COLOR[it.kind], padding: "2px 8px", borderRadius: 6 }}
              >
                {it.kindLabel}
              </span>
            </button>
            <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.35 }}>{it.period}</div>
              <div style={{ fontSize: 11, color: "var(--muted,#8a93a0)", wordBreak: "break-all" }}>{it.title}</div>
              {it.perf && it.perf.count > 0 && (
                <div style={{ marginTop: 2, padding: "6px 8px", borderRadius: 7, background: "var(--surface2,#f5f7fa)", fontSize: 11 }}>
                  <div style={{ color: "var(--muted,#8a93a0)", marginBottom: 2 }}>キャンペーン月の該当商品実績</div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{fmtYen(it.perf.totalSales)}<span style={{ fontSize: 11, fontWeight: 400, color: "var(--ink2,#5b6472)" }}> ・{it.perf.totalQty.toLocaleString()}点 / {it.perf.count}商品</span></div>
                  {it.perf.top[0] && <div style={{ color: "var(--ink2,#5b6472)", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>1位 {it.perf.top[0][0]}（{it.perf.top[0][1]}点）</div>}
                </div>
              )}
              <div style={{ marginTop: "auto", display: "flex", gap: 6, alignItems: "center", paddingTop: 6 }}>
                <button onClick={() => setPreview(it)} className="btn-ghost" style={{ fontSize: 12, padding: "5px 10px", border: "1px solid var(--line,#e3e7ee)", borderRadius: 7, background: "transparent", cursor: "pointer", color: "var(--ink,#1a2230)" }}>
                  <Icon name="Eye" size={13} /> プレビュー
                </button>
                <a href={it.view} target="_blank" rel="noreferrer" style={{ fontSize: 12, padding: "5px 10px", borderRadius: 7, background: "var(--accent,#1f5fa6)", color: "#fff", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
                  Drive <Icon name="ExternalLink" size={12} />
                </a>
                <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--muted,#8a93a0)" }}>{fmtSize(it.size)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {preview && (
        <div
          onClick={() => setPreview(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(10,14,20,.68)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--surface,#fff)", borderRadius: 12, width: "min(820px,96vw)", height: "min(90vh,1000px)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: "1px solid var(--line,#e3e7ee)" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", background: KIND_COLOR[preview.kind], padding: "2px 8px", borderRadius: 6 }}>{preview.kindLabel}</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{preview.period}</span>
              <span style={{ fontSize: 11, color: "var(--muted,#8a93a0)" }}>{preview.title}</span>
              <a href={preview.view} target="_blank" rel="noreferrer" style={{ marginLeft: "auto", fontSize: 12, padding: "5px 10px", borderRadius: 7, background: "var(--accent,#1f5fa6)", color: "#fff", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>Driveで開く <Icon name="ExternalLink" size={12} /></a>
              <button onClick={() => setPreview(null)} style={{ border: 0, background: "transparent", cursor: "pointer", color: "var(--ink2,#5b6472)" }} aria-label="閉じる"><Icon name="X" size={18} /></button>
            </div>
            <iframe src={preview.preview} title={preview.title} style={{ flex: 1, border: 0, width: "100%" }} />
            {preview.perf && preview.perf.count > 0 && (
              <div style={{ borderTop: "1px solid var(--line,#e3e7ee)", padding: "10px 14px", maxHeight: 180, overflowY: "auto" }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                  キャンペーン月の該当商品実績（{preview.period}）
                  <span style={{ fontSize: 11, fontWeight: 400, color: "var(--ink2,#5b6472)", marginLeft: 8 }}>{fmtYen(preview.perf.totalSales)} ・{preview.perf.totalQty.toLocaleString()}点 ・{preview.perf.count}商品</span>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <tbody>
                    {preview.perf.top.map((t, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid var(--line,#eef1f5)" }}>
                        <td style={{ padding: "3px 6px", color: "var(--muted,#8a93a0)", width: 20 }}>{i + 1}</td>
                        <td style={{ padding: "3px 6px" }}>{t[0]}</td>
                        <td style={{ padding: "3px 6px", textAlign: "right", whiteSpace: "nowrap" }}>{t[1].toLocaleString()}点</td>
                        <td style={{ padding: "3px 6px", textAlign: "right", whiteSpace: "nowrap", fontWeight: 600 }}>{fmtYen(t[2])}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ fontSize: 10, color: "var(--muted,#8a93a0)", marginTop: 4 }}>{POP.perfNote}</div>
              </div>
            )}
            <div style={{ fontSize: 11, color: "var(--muted,#8a93a0)", padding: "6px 14px", borderTop: "1px solid var(--line,#e3e7ee)" }}>
              プレビューが表示されない場合はGoogleにログイン済みか確認、または「Driveで開く」をご利用ください。
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
