import {
  AllergenRule,
  AllergenSeverity,
  SafetyCheckResult,
  SafetyStatus,
} from './types';
import { STANDARD_ALLERGENS } from './allergenDictionary';
import {
  parseIngredientSegments,
  matchAllergenInText,
  detectAmbiguousIngredients,
  AllergenMatchDetail,
} from './synonymMatcher';
import { checkCrossReactivity } from './crossReactivity';

export interface EvaluateSafetyOptions {
  profileName?: string;
  allowAmbiguous?: boolean;
}

/**
 * Pure deterministic Safety Engine.
 * Evaluates an ingredient string or ingredient list against the rules of an active allergy profile.
 */
export function evaluateSafety(
  ingredientsInput: string | string[],
  rules: AllergenRule[],
  options: EvaluateSafetyOptions = {}
): SafetyCheckResult {
  const profileName = options.profileName || 'Active Member';
  const timestamp = new Date().toISOString();

  // Parse input
  const segments = parseIngredientSegments(ingredientsInput);
  const rawCombinedText = Array.isArray(ingredientsInput)
    ? ingredientsInput.join(', ')
    : ingredientsInput || '';

  const checkedAllergenNames = rules.map((r) => r.allergenName);

  // Guard: Empty input
  if (!rawCombinedText.trim() || segments.length === 0) {
    return {
      status: 'CAUTION',
      matchedAllergens: [],
      matchedIngredients: [],
      reasons: ['No ingredients were provided for analysis.'],
      crossContactWarnings: [],
      ambiguousIngredients: [],
      details: {
        checkedAllergens: checkedAllergenNames,
        profileName,
        timestamp,
      },
    };
  }

  // Guard: Profile has zero configured allergens
  if (!rules || rules.length === 0) {
    return {
      status: 'SAFE',
      matchedAllergens: [],
      matchedIngredients: [],
      reasons: ['The active profile has no active allergy restrictions configured.'],
      crossContactWarnings: [],
      ambiguousIngredients: [],
      details: {
        checkedAllergens: [],
        profileName,
        timestamp,
      },
    };
  }

  const allMatches: AllergenMatchDetail[] = [];
  const crossContactWarnings: string[] = [];
  const matchedAllergenSet = new Set<string>();
  const matchedIngredientSet = new Set<string>();
  const reasons: string[] = [];

  let highestSeverityRank = -1; // 0 = TRACE_OK, 1 = AVOID, 2 = LIFE_THREATENING
  let highestSeverity: AllergenSeverity | undefined = undefined;

  const severityRank: Record<AllergenSeverity, number> = {
    TRACE_OK: 0,
    AVOID: 1,
    LIFE_THREATENING: 2,
  };

  // 1. Evaluate allergen rules against each ingredient segment and combined text
  for (const rule of rules) {
    const segmentMatches = matchAllergenInText(rawCombinedText, rule, STANDARD_ALLERGENS);

    if (segmentMatches.length > 0) {
      allMatches.push(...segmentMatches);

      for (const match of segmentMatches) {
        matchedAllergenSet.add(match.allergenName);
        matchedIngredientSet.add(match.matchedTerm);

        const currentRank = severityRank[rule.severity];
        if (currentRank > highestSeverityRank) {
          highestSeverityRank = currentRank;
          highestSeverity = rule.severity;
        }

        if (match.isCrossContact) {
          crossContactWarnings.push(
            `Cross-contact warning found: '${match.sourceIngredient}' mentioning '${match.matchedTerm}'`
          );

          if (rule.severity === 'LIFE_THREATENING') {
            reasons.push(
              `${rule.allergenName} cross-contact detected through '${match.matchedTerm}'. Active profile '${profileName}' has a Life-Threatening allergy requiring strict zero cross-contact.`
            );
          } else if (rule.severity === 'AVOID') {
            reasons.push(
              `Possible ${rule.allergenName.toLowerCase()} cross-contact detected from '${match.matchedTerm}'. Active profile '${profileName}' specifies Avoid.`
            );
          } else if (rule.severity === 'TRACE_OK') {
            reasons.push(
              `Possible ${rule.allergenName.toLowerCase()} cross-contact advisory detected from '${match.matchedTerm}'. Active profile '${profileName}' tolerates trace contact, but verification is advised.`
            );
          }
        } else {
          // Direct ingredient match
          if (rule.severity === 'LIFE_THREATENING') {
            reasons.push(
              `${rule.allergenName} detected through ingredient term '${match.matchedTerm}'. Active profile '${profileName}' has a Life-Threatening ${rule.allergenName.toLowerCase()} allergy.`
            );
          } else if (rule.severity === 'AVOID') {
            reasons.push(
              `${rule.allergenName} detected through ingredient term '${match.matchedTerm}'. Active profile '${profileName}' must avoid this allergen.`
            );
          } else if (rule.severity === 'TRACE_OK') {
            // Even if trace is ok for cross-contact on equipment, direct ingredient presence is unsafe to consume!
            reasons.push(
              `${rule.allergenName} directly present through ingredient term '${match.matchedTerm}'. Even with trace tolerance, direct consumption is restricted.`
            );
          }
        }
      }
    }

    // 2. Cross-reactivity check
    const crossReactivities = checkCrossReactivity(rawCombinedText, rule.allergenId);
    for (const cr of crossReactivities) {
      if (rule.severity === 'LIFE_THREATENING') {
        reasons.push(
          `Cross-reactive ingredient '${cr.relatedIngredient}' detected: ${cr.note}`
        );
        matchedIngredientSet.add(cr.relatedIngredient);
      }
    }
  }

  // 3. Ambiguous ingredients check
  const ambiguousDetected = detectAmbiguousIngredients(rawCombinedText);
  const ambiguousTerms = ambiguousDetected.map((a) => a.term);

  for (const amb of ambiguousDetected) {
    reasons.push(
      `Ambiguous ingredient '${amb.term}' detected: ${amb.explanation}`
    );
  }

  // 4. Determine final status
  let status: SafetyStatus = 'SAFE';

  const hasDirectMatch = allMatches.some((m) => !m.isCrossContact);
  const hasCrossContactMatch = allMatches.some((m) => m.isCrossContact);

  if (hasDirectMatch) {
    // Any direct ingredient match for an active allergen is UNSAFE
    status = 'UNSAFE';
  } else if (hasCrossContactMatch) {
    // Cross contact only:
    // If any matched allergen has LIFE_THREATENING -> UNSAFE
    // If all matched are TRACE_OK -> CAUTION
    // If AVOID -> CAUTION
    const hasLifeThreateningCross = allMatches.some(
      (m) => m.isCrossContact && rules.find((r) => r.allergenName === m.allergenName)?.severity === 'LIFE_THREATENING'
    );

    if (hasLifeThreateningCross) {
      status = 'UNSAFE';
    } else {
      status = 'CAUTION';
    }
  } else if (ambiguousDetected.length > 0) {
    // No direct or cross allergens, but ambiguous ingredients exist
    status = 'CAUTION';
  } else {
    status = 'SAFE';
    reasons.push('No configured allergens were detected in this ingredient list.');
  }

  return {
    status,
    matchedAllergens: Array.from(matchedAllergenSet),
    matchedIngredients: Array.from(matchedIngredientSet),
    severity: highestSeverity,
    reasons,
    crossContactWarnings,
    ambiguousIngredients: ambiguousTerms,
    details: {
      checkedAllergens: checkedAllergenNames,
      profileName,
      timestamp,
    },
  };
}
