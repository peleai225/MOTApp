/**
 * Backend de démonstration — reproduit le contrat de l'API MOT ERP (agare)
 * pour que l'application reste utilisable quand le serveur est injoignable.
 * Toutes les données vivent dans le localStorage de l'appareil.
 */
import type {
  AuthResponse, Client, Gare, ProfilePayload, Reservation, ReservationPayload,
  ReservationsResponse, SearchParams, Siege, SiegesResponse, Trajet, TrajetsResponse,
} from '@/types'
import { addDays, fromMinutes, isoDate, minutesUntil, normalizePhone, toMinutes } from '@/lib/format'

type R<T> = Promise<{ data: T }>

const wait = (min = 280, spread = 380) => new Promise(r => setTimeout(r, min + Math.random() * spread))

function fail(status: number, message: string, errors?: Record<string, string[]>): never {
  const e = new Error(message) as Error & { response: unknown; isDemo: boolean }
  e.response = { status, data: { message, errors } }
  e.isDemo = true
  throw e
}

// ── Réseau ──────────────────────────────────────────────────────────────
const GARES: Gare[] = [
  { id: 1, nom: 'Yopougon',     code: 'YOP', ville: 'Abidjan' },
  { id: 2, nom: 'Adjamé',       code: 'ADJ', ville: 'Abidjan' },
  { id: 3, nom: 'Abengourou',   code: 'ABG', ville: 'Abengourou' },
  { id: 4, nom: 'Agnibilékrou', code: 'AGN', ville: 'Agnibilékrou' },
  { id: 5, nom: 'Tanda',        code: 'TND', ville: 'Tanda' },
  { id: 6, nom: 'Bondoukou',    code: 'BDK', ville: 'Bondoukou' },
  { id: 7, nom: 'Kumasi',       code: 'KMS', ville: 'Kumasi, Ghana' },
  { id: 8, nom: 'Yamoussoukro', code: 'YAM', ville: 'Yamoussoukro' },
  { id: 9, nom: 'Bouaké',       code: 'BKE', ville: 'Bouaké' },
]

interface Ligne { from: number; to: number; km: number; min: number; prix: [number, number, number]; heures: string[]; arrets: string[] }

const LIGNES: Ligne[] = [
  { from: 1, to: 6, km: 420, min: 450, prix: [8000, 5000, 6500],   heures: ['06:00', '08:30', '12:00', '20:30'], arrets: ['Abengourou', 'Agnibilékrou', 'Tanda'] },
  { from: 6, to: 1, km: 420, min: 450, prix: [8000, 5000, 6500],   heures: ['05:30', '09:00', '13:30', '21:00'], arrets: ['Tanda', 'Agnibilékrou', 'Abengourou'] },
  { from: 1, to: 7, km: 640, min: 660, prix: [15000, 10000, 13000], heures: ['07:00', '19:00'],                 arrets: ['Abengourou', 'Bondoukou', 'Sampa'] },
  { from: 7, to: 1, km: 640, min: 660, prix: [15000, 10000, 13000], heures: ['06:30', '18:30'],                 arrets: ['Sampa', 'Bondoukou', 'Abengourou'] },
  { from: 6, to: 7, km: 210, min: 225, prix: [6000, 4000, 5000],   heures: ['08:00', '14:00'],                 arrets: ['Sampa'] },
  { from: 7, to: 6, km: 210, min: 225, prix: [6000, 4000, 5000],   heures: ['09:00', '15:30'],                 arrets: ['Sampa'] },
  { from: 1, to: 3, km: 220, min: 240, prix: [4000, 2500, 3500],   heures: ['06:30', '10:00', '15:00'],        arrets: ['Adzopé'] },
  { from: 3, to: 1, km: 220, min: 240, prix: [4000, 2500, 3500],   heures: ['07:00', '12:30', '16:00'],        arrets: ['Adzopé'] },
  { from: 1, to: 4, km: 290, min: 330, prix: [5000, 3000, 4000],   heures: ['07:30', '14:00'],                 arrets: ['Abengourou'] },
  { from: 1, to: 5, km: 360, min: 390, prix: [6500, 4000, 5500],   heures: ['09:30'],                          arrets: ['Abengourou', 'Agnibilékrou'] },
  { from: 2, to: 8, km: 240, min: 210, prix: [4000, 2500, 3500],   heures: ['07:00', '11:00', '16:00'],        arrets: ['Toumodi'] },
  { from: 8, to: 2, km: 240, min: 210, prix: [4000, 2500, 3500],   heures: ['06:00', '10:30', '15:30'],        arrets: ['Toumodi'] },
  { from: 2, to: 9, km: 350, min: 330, prix: [6000, 4000, 5000],   heures: ['06:00', '13:00', '22:00'],        arrets: ['Toumodi', 'Yamoussoukro'] },
  { from: 9, to: 2, km: 350, min: 330, prix: [6000, 4000, 5000],   heures: ['05:30', '12:00', '21:30'],        arrets: ['Yamoussoukro', 'Toumodi'] },
]

