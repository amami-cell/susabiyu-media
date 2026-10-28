"use client";
import { useState } from "react";

export default function Login({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErr(data.error ?? "ログインに失敗しました。");
        return;
      }
      onDone();
    } catch {
      setErr("通信エラーが発生しました。");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login">
      <form className="login-card" onSubmit={submit}>
        <div className="login-brand">
          <div className="sub">NEXUS GROUP</div>
          <div className="ttl">店舗情報管理</div>
        </div>
        {err && <div className="err">{err}</div>}
        <div>
          <label htmlFor="email">メールアドレス</label>
          <input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@nexus-group.co.jp" />
        </div>
        <div>
          <label htmlFor="password">パスワード</label>
          <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <button className="btn" type="submit" disabled={busy}>{busy ? "ログイン中…" : "ログイン"}</button>
        <div className="hint">デモ環境：任意のメール＋パスワードでログインできます。</div>
      </form>
    </div>
  );
}
