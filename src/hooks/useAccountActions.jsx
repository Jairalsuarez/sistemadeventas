export default function useAccountActions({
  session,
  user,
  commit,
  setSession,
  notify,
  inform,
  personName,
  mergeUsers,
  updateRemoteProfile,
}) {
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

  return {
    saveProfile,
  };
}
