'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MerchantRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin');
  }, [router]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center font-mono text-xs text-faint">
      Redirecting to administrative console...
    </div>
  );
}
