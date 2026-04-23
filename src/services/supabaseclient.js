import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  "";

function secureSuffix() {
  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    return "; Secure";
  }
  return "";
}

const cookieStorage = {
  getItem(storageKey) {
    if (typeof document === "undefined") return null;
    const chunk = document.cookie
      .split("; ")
      .find((item) => item.startsWith(`${storageKey}=`));
    return chunk ? decodeURIComponent(chunk.split("=").slice(1).join("=")) : null;
  },
  setItem(storageKey, value) {
    if (typeof document === "undefined") return;
    document.cookie = `${storageKey}=${encodeURIComponent(value)}; path=/; SameSite=Lax${secureSuffix()}; max-age=${60 * 60 * 24 * 30}`;
  },
  removeItem(storageKey) {
    if (typeof document === "undefined") return;
    document.cookie = `${storageKey}=; path=/; SameSite=Lax${secureSuffix()}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  },
};

export const supabaseReady = Boolean(url && key);

export const supabase = supabaseReady
  ? createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "ventas-supabase-auth",
        storage: cookieStorage,
      },
    })
  : null;
