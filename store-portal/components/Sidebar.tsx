"use client";
import { NAV } from "@/lib/nav";
import { Icon } from "./Icon";
import { useStore } from "@/lib/store";

interface Props {
  page: string;
  collapsed: boolean;
  appTheme: "ai-dark" | "ai";
  onNavigate: (k: string) => void;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
  onSetTheme: (t: "ai-dark" | "ai") => void;
  build: { commit: string; builtAt: string };
}

export default function Sidebar({
  page, collapsed, appTheme, onNavigate, onToggleCollapse, onCloseMobile, onSetTheme, build,
}: Props) {
  const user = useStore((s) => s.collections.user);

  return (
    <aside className="sb">
      <div className="sb-brand">
        <div className="txt">
          <div className="sub">NEXUS GROUP</div>
          <div className="ttl">店舗情報管理</div>
        </div>
        <div className="sb-logo">N</div>
        <button className="sb-collapse main-toggle" onClick={onToggleCollapse} aria-label={collapsed ? "メニューを開く" : "メニューを畳む"}>
          <Icon name={collapsed ? "ChevronsRight" : "ChevronsLeft"} size={16} />
        </button>
        <button className="sb-collapse mobile-close" onClick={onCloseMobile} aria-label="メニューを閉じる">
          <Icon name="X" size={16} />
        </button>
      </div>

      <div className="sb-user">
        <div className="sb-avatar">{user?.initial ?? "—"}</div>
        <div className="name">{user?.name ?? "読み込み中…"}</div>
        <div className="sb-badge">{user?.dept ?? ""}</div>
      </div>

      <nav className="sb-nav">
        {NAV.map((n, i) => {
          if ("sec" in n) return <div key={i} className="sb-sec">{n.sec}</div>;
          if ("line" in n) return <div key={i} className="sb-line" />;
          return (
            <button
              key={n.k}
              className={`sb-item${page === n.k ? " active" : ""}`}
              title={n.t}
              onClick={() => onNavigate(n.k)}
            >
              <span className="bar" />
              <span className="ic"><Icon name={n.icon} /></span>
              <span className="lbl">{n.t}</span>
              {n.g && <span className="gicon">G</span>}
              {n.cnt != null && <span className="cnt">{n.cnt}</span>}
              {n.ext && <span className="extic"><Icon name="ExternalLink" size={14} /></span>}
              {n.soon && <span className="soon">（準備中）</span>}
            </button>
          );
        })}
      </nav>

      <div className="sb-foot">
        <button className="sb-btn"><Icon name="KeyRound" size={14} /><span className="lbl">パスワード変更</span></button>
        <button className="sb-btn"><Icon name="LogOut" size={14} /><span className="lbl">ログアウト</span></button>
        <div className="sb-theme">
          <button className={appTheme === "ai-dark" ? "on" : ""} onClick={() => onSetTheme("ai-dark")}>ダーク</button>
          <button className={appTheme === "ai" ? "on" : ""} onClick={() => onSetTheme("ai")}>ライト</button>
        </div>
        <div className="sb-build">
          <span className="full">最終更新 {build.builtAt} · </span>v <span className="v">{build.commit}</span>
        </div>
      </div>
    </aside>
  );
}
