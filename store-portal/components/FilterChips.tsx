"use client";

export interface ChipOption {
  v: string;
  label: string;
  n?: number;
  cls?: string;
}

export default function FilterChips({
  options,
  value,
  onChange,
}: {
  options: ChipOption[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="chips" style={{ marginBottom: 8 }} role="group" aria-label="絞り込み">
      {options.map((o) => (
        <button
          key={o.v}
          className={`chip ${o.cls ?? ""}${value === o.v ? " on" : ""}`}
          aria-pressed={value === o.v}
          onClick={() => onChange(o.v)}
        >
          {o.label}
          {o.n != null && <span className="n">{o.n}</span>}
        </button>
      ))}
    </div>
  );
}
