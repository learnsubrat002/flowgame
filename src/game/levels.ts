// 10 hand-tuned levels for a smooth difficulty curve.
// Falls back to procedural generation for index >= 10.
import { Level, generateLevel, applyClusterBias } from "./levelGenerator";

interface LevelSpec {
  size: number;
  colors: number;
  moves: number;
  target: number;
}

// Spec-driven curve:
//  L1-3 → 5x5, 3 colors, 15 moves
//  L4-7 → 6x6, 4 colors, 12 moves
//  L8-10 → 7x7, 5 colors, 10 moves
// Targets ramp 10 → 50 dots cleared.
const SPECS: LevelSpec[] = [
  { size: 5, colors: 3, moves: 15, target: 10 },
  { size: 5, colors: 3, moves: 15, target: 15 },
  { size: 5, colors: 3, moves: 15, target: 20 },
  { size: 6, colors: 4, moves: 12, target: 25 },
  { size: 6, colors: 4, moves: 12, target: 30 },
  { size: 6, colors: 4, moves: 12, target: 35 },
  { size: 6, colors: 4, moves: 12, target: 38 },
  { size: 7, colors: 5, moves: 10, target: 42 },
  { size: 7, colors: 5, moves: 10, target: 46 },
  { size: 7, colors: 5, moves: 10, target: 50 },
];

export const TOTAL_LEVELS = SPECS.length;

export function getLevel(index: number, assist = false): Level {
  if (index < SPECS.length) {
    const spec = SPECS[index];
    // Soft assist: fewer colors, slightly lower target, cluster-biased grid.
    const colors = assist ? Math.max(3, spec.colors - 1) : spec.colors;
    const target = assist ? Math.max(5, Math.round(spec.target * 0.85)) : spec.target;
    let built = buildCustomGrid(spec.size, colors);
    if (assist) built = applyClusterBias(built, 2);
    return {
      index,
      size: spec.size,
      colors,
      moves: spec.moves,
      target,
      grid: built,
    };
  }
  // Beyond curated levels, scale procedurally with offset
  const lvl = generateLevel(index);
  if (!assist) return lvl;
  const colors = Math.max(3, lvl.colors - 1);
  return {
    ...lvl,
    colors,
    target: Math.max(5, Math.round(lvl.target * 0.85)),
    grid: applyClusterBias(lvl.grid, 2),
  };
}

function buildCustomGrid(size: number, colors: number) {
  // Use generator's logic by exploiting generateLevel for the same size+colors mapping
  // Simple inline builder to honor exact size/colors:
  const grid: (number | null)[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => null as number | null)
  );
  const total = size * size;
  const base = Math.floor(total / colors);
  const counts = Array.from({ length: colors }, () => base);
  let remainder = total - base * colors;
  while (remainder-- > 0) counts[Math.floor(Math.random() * colors)]++;
  const pool: number[] = [];
  counts.forEach((c, i) => {
    for (let k = 0; k < c; k++) pool.push(i + 1);
  });
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  let p = 0;
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++) grid[r][c] = pool[p++];
  return grid;
}