const ROWS = 13
const COLS = ['A', 'B', 'C', 'D'] as const
const CAPACITE = ROWS * COLS.length

// ── Identifiants de départ : AAAAMMJJ + n° ligne (2) + n° horaire (1) ───
function encodeId(date: string, li: number, hi: number) {
  return Number(`${date.replace(/-/g, '')}${String(li).padStart(2, '0')}${hi}`)
}
function decodeId(id: number | string) {
  const s = String(id)
  if (!/^\d{11}$/.test(s)) return null
  const date = `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`
  const li = Number(s.slice(8, 10))
  const hi = Number(s.slice(10))
  const ligne = LIGNES[li]
  if (!ligne || !ligne.heures[hi]) return null
  return { date, li, hi, ligne, heure: ligne.heures[hi] }
}

function rng(seed: number) {
  let t = seed % 2147483647
  return () => {
    t = (t + 0x6d2b79f5) | 0
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

// ── Stockage local ──────────────────────────────────────────────────────
interface StoredClient { client: Client; password: string }
interface StoredTicket { clientId: number; departId: number; ticket: Reservation }

const K_CLIENTS = 'mot_demo_clients'
const K_TICKETS = 'mot_demo_tickets'

function read<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || '') as T } catch { return fallback }
}
function write(key: string, v: unknown) {
  try { localStorage.setItem(key, JSON.stringify(v)) } catch { /* quota */ }
}

function seed() {
  if (localStorage.getItem(K_CLIENTS)) return
  const awa: Client = {
    id: 1, code: 'CLI-D3M0A1', nom: 'KOUASSI', prenom: 'Awa', nom_complet: 'Awa KOUASSI',
    telephone: '0700000000', email: 'awa.kouassi@exemple.ci', type: 'occasionnel',
    points_fidelite: 120, nombre_voyages: 3,
  }
  write(K_CLIENTS, [{ client: awa, password: 'demo123' }] satisfies StoredClient[])

  const t = isoDate()
  const upcomingId = encodeId(addDays(t, 3), 0, 1)
  const pastId = encodeId(addDays(t, -12), 1, 1)
  const tickets: StoredTicket[] = [
    { clientId: 1, departId: upcomingId, ticket: makeTicket(upcomingId, ['4A', '4B'], 'mobile_money', 'valide') },
    { clientId: 1, departId: pastId, ticket: makeTicket(pastId, ['7C'], 'cash', 'utilise') },
  ]
  write(K_TICKETS, tickets)
}

function clients(): StoredClient[] { seed(); return read<StoredClient[]>(K_CLIENTS, []) }
function tickets(): StoredTicket[] { seed(); return read<StoredTicket[]>(K_TICKETS, []) }

function currentClient(): Client {
  const token = localStorage.getItem('mot_token') || ''
  const id = Number(token.replace('demo-', ''))
  const found = clients().find(c => c.client.id === id)
  if (!token.startsWith('demo-') || !found) fail(401, 'Non authentifié.')
  return found.client
}

