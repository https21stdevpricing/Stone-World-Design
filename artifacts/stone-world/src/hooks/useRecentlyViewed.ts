import { useEffect, useState } from "react";

const STORAGE_KEY = "sw_recently_viewed";
const MAX_ITEMS = 12;

function readIds(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is number => typeof x === "number");
  } catch {
    return [];
  }
}

function writeIds(ids: number[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // localStorage may be unavailable (private browsing, etc.)
  }
}

export function useRecentlyViewed(currentId: number): number[] {
  const [ids, setIds] = useState<number[]>(() => readIds());

  useEffect(() => {
    if (!currentId) return;
    const existing = readIds();
    const updated = [currentId, ...existing.filter(id => id !== currentId)].slice(0, MAX_ITEMS);
    writeIds(updated);
    setIds(updated);
  }, [currentId]);

  return ids.filter(id => id !== currentId);
}
