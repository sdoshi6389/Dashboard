import { supabase } from "@/lib/supabase";
import type { FullState } from "@/types/state";

export async function getSessionUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

export async function loadCloudState(): Promise<FullState | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from("dashboard_state")
    .select("state")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data?.state as FullState) ?? null;
}

export async function saveCloudState(state: FullState): Promise<void> {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Not logged in");

  const { error } = await supabase
    .from("dashboard_state")
    .upsert({ user_id: userId, state, updated_at: new Date().toISOString() });

  if (error) throw new Error(error.message);
}
