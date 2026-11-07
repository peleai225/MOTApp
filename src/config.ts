/**
 * Coordonnées et réglages de la marque.
 * Repris du flocage des cars MOT — à vérifier avant mise en production.
 */
export const BRAND = {
  name: 'MOT',
  fullName: 'Mohamed Ouattara Transport',
  tagline: 'Votre confort, notre priorité',
  phone: '+2250707070707',
  phoneDisplay: '07 07 07 07 07',
  whatsapp: '2250505050505',
  email: 'info@motransport.ci',
  website: 'https://www.motransport.ci',
  /** Délai d'annulation par défaut côté backend (Depart::delai_annulation_heures) */
  cancelDelayHours: 2,
  /** Arriver en gare avant le départ */
  boardingAdviceMinutes: 30,
  version: '1.1.0',
} as const
