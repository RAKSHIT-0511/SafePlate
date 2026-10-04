# SafePlate 🛡️🍽️

> **Meals everyone in your home can safely eat.**  
> A pure deterministic, local-first allergy safety meal planner and ingredient scanner built for households with food allergies, celiac disease, and severe intolerances.

---

## 🌟 Why SafePlate?

Managing food allergies in a busy home is stressful. Standard recipe apps ignore cross-contact risks, and AI models frequently hallucinate allergen safety. 

**SafePlate eliminates the guesswork with a 100% deterministic safety engine running entirely in your browser.**
- **Zero Cloud Accounts or External DBs**: All your profiles, meal plans, and grocery checklists stay private on your device using browser IndexedDB.
- **Zero AI Hallucinations**: Safety decisions are evaluated deterministically using an allergen taxonomy, scientific synonym dictionary, cross-reactivity mapping, and cross-contact risk filters.
- **Ultra-Fast & Intuitive UX**: Designed for maximum ease of use—no tedious forms, no walls of text. Tap chips, pick severity cards, and generate safe meals in seconds.

---

## 🚀 Key Features & Workflows

### 1. Simple, Chip-First Household Profiles
- **Minimal Typing**: Enter a name and tap allergen chips (Peanuts, Tree Nuts, Milk/Dairy, Eggs, Wheat/Gluten, Soy, Fish, Shellfish, Sesame, Sulfites, Mustard, Celery, plus custom triggers).
- **3 Large Selectable Severity Options**:
  - 🟡 **Avoid**: Direct intolerance / aversion.
  - 🟢 **Trace OK**: Shared line facility or trace levels tolerable.
  - 🔴 **Life-Threatening**: Strict zero cross-contact tolerance.
- **1-Tap Household Switcher**: Switch active member profiles instantly from the navigation header.

### 2. Immediate & Understandable Meal Planner
- **Full 7-Day Planning (21 Meals)**: Filtered dynamically against the active member's allergy rules.
- **Glanceable Meal Cards**:
  - Photo, prep time, calories, and clear safety badge (`🟢 SAFE`).
  - Short `"Why safe:"` summary on every card.
  - Quick action buttons: `[Swap]`, `[Lock] / [Unlock]`, and `[Details]`.
- **Deep Recipe Drawer**: Full ingredient checklist, cooking steps, and detailed Safety Engine audit.

### 3. One-Tap Ingredient Scanner
- **Paste & Check**: Large input area with single primary action `[Check Ingredients]`.
- **Instant Visual Badges**:
  - 🟢 **SAFE**: No triggers detected.
  - 🟠 **CAUTION**: Shared facility advisory or ambiguous ingredient identified.
  - 🔴 **UNSAFE**: Direct allergen or synonym detected.
- **Quick Demo Examples**: One-click demo buttons (`[Safe Example]`, `[Caution Example]`, `[Unsafe Example]`) for instant verification.
- **Expandable Safety Breakdown**: Deep scientific reasoning tucked neatly behind an expandable toggle.

### 4. Checklist-First Grocery Organizer
- **Auto-Compiled from Planned Meals**: Consolidated and categorized by supermarket aisle (Produce, Dairy Alternatives, Grains, Proteins, Pantry).
- **Checklist First**: Tap to cross off items as you shop in the grocery store.
- **One-Click Primary Action**: `[Copy List]` copies formatted grocery items directly to your clipboard.
- **Visual Progress Bar**: Shows instant completion percentage.

---

## 🔬 Deterministic Safety Engine Architecture

The SafePlate Safety Engine operates under a strict deterministic pipeline:

```text
[ Raw Ingredients / Recipe ]
             │
             ▼
   [ Text Normalizer ]  ── (Unicode NFC, strip punctuation, casefold)
             │
             ▼
  [ Cross-Contact Sieve ]  ── (Separates direct ingredients from "May contain / processed on" advisories)
             │
             ▼
 [ Word-Boundary Synonym Matcher ]  ── (Casein, Whey, Arachis, Albumin, Semolina, Spelt, Tahini, etc.)
             │
             ▼
[ Cross-Reactivity & Ambiguity Guard ]  ── (Lupin ↔ Peanut, Goat milk ↔ Bovine dairy, "Natural flavors")
             │
             ▼
  [ Profile Severity Evaluator ]  ── (Applies Avoid, Trace OK, or Life-Threatening thresholds)
             │
             ▼
  [ Output: SAFE 🟢 | CAUTION 🟠 | UNSAFE 🔴 + Exact Reasons ]
```

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React Icons
- **Build Tool**: Vite 6
- **Routing**: React Router DOM (v7)
- **Local Persistence**: IndexedDB via `idb`
- **Testing**: Vitest (18 automated tests for safety engine verification)

---

## 💻 Getting Started Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/<your-username>/safeplate.git
cd safeplate

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Running Automated Safety Tests
```bash
npm test
```
Runs 18 unit tests covering exact matches, multi-word allergens, chemical synonyms, trace sensitivity rules, cross-reactivity, and advisory phrasing.

### Production Build
```bash
npm run build
```
Creates an optimized production bundle in the `dist/` directory.

---

## 📱 Mobile Usability & Accessibility

- Large touch targets (minimum 48px on mobile).
- Fixed bottom navigation bar with thumb-accessible routes.
- Chip selectors and selectable cards replace cumbersome text fields.
- Zero horizontal scrolling on small screens.

---

## ⚠️ Medical Disclaimer

> **SafePlate is a planning and ingredient-checking tool and does not replace medical advice or careful label reading.**  
> Food manufacturers frequently alter formulations and facility practices. Always verify physical packaging labels and consult your board-certified allergist or medical provider for clinical decisions.

---

## 📄 License

MIT License. Built for allergy households everywhere.
