"use server";

import { createAdminClient } from "@/supabase/server";

export async function uploadImageAction(formData: FormData) {
  const file = formData.get("file") as File;
  const bucket = formData.get("bucket") as string;
  const fileName = formData.get("fileName") as string;

  if (!file || !bucket || !fileName) {
    throw new Error("Missing required fields for upload");
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file);

  if (error) {
    throw new Error(error.message || "Upload failed");
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}
