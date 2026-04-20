// Invisible Dynamic Difficulty (Soft Assist)
// In-memory tracker — silently eases the next board when the player struggles.

const failCount = new Map<number, number>();
let lowProgressMoves = 0;

const FAIL_THRESHOLD = 2;
const LOW_PROGRESS_THRESHOLD = 4;
const LOW_PROGRESS_CLEAR = 3;

export function recordFail(levelIndex: number) {
  failCount.set(levelIndex, (failCount.get(levelIndex) ?? 0) + 1);
}

export function recordMove(clearedCount: number) {
  if (clearedCount < LOW_PROGRESS_CLEAR) {
    lowProgressMoves += 1;
  } else {
    // Meaningful progress softly resets the low-progress counter.
    lowProgressMoves = Math.max(0, lowProgressMoves - 1);
  }
}

export function recordSuccess(levelIndex: number) {
  failCount.delete(levelIndex);
  lowProgressMoves = 0;
}

export function shouldAssist(levelIndex: number): boolean {
  const fails = failCount.get(levelIndex) ?? 0;
  return fails >= FAIL_THRESHOLD || lowProgressMoves >= LOW_PROGRESS_THRESHOLD;
}
