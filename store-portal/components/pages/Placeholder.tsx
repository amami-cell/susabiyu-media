"use client";
import { Icon } from "../Icon";

export default function Placeholder({ title, icon }: { title: string; icon: string }) {
  return (
    <div className="pg">
      <div className="page-head"><h2>{title}</h2></div>
      <div className="card">
        <div className="placeholder">
          <div className="ic"><Icon name={icon} size={40} strokeWidth={1.5} /></div>
          「{title}」画面（デモ再現：レイアウト・サイドバー・操作感のサンプル）
          <br />
          <span className="faint" style={{ fontSize: 12 }}>
            実データは /api/state から一括ロードされ、クライアント内で描画されます。
          </span>
        </div>
      </div>
    </div>
  );
}
