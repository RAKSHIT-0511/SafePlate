import { GroceryCategory, GroceryItem } from '../types/grocery';

export interface RawIngredientEntry {
  raw: string;
  recipeTitle?: string;
}

/**
 * Determines appropriate grocery store category for an ingredient.
 */
export function categorizeIngredient(ingredientName: string): GroceryCategory {
  const lower = ingredientName.toLowerCase();

  // Dairy alternatives
  if (
    lower.includes('oat milk') ||
    lower.includes('coconut milk') ||
    lower.includes('almond milk') ||
    lower.includes('dairy-free') ||
    lower.includes('crema alternative') ||
    lower.includes('vegan cheese') ||
    lower.includes('plant milk')
  ) {
    return 'Dairy Alternatives';
  }

  // Fresh produce
  if (
    lower.includes('spinach') ||
    lower.includes('kale') ||
    lower.includes('tomato') ||
    lower.includes('avocado') ||
    lower.includes('lemon') ||
    lower.includes('lime') ||
    lower.includes('potato') ||
    lower.includes('onion') ||
    lower.includes('garlic') ||
    lower.includes('ginger') ||
    lower.includes('zucchini') ||
    lower.includes('broccoli') ||
    lower.includes('pepper') ||
    lower.includes('mushroom') ||
    lower.includes('cilantro') ||
    lower.includes('basil') ||
    lower.includes('berry') ||
    lower.includes('berries') ||
    lower.includes('banana') ||
    lower.includes('radish') ||
    lower.includes('cucumber') ||
    lower.includes('asparagus') ||
    lower.includes('carrot') ||
    lower.includes('cabbage') ||
    lower.includes('scallion') ||
    lower.includes('microgreen') ||
    lower.includes('lettuce') ||
    lower.includes('thyme')
  ) {
    return 'Fresh Produce';
  }

  // Grains & Baking
  if (
    lower.includes('oat') ||
    lower.includes('quinoa') ||
    lower.includes('rice') ||
    lower.includes('noodle') ||
    lower.includes('soba') ||
    lower.includes('rigatoni') ||
    lower.includes('pasta') ||
    lower.includes('bread') ||
    lower.includes('sourdough') ||
    lower.includes('tortilla') ||
    lower.includes('chia') ||
    lower.includes('flax') ||
    lower.includes('baking powder') ||
    lower.includes('starch') ||
    lower.includes('flour')
  ) {
    return 'Grains & Baking';
  }

  // Proteins
  if (
    lower.includes('tofu') ||
    lower.includes('salmon') ||
    lower.includes('chicken') ||
    lower.includes('tuna') ||
    lower.includes('bean') ||
    lower.includes('chickpea') ||
    lower.includes('lentil') ||
    lower.includes('edamame') ||
    lower.includes('egg') ||
    lower.includes('beef') ||
    lower.includes('turkey') ||
    lower.includes('shrimp')
  ) {
    return 'Proteins';
  }

  // Pantry
  if (
    lower.includes('oil') ||
    lower.includes('vinegar') ||
    lower.includes('tamari') ||
    lower.includes('soy sauce') ||
    lower.includes('syrup') ||
    lower.includes('maple') ||
    lower.includes('turmeric') ||
    lower.includes('cumin') ||
    lower.includes('paprika') ||
    lower.includes('oregano') ||
    lower.includes('nutritional yeast') ||
    lower.includes('salt') ||
    lower.includes('broth') ||
    lower.includes('can') ||
    lower.includes('canned') ||
    lower.includes('seed') ||
    lower.includes('pepita') ||
    lower.includes('sunflower seed') ||
    lower.includes('olive') ||
    lower.includes('mustard') ||
    lower.includes('cinnamon')
  ) {
    return 'Pantry';
  }

  return 'Other';
}

/**
 * Normalizes and aggregates raw ingredients collected from a weekly meal plan into consolidated grocery items.
 */
export function consolidateIngredients(
  rawList: RawIngredientEntry[],
  existingItems: GroceryItem[] = []
): GroceryItem[] {
  const map = new Map<string, { name: string; quantity: string; category: GroceryCategory; recipes: Set<string> }>();

  // Map existing items to preserve checked states if matching
  const checkedMap = new Map<string, boolean>();
  for (const item of existingItems) {
    checkedMap.set(item.name.toLowerCase().trim(), item.checked);
  }

  for (const entry of rawList) {
    const raw = entry.raw.trim();
    if (!raw) continue;

    // Extract quantity pattern if at beginning (e.g. "1 cup", "2 tbsp", "1/2 cup", "2 large")
    const match = raw.match(/^([\d/.\s-]+(?:\s*(?:cup|cups|tbsp|tsp|can|cans|g|oz|lb|lbs|clove|cloves|block|bunch|pinch|slices?|fillets?|medium|large|small|pint|head|stalks?)\b)?)(.*)$/i);

    let quantity = '1 unit';
    let name = raw;

    if (match && match[1].trim()) {
      quantity = match[1].trim();
      name = match[2].trim().replace(/^of\s+/i, '');
    }

    // Capitalize first letter of clean name
    const cleanName = name.charAt(0).toUpperCase() + name.slice(1);
    const key = cleanName.toLowerCase();

    if (!map.has(key)) {
      map.set(key, {
        name: cleanName,
        quantity,
        category: categorizeIngredient(cleanName),
        recipes: new Set(entry.recipeTitle ? [entry.recipeTitle] : []),
      });
    } else {
      const existing = map.get(key)!;
      if (entry.recipeTitle) existing.recipes.add(entry.recipeTitle);
      // Combine quantities gracefully
      existing.quantity = `${existing.quantity} + ${quantity}`;
    }
  }

  const result: GroceryItem[] = [];

  for (const [key, value] of map.entries()) {
    result.push({
      id: `grocery_${key.replace(/\s+/g, '_')}`,
      name: value.name,
      quantity: value.quantity,
      category: value.category,
      checked: checkedMap.get(key) || false,
      recipeSource: Array.from(value.recipes).join(', '),
    });
  }

  // Preserve existing custom items
  const customItems = existingItems.filter((i) => i.isCustom);
  for (const custom of customItems) {
    if (!result.some((r) => r.id === custom.id)) {
      result.push(custom);
    }
  }

  return result;
}
