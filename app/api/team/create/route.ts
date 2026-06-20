import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/mock/config";

export async function POST(request: Request) {
  if (isMockMode()) {
    return NextResponse.json({ error: "Not available in mock mode" }, { status: 503 });
  }

  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Server error" }, { status: 500 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: membership } = await supabase
    .from("clinic_members")
    .select("clinic_id, role")
    .eq("user_id", user.id)
    .eq("role", "owner")
    .single();

  if (!membership) {
    return NextResponse.json({ error: "Only clinic owners can add team members" }, { status: 403 });
  }

  const body = await request.json();
  const { email, password, fullName, role, phone } = body;

  if (!email || !password || !fullName || !role) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const admin = await createAdminClient();
  if (!admin) return NextResponse.json({ error: "Server error" }, { status: 500 });

  const { data: newUser, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      phone: phone ?? "",
      clinic_id: membership.clinic_id,
      role,
    },
  });

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, user_id: newUser.user?.id });
}
