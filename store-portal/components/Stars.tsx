"use client";
import { Star } from "lucide-react";

export function Stars({ value }: { value: number }) {
  const full = Math.round(value);
  return (
    <span className="stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={14} strokeWidth={0} className={i <= full ? "" : "empty"} fill="currentColor" />
      ))}
      <span className="num">{value.toFixed(1)}</span>
    </span>
  );
}
