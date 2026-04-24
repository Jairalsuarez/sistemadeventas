import { useMemo } from "react";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";
import SectionBlock from "../../components/ui/SectionBlock";

const fullName = (user = {}) => [user.nombre, user.apellido].filter(Boolean).join(" ").trim() || user.nombre || "Sin nombre";

export default function UsersPage({ users }) {
  const orderedUsers = useMemo(() => [...users].sort((a, b) => fullName(a).localeCompare(fullName(b))), [users]);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin" title="Usuarios y permisos" />

      <SectionBlock description="Estos son los perfiles activos para operar el negocio." title="Cuentas activas">
        {orderedUsers.length ? (
          <>
            <div className="space-y-3 md:hidden">
              {orderedUsers.map((user) => (
                <article key={user.id} className="rounded-xl border border-[#edf1ea] p-4 dark:border-white/10 dark:bg-[#182235]">
                  <div className="space-y-3">
                    <div>
                      <strong className="block text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">{fullName(user)}</strong>
                      <span className="mt-1 inline-flex rounded-full bg-[#f4f8ef] px-3 py-1 text-xs font-semibold text-[#56705d] dark:bg-[#0f172a] dark:text-[#93c5fd]">{user.role}</span>
                    </div>
                    <div className="grid gap-2 text-sm text-[#5b6d61] dark:text-[#c7d2e0]">
                      <p>Teléfono: {user.telefono || "Sin número"}</p>
                      <p>Permisos: {user.role === "admin" ? "Control operativo del negocio" : "Registro de ventas"}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
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
          </>
        ) : (
          <EmptyState description="Todavia no se han cargado las cuentas activas." title="Sin usuarios" />
        )}
      </SectionBlock>
    </div>
  );
}
