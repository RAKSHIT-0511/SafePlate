import { STANDARD_ALLERGENS, AMBIGUOUS_INGREDIENTS, CROSS_CONTACT_PHRASES } from './allergenDictionary';
import { AllergenDefinition, AllergenRule } from './types';

/**
 * Normalizes an ingredient text for robust deterministic matching:
 * - lowercase
 * - strips surrounding punctuation
 * - collapses multiple whitespaces
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ') // Keep alphanumeric, spaces, and hyphens
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Tokenizes ingredient string or ingredient list into normalized segments.
 * Splits on commas, semicolons, newlines, and bullet points.
 */
export function parseIngredientSegments(input: string | string[]): string[] {
  if (Array.isArray(input)) {
    return input
      .flatMap((item) => item.split(/[,;\n•·]/))
      .map((seg) => seg.trim())
      .filter((seg) => seg.length > 0);
  }

  if (typeof input !== 'string') return [];

  return input
    .split(/[,;\n•·]/)
    .map((seg) => seg.trim())
    .filter((seg) => seg.length > 0);
}

/**
 * Checks if a specific target term is present in the text as a discrete phrase or word.
 * Uses word boundary detection to avoid partial match false-positives (e.g. 'nut' matching 'minute').
 */
export function containsTerm(text: string, term: string): boolean {
  if (!text || !term) return false;

  const normText = normalizeText(text);
  const normTerm = normalizeText(term);

  if (!normText || !normTerm) return false;

  // Escape regex special characters in the term
  const escaped = normTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Multi-word or single-word with word boundaries
  const regex = new RegExp(`(^|\\b)${escaped}(\\b|$)`, 'i');
  return regex.test(normText);
}

export interface AllergenMatchDetail {
  allergenId: string;
  allergenName: string;
  matchedTerm: string;
  sourceIngredient: string;
  isCrossContact: boolean;
}

/**
 * Splits text into primary ingredient sections vs cross-contact advisory sections.
 */
export function extractCrossContactSections(rawText: string): {
  primaryText: string;
  advisoryText: string;
} {
  const lower = rawText.toLowerCase();

  // Find the earliest index of any cross-contact phrase
  let earliestIndex = -1;

  for (const phrase of CROSS_CONTACT_PHRASES) {
    const idx = lower.indexOf(phrase);
    if (idx !== -1) {
      if (earliestIndex === -1 || idx < earliestIndex) {
        earliestIndex = idx;
      }
    }
  }

  if (earliestIndex === -1) {
    return { primaryText: rawText, advisoryText: '' };
  }

  return {
    primaryText: rawText.substring(0, earliestIndex).trim(),
    advisoryText: rawText.substring(earliestIndex).trim(),
  };
}

/**
 * Finds all matches for a given allergen rule within an ingredient text.
 */
export function matchAllergenInText(
  rawText: string,
  rule: AllergenRule,
  allDefinitions: AllergenDefinition[] = STANDARD_ALLERGENS
): AllergenMatchDetail[] {
  const matches: AllergenMatchDetail[] = [];
  const { primaryText, advisoryText } = extractCrossContactSections(rawText);

  // Find the definition for this allergen
  const def = allDefinitions.find(
    (d) => d.id.toLowerCase() === rule.allergenId.toLowerCase() || d.name.toLowerCase() === rule.allergenName.toLowerCase()
  );

  // If custom allergen without standard definition, use allergen name as the primary synonym
  const rawTerms = def ? def.synonyms : [rule.allergenName.toLowerCase()];
  // Sort by length descending so multi-word phrases match before single-word substrings
  const termsToSearch = [...rawTerms].sort((a, b) => b.length - a.length);

  // Check in primary text first (direct ingredient)
  for (const term of termsToSearch) {
    if (containsTerm(primaryText, term)) {
      matches.push({
        allergenId: rule.allergenId,
        allergenName: rule.allergenName,
        matchedTerm: term,
        sourceIngredient: primaryText,
        isCrossContact: false,
      });
      break; // Avoid duplicated reporting of multiple synonyms on the same segment
    }
  }

  // Check in cross-contact advisory text
  if (advisoryText) {
    for (const term of termsToSearch) {
      if (containsTerm(advisoryText, term)) {
        matches.push({
          allergenId: rule.allergenId,
          allergenName: rule.allergenName,
          matchedTerm: term,
          sourceIngredient: advisoryText,
          isCrossContact: true,
        });
        break;
      }
    }
  }

  return matches;
}

/**
 * Identifies ambiguous ingredients in the text that cannot be verified safe.
 */
export function detectAmbiguousIngredients(rawText: string): { term: string; explanation: string }[] {
  const found: { term: string; explanation: string }[] = [];

  for (const item of AMBIGUOUS_INGREDIENTS) {
    if (containsTerm(rawText, item.term)) {
      found.push(item);
    }
  }

  return found;
}
