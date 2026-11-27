"use client";
import { useEffect, type ReactNode } from "react";
import { Icon } from "./Icon";

export default function Modal({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [onClose]);

  return (
    <>
      <div className="scrim show" style={{ zIndex: 55 }} onClick={onClose} />
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <header>
          <span className="nm">{title}</span>
          <button className="x" onClick={onClose} aria-label="閉じる"><Icon name="X" size={18} /></button>
        </header>
        <div className="mbody">{children}</div>
        {footer && <footer>{footer}</footer>}
      </div>
    </>
  );
}
