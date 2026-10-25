"use client";
import { useCallback, useEffect, useState } from "react";
import { useSync } from "@/lib/useSync";
import { PAGE_TITLES, NAV } from "@/lib/nav";
import Sidebar from "@/components/Sidebar";
import Drawer from "@/components/Drawer";
import Dashboard from "@/components/pages/Dashboard";
import Stores from "@/components/pages/Stores";
import Placeholder from "@/components/pages/Placeholder";
import { Icon } from "@/components/Icon";
import type { Store, BuildInfo } from "@/lib/types";

const VALID = new Set(NAV.filter((n): n is Extract<typeof NAV[number], { k: string }> => "k" in n).map((n) => n.k));

export default function Page() {
  useSync();

  const [page, setPage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [appTheme, setAppTheme] = useState<"ai-dark" | "ai">("ai-dark");
  const [drawerStore, setDrawerStore] = useState<Store | null>(null);
  const [build, setBuild] = useState<{ commit: string; builtAt: string }>({ commit: "3ad5c9b", builtAt: "10/24 19:45" });

  // ハッシュルーティング
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

  // 折りたたみ状態の復元（inline script が html にセット済み）
  useEffect(() => {
    try {
      if (document.documentElement.hasAttribute("data-nav-collapsed")) setCollapsed(true);
    } catch {}
  }, []);

  // ビルド情報（仕様書 5-4）
  useEffect(() => {
    fetch("/api/build", { cache: "no-store" })
      .then((r) => r.json())
      .then((b: BuildInfo) => setBuild({ commit: b.commit, builtAt: b.builtAt }))
      .catch(() => {});
  }, []);

  const navigate = useCallback((k: string) => {
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

  const renderPage = () => {
    if (page === "dashboard") return <Dashboard />;
    if (page === "stores") return <Stores onOpen={setDrawerStore} />;
    const meta = NAV.find((n) => "k" in n && n.k === page) as { icon: string } | undefined;
    return <Placeholder title={PAGE_TITLES[page] ?? "ダッシュボード"} icon={meta?.icon ?? "Square"} />;
  };

  return (
    <div className={`app${mobileOpen ? " mobile-open" : ""}`} data-apptheme={appTheme} {...(collapsed ? { "data-collapsed": "" } : {})}>
      {/* モバイル上部バー */}
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
        build={build}
      />

      <main className="main">{renderPage()}</main>

      {/* モバイル時オーバーレイ（サイドバー背後） */}
      {mobileOpen && <div className="scrim show" onClick={() => setMobileOpen(false)} style={{ zIndex: 35 }} />}

      <Drawer store={drawerStore} onClose={() => setDrawerStore(null)} />
    </div>
  );
}
