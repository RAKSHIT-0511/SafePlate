export type AllergenSeverity = 'AVOID' | 'TRACE_OK' | 'LIFE_THREATENING';

export type SafetyStatus = 'SAFE' | 'CAUTION' | 'UNSAFE';

export interface AllergenRule {
  allergenId: string;
  allergenName: string;
  severity: AllergenSeverity;
  isCustom?: boolean;
}

export interface SafetyCheckResult {
  status: SafetyStatus;
  matchedAllergens: string[];
  matchedIngredients: string[];
  severity?: AllergenSeverity;
  reasons: string[];
  crossContactWarnings: string[];
  ambiguousIngredients: string[];
  details: {
    checkedAllergens: string[];
    profileName: string;
    timestamp: string;
  };
}

export interface AllergenDefinition {
  id: string;
  name: string;
  category?: string;
  synonyms: string[];
  crossReactivities?: string[];
  iconName?: string;
  description?: string;
}
