import type { Siege, SiegesResponse } from '@/types'

const COLS = ['A', 'B', 'C', 'D']

/**
 * Transforme la réponse /trajets/{id}/sieges en grille 2 + 2.
 * Le backend renvoie `rangees` comme objet indexé par n° de rangée (tableau PHP associatif).
 */
export function toSeatRows(res: SiegesResponse | null | undefined): (Siege | null)[][] {
  if (!res?.rangees) return []
  const all: Siege[] = (Array.isArray(res.rangees) ? res.rangees : Object.values(res.rangees)).flat().filter(Boolean)
  if (!all.length) return []

  const rows = new Map<number, (Siege | null)[]>()
  const loose: Siege[] = []
  for (const s of all) {
    const m = String(s.numero).trim().match(/^(\d+)\s*([A-Za-z])$/)
    const col = (s.colonne || m?.[2] || '').toUpperCase()
    const ci = COLS.indexOf(col)
    if (!m || ci < 0) { loose.push(s); continue }
    const r = Number(m[1])
    if (!rows.has(r)) rows.set(r, [null, null, null, null])
    rows.get(r)![ci] = s
  }

  // Numérotation non standard : on range simplement par 4
  if (loose.length > all.length / 2) {
    const out: (Siege | null)[][] = []
    for (let i = 0; i < all.length; i += 4) {
      const chunk: (Siege | null)[] = all.slice(i, i + 4)
      while (chunk.length < 4) chunk.push(null)
      out.push(chunk)
    }
    return out
  }

  return [...rows.keys()].sort((a, b) => a - b).map(r => rows.get(r)!)
}
