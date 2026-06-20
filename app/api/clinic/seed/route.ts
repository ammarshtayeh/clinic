import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: existing } = await supabase
    .from("clinic_members")
    .select("id")
    .eq("user_id", user.id)
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json({ ok: true, message: "Clinic already exists" });
  }

  const clinicName = user.user_metadata?.clinic_name ?? `عيادة ${user.user_metadata?.full_name ?? "جديدة"}`;

  const { data: clinic, error: clinicError } = await supabase
    .from("clinics")
    .insert({ name: clinicName, owner_id: user.id, phone: user.user_metadata?.phone, email: user.email })
    .select()
    .single();

  if (clinicError) {
    return NextResponse.json({ error: clinicError.message }, { status: 500 });
  }

  await supabase.from("clinic_members").insert({
    clinic_id: clinic.id,
    user_id: user.id,
    role: "owner",
  });

  await supabase.rpc("seed_default_procedures", { p_clinic_id: clinic.id });

  return NextResponse.json({ ok: true, clinic_id: clinic.id });
}
