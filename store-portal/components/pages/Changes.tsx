"use client";
import { useStore } from "@/lib/store";
import { useMutate } from "@/lib/useMutate";

const ST: Record<string, string> = { 申請中: "a", 承認: "g", 差戻し: "r" };

export default function Changes() {
  const changes = useStore((s) => s.collections.changes) ?? [];
  const mutate = useMutate();

  return (
    <div className="pg">
      <div className="page-head"><h2>変更申請</h2></div>
      <div className="tbl-wrap">
        <table style={{ minWidth: 780 }}>
          <thead>
            <tr><th>店舗</th><th>項目</th><th>変更後</th><th>申請者</th><th>ステータス</th><th>申請日</th><th>操作</th></tr>
          </thead>
          <tbody>
            {changes.map((c) => (
              <tr key={c.id}>
                <td>{c.store}</td>
                <td>{c.field}</td>
                <td>{c.to}</td>
                <td className="muted">{c.applicant}</td>
                <td><span className={`sp ${ST[c.status]}`}>{c.status}</span></td>
                <td style={{ fontVariantNumeric: "tabular-nums" }}>{c.date}</td>
                <td>
                  {c.status === "申請中" ? (
                    <span className="row-actions">
                      <button className="mini ok" onClick={() => mutate("changes", c.id, { status: "承認" })}>承認</button>
                      <button className="mini no" onClick={() => mutate("changes", c.id, { status: "差戻し" })}>差戻し</button>
                    </span>
                  ) : (
                    <span className="faint" style={{ fontSize: 11 }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
