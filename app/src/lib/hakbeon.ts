// Approximates a student's university entrance year from birth year, using
// the standard Korean school-year cohort (age 19 in the entrance year) —
// doesn't account for the March 1/2 birth-date cutoff some students fall on
// either side of, so treat this as a friendly estimate, not an official 학번.
export function estimateHakbeon(birthDate: string): string {
  const birthYear = new Date(birthDate).getUTCFullYear();
  const entranceYear = birthYear + 19;
  return String(entranceYear % 100).padStart(2, '0');
}
