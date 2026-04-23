export default function useAccountActions({
  session,
  user,
  users,
  commit,
  setSession,
  notify,
  inform,
  personName,
  mergeUsers,
  createRemoteManagedUser,
  updateRemoteProfile,
}) {
  const canManageUsers = user?.role === "superadmin";

  const saveProfile = async ({ nombre, apellido, telefono, avatarUrl }) => {
    const cleanName = nombre.trim();
    const cleanLastName = apellido.trim();
    const cleanPhone = telefono.trim();
    if (!cleanName) return inform("El nombre no puede quedar vacio.", "warning");
    if (!cleanPhone) return inform("Agrega un numero de telefono para tu perfil.", "warning");

    const nextUser = {
      ...user,
      nombre: cleanName,
      apellido: cleanLastName,
      telefono: cleanPhone,
      avatarUrl: avatarUrl || user?.avatarUrl || "",
    };
    const remote = session?.mode === "supabase" ? await updateRemoteProfile(nextUser) : { ok: false };
    const finalUser = remote.ok ? { ...nextUser, ...remote.profile } : nextUser;

    commit((current) => ({
      ...current,
      users: mergeUsers(
        current.users.map((item) => (item.id === finalUser.id ? { ...item, ...finalUser } : item)),
        []
      ),
    }));
    setSession((current) =>
      current
        ? {
            ...current,
            nombre: finalUser.nombre,
            apellido: finalUser.apellido || "",
            telefono: finalUser.telefono || "",
            avatarUrl: finalUser.avatarUrl || "",
            displayName: personName(finalUser),
          }
        : current
    );
    notify(`${personName(finalUser)} actualizo su perfil.`, personName(finalUser));
    inform("Perfil actualizado.", "success");
  };

  const saveManagedUser = async (payload) => {
    if (!canManageUsers) return inform("Solo el superadmin puede gestionar usuarios.", "warning");
    if (!payload.id) {
      const cleanEmail = payload.email.trim().toLowerCase();
      const cleanName = payload.nombre.trim();
      const cleanPhone = payload.telefono.trim();
      if (!cleanName || !cleanEmail || !cleanPhone || !payload.password.trim()) {
        inform("Completa nombre, telefono, correo y clave temporal.", "warning");
        return { ok: false };
      }

      if (session?.mode === "supabase") {
        const remoteCreate = await createRemoteManagedUser({
          nombre: cleanName,
          apellido: payload.apellido.trim(),
          telefono: cleanPhone,
          email: cleanEmail,
          password: payload.password.trim(),
          role: payload.role,
        });

        if (!remoteCreate.ok) {
          inform(remoteCreate.error || "No se pudo crear el usuario en Supabase.", "error");
          return { ok: false };
        }

        commit((current) => ({
          ...current,
          users: mergeUsers(current.users, [remoteCreate.user]),
        }));
        inform("Usuario creado.", "success");
        notify(`${personName(user)} creo a ${personName(remoteCreate.user)}.`, personName(user));
        return { ok: true, user: remoteCreate.user };
      }

      const exists = users.some((item) => item.email?.trim().toLowerCase() === cleanEmail);
      if (exists) {
        inform("Ya existe una cuenta con ese correo.", "warning");
        return { ok: false };
      }

      const newUser = {
        id: crypto.randomUUID(),
        nombre: cleanName,
        apellido: payload.apellido.trim(),
        telefono: cleanPhone,
        email: cleanEmail,
        role: payload.role,
        avatarUrl: payload.avatarUrl || "",
        password: payload.password.trim(),
        source: "local",
      };

      commit((current) => ({
        ...current,
        users: [newUser, ...current.users],
      }));
      inform("Usuario creado.", "success");
      notify(`${personName(user)} creo a ${personName(newUser)}.`, personName(user));
      return { ok: true, user: newUser };
    }

    const record = {
      id: payload.id,
      nombre: payload.nombre.trim(),
      apellido: payload.apellido.trim(),
      telefono: payload.telefono.trim(),
      role: payload.role,
      avatarUrl: payload.avatarUrl || "",
    };

    if (!record.nombre || !record.telefono) return inform("Completa el nombre y telefono del usuario.", "warning");

    const remote = session?.mode === "supabase" ? await updateRemoteProfile(record) : { ok: false };
    const finalUser = remote.ok ? { ...payload, ...remote.profile } : { ...payload, ...record };

    commit((current) => ({
      ...current,
      users: current.users.map((item) => (item.id === payload.id ? { ...item, ...finalUser } : item)),
    }));
    inform("Usuario actualizado.", "success");
    notify(`${personName(user)} actualizo a ${personName(finalUser)}.`, personName(user));
    return { ok: true, user: finalUser };
  };

  const deleteManagedUser = () => {
    if (!canManageUsers) return inform("Solo el superadmin puede gestionar usuarios.", "warning");
    inform("Para eliminar una cuenta, usa la configuracion interna del negocio.", "warning");
  };

  return {
    saveProfile,
    saveManagedUser,
    deleteManagedUser,
  };
}
