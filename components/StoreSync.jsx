'use client';

import { useEffect } from 'react';
import { useStore, STORE_KEY } from '@/lib/store';

// Mounted once at the root layout. Listens for localStorage writes made by
// *other* browser tabs (e.g. a customer submitting the public complaint
// form) and re-hydrates this tab's store so the change shows up live —
// no backend, no polling.
export default function StoreSync() {
  useEffect(() => {
    function onStorage(e) {
      if (e.key === STORE_KEY) {
        useStore.persist.rehydrate();
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  return null;
}
