import { AllergenRule } from '../safety/types';

export interface UserProfile {
  id: string;
  name: string;
  relationship: string;
  avatarUrl?: string;
  allergens: AllergenRule[];
  customAllergens: string[];
  sharedKitchenNotes: string[];
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
];
