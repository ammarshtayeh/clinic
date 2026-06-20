import { createClient } from "@/lib/supabase/client";

export async function logAudit(
  clinicId: string,
  action: string,
  entityType?: string,
  entityId?: string,
  details?: Record<string, unknown>
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("audit_logs").insert({
    clinic_id: clinicId,
    user_id: user.id,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details: details ?? null,
  });
}
