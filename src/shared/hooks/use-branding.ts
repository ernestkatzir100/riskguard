'use client';

import { useState, useEffect } from 'react';

export type Branding = {
  companyName: string;
  logoUrl: string | null;
  brandColor: string | null;
};

const STORAGE_KEY = 'rg-branding';
const DEFAULT: Branding = { companyName: '', logoUrl: null, brandColor: null };

function loadCache(): Branding | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Branding;
  } catch { /* ignore */ }
  return null;
}

function saveCache(b: Branding) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(b)); } catch { /* ignore */ }
}

export function useBranding() {
  const [branding, setBranding] = useState<Branding>(() => loadCache() || DEFAULT);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { getBranding } = await import('@/app/actions/settings');
        const data = await getBranding();
        if (!cancelled) {
          setBranding(data);
          saveCache(data);
        }
      } catch {
        // Use cached or default
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const refresh = async () => {
    try {
      const { getBranding } = await import('@/app/actions/settings');
      const data = await getBranding();
      setBranding(data);
      saveCache(data);
    } catch { /* ignore */ }
  };

  return { branding, refresh };
}
