// Local persistence — fully offline.
const KEY_LEVEL = "flow:level";
const KEY_BEST = "flow:best";

export function loadLevelIndex(): number {
  try {
    const v = parseInt(localStorage.getItem(KEY_LEVEL) || "0", 10);
    return Number.isFinite(v) && v >= 0 ? v : 0;
  } catch {
    return 0;
  }
}

export function saveLevelIndex(i: number) {
  try {
    localStorage.setItem(KEY_LEVEL, String(i));
  } catch {}
}

export function loadBest(): number {
  try {
    return parseInt(localStorage.getItem(KEY_BEST) || "0", 10) || 0;
  } catch {
    return 0;
  }
}

export function saveBest(i: number) {
  try {
    localStorage.setItem(KEY_BEST, String(i));
  } catch {}
}
