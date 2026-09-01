export interface Gare { id: number; nom: string; ville: string }

export interface Arret { gare: Gare; heure: string }

export interface Trajet {
  id: number
  origine: Gare
  destination: Gare
  depart_at: string
  arrivee_at: string
  prix_adulte: number
  prix_enfant: number
  prix_etudiant: number
  places_disponibles: number
  bus: { immatriculation: string; capacite: number }
  arrets: Arret[]
}

export interface Reservation {
  ref: string
  trajet: Trajet
  sieges: string[]
  statut: 'valide' | 'utilise' | 'annule' | 'expire'
  nom_passager?: string
  mode_paiement: 'mobile_money' | 'especes' | 'carte'
  created_at: string
}

export interface User {
  id: number; nom: string; prenom: string; telephone: string
  email?: string; date_naissance?: string; ville?: string; adresse?: string
}

export interface SearchParams { origine: string; destination: string; date: string; places: number }
