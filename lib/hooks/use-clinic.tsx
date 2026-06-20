"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Clinic, ClinicMember, Profile } from "@/lib/types/database";

interface ClinicContextValue {
  user: User | null;
  profile: Profile | null;
  clinic: Clinic | null;
  membership: ClinicMember | null;
  isSuperAdmin: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
}

const ClinicContext = createContext<ClinicContextValue>({
  user: null,
  profile: null,
  clinic: null,
  membership: null,
  isSuperAdmin: false,
  loading: true,
  refresh: async () => {},
});

export function ClinicProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [membership, setMembership] = useState<ClinicMember | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const refresh = useCallback(async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    setUser(currentUser);

    if (!currentUser) {
      setProfile(null);
      setClinic(null);
      setMembership(null);
      setLoading(false);
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", currentUser.id)
      .single();
    setProfile(profileData as Profile | null);

    const { data: memberData } = await supabase
      .from("clinic_members")
      .select("*, clinic:clinics(*)")
      .eq("user_id", currentUser.id)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (memberData) {
      setMembership(memberData as ClinicMember);
      setClinic((memberData as { clinic: Clinic }).clinic);
    } else {
      setMembership(null);
      setClinic(null);
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    refresh();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => refresh());
    return () => subscription.unsubscribe();
  }, [refresh, supabase]);

  return (
    <ClinicContext.Provider value={{
      user,
      profile,
      clinic,
      membership,
      isSuperAdmin: profile?.is_super_admin ?? false,
      loading,
      refresh,
    }}>
      {children}
    </ClinicContext.Provider>
  );
}

export function useClinic() {
  return useContext(ClinicContext);
}
