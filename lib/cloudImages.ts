import { supabase } from "@/lib/supabase";

const BUCKET = "dashboard-images";

export async function uploadDashboardImage(file: File): Promise<{ path: string; signedUrl: string }> {
  const { data: session } = await supabase.auth.getSession();
  const userId = session.session?.user?.id;
  if (!userId) throw new Error("Not logged in");

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });

  if (uploadError) throw new Error(uploadError.message);

  // signed url (private bucket)
  const { data: signed, error: signedError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 7); // 7 days

  if (signedError || !signed?.signedUrl) throw new Error(signedError?.message || "No signed URL");

  return { path, signedUrl: signed.signedUrl };
}
