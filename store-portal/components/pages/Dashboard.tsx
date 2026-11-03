"use client";
import { useStore } from "@/lib/store";
import { Icon } from "../Icon";
import { Stars } from "../Stars";
import GlobalSearch from "../GlobalSearch";
import PromoCharts from "../PromoCharts";

export default function Dashboard() {
  const user = useStore((s) => s.collections.user);
  const media = useStore((s) => s.collections.media) ?? [];
  const reviews = useStore((s) => s.collections.reviews) ?? [];
  const minutes = useStore((s) => s.collections.minutes) ?? [];
  const notices = useStore((s) => s.collections.notices) ?? [];

  // 販促KPI（既存データから算出）
  const rated = media.filter((m) => m.source !== "Instagram" && m.rating > 0);
  const avg = rated.length ? rated.reduce((s, m) => s + m.rating, 0) / rated.length : 0;
  const totalReviews = media.filter((m) => m.source !== "Instagram").reduce((s, m) => s + m.reviews, 0);
  const ig = media.find((m) => m.source === "Instagram");
  const low = reviews.filter((r) => r.rating <= 2).length;
  const syncErr = media.filter((m) => !m.synced).length;

  const promoNotices = notices.filter((n) => /媒体|販促|口コミ|キャンペーン|Google|食べログ|ぐるなび/.test(n.text));
  const shownNotices = promoNotices.length ? promoNotices : notices;
  const pillClass = (tag: string) => (tag === "NEW" ? "new" : tag === "更新" ? "info" : tag === "期限" ? "warn" : "ok");

  return (
    <div className="pg">
      <div className="hello">
        <b>こんにちは、{user?.name?.split(" ")[0] ?? "ゲスト"}さん</b>
        <div className="s">
          媒体評価 平均 {avg.toFixed(2)}・新着の低評価口コミ {low} 件・媒体連携エラー {syncErr} 件
        </div>
      </div>

      <GlobalSearch />

      <div className="kpis">
        <div className="kpi"><div className="k"><Icon name="MessageSquareText" size={14} />平均媒体評価</div><div className="v">{avg.toFixed(2)}</div><div className="d"><Stars value={avg} /></div></div>
        <div className="kpi"><div className="k"><Icon name="Megaphone" size={14} />口コミ総数</div><div className="v">{totalReviews.toLocaleString()}</div><div className="d muted">媒体 {rated.length} 件を集計</div></div>
        <div className="kpi"><div className="k"><Icon name="Instagram" size={14} />Instagram フォロワー</div><div className="v">{(ig?.reviews ?? 0).toLocaleString()}</div><div className="d muted">{ig?.store ?? "—"}</div></div>
        <div className="kpi"><div className="k"><Icon name="TriangleAlert" size={14} />要対応の低評価口コミ</div><div className="v">{low}</div><div className={low ? "d dn" : "d up"}>{low ? "★2以下 要フォロー" : "低評価なし"}</div></div>
      </div>

      <PromoCharts />

      <div className="grid2">
        <div className="card">
          <h3><span className="emoji">📊</span>媒体パフォーマンス</h3>
          <ul className="news">
            {media.map((m) => (
              <li key={m.id}>
                <span style={{ flex: 1 }}>{m.store}<span className="muted" style={{ fontSize: 11 }}>（{m.source}）</span></span>
                {m.source === "Instagram"
                  ? <span className="muted" style={{ fontSize: 12, fontVariantNumeric: "tabular-nums" }}>{m.reviews.toLocaleString()} フォロワー</span>
                  : <Stars value={m.rating} />}
                {!m.synced && <span className="pill warn" style={{ marginLeft: 8 }}>要再認証</span>}
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h3><span className="emoji">💬</span>最新の口コミ</h3>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {reviews.slice(0, 4).map((r) => (
              <div className="rev" key={r.id}>
                <div className="top">
                  <span className="st">{r.store}</span>
                  <span className="src">{r.source}</span>
                  <Stars value={r.rating} />
                  <span className="dt">{r.date}</span>
                  {r.rating <= 2 && <span className="pill new" style={{ marginLeft: 6 }}>要対応</span>}
                </div>
                <div className="txt">{r.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid2">
        <div className="card">
          <h3><span className="emoji">📝</span>販促会議・議事録</h3>
          <ul className="news">
            {minutes.map((m) => (
              <li key={m.id}>
                <span className="dt">{m.date}</span>
                <span style={{ flex: 1 }}><b style={{ fontWeight: 600 }}>{m.title}</b><br /><span className="muted" style={{ fontSize: 12 }}>{m.summary}</span></span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h3><span className="emoji">📣</span>販促まわりのお知らせ</h3>
          <ul className="news">
            {shownNotices.map((n) => (
              <li key={n.id}>
                <span className="dt">{n.date}</span>
                <span style={{ flex: 1 }}>{n.text}</span>
                <span className={`pill ${pillClass(n.tag)}`}>{n.tag}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
