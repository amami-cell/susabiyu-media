"use client";
import { useStore } from "@/lib/store";
import { Icon } from "../Icon";
import { Stars } from "../Stars";

export default function Media() {
  const media = useStore((s) => s.collections.media) ?? [];
  return (
    <div className="pg">
      <div className="page-head"><h2>媒体一覧</h2></div>
      <div className="tbl-wrap">
        <table style={{ minWidth: 640 }}>
          <thead>
            <tr><th>店舗</th><th>媒体</th><th>評価</th><th>レビュー / フォロワー</th><th>連携</th></tr>
          </thead>
          <tbody>
            {media.map((m) => (
              <tr key={m.id}>
                <td>{m.store}</td>
                <td>{m.source}</td>
                <td>{m.source === "Instagram" ? <span className="muted">—</span> : <Stars value={m.rating} />}</td>
                <td style={{ fontVariantNumeric: "tabular-nums" }}>{m.reviews.toLocaleString()}{m.source === "Instagram" ? " フォロワー" : " 件"}</td>
                <td>
                  {m.synced
                    ? <span className="sp g" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon name="ClipboardCheck" size={12} />連携済</span>
                    : <span className="sp r" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon name="TriangleAlert" size={12} />要再認証</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
