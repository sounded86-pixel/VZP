import { HelpItem, UserProfile } from './types';
import { INITIAL_ITEMS } from './seedData';
import { db } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';

const STORAGE_KEY_ITEMS = 'vzaimo_help_items_v1';
const STORAGE_KEY_PROFILE = 'vzaimo_user_profile_v1';

// Read items from localStorage (offline fallback & instant cache)
export function getLocalItems(): HelpItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ITEMS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading local items:', e);
  }
  // Initialize with seed items if empty
  saveLocalItems(INITIAL_ITEMS);
  return INITIAL_ITEMS;
}

export function saveLocalItems(items: HelpItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
  } catch (e) {
    console.warn('Error saving local items:', e);
  }
}

// User Profile (Name + Phone + Settlement)
export function getLocalProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading local profile:', e);
  }
  return {
    name: '',
    phone: '',
    settlement: 'Шангалы'
  };
}

export function saveLocalProfile(profile: UserProfile) {
  try {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.warn('Error saving local profile:', e);
  }
}

// Live subscribe to Firestore items with offline fallback
export function subscribeToHelpItems(
  onUpdate: (items: HelpItem[]) => void,
  onError?: (error: any) => void
): () => void {
  // First emit local items immediately for instant 0-second render
  const localItems = getLocalItems();
  onUpdate(localItems);

  try {
    const q = query(
      collection(db, 'pwa_items'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteItems: HelpItem[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as HelpItem;
            remoteItems.push({
              ...data,
              id: docSnap.id
            });
          });
          // Cache remotely fetched items locally
          saveLocalItems(remoteItems);
          onUpdate(remoteItems);
        } else {
          // If Firestore collection is empty, seed it with initial items
          seedFirestoreIfEmpty();
        }
      },
      (error) => {
        console.warn('Firestore subscription offline/fallback mode:', error.message);
        if (onError) onError(error);
        // Fall back to local items
        onUpdate(getLocalItems());
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Firestore subscription init error:', err);
    return () => {};
  }
}

// Seed Firestore once if collection has no items
async function seedFirestoreIfEmpty() {
  try {
    for (const item of INITIAL_ITEMS) {
      await setDoc(doc(db, 'pwa_items', item.id), item);
    }
  } catch (e) {
    console.warn('Seeding Firestore skipped or offline:', e);
  }
}

// Add a new help item (saves locally + tries Firestore sync)
export async function createHelpItem(item: HelpItem): Promise<void> {
  // 1. Save locally first (instant UI update)
  const current = getLocalItems();
  const updated = [item, ...current];
  saveLocalItems(updated);

  // 2. Sync to Firestore in background
  try {
    await setDoc(doc(db, 'pwa_items', item.id), item);
  } catch (error) {
    console.warn('Background Firestore write failed (offline mode):', error);
  }
}

// Update item status (e.g. mark as completed / resolved)
export async function toggleItemStatus(itemId: string, newStatus: 'active' | 'completed'): Promise<void> {
  const current = getLocalItems();
  const updated = current.map(item => item.id === itemId ? { ...item, status: newStatus } : item);
  saveLocalItems(updated);

  try {
    await updateDoc(doc(db, 'pwa_items', itemId), { status: newStatus });
  } catch (e) {
    console.warn('Failed to update status on Firestore:', e);
  }
}

// Delete item
export async function deleteHelpItem(itemId: string): Promise<void> {
  const current = getLocalItems();
  const updated = current.filter(item => item.id !== itemId);
  saveLocalItems(updated);

  try {
    await deleteDoc(doc(db, 'pwa_items', itemId));
  } catch (e) {
    console.warn('Failed to delete on Firestore:', e);
  }
}
