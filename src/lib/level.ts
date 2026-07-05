/**
 * XP → level curve. Each level requires a bit more than the last:
 * level 1→2 needs 100 XP, then +50 XP per additional level.
 */
export interface LevelInfo {
  level: number
  /** XP earned inside the current level. */
  into: number
  /** XP needed to finish the current level. */
  need: number
  /** 0..1 progress within the current level. */
  progress: number
}

export function levelInfo(xp: number): LevelInfo {
  let level = 1
  let need = 100
  let rem = Math.max(0, xp)
  while (rem >= need) {
    rem -= need
    level++
    need = 100 + (level - 1) * 50
  }
  return { level, into: rem, need, progress: need > 0 ? rem / need : 0 }
}
