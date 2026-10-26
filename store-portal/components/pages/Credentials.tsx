"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Icon } from "../Icon";

export default function Credentials() {
  const creds = useStore((s) => s.collections.credentials) ?? [];
  const [shown, setShown] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied((c) => (c === id ? null : c)), 1500);
    } catch {
      /* 一部環境ではコピー不可 */
    }
  };

  return (
    <div className="pg">
      <div className="page-head"><h2>ID・PW</h2></div>
      <div className="card" style={{ padding: "10px 12px" }}>
        <div className="muted" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="KeyRound" size={14} />権限のある担当のみ閲覧できます（デモ値）。パスワードは既定で非表示。
        </div>
      </div>
      <div className="tbl-wrap">
        <table style={{ minWidth: 760 }}>
          <thead>
            <tr><th>サービス</th><th>店舗</th><th>ログインID</th><th>パスワード</th><th>URL</th></tr>
          </thead>
          <tbody>
            {creds.map((c) => (
              <tr key={c.id}>
                <td>{c.service}</td>
                <td className="muted">{c.store}</td>
                <td style={{ fontFamily: "ui-monospace,monospace" }}>{c.loginId}</td>
                <td>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "ui-monospace,monospace", letterSpacing: shown[c.id] ? 0 : 2 }}>
                      {shown[c.id] ? c.password : "••••••••"}
                    </span>
                    <button className="cell-btn" title={shown[c.id] ? "隠す" : "表示"} onClick={() => setShown((s) => ({ ...s, [c.id]: !s[c.id] }))}>
                      <Icon name={shown[c.id] ? "X" : "Search"} size={14} />
                    </button>
                    <button className="cell-btn" title="コピー" onClick={() => copy(c.id, c.password)}>
                      <Icon name={copied === c.id ? "ClipboardCheck" : "Square"} size={14} />
                    </button>
                  </span>
                </td>
                <td><a href={c.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", display: "inline-flex", alignItems: "center", gap: 4 }}>開く <Icon name="ExternalLink" size={13} /></a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
