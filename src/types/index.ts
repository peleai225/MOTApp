// Contrat de l'API MOT ERP (agare) — voir app/Http/Controllers/Api/*

export interface Gare {
  id: number
  nom: string
  code?: string | null
  ville: string
  latitude?: number | null
  longitude?: number | null
}

export interface Trajet {
  id: number
  code?: string
  origine: { id: number | null; nom: string }
  destination: { id: number | null; nom: string }
  date_depart: string          // "2026-11-04"
  heure_depart: string         // "07:30"
  heure_arrivee: string | null
  duree_minutes: number | null
  places_disponibles: number
  prix_adulte: number
  prix_enfant: number
  prix_etudiant: number
  prix_total: number
  statut: string
  disponible: boolean
  // détail uniquement
  bus?: { numero?: string | null; immatriculation?: string | null; capacite?: number | null; modele?: string | null }
  distance_km?: number | null
  arrets?: (string | { nom: string })[]
}

export interface TrajetsResponse {
  date: string
  places: number
  total: number
  trajets: Trajet[]
}

export interface Siege {
  id?: number
  numero: string               // "3A"
  colonne?: string             // "A" | "B" | "C" | "D"
  position?: string            // fenetre | couloir | milieu
  categorie?: string
  disponible: boolean
}

export interface SiegesResponse {
  depart_id: number
  bus_numero?: string | null
  capacite?: number | null
  disponibles: number
  occupes: number
  /** Objet indexé par numéro de rangée (PHP) ou tableau */
  rangees: Record<string, Siege[]> | Siege[][]
}

export type StatutTicket = 'valide' | 'utilise' | 'annule' | 'expire'
export type ModePaiement = 'cash' | 'mobile_money' | 'carte_bancaire'

export interface Reservation {
  reference: string
  statut: StatutTicket
  statut_paiement?: string | null
  nombre_places: number
  montant_total: number
  mode_paiement: ModePaiement | string
  date_emission?: string | null
  sieges: string[]
  trajet: {
    id: number
    date_depart: string
    heure: string
    origine: string
    destination: string
  } | null
  // détail uniquement
  qr_code?: string | null
  hash_securite?: string | null
  date_expiration?: string | null
  bus?: { numero?: string | null; immatriculation?: string | null } | null
}

export interface ReservationsResponse {
  reservations: Reservation[]
  pagination: { page: number; par_page: number; total: number; pages: number }
}

export interface Client {
  id: number
  code?: string
  nom_complet?: string
  nom: string
  prenom: string
  telephone: string
  email?: string | null
  type?: string
  points_fidelite?: number
  nombre_voyages?: number
  date_naissance?: string | null
  ville?: string | null
  adresse?: string | null
}
/** @deprecated alias historique */
export type User = Client

export interface AuthResponse {
  message?: string
  token: string
  client: Client
}

export interface SearchParams {
  origine?: number | string | null
  destination?: number | string | null
  date: string
  places: number
}

export interface ReservationPayload {
  depart_id: number
  nombre_places: number
  mode_paiement: ModePaiement
  sieges?: string[]
  nom_passager?: string
  telephone_passager?: string
}

export interface ProfilePayload {
  nom?: string
  prenom?: string
  email?: string
  date_naissance?: string
  ville?: string
  adresse?: string
}
