"use client";
import { useStore } from "@/lib/store";
import { Icon } from "../Icon";

export default function Dashboard() {
  const user = useStore((s) => s.collections.user);
  const notices = useStore((s) => s.collections.notices) ?? [];
  const pillClass = (tag: string) =>
    tag === "NEW" ? "new" : tag === "更新" ? "info" : tag === "期限" ? "warn" : "ok";

  return (
    <div className="pg">
      <div className="hello">
        <b>こんにちは、{user?.name?.split(" ")[0] ?? "ゲスト"}さん</b>
        <div className="s">本日のタスク 3件・未確認の変更申請 2件・許可アラート 8件</div>
      </div>

      <div className="kpis">
        <div className="kpi"><div className="k"><Icon name="Store" size={14} />登録店舗</div><div className="v">142</div><div className="d muted">稼働 118 / 準備中 24</div></div>
        <div className="kpi"><div className="k"><Icon name="FilePenLine" size={14} />未処理 変更申請</div><div className="v">2</div><div className="d up">前週比 −3</div></div>
        <div className="kpi"><div className="k"><Icon name="Bell" size={14} />許可・アラート</div><div className="v">8</div><div className="d dn">要対応 3</div></div>
        <div className="kpi"><div className="k"><Icon name="PencilRuler" size={14} />未入力項目</div><div className="v">164</div><div className="d muted">47店舗にまたがる</div></div>
      </div>

      <div className="qs-card">
        <h3 style={{ marginBottom: 10 }}><span className="ic"><Icon name="Zap" size={16} /></span>クイックスタート</h3>
        <div className="qs-grid">
          <button className="tile"><span className="ti a"><Icon name="Store" /></span><span><span className="tt">店舗を追加</span><span className="td">新規出店の基本情報を登録</span></span></button>
          <button className="tile"><span className="ti b"><Icon name="FilePenLine" /></span><span><span className="tt">変更申請を作成</span><span className="td">店舗情報の修正を申請</span></span></button>
          <button className="tile"><span className="ti c"><Icon name="ClipboardCheck" /></span><span><span className="tt">MS・試食を登録</span><span className="td">ミステリーショッパー結果</span></span></button>
          <button className="tile"><span className="ti d"><Icon name="CalendarDays" /></span><span><span className="tt">スケジュール確認</span><span className="td">Googleカレンダー連携</span></span></button>
        </div>
      </div>

      <div className="grid2">
        <div className="card">
          <h3><span className="ic"><Icon name="Megaphone" size={16} /></span>お知らせ</h3>
          <ul className="news">
            {notices.map((n) => (
              <li key={n.id}>
                <span className="dt">{n.date}</span>
                <span style={{ flex: 1 }}>{n.text}</span>
                <span className={`pill ${pillClass(n.tag)}`}>{n.tag}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h3><span className="ic"><Icon name="Activity" size={16} /></span>最新情報</h3>
          <ul className="news">
            <li><span className="dt">10/24</span><span style={{ flex: 1 }}>すさび湯 烏丸店の改装予定を登録（11/E 着工）。</span></li>
            <li><span className="dt">10/23</span><span style={{ flex: 1 }}>ARATA の電話番号が変更されました。</span></li>
            <li><span className="dt">10/23</span><span style={{ flex: 1 }}>三条店の契約待ちステータスを更新。</span></li>
            <li><span className="dt">10/22</span><span style={{ flex: 1 }}>お初天神GOLD に未入力項目 1件の警告。</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
