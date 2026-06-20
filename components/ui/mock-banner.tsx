"use client";

import { isUsingMockData } from "@/lib/supabase/client";

export function MockBanner() {
  if (!isUsingMockData()) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-200 bg-gradient-to-l from-amber-50 to-amber-100/80 px-4 py-3 text-sm">
      <div>
        <span className="font-black text-amber-900">⚡ وضع تجريبي</span>
        <span className="mr-2 text-amber-700">— البيانات محفوظة محلياً في المتصفح (Mock Data)</span>
      </div>
      <div className="text-xs text-amber-600" dir="ltr">
        owner: ammar.shtayeh@gmail.com · doctor: ammar.ammar@gmail.com
      </div>
    </div>
  );
}
