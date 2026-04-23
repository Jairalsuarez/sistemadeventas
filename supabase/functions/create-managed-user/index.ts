import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json({ error: "Metodo no permitido." }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const authHeader = request.headers.get("Authorization");

  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: "Faltan variables de entorno de Supabase en la Edge Function." }, 500);
  }

  if (!authHeader) {
    return json({ error: "Falta el token de autorizacion." }, 401);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const token = authHeader.replace("Bearer ", "").trim();
  const {
    data: { user: actor },
    error: actorError,
  } = await adminClient.auth.getUser(token);

  if (actorError || !actor) {
    return json({ error: actorError?.message || "No se pudo validar la sesion del administrador." }, 401);
  }

  const { data: actorProfile, error: actorProfileError } = await adminClient
    .from("profiles")
    .select("id, role")
    .eq("id", actor.id)
    .maybeSingle();

  if (actorProfileError) {
    return json({ error: actorProfileError.message }, 400);
  }

  if (!actorProfile || !["admin", "superadmin"].includes(String(actorProfile.role || "").toLowerCase())) {
    return json({ error: "Solo administracion puede crear usuarios." }, 403);
  }

  const payload = await request.json().catch(() => null);
  const nombre = String(payload?.nombre || "").trim();
  const apellido = String(payload?.apellido || "").trim();
  const telefono = String(payload?.telefono || "").trim();
  const email = String(payload?.email || "").trim().toLowerCase();
  const password = String(payload?.password || "").trim();
  const role = String(payload?.role || "vendedor").trim().toLowerCase();

  if (!nombre || !telefono || !email || !password) {
    return json({ error: "Completa nombre, telefono, correo y clave temporal." }, 400);
  }

  if (!["admin", "vendedor", "superadmin"].includes(role)) {
    return json({ error: "Rol invalido." }, 400);
  }

  const { data: createdUser, error: createUserError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      nombre,
      apellido,
      telefono,
      role,
    },
  });

  if (createUserError || !createdUser.user) {
    return json({ error: createUserError?.message || "No se pudo crear el usuario en Authentication." }, 400);
  }

  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .upsert({
      id: createdUser.user.id,
      nombre,
      apellido,
      telefono,
      role,
      updated_at: new Date().toISOString(),
    })
    .select("id, nombre, apellido, telefono, role, avatar_url, created_at")
    .single();

  if (profileError) {
    await adminClient.auth.admin.deleteUser(createdUser.user.id);
    return json({ error: profileError.message }, 400);
  }

  return json({
    user: {
      id: profile.id,
      nombre: profile.nombre,
      apellido: profile.apellido || "",
      telefono: profile.telefono || "",
      role: profile.role,
      avatarUrl: profile.avatar_url || "",
      email,
      createdAt: profile.created_at,
    },
  });
});
