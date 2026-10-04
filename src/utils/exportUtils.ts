import { GroceryItem, GROCERY_CATEGORIES } from '../types/grocery';

export function formatGroceryListAsText(items: GroceryItem[], activeProfileName: string = 'Household'): string {
  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  let text = `🛒 SafePlate Shopping List (${dateStr})\n`;
  text += `🛡️ Screened for: ${activeProfileName} (Allergen-Safe Protocol)\n\n`;

  for (const cat of GROCERY_CATEGORIES) {
    const catItems = items.filter((i) => i.category === cat);
    if (catItems.length === 0) continue;

    text += `[${cat.toUpperCase()}]\n`;
    for (const item of catItems) {
      const check = item.checked ? '✓' : '□';
      text += `${check} ${item.name} (${item.quantity})\n`;
    }
    text += '\n';
  }

  text += `Generated with SafePlate - 100% Local & Allergy-Safe`;
  return text;
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      textArea.remove();
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
    return false;
  }
}
