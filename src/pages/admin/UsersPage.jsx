import { useMemo } from "react";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";
import SectionBlock from "../../components/ui/SectionBlock";

const fullName = (user = {}) => [user.nombre, user.apellido].filter(Boolean).join(" ").trim() || user.nombre || "Sin nombre";

export default function UsersPage({ users }) {
  const orderedUsers = useMemo(() => [...users].sort((a, b) => fullName(a).localeCompare(fullName(b))), [users]);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin" title="Usuarios y permisos" description="Consulta las cuentas que operan el sistema. La creacion y cambios de usuarios se gestionan directamente en Supabase." />

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
                </tr>
              </thead>
              <tbody>
                {orderedUsers.map((user) => (
                  <tr key={user.id} className="border-t border-[#edf1ea] dark:border-white/10">
                    <td className="py-3 font-medium">{fullName(user)}</td>
                    <td className="py-3">{user.role}</td>
                    <td className="py-3">{user.telefono || "Sin numero"}</td>
                    <td className="py-3">{user.role === "admin" ? "Control operativo del negocio" : "Registro de ventas"}</td>
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
