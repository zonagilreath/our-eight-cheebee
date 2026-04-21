import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { ListItem } from '../types';

const LIST_COLLECTION = 'list_items';

interface FirestoreListItem {
  product_id: string | null;
  name: string;
  image_url: string | null;
  price: number | null;
  quantity: number;
  added_by: 'zona' | 'whitney';
  checked_off: boolean;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
}

function toListItem(id: string, data: FirestoreListItem): ListItem {
  return {
    id,
    product_id: data.product_id,
    name: data.name,
    image_url: data.image_url,
    price: data.price,
    quantity: data.quantity,
    added_by: data.added_by,
    checked_off: data.checked_off,
    created_at: data.created_at?.toDate().toISOString() ?? new Date().toISOString(),
    updated_at: data.updated_at?.toDate().toISOString() ?? new Date().toISOString(),
  };
}

export function useSharedList() {
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Timeout fallback: if Firestore never responds (dev with placeholder config), stop loading
    const timeout = setTimeout(() => setLoading(false), 3000);

    const q = query(collection(db, LIST_COLLECTION), orderBy('created_at', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      clearTimeout(timeout);
      const newItems = snapshot.docs.map((d) =>
        toListItem(d.id, d.data() as FirestoreListItem)
      );
      setItems(newItems);
      setLoading(false);
    }, () => {
      clearTimeout(timeout);
      setLoading(false);
    });

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  const addItem = useCallback(
    async (item: Omit<ListItem, 'id' | 'created_at' | 'updated_at'>) => {
      await addDoc(collection(db, LIST_COLLECTION), {
        ...item,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
    },
    []
  );

  const updateItem = useCallback(async (id: string, updates: Partial<ListItem>) => {
    const { id: _id, created_at: _ca, ...rest } = updates as Record<string, unknown>;
    void _id; void _ca;
    await updateDoc(doc(db, LIST_COLLECTION, id), {
      ...rest,
      updated_at: serverTimestamp(),
    });
  }, []);

  const removeItem = useCallback(async (id: string) => {
    await deleteDoc(doc(db, LIST_COLLECTION, id));
  }, []);

  const toggleChecked = useCallback(
    async (id: string) => {
      const item = items.find((i) => i.id === id);
      if (item) {
        await updateItem(id, { checked_off: !item.checked_off });
      }
    },
    [items, updateItem]
  );

  const updateQuantity = useCallback(
    async (id: string, quantity: number) => {
      if (quantity < 1) {
        await removeItem(id);
      } else {
        await updateItem(id, { quantity });
      }
    },
    [updateItem, removeItem]
  );

  const uncheckedItems = items.filter((i) => !i.checked_off);
  const checkedItems = items.filter((i) => i.checked_off);

  return {
    items,
    uncheckedItems,
    checkedItems,
    loading,
    addItem,
    updateItem,
    removeItem,
    toggleChecked,
    updateQuantity,
  };
}
