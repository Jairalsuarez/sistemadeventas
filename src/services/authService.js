import { getAppData } from "./appDataService.js";
import { supabase, supabaseReady } from "./supabaseclient";
import { buildDisplayName } from "./normalizers.js";
import { fetchSupabaseProfile } from "./profileService.js";

const SESSION_KEY = "ventas-local-session-v2";
const DAYS = 90;

function secureSuffix() {
  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    return "; Secure";
  }
  return "";
}

function writeCookie(name, value, days = DAYS) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${secureSuffix()}`;
}

function readCookie(name) {
  const chunk = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));
  return chunk ? decodeURIComponent(chunk.split("=").slice(1).join("=")) : null;
}

function removeCookie(name) {
  document.cookie = `${name}=; path=/; SameSite=Lax${secureSuffix()}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export function getSession() {
  try {
    const raw = readCookie(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      removeCookie(SESSION_KEY);
      return null;
    }
    if (session.mode === "supabase") {
      removeCookie(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    removeCookie(SESSION_KEY);
    return null;
  }
}

function createSession(user, mode = "local") {
  const session = {
    userId: user.id,
    role: user.role,
    nombre: user.nombre,
    apellido: user.apellido || "",
    email: user.email,
    avatarUrl: user.avatarUrl || "",
    displayName: buildDisplayName(user),
    mode,
    expiresAt: new Date(Date.now() + DAYS * 24 * 60 * 60 * 1000).toISOString(),
  };
  return session;
}

function persistLocalSession(user) {
  const session = createSession(user, "local");
  writeCookie(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function clearSession() {
  removeCookie(SESSION_KEY);
}

async function loginSupabase(email, password) {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: error.message };

    const profileResult = await fetchSupabaseProfile(data.user.id);
    if (!profileResult.ok) {
      await supabase.auth.signOut();
      return { ok: false, error: `${profileResult.error} UID autenticado: ${data.user.id}.` };
    }

    return {
      ok: true,
      session: createSession(
        {
          id: data.user.id,
          email: data.user.email,
          nombre: profileResult.profile.nombre || data.user.email,
          apellido: profileResult.profile.apellido || "",
          role: profileResult.profile.role,
          avatarUrl: profileResult.profile.avatarUrl || "",
        },
        "supabase"
      ),
    };
  } catch {
    return { ok: false, error: "No se pudo conectar con Supabase." };
  }
}

function loginLocal(email, password) {
  const app = getAppData();
  const user = app.users.find(
    (item) => item.email?.trim().toLowerCase() === email.trim().toLowerCase() && item.password === password
  );
  if (!user) return { ok: false, error: "Credenciales invalidas." };
  return { ok: true, session: persistLocalSession(user) };
}

export async function loginUser({ email, password }) {
  const clean = email.trim().toLowerCase();
  if (supabaseReady) {
    return loginSupabase(clean, password);
  }
  return loginLocal(clean, password);
}

export async function refreshSupabaseSession(localSession) {
  if (!supabaseReady || !supabase || localSession?.mode !== "supabase") return { ok: false };

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) return { ok: false, error: error?.message || "No hay usuario autenticado en Supabase." };

  const profileResult = await fetchSupabaseProfile(data.user.id);
  if (!profileResult.ok) return { ok: false, error: profileResult.error };

  return {
    ok: true,
    session: createSession(
      {
        id: data.user.id,
        email: data.user.email,
        nombre: profileResult.profile.nombre || data.user.email,
        apellido: profileResult.profile.apellido || "",
        role: profileResult.profile.role,
        avatarUrl: profileResult.profile.avatarUrl || "",
      },
      "supabase"
    ),
  };
}

export async function restoreSupabaseSession() {
  if (!supabaseReady || !supabase) return { ok: false };

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) return { ok: false, error: error?.message || "No hay sesión activa." };

  const profileResult = await fetchSupabaseProfile(data.user.id);
  if (!profileResult.ok) return { ok: false, error: profileResult.error };

  return {
    ok: true,
    session: createSession({
      id: data.user.id,
      email: data.user.email,
      nombre: profileResult.profile.nombre || data.user.email,
      apellido: profileResult.profile.apellido || "",
      role: profileResult.profile.role,
      avatarUrl: profileResult.profile.avatarUrl || "",
    }, "supabase"),
  };
}

export async function logoutSupabaseSession() {
  if (!supabaseReady || !supabase) return;
  await supabase.auth.signOut();
}

export async function verifySupabasePassword(email, password) {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };
  if (!email || !password) return { ok: false, error: "Ingresa tu correo y contrasena actual." };

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo validar tu contrasena actual." };
  }
}
