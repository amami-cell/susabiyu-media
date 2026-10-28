"use client";
import { useCallback, useEffect, useState } from "react";
import { useSync } from "@/lib/useSync";
import { PAGE_TITLES, NAV } from "@/lib/nav";
import Sidebar from "@/components/Sidebar";
import Drawer from "@/components/Drawer";
import Login from "@/components/Login";
import Dashboard from "@/components/pages/Dashboard";
import Stores from "@/components/pages/Stores";
import Schedule from "@/components/pages/Schedule";
import Media from "@/components/pages/Media";
import Reviews from "@/components/pages/Reviews";
import Changes from "@/components/pages/Changes";
import Tasks from "@/components/pages/Tasks";
import Alerts from "@/components/pages/Alerts";
import Vendors from "@/components/pages/Vendors";
import Equipment from "@/components/pages/Equipment";
import Vehicles from "@/components/pages/Vehicles";
import Credentials from "@/components/pages/Credentials";
import Minutes from "@/components/pages/Minutes";
import Drawings from "@/components/pages/Drawings";
import CapexPage from "@/components/pages/Capex";
import Properties from "@/components/pages/Properties";
import Ms from "@/components/pages/Ms";
import UserRequests from "@/components/pages/UserRequests";
import FeedbackPage from "@/components/pages/Feedback";
import CorpPage from "@/components/pages/Corp";
import History from "@/components/pages/History";
import Manual from "@/components/pages/Manual";
import Soon from "@/components/pages/Soon";
import Placeholder from "@/components/pages/Placeholder";
import Toast from "@/components/Toast";
import { Icon } from "@/components/Icon";
import type { Store, BuildInfo } from "@/lib/types";

const VALID = new Set(
  NAV.filter((n): n is Extract<(typeof NAV)[number], { k: string }> => "k" in n).map((n) => n.k)
);

export default function Page() {
  const [auth, setAuth] = useState<"loading" | "in" | "out">("loading");

  useEffect(() => {
    fetch("/api/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setAuth(d.authed ? "in" : "out"))
      .catch(() => setAuth("out"));
  }, []);

  if (auth === "loading") {
    return (
      <div className="login">
        <div style={{ color: "#fff", fontSize: 13, opacity: 0.8 }}>読み込み中…</div>
      </div>
    );
  }
  if (auth === "out") return <Login onDone={() => setAuth("in")} />;
  return <AppShell onLogout={() => setAuth("out")} />;
}

function AppShell({ onLogout }: { onLogout: () => void }) {
  useSync();

  const [page, setPage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [appTheme, setAppTheme] = useState<"ai-dark" | "ai">("ai-dark");
  const [drawerStore, setDrawerStore] = useState<Store | null>(null);
  const [build, setBuild] = useState<{ commit: string; builtAt: string }>({ commit: "3ad5c9b", builtAt: "10/24 19:45" });
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const read = () => {
      const h = location.hash.slice(1);
      setPage(VALID.has(h) ? h : "dashboard");
      window.scrollTo(0, 0);
      setMobileOpen(false);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  useEffect(() => {
    try {
      if (document.documentElement.hasAttribute("data-nav-collapsed")) setCollapsed(true);
    } catch {}
  }, []);

  // ビルド情報＋新デプロイ検知（仕様書 5-4）: 起動時のコミットを基準に 60秒ごと比較
  useEffect(() => {
    let bootCommit: string | null = null;
    const poll = () =>
      fetch("/api/build", { cache: "no-store" })
        .then((r) => r.json())
        .then((b: BuildInfo) => {
          if (bootCommit === null) {
            bootCommit = b.commit;
            setBuild({ commit: b.commit, builtAt: b.builtAt });
          } else if (b.commit !== bootCommit) {
            setUpdateAvailable(true);
          }
        })
        .catch(() => {});
    poll();
    const timer = setInterval(() => {
      if (!document.hidden) poll();
    }, 60_000);
    return () => clearInterval(timer);
  }, []);

  const navigate = useCallback((k: string) => {
    // アクセスログ（仕様書 6, sendBeacon）
    try {
      navigator.sendBeacon?.("/api/access", new Blob([JSON.stringify({ page: k, at: Date.now() })], { type: "application/json" }));
    } catch {}
    if (location.hash.slice(1) !== k) location.hash = k;
    else setPage(k);
  }, []);

  const toggleCollapse = useCallback(() => {
    setCollapsed((v) => {
      const next = !v;
      try {
        localStorage.setItem("nav-collapsed", next ? "1" : "0");
        document.documentElement.toggleAttribute("data-nav-collapsed", next);
      } catch {}
      return next;
    });
  }, []);

  const doLogout = useCallback(async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch {}
    onLogout();
  }, [onLogout]);

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <Dashboard />;
      case "stores": return <Stores onOpen={setDrawerStore} />;
      case "schedule": return <Schedule />;
      case "media": return <Media />;
      case "reviews": return <Reviews />;
      case "change": return <Changes />;
      case "tasks": return <Tasks />;
      case "alerts": return <Alerts />;
      case "vendors": return <Vendors />;
      case "equipment": return <Equipment />;
      case "vehicles": return <Vehicles />;
      case "idpw": return <Credentials />;
      case "minutes": return <Minutes />;
      case "drawings": return <Drawings />;
      case "capex": return <CapexPage />;
      case "properties": return <Properties />;
      case "ms": return <Ms />;
      case "userreq": return <UserRequests />;
      case "feedback": return <FeedbackPage />;
      case "corp": return <CorpPage />;
      case "history": return <History />;
      case "manual": return <Manual />;
      case "promo":
      case "workflow":
        return <Soon title={PAGE_TITLES[page]} />;
      default: {
        const meta = NAV.find((n) => "k" in n && n.k === page) as { icon: string } | undefined;
        return <Placeholder title={PAGE_TITLES[page] ?? "ダッシュボード"} icon={meta?.icon ?? "Square"} />;
      }
    }
  };

  return (
    <div className={`app${mobileOpen ? " mobile-open" : ""}`} data-apptheme={appTheme} {...(collapsed ? { "data-collapsed": "" } : {})}>
      {updateAvailable && (
        <div className="update-banner">
          <Icon name="TriangleAlert" size={15} />
          新しいバージョンがあります。
          <button className="btn" onClick={() => location.reload()}>更新</button>
        </div>
      )}
      <div className="mbar">
        <button onClick={() => setMobileOpen(true)} aria-label="メニューを開く"><Icon name="Menu" size={18} /></button>
        <span className="t">店舗情報管理</span>
        <button aria-label="通知"><Icon name="Bell" size={18} /></button>
      </div>

      <Sidebar
        page={page}
        collapsed={collapsed}
        appTheme={appTheme}
        onNavigate={navigate}
        onToggleCollapse={toggleCollapse}
        onCloseMobile={() => setMobileOpen(false)}
        onSetTheme={setAppTheme}
        onLogout={doLogout}
        build={build}
      />

      <main className="main">{renderPage()}</main>

      {mobileOpen && <div className="scrim show" onClick={() => setMobileOpen(false)} style={{ zIndex: 35 }} />}

      <Drawer store={drawerStore} onClose={() => setDrawerStore(null)} />
      <Toast />
    </div>
  );
}
