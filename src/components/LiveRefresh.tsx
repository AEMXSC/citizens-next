'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Polls the server components on an interval so a fragment published in AEM
// appears in the app within a few seconds, no manual reload. Disabled inside
// the Universal Editor iframe so it never clobbers an in-progress edit
// (matches the NYL app's inEditor guard).
export default function LiveRefresh({ intervalMs = 10000 }: { intervalMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== 'undefined' && window.self !== window.top) return undefined;
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);
  return null;
}
