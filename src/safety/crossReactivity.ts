export interface CrossReactivityItem {
  primaryAllergenId: string;
  relatedIngredient: string;
  riskLevel: 'HIGH' | 'MODERATE' | 'LOW';
  note: string;
}

export const KNOWN_CROSS_REACTIVITIES: CrossReactivityItem[] = [
  {
    primaryAllergenId: 'peanut',
    relatedIngredient: 'lupin',
    riskLevel: 'HIGH',
    note: 'Lupin flour and lupin seeds are legumes with significant clinical cross-reactivity to peanut antibodies.',
  },
  {
    primaryAllergenId: 'peanut',
    relatedIngredient: 'lupine',
    riskLevel: 'HIGH',
    note: 'Lupine is a legume closely related to peanut.',
  },
  {
    primaryAllergenId: 'dairy',
    relatedIngredient: 'goat milk',
    riskLevel: 'HIGH',
    note: 'Goat and sheep milk proteins share >90% amino acid sequence homology with cow milk casein.',
  },
  {
    primaryAllergenId: 'dairy',
    relatedIngredient: 'sheep milk',
    riskLevel: 'HIGH',
    note: 'Sheep milk proteins exhibit high cross-reactivity with bovine dairy allergens.',
  },
  {
    primaryAllergenId: 'shellfish',
    relatedIngredient: 'cricket flour',
    riskLevel: 'HIGH',
    note: 'Insects share muscle tropomyosin with crustaceans (shrimp/crab) and trigger severe allergic reactions.',
  },
  {
    primaryAllergenId: 'sesame',
    relatedIngredient: 'poppy seed',
    riskLevel: 'MODERATE',
    note: 'Occasional cross-reactivity between sesame seed and poppy seed 2S albumin storage proteins.',
  },
];

export function checkCrossReactivity(
  text: string,
  allergenId: string
): CrossReactivityItem[] {
  const lower = text.toLowerCase();
  return KNOWN_CROSS_REACTIVITIES.filter(
    (item) => item.primaryAllergenId.toLowerCase() === allergenId.toLowerCase() && lower.includes(item.relatedIngredient.toLowerCase())
  );
}
