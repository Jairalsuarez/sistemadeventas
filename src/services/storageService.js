import { supabase, supabaseReady } from "./supabaseclient";

const STORAGE_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || "product-images";

export const cloudinaryReady = Boolean(
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME && import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
);

export const storageReady = Boolean(supabaseReady && STORAGE_BUCKET);

async function uploadToCloudinary(file) {
  if (!cloudinaryReady) {
    throw new Error("Supabase Storage no responde y Cloudinary no esta configurado.");
  }

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
  form.append("folder", import.meta.env.VITE_CLOUDINARY_FOLDER || "productos");

  const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) throw new Error("Fallo la subida de la imagen.");
  const data = await res.json();
  return data.secure_url;
}

export async function uploadImage(file, folder = "products") {
  if (storageReady && supabase) {
    const extension = file.name.split(".").pop() || "jpg";
    const path = `${folder}/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, { upsert: false });
    if (!error) {
      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      if (data?.publicUrl) {
        return data.publicUrl;
      }

      const signed = await supabase.storage.from(STORAGE_BUCKET).createSignedUrl(path, 60 * 60 * 24 * 30);
      if (!signed.error && signed.data?.signedUrl) {
        return signed.data.signedUrl;
      }
    }
  }

  return uploadToCloudinary(file);
}
