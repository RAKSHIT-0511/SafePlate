import { describe, it, expect } from 'vitest';
import { evaluateSafety } from '../../src/safety/safetyEngine';
import { AllergenRule } from '../../src/safety/types';

describe('Deterministic Safety Engine', () => {
  const peanutLifeThreatening: AllergenRule = {
    allergenId: 'peanut',
    allergenName: 'Peanut',
    severity: 'LIFE_THREATENING',
  };

  const dairyAvoid: AllergenRule = {
    allergenId: 'dairy',
    allergenName: 'Dairy',
    severity: 'AVOID',
  };

  const dairyTraceOk: AllergenRule = {
    allergenId: 'dairy',
    allergenName: 'Dairy',
    severity: 'TRACE_OK',
  };

  const eggAvoid: AllergenRule = {
    allergenId: 'egg',
    allergenName: 'Egg',
    severity: 'AVOID',
  };

  const glutenAvoid: AllergenRule = {
    allergenId: 'gluten',
    allergenName: 'Gluten',
    severity: 'AVOID',
  };

  // 1. Exact Allergen Match
  it('detects exact allergen match', () => {
    const result = evaluateSafety('organic peanut oil, sea salt', [peanutLifeThreatening]);
    expect(result.status).toBe('UNSAFE');
    expect(result.matchedAllergens).toContain('Peanut');
    expect(result.severity).toBe('LIFE_THREATENING');
  });

  // 2. Case-Insensitive Matching
  it('handles case-insensitive matching properly', () => {
    const result = evaluateSafety('PEANUT BUTTER, Honey, Oats', [peanutLifeThreatening]);
    expect(result.status).toBe('UNSAFE');
    expect(result.matchedAllergens).toContain('Peanut');
    expect(result.matchedIngredients).toContain('peanut butter');
  });

  // 3. Synonym Match: arachis -> peanut
  it('detects arachis as a synonym for peanut', () => {
    const result = evaluateSafety('Ingredients: sugar, cocoa, arachis hypogaea extract', [peanutLifeThreatening]);
    expect(result.status).toBe('UNSAFE');
    expect(result.matchedAllergens).toContain('Peanut');
    expect(result.matchedIngredients.some((i) => i.includes('arachis'))).toBe(true);
    expect(result.reasons.some((r) => r.includes('arachis'))).toBe(true);
  });

  // 4. Synonym Match: groundnut -> peanut
  it('detects groundnut as a synonym for peanut', () => {
    const result = evaluateSafety('groundnut flour, cane sugar', [peanutLifeThreatening]);
    expect(result.status).toBe('UNSAFE');
    expect(result.matchedAllergens).toContain('Peanut');
  });

  // 5. Dairy Detection: milk
  it('detects milk directly', () => {
    const result = evaluateSafety('organic whole milk, cocoa powder', [dairyAvoid]);
    expect(result.status).toBe('UNSAFE');
    expect(result.matchedAllergens).toContain('Dairy');
  });

  // 6. Synonym Match: casein -> dairy
  it('detects casein as dairy', () => {
    const result = evaluateSafety('sodium caseinate, emulsifier, water', [dairyAvoid]);
    expect(result.status).toBe('UNSAFE');
    expect(result.matchedAllergens).toContain('Dairy');
    expect(result.matchedIngredients.some((i) => i.includes('casein'))).toBe(true);
  });

  // 7. Synonym Match: whey -> dairy
  it('detects whey and whey protein as dairy', () => {
    const result = evaluateSafety('whey protein concentrate, oats, berries', [dairyAvoid]);
    expect(result.status).toBe('UNSAFE');
    expect(result.matchedAllergens).toContain('Dairy');
    expect(result.matchedIngredients.some((i) => i.includes('whey'))).toBe(true);
  });

  // 8. Multi-Word Ingredient Matching
  it('detects multi-word ingredients without false word boundaries', () => {
    const result = evaluateSafety('nonfat dry milk, cane sugar, cocoa', [dairyAvoid]);
    expect(result.status).toBe('UNSAFE');
    expect(result.matchedAllergens).toContain('Dairy');
  });

  // 9. Life-Threatening Rejection
  it('rejects with UNSAFE for LIFE_THREATENING allergens', () => {
    const result = evaluateSafety('crushed peanuts, dark chocolate', [peanutLifeThreatening]);
    expect(result.status).toBe('UNSAFE');
    expect(result.severity).toBe('LIFE_THREATENING');
    expect(result.reasons.some((r) => r.includes('Life-Threatening'))).toBe(true);
  });

  // 10. Avoid Rejection
  it('rejects with UNSAFE for AVOID allergens', () => {
    const result = evaluateSafety('egg whites, spinach, olive oil', [eggAvoid]);
    expect(result.status).toBe('UNSAFE');
    expect(result.matchedAllergens).toContain('Egg');
  });

  it('rejects with UNSAFE when gluten/wheat derivative is detected', () => {
    const result = evaluateSafety('semolina flour, extra virgin olive oil', [glutenAvoid]);
    expect(result.status).toBe('UNSAFE');
    expect(result.matchedAllergens).toContain('Gluten');
  });

  // 11. Trace/Cross-Contact Caution
  it('returns CAUTION when TRACE_OK has a possible cross-contact warning', () => {
    const result = evaluateSafety(
      'Rolled oats, maple syrup, sea salt. Manufactured on shared equipment with dairy products.',
      [dairyTraceOk]
    );
    expect(result.status).toBe('CAUTION');
    expect(result.matchedAllergens).toContain('Dairy');
    expect(result.reasons.some((r) => r.toLowerCase().includes('cross-contact'))).toBe(true);
  });

  // 12. Cross-contact rejection for LIFE_THREATENING
  it('returns UNSAFE when LIFE_THREATENING allergen has a cross-contact warning', () => {
    const result = evaluateSafety(
      'Granola bar, dark chocolate. Processed in a facility that also processes peanuts.',
      [peanutLifeThreatening]
    );
    expect(result.status).toBe('UNSAFE');
    expect(result.matchedAllergens).toContain('Peanut');
    expect(result.reasons.some((r) => r.includes('Life-Threatening'))).toBe(true);
  });

  // 13. Multiple Allergens
  it('detects multiple allergens simultaneously and reports the highest severity', () => {
    const result = evaluateSafety('peanut butter, skim milk, eggs, honey', [
      peanutLifeThreatening,
      dairyAvoid,
      eggAvoid,
    ]);
    expect(result.status).toBe('UNSAFE');
    expect(result.matchedAllergens).toContain('Peanut');
    expect(result.matchedAllergens).toContain('Dairy');
    expect(result.matchedAllergens).toContain('Egg');
    expect(result.severity).toBe('LIFE_THREATENING');
    expect(result.reasons.length).toBeGreaterThanOrEqual(3);
  });

  // 14. Ambiguous Ingredients Produce CAUTION
  it('classifies ambiguous ingredients as CAUTION and provides clear explanation', () => {
    const result = evaluateSafety('organic apples, cinnamon, natural flavors', [peanutLifeThreatening]);
    expect(result.status).toBe('CAUTION');
    expect(result.ambiguousIngredients).toContain('natural flavors');
    expect(result.reasons.some((r) => r.includes('natural flavors'))).toBe(true);
  });

  // 15. Safe Ingredients
  it('returns SAFE when no configured allergens or ambiguous ingredients are present', () => {
    const result = evaluateSafety('quinoa, olive oil, sweet potato, black beans, avocado, sea salt', [
      peanutLifeThreatening,
      dairyAvoid,
    ]);
    expect(result.status).toBe('SAFE');
    expect(result.matchedAllergens).toHaveLength(0);
    expect(result.reasons).toContain('No configured allergens were detected in this ingredient list.');
  });

  // 16. Empty/No Allergen Profile is Safe
  it('returns SAFE when user has no allergens configured', () => {
    const result = evaluateSafety('peanut butter, cheese, bread', []);
    expect(result.status).toBe('SAFE');
  });

  // 17. Empty Ingredients Input
  it('handles empty input gracefully with CAUTION', () => {
    const result = evaluateSafety('', [peanutLifeThreatening]);
    expect(result.status).toBe('CAUTION');
    expect(result.reasons).toContain('No ingredients were provided for analysis.');
  });
});
