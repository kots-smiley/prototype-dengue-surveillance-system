/**
 * Age helpers shared by the EMR modules. Used to derive a de-identified
 * age / age group for surveillance Cases generated from patient encounters.
 */

/** Whole-year age from a birth date relative to a reference date (default now). */
export function ageFromBirthDate(birthDate: Date, reference: Date = new Date()): number {
  let age = reference.getFullYear() - birthDate.getFullYear();
  const monthDiff = reference.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && reference.getDate() < birthDate.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

/** Map an age to the surveillance age-group buckets. */
export function ageGroupFromAge(age: number): string {
  if (age <= 5) return '0-5';
  if (age <= 12) return '6-12';
  if (age <= 18) return '13-18';
  if (age <= 30) return '19-30';
  if (age <= 50) return '31-50';
  return '50+';
}
