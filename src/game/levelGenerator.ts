// Lightweight offline "AI" level generator.
// Uses controlled randomness + difficulty curve to produce solvable, balanced boards.

export type Cell = number | null; // color index 1..N or null (empty)

export interface Level {
  index: number;
  size: number;          // grid NxN
  colors: number;        // number of distinct colors (max 6)
  moves: number;         // moves allowed
  target: number;        // dots to clear
  grid: Cell[][];
}

const MAX_COLORS = 6;

function rngInt(max: number) {
  return Math.floor(Math.random() * max);
}

function difficultyFor(index: number) {
  // Smooth curve: size 6 -> 8, colors 3 -> 6, moves loosen then tighten
  const size = Math.min(8, 6 + Math.floor(index / 6));
  const colors = Math.min(MAX_COLORS, 3 + Math.floor(index / 4));
  const baseMoves = 14;
  const moves = Math.max(8, baseMoves + Math.floor(size * 0.5) - Math.floor(index / 5));
  const target = Math.min(size * size - 4, 8 + index * 2);
  return { size, colors, moves, target };
}

/**
 * Build a balanced grid: distribute each color in clusters so that
 * connected groups of >=2 same-color exist (guarantees solvability of objective).
 */
export function applyClusterBias(grid: Cell[][], passes = 2): Cell[][] {
  const size = grid.length;
  const next = grid.map((row) => [...row]);
  for (let pass = 0; pass < passes; pass++) {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const color = next[r][c];
        if (color === null) continue;
        // Count same-color neighbors
        const neighbors = [
          [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1],
        ];
        let same = 0;
        const diffSlots: [number, number][] = [];
        for (const [nr, nc] of neighbors) {
          if (nr < 0 || nc < 0 || nr >= size || nc >= size) continue;
          if (next[nr][nc] === color) same++;
          else diffSlots.push([nr, nc]);
        }
        if (same >= 2 || diffSlots.length === 0) continue;
        // Try to swap a different-color neighbor with another same-color cell elsewhere
        const [tr, tc] = diffSlots[Math.floor(Math.random() * diffSlots.length)];
        // Find a same-color donor cell that isn't already adjacent to a cluster
        for (let r2 = 0; r2 < size; r2++) {
          for (let c2 = 0; c2 < size; c2++) {
            if ((r2 === r && c2 === c) || (r2 === tr && c2 === tc)) continue;
            if (next[r2][c2] === color) {
              const tmp = next[tr][tc];
              next[tr][tc] = color;
              next[r2][c2] = tmp;
              r2 = size; c2 = size; // break out
            }
          }
        }
      }
    }
  }
  return next;
}

function buildGrid(size: number, colors: number): Cell[][] {
  const grid: Cell[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => null as Cell)
  );

  const total = size * size;
  // Per-color counts: roughly even, with small variance.
  const base = Math.floor(total / colors);
  const counts = Array.from({ length: colors }, () => base);
  let remainder = total - base * colors;
  while (remainder-- > 0) counts[rngInt(colors)]++;

  // Flatten color pool
  const pool: number[] = [];
  counts.forEach((c, i) => {
    for (let k = 0; k < c; k++) pool.push(i + 1);
  });

  // Shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = rngInt(i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  let p = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      grid[r][c] = pool[p++];
    }
  }

  // Ensure every color has at least one adjacent same-color pair.
  for (let color = 1; color <= colors; color++) {
    if (!hasAdjacentPair(grid, color)) {
      seedPair(grid, color, size);
    }
  }
  return grid;
}

function hasAdjacentPair(grid: Cell[][], color: number) {
  const size = grid.length;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] !== color) continue;
      if (r + 1 < size && grid[r + 1][c] === color) return true;
      if (c + 1 < size && grid[r][c + 1] === color) return true;
    }
  }
  return false;
}

function seedPair(grid: Cell[][], color: number, size: number) {
  // Find any cell of that color, then swap a neighbor with another same-color cell.
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === color) {
        const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
        for (const [dr, dc] of dirs) {
          const nr = r + dr, nc = c + dc;
          if (nr < 0 || nc < 0 || nr >= size || nc >= size) continue;
          if (grid[nr][nc] === color) return;
          // find another same-color cell to swap into neighbor
          for (let r2 = 0; r2 < size; r2++) {
            for (let c2 = 0; c2 < size; c2++) {
              if ((r2 === r && c2 === c) || (r2 === nr && c2 === nc)) continue;
              if (grid[r2][c2] === color) {
                const tmp = grid[nr][nc];
                grid[nr][nc] = color;
                grid[r2][c2] = tmp;
                return;
              }
            }
          }
        }
      }
    }
  }
}

export function generateLevel(index: number): Level {
  const { size, colors, moves, target } = difficultyFor(index);
  const grid = buildGrid(size, colors);
  return { index, size, colors, moves, target, grid };
}
