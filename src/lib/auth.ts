import { supabase } from "@/integrations/supabase/client";

let visitorSession: Promise<string> | null = null;
export async function ensureParticipantSession(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (data.session) return data.session.user.id;
  if (!visitorSession) visitorSession = (async () => {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error || !data.user) throw error ?? new Error("No se pudo iniciar tu sesión de apartado.");
    return data.user.id;
  })();
  try { return await visitorSession; } finally { visitorSession = null; }
}

export async function isAdministrator(): Promise<boolean> {
  const { data: user, error } = await supabase.auth.getUser();
  if (error || !user.user || user.user.is_anonymous) return false;
  const { data, error: roleError } = await supabase.rpc("is_raffle_admin");
  if (roleError) throw roleError;
  return data === true;
}
