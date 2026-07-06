import { getSupabase } from './supabase'

const TABLE = 'challenges'

export interface Challenge {
  id: string
  challenger_name: string
  challenger_score: number
  opponent_name: string | null
  opponent_score: number | null
}

/** Short, URL-friendly duel code (e.g. "k3x9qz"). */
function makeCode(): string {
  return Math.random().toString(36).slice(2, 8)
}

/** Shareable URL that opens the app directly into this duel. */
export function challengeUrl(id: string): string {
  return `${window.location.origin}${window.location.pathname}?challenge=${id}`
}

/** Read a `?challenge=CODE` param from the current URL, if any. */
export function challengeIdFromUrl(): string | null {
  const id = new URLSearchParams(window.location.search).get('challenge')
  return id && /^[a-z0-9]{4,16}$/i.test(id) ? id : null
}

/** Remove the challenge param from the address bar once the duel is resolved. */
export function clearChallengeFromUrl(): void {
  window.history.replaceState(null, '', window.location.pathname)
}

/** Create a new duel with the challenger's survival score. Returns its id. */
export async function createChallenge(name: string, score: number): Promise<string | null> {
  const supabase = await getSupabase()
  if (!supabase) return null
  const id = makeCode()
  const { error } = await supabase
    .from(TABLE)
    .insert({ id, challenger_name: name.slice(0, 24), challenger_score: score })
  return error ? null : id
}

export async function fetchChallenge(id: string): Promise<Challenge | null> {
  const supabase = await getSupabase()
  if (!supabase) return null
  const { data, error } = await supabase
    .from(TABLE)
    .select('id,challenger_name,challenger_score,opponent_name,opponent_score')
    .eq('id', id)
    .maybeSingle()
  if (error || !data) return null
  return data as Challenge
}

/**
 * Record the opponent's result. The RLS policy only allows updating rows whose
 * opponent_score is still null, so a finished duel can't be rewritten.
 */
export async function submitOpponentResult(id: string, name: string, score: number): Promise<void> {
  const supabase = await getSupabase()
  if (!supabase) return
  await supabase
    .from(TABLE)
    .update({ opponent_name: name.slice(0, 24), opponent_score: score })
    .eq('id', id)
    .is('opponent_score', null)
}
