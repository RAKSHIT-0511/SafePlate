export interface AllergenUIItem {
  id: string;
  name: string;
  category: string;
  iconName: string;
  defaultSeverityDesc: string;
}

export const INITIAL_ALLERGENS_LIST: AllergenUIItem[] = [
  {
    id: 'peanut',
    name: 'Peanut',
    category: 'Legumes',
    iconName: 'nutrition',
    defaultSeverityDesc: 'Severe anaphylaxis trigger in legume family',
  },
  {
    id: 'tree-nut',
    name: 'Tree Nut',
    category: 'Nuts',
    iconName: 'psychiatry',
    defaultSeverityDesc: 'Almonds, cashews, walnuts, pecans, etc.',
  },
  {
    id: 'milk',
    name: 'Milk',
    category: 'Dairy',
    iconName: 'local_drink',
    defaultSeverityDesc: 'Bovine dairy proteins: whey, casein, lactose',
  },
  {
    id: 'dairy',
    name: 'Dairy',
    category: 'Dairy',
    iconName: 'local_drink',
    defaultSeverityDesc: 'Covers all milk derivatives, cream, butter, cheese',
  },
  {
    id: 'egg',
    name: 'Egg',
    category: 'Poultry',
    iconName: 'egg',
    defaultSeverityDesc: 'Egg whites (albumin) and yolk proteins',
  },
  {
    id: 'wheat',
    name: 'Wheat',
    category: 'Grains',
    iconName: 'grain',
    defaultSeverityDesc: 'Wheat flour, semolina, spelt, durum',
  },
  {
    id: 'gluten',
    name: 'Gluten',
    category: 'Grains',
    iconName: 'grain',
    defaultSeverityDesc: 'Gluten proteins in wheat, barley, rye, malt',
  },
  {
    id: 'soy',
    name: 'Soy',
    category: 'Legumes',
    iconName: 'spa',
    defaultSeverityDesc: 'Soybeans, edamame, tofu, tamari, lecithin',
  },
  {
    id: 'fish',
    name: 'Fish',
    category: 'Seafood',
    iconName: 'set_meal',
    defaultSeverityDesc: 'Salmon, tuna, cod, tilapia, and fish sauces',
  },
  {
    id: 'shellfish',
    name: 'Shellfish',
    category: 'Seafood',
    iconName: 'water',
    defaultSeverityDesc: 'Crustaceans (shrimp/crab) and mollusks (clams/mussels)',
  },
  {
    id: 'sesame',
    name: 'Sesame',
    category: 'Seeds',
    iconName: 'scatter_plot',
    defaultSeverityDesc: 'Sesame seeds, sesame oil, and tahini',
  },
  {
    id: 'mustard',
    name: 'Mustard',
    category: 'Seeds',
    iconName: 'yard',
    defaultSeverityDesc: 'Mustard seed, ground mustard, prepared mustard',
  },
];
