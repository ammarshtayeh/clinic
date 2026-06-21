"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Clinic } from "@/lib/types/database";

export function useClinics() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const load = useCallback(async () => {
    const { data } = await supabase.from("clinics").select("*").order("created_at", { ascending: false });
    setClinics((data ?? []) as Clinic[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const update = useCallback(
    async (id: string, patch: Partial<Clinic>) => {
      await supabase.from("clinics").update(patch).eq("id", id);
      await load();
    },
    [supabase, load]
  );

  return { clinics, loading, reload: load, update };
}