// ── Sièges ──────────────────────────────────────────────────────────────
function occupiedSeats(departId: number): Set<string> {
  const rand = rng(departId)
  const fill = 0.2 + rand() * 0.72
  const all: string[] = []
  for (let r = 1; r <= ROWS; r++) for (const c of COLS) all.push(`${r}${c}`)
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[all[i], all[j]] = [all[j], all[i]]
  }
  const taken = new Set(all.slice(0, Math.floor(all.length * fill)))
  for (const st of read<StoredTicket[]>(K_TICKETS, [])) {
    if (st.departId === departId && st.ticket.statut !== 'annule') st.ticket.sieges.forEach(s => taken.add(s))
  }
  return taken
}

function formatDepart(id: number, places = 1, detail = false): Trajet {
  const d = decodeId(id)!
  const { ligne, li, hi } = d
  const from = GARES.find(g => g.id === ligne.from)!
  const to = GARES.find(g => g.id === ligne.to)!
  const dispo = CAPACITE - occupiedSeats(id).size
  const busNum = String(((li * 7 + hi * 3) % 18) + 3).padStart(3, '0')
  const t: Trajet = {
    id,
    code: `DEP-${String(id).slice(2)}`,
    origine: { id: from.id, nom: from.nom },
    destination: { id: to.id, nom: to.nom },
    date_depart: d.date,
    heure_depart: d.heure,
    heure_arrivee: fromMinutes(toMinutes(d.heure) + ligne.min),
    duree_minutes: ligne.min,
    places_disponibles: dispo,
    prix_adulte: ligne.prix[0],
    prix_enfant: ligne.prix[1],
    prix_etudiant: ligne.prix[2],
    prix_total: ligne.prix[0] * places,
    statut: dispo > 0 ? 'en_vente' : 'complet',
    disponible: dispo > 0,
  }
  if (detail) {
    t.bus = { numero: `MOT-${busNum}`, immatriculation: `${1200 + li * 37 + hi} KX 01`, capacite: CAPACITE, modele: 'Yutong ZK6122H9' }
    t.distance_km = ligne.km
    t.arrets = ligne.arrets
  }
  return t
}

function assertDepart(id: number | string) {
  const d = decodeId(id)
  if (!d) fail(404, "Ce trajet n'existe pas.")
  if (minutesUntil(d.date, d.heure) < 0) fail(404, "Ce trajet n'est plus disponible")
  return d
}

// ── Billets ─────────────────────────────────────────────────────────────
function makeRef(date: string) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 4; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)]
  return `MOT-${date.slice(2).replace(/-/g, '')}-${s}`
}

function makeTicket(departId: number, sieges: string[], mode: string, statut: Reservation['statut'] = 'valide'): Reservation {
  const d = decodeId(departId)!
  const trajet = formatDepart(departId, sieges.length, true)
  const reference = makeRef(d.date)
  return {
    reference,
    statut,
    statut_paiement: mode === 'cash' && statut === 'valide' ? 'en_attente' : 'paye',
    nombre_places: sieges.length,
    montant_total: trajet.prix_adulte * sieges.length,
    mode_paiement: mode,
    date_emission: new Date().toISOString(),
    sieges,
    trajet: {
      id: departId,
      date_depart: d.date,
      heure: d.heure,
      origine: trajet.origine.nom,
      destination: trajet.destination.nom,
    },
    qr_code: `MOT|${reference}|${departId}|${sieges.join(',')}`,
    hash_securite: Math.abs(departId * 31 + reference.length * 7).toString(16),
    date_expiration: new Date(`${addDays(d.date, 1)}T23:59:00`).toISOString(),
    bus: { numero: trajet.bus?.numero, immatriculation: trajet.bus?.immatriculation },
  }
}

function withLiveStatus(t: Reservation): Reservation {
  if (t.statut === 'valide' && t.trajet && minutesUntil(t.trajet.date_depart, t.trajet.heure) < -24 * 60) {
    return { ...t, statut: 'expire' }
  }
  return t
}

function listOnly(t: Reservation): Reservation {
  const { qr_code, hash_securite, date_expiration, bus, ...rest } = t
  void qr_code; void hash_securite; void date_expiration; void bus
  return rest
}

