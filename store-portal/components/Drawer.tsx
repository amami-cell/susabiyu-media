"use client";
import { useEffect } from "react";
import type { Store } from "@/lib/types";
import { Icon } from "./Icon";

// 右スライドドロワー（仕様書 4-6 + 改善: slide-in 200ms / Esc 閉じ / 背景スクロールロック）
export default function Drawer({ store, onClose }: { store: Store | null; onClose: () => void }) {
  useEffect(() => {
    if (store) {
      document.documentElement.style.overflow = "hidden";
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
      window.addEventListener("keydown", onKey);
      return () => {
        document.documentElement.style.overflow = "";
        window.removeEventListener("keydown", onKey);
      };
    }
  }, [store, onClose]);

  return (
    <>
      <div className={`scrim${store ? " show" : ""}`} onClick={onClose} />
      <aside className={`drawer${store ? " show" : ""}`} aria-hidden={!store}>
        {store && (
          <>
            <header>
              <div>
                <div className="nm">{store.name}</div>
                <div className="mt">{store.dept}／{store.area}・コード {store.code}</div>
              </div>
              <button className="x" onClick={onClose} aria-label="閉じる"><Icon name="X" size={18} /></button>
            </header>
            <div className="dbody">
              {store.warn > 0 && (
                <div className="wbox">
                  <div className="t"><Icon name="TriangleAlert" size={14} />未入力の項目（{store.warn}）</div>
                  <div className="chiprow">
                    {store.warn >= 1 && <span>営業許可証</span>}
                    {store.warn >= 2 && <span>賃貸契約書</span>}
                  </div>
                </div>
              )}
              <dl className="dl">
                <dt>ステータス</dt><dd><span className={`sp ${store.statusKey}`}>{store.status}</span></dd>
                <dt>業態</dt><dd>{store.genre}</dd>
                <dt>営業部</dt><dd>{store.dept}</dd>
                <dt>エリア</dt><dd>{store.area}</dd>
                <dt>開店日</dt><dd>{store.open}</dd>
                <dt>電話</dt><dd>{store.tel}</dd>
                <dt>店舗コード</dt><dd>{store.code}</dd>
                <dt>媒体</dt><dd>{store.media ?? "—"}</dd>
                <dt>備考</dt><dd className="muted">{store.note ?? "本部管理。詳細は「詳細を開く」から。"}</dd>
              </dl>
            </div>
            <footer>
              <button className="btn sec" onClick={onClose}>閉じる</button>
              <button className="btn">詳細を開く <Icon name="ExternalLink" size={14} /></button>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}
