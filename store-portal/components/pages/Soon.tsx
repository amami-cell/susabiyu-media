"use client";
import { Icon } from "../Icon";

export default function Soon({ title }: { title: string }) {
  return (
    <div className="pg">
      <div className="page-head"><h2>{title}</h2></div>
      <div className="card">
        <div className="placeholder">
          <div className="ic"><Icon name="Workflow" size={40} strokeWidth={1.5} /></div>
          <span className="sp a" style={{ fontSize: 12 }}>準備中</span>
          <div style={{ marginTop: 10 }}>この機能は現在準備中です。</div>
        </div>
      </div>
    </div>
  );
}
