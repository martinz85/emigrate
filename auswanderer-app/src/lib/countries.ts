/**
 * Country flag emoji mapping
 * Centralized to avoid duplication across components
 */
export const COUNTRY_FLAGS: Record<string, string> = {
  'Portugal': '🇵🇹',
  'Spanien': '🇪🇸',
  'Zypern': '🇨🇾',
  'Costa Rica': '🇨🇷',
  'Uruguay': '🇺🇾',
  'Thailand': '🇹🇭',
  'Mexiko': '🇲🇽',
  'Panama': '🇵🇦',
  'Kolumbien': '🇨🇴',
  'Ungarn': '🇭🇺',
  'Bulgarien': '🇧🇬',
  'Rumänien': '🇷🇴',
  'Griechenland': '🇬🇷',
  'Italien': '🇮🇹',
  'Kroatien': '🇭🇷',
  'Estland': '🇪🇪',
  'Georgien': '🇬🇪',
  'Malta': '🇲🇹',
  'Kanada': '🇨🇦',
  'USA': '🇺🇸',
  'Australien': '🇦🇺',
  'Neuseeland': '🇳🇿',
  'Schweiz': '🇨🇭',
  'Österreich': '🇦🇹',
  'Niederlande': '🇳🇱',
  'Frankreich': '🇫🇷',
  'Großbritannien': '🇬🇧',
  'Irland': '🇮🇪',
  'Schweden': '🇸🇪',
  'Norwegen': '🇳🇴',
  'Dänemark': '🇩🇰',
  'Finnland': '🇫🇮',
}

/**
 * Get flag emoji for a country
 * Returns a globe emoji as fallback for unknown countries
 */
export function getCountryFlag(country: string): string {
  return COUNTRY_FLAGS[country] || '🌍'
}

