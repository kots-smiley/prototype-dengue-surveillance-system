import { Allergy } from '../types';

/** Case-insensitive substring match between a drug name and allergy substance. */
export function drugMatchesAllergy(drug: string, substance: string): boolean {
  const d = drug.trim().toLowerCase();
  const s = substance.trim().toLowerCase();
  if (!d || !s) return false;
  return d.includes(s) || s.includes(d);
}

export interface AllergyMatch {
  drug: string;
  allergy: Allergy;
}

/** Find all drug–allergy conflicts in a medication list. */
export function findAllergyConflicts(
  drugs: string[],
  allergies: Allergy[] | undefined
): AllergyMatch[] {
  if (!allergies?.length) return [];
  const matches: AllergyMatch[] = [];
  for (const drug of drugs) {
    if (!drug.trim()) continue;
    for (const allergy of allergies) {
      if (drugMatchesAllergy(drug, allergy.substance)) {
        matches.push({ drug: drug.trim(), allergy });
      }
    }
  }
  return matches;
}
