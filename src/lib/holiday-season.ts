export const holidaySeasons = ['winter', 'autumn', 'spring', 'summer'] as const;
export function holidaySeasonLabel(season: string): string {
  return season.charAt(0).toUpperCase() + season.slice(1);
}
