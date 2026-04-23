import { supabase, supabaseReady } from "./supabaseclient";
import { buildDisplayName, normalizeProfile, normalizeRole } from "./normalizers.js";

async function fetchSupabaseProfile(userId) {
  if (!supabaseReady || !supabase || !userId) return { ok: false, error: "Supabase no configurado." };

  let { data, error } = await supabase
    .from("profiles")
    .select("id, role, nombre, apellido, telefono, avatar_url")
    .eq("id", userId)
    .maybeSingle();

  if (error && String(error.message || "").toLowerCase().includes("avatar_url")) {
    ({ data, error } = await supabase.from("profiles").select("id, role, nombre, apellido, telefono").eq("id", userId).maybeSingle());
  }

  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "No existe perfil para este usuario en profiles." };

  return { ok: true, profile: normalizeProfile(data) };
}

export async function fetchRemoteProfiles() {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };
  let { data, error } = await supabase
    .from("profiles")
    .select("id,nombre,apellido,telefono,role,avatar_url,created_at")
    .order("created_at", { ascending: false });

  if (error && String(error.message || "").toLowerCase().includes("avatar_url")) {
    ({ data, error } = await supabase.from("profiles").select("id,nombre,apellido,telefono,role,created_at").order("created_at", { ascending: false }));
  }

  if (error) return { ok: false, error: error.message };
  return { ok: true, profiles: (data || []).map(normalizeProfile) };
}

export async function updateRemoteProfile(profile) {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };

  const payload = {
    nombre: profile.nombre,
    apellido: profile.apellido || "",
    telefono: profile.telefono || "",
    role: normalizeRole(profile.role),
    avatar_url: profile.avatarUrl || null,
  };

  let { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", profile.id)
    .select("id,nombre,apellido,telefono,role,avatar_url,created_at")
    .single();

  if (error && String(error.message || "").toLowerCase().includes("avatar_url")) {
    const fallbackPayload = {
      nombre: profile.nombre,
      apellido: profile.apellido || "",
      telefono: profile.telefono || "",
      role: normalizeRole(profile.role),
    };

    ({ data, error } = await supabase
      .from("profiles")
      .update(fallbackPayload)
      .eq("id", profile.id)
      .select("id,nombre,apellido,telefono,role,created_at")
      .single());
  }

  if (error) return { ok: false, error: error.message };
  return { ok: true, profile: normalizeProfile(data) };
}

export function mergeUsers(localUsers = [], remoteProfiles = []) {
  if (supabaseReady) return [...remoteProfiles];
  const map = new Map();
  [...localUsers, ...remoteProfiles].forEach((item) => {
    if (!item?.id) return;
    const current = map.get(item.id) || {};
    map.set(item.id, { ...current, ...item });
  });
  return [...map.values()];
}

export { buildDisplayName, fetchSupabaseProfile };
