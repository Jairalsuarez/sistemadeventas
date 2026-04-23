import { useMemo, useState } from "react";
import UserForm from "../../components/forms/UserForm";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";
import SectionBlock from "../../components/ui/SectionBlock";

const EMPTY_FORM = { id: "", nombre: "", apellido: "", telefono: "", email: "", role: "vendedor", password: "", avatarUrl: "" };
const fullName = (user = {}) => [user.nombre, user.apellido].filter(Boolean).join(" ").trim() || user.nombre || "Sin nombre";

export default function UsersPage({ onDelete, onSave, sessionMode, users }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const editingUser = useMemo(() => users.find((item) => item.id === form.id) || null, [form.id, users]);
  const supportsCreate = true;

  const orderedUsers = useMemo(() => [...users].sort((a, b) => fullName(a).localeCompare(fullName(b))), [users]);
  const hasChanges = useMemo(() => {
    if (!editingUser) return false;
    return (
      form.nombre.trim() !== (editingUser.nombre || "").trim() ||
      form.apellido.trim() !== (editingUser.apellido || "").trim() ||
      form.telefono.trim() !== (editingUser.telefono || "").trim() ||
      form.role !== editingUser.role
    );
  }, [editingUser, form.apellido, form.nombre, form.role, form.telefono]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await onSave(form);
    if (result?.ok) setForm(EMPTY_FORM);
  };

  const editUser = (user) => {
    setForm({ ...EMPTY_FORM, ...user, password: "" });
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Superadmin" title="Usuarios y permisos" description="Administra las cuentas que operan el sistema y define sus niveles de acceso." />

      {form.id ? (
        <SectionBlock description="Cambia el nombre visible o el rol asignado a una cuenta existente." title="Editar usuario">
          <UserForm disableEmail form={form} isEditing onChange={handleChange} onSubmit={handleSubmit} submitDisabled={!hasChanges} submitLabel="Guardar cambios" />
        </SectionBlock>
      ) : null}

      {!form.id ? (
        <SectionBlock
          description={
            supportsCreate
              ? sessionMode === "supabase"
                ? "Crea usuarios reales de Supabase con correo, telefono, rol y clave temporal."
                : "Crea una nueva cuenta local con correo, rol y clave temporal."
              : "En Supabase, primero crea el usuario en Authentication y luego vuelve aqui para editar su perfil."
          }
          title="Nuevo usuario"
        >
          <UserForm form={form} onChange={handleChange} onSubmit={handleSubmit} showPasswordField submitLabel="Crear usuario" />
        </SectionBlock>
      ) : null}

      <SectionBlock description="Estos son los perfiles activos para operar el negocio." title="Cuentas activas">
        {orderedUsers.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-[#6a7b70] dark:text-white/55">
                <tr>
                  <th className="pb-3">Nombre completo</th>
                  <th className="pb-3">Rol</th>
                  <th className="pb-3">Telefono</th>
                  <th className="pb-3">Permisos</th>
                  <th className="pb-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {orderedUsers.map((user) => (
                  <tr key={user.id} className="border-t border-[#edf1ea] dark:border-white/10">
                    <td className="py-3 font-medium">{fullName(user)}</td>
                    <td className="py-3">{user.role}</td>
                    <td className="py-3">{user.telefono || "Sin numero"}</td>
                    <td className="py-3">{user.role === "superadmin" ? "Acceso total y gestion de usuarios" : user.role === "admin" ? "Control operativo del negocio" : "Registro de ventas"}</td>
                    <td className="py-3">
                      <div className="flex justify-end gap-2">
                        <button className="rounded-md border border-[#dfe7db] px-3 py-2 dark:border-white/10" onClick={() => editUser(user)} type="button">
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState description="Todavia no se han cargado las cuentas activas." title="Sin usuarios" />
        )}
      </SectionBlock>
    </div>
  );
}
