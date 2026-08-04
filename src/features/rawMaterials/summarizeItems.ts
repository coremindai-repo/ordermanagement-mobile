import type { FreeForm } from "../../api/orderTypes";

/** `items` is free-form JSON (contract §6) — best-effort human-readable summary. */
export function summarizeItems(items: FreeForm[] | FreeForm): string {
  const list = Array.isArray(items) ? items : [items];
  const parts = list.map((entry) => {
    if (typeof entry === "string") return entry;
    const record = entry as Record<string, unknown>;
    if (typeof record.description === "string") return record.description;
    if (typeof record.name === "string") return record.name;
    return JSON.stringify(entry);
  });
  return parts.filter(Boolean).join(", ") || "—";
}