// ── API publique ────────────────────────────────────────────────────────
export const demoApi = {
  async gares(): R<Gare[]> {
    await wait(150, 200)
    return { data: [...GARES].sort((a, b) => a.nom.localeCompare(b.nom, 'fr')) }
  },

  async rechercher(params: Partial<SearchParams>): R<TrajetsResponse> {
    await wait()
    const date = params.date || isoDate()
    const places = Number(params.places) || 1
    if (date < isoDate()) fail(422, 'La date doit être aujourd’hui ou plus tard.', { date: ['La date doit être aujourd’hui ou plus tard.'] })
    const trajets: Trajet[] = []
    LIGNES.forEach((l, li) => {
      if (params.origine && Number(params.origine) !== l.from) return
      if (params.destination && Number(params.destination) !== l.to) return
      l.heures.forEach((h, hi) => {
        if (minutesUntil(date, h) < 0) return
        const t = formatDepart(encodeId(date, li, hi), places)
        if (t.places_disponibles >= places) trajets.push(t)
      })
    })
    trajets.sort((a, b) => a.heure_depart.localeCompare(b.heure_depart))
    return { data: { date, places, total: trajets.length, trajets } }
  },

  async show(id: number | string): R<Trajet> {
    await wait(200, 250)
    assertDepart(id)
    return { data: formatDepart(Number(id), 1, true) }
  },

  async sieges(id: number | string): R<SiegesResponse> {
    await wait(250, 300)
    assertDepart(id)
    const taken = occupiedSeats(Number(id))
    const rangees: Record<string, Siege[]> = {}
    for (let r = 1; r <= ROWS; r++) {
      rangees[r] = COLS.map((c, ci) => ({
        id: r * 10 + ci,
        numero: `${r}${c}`,
        colonne: c,
        position: c === 'A' || c === 'D' ? 'fenetre' : 'couloir',
        categorie: 'Standard',
        disponible: !taken.has(`${r}${c}`),
      }))
    }
    return {
      data: {
        depart_id: Number(id),
        bus_numero: formatDepart(Number(id), 1, true).bus?.numero ?? null,
        capacite: CAPACITE,
        disponibles: CAPACITE - taken.size,
        occupes: taken.size,
        rangees,
      },
    }
  },

  // ── Auth ──
  async register(p: { nom: string; prenom: string; telephone: string; email?: string; password: string; password_confirmation: string }): R<AuthResponse> {
    await wait()
    const errors: Record<string, string[]> = {}
    if (!p.nom) errors.nom = ['Le nom est obligatoire.']
    if (!p.prenom) errors.prenom = ['Le prénom est obligatoire.']
    if (!p.telephone) errors.telephone = ['Le téléphone est obligatoire.']
    if ((p.password || '').length < 6) errors.password = ['Le mot de passe doit contenir au moins 6 caractères.']
    if (p.password !== p.password_confirmation) errors.password = ['La confirmation ne correspond pas.']
    const list = clients()
    if (list.some(c => normalizePhone(c.client.telephone) === normalizePhone(p.telephone))) errors.telephone = ['Ce numéro est déjà utilisé.']
    if (Object.keys(errors).length) fail(422, Object.values(errors)[0][0], errors)
    const id = Math.max(0, ...list.map(c => c.client.id)) + 1
    const client: Client = {
      id, code: `CLI-${Math.random().toString(36).slice(-6).toUpperCase()}`,
      nom: p.nom.toUpperCase(), prenom: p.prenom.charAt(0).toUpperCase() + p.prenom.slice(1),
      nom_complet: `${p.prenom} ${p.nom.toUpperCase()}`,
      telephone: normalizePhone(p.telephone), email: p.email || null, type: 'occasionnel',
      points_fidelite: 0, nombre_voyages: 0,
    }
    write(K_CLIENTS, [...list, { client, password: p.password }])
    return { data: { message: 'Compte créé avec succès', token: `demo-${id}`, client } }
  },

  async login(p: { telephone: string; password: string }): R<AuthResponse> {
    await wait()
    const found = clients().find(c => normalizePhone(c.client.telephone) === normalizePhone(p.telephone))
    if (!found || found.password !== p.password) {
      fail(422, 'Téléphone ou mot de passe incorrect.', { telephone: ['Téléphone ou mot de passe incorrect.'] })
    }
    return { data: { message: 'Connexion réussie', token: `demo-${found.client.id}`, client: found.client } }
  },

  async logout(): R<{ message: string }> {
    await wait(80, 80)
    return { data: { message: 'Déconnexion réussie' } }
  },

  async me(): R<Client> {
    await wait(120, 120)
    return { data: currentClient() }
  },

  async update(p: ProfilePayload): R<{ message: string; client: Client }> {
    await wait()
    const me = currentClient()
    const list = clients()
    const idx = list.findIndex(c => c.client.id === me.id)
    const client = { ...list[idx].client, ...p }
    client.nom_complet = `${client.prenom} ${client.nom}`
    list[idx] = { ...list[idx], client }
    write(K_CLIENTS, list)
    return { data: { message: 'Profil mis à jour', client } }
  },

  // ── Réservations ──
  async reservations(): R<ReservationsResponse> {
    await wait()
    const me = currentClient()
    const mine = tickets()
      .filter(t => t.clientId === me.id)
      .map(t => listOnly(withLiveStatus(t.ticket)))
      .sort((a, b) => (b.date_emission || '').localeCompare(a.date_emission || ''))
    return { data: { reservations: mine, pagination: { page: 1, par_page: 15, total: mine.length, pages: 1 } } }
  },

  async reserver(p: ReservationPayload): R<{ message: string; reservation: Reservation }> {
    await wait(700, 600)
    const me = currentClient()
    const d = assertDepart(p.depart_id)
    const trajet = formatDepart(p.depart_id, p.nombre_places)
    if (trajet.places_disponibles < p.nombre_places) fail(422, `Places insuffisantes. Disponible : ${trajet.places_disponibles}`)
    const taken = occupiedSeats(p.depart_id)
    let sieges = p.sieges ?? []
    if (sieges.length) {
      if (sieges.length !== p.nombre_places) fail(422, `Le nombre de sièges (${sieges.length}) ne correspond pas au nombre de places (${p.nombre_places})`)
      const pris = sieges.filter(s => taken.has(s))
      if (pris.length) fail(422, `Le siège ${pris.join(', ')} vient d'être réservé. Choisissez une autre place.`)
    } else {
      sieges = []
      for (let r = 1; r <= ROWS && sieges.length < p.nombre_places; r++) {
        for (const c of COLS) if (!taken.has(`${r}${c}`) && sieges.length < p.nombre_places) sieges.push(`${r}${c}`)
      }
    }
    void d
    const ticket = makeTicket(p.depart_id, sieges, p.mode_paiement)
    write(K_TICKETS, [...tickets(), { clientId: me.id, departId: p.depart_id, ticket }])
    return { data: { message: 'Réservation confirmée', reservation: ticket } }
  },

  async reservation(ref: string): R<Reservation> {
    await wait(200, 200)
    const me = currentClient()
    const st = tickets().find(t => t.clientId === me.id && t.ticket.reference === ref)
    if (!st) fail(404, 'Réservation introuvable.')
    return { data: withLiveStatus(st.ticket) }
  },

  async annuler(ref: string): R<{ message: string }> {
    await wait(500, 400)
    const me = currentClient()
    const list = tickets()
    const st = list.find(t => t.clientId === me.id && t.ticket.reference === ref)
    if (!st) fail(404, 'Réservation introuvable.')
    if (st.ticket.statut === 'annule') fail(422, 'Ce ticket est déjà annulé')
    if (st.ticket.statut === 'utilise') fail(422, 'Un ticket déjà utilisé ne peut pas être annulé')
    const t = st.ticket.trajet!
    if (minutesUntil(t.date_depart, t.heure) < 120) {
      fail(422, "L'annulation n'est plus possible (délai de 2h avant départ dépassé)")
    }
    st.ticket.statut = 'annule'
    write(K_TICKETS, list)
    return { data: { message: 'Réservation annulée avec succès' } }
  },
}

export const DEMO_ACCOUNT = { telephone: '07 00 00 00 00', password: 'demo123' }
