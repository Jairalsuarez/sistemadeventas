import { NavLink } from "react-router-dom";
import Icon from "../ui/Icon";
import { isNativeApp } from "../../utils/platform.js";

const baseLink = "flex items-center gap-3 rounded-md px-4 py-3 text-base font-medium transition whitespace-nowrap";

export default function SideNav({ businessName = "Sabores Tropicales", isAdmin, open = false, onClose = () => {}, user }) {
  const nativeApp = isNativeApp();
  const links = [
    { to: "/panel", label: "Resumen", icon: "dashboard", end: true },
    { to: "/panel/saldo", label: "Saldo", icon: "account_balance_wallet" },
    { to: "/panel/productos", label: "Productos", icon: "inventory_2" },
    { to: "/panel/perfil", label: "Perfil", icon: "person" },
  ];

  if (isAdmin) {
    links.splice(2, 0, { to: "/panel/agenda", label: "Agenda", icon: "calendar_month" });
    links.splice(3, 0, { to: "/panel/analitica", label: "Ventas", icon: "monitoring" });
  }

  return (
    <>
    {nativeApp && open ? <button aria-label="Cerrar menu" className="fixed inset-0 z-40 bg-[#0b1220]/38" onClick={onClose} type="button" /> : null}
    <aside className={nativeApp ? `fixed inset-y-0 left-0 z-50 w-[min(82vw,320px)] origin-left overflow-hidden bg-white shadow-[18px_0_34px_rgba(15,23,42,0.18)] transition-[opacity,transform] duration-150 ease-out dark:bg-[#0b1220] ${open ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-full opacity-0"}` : "w-full shrink-0 border-b border-[#edf1ea] px-4 py-4 dark:border-[#23314d] lg:w-[270px] lg:border-b-0 lg:border-r lg:px-4 lg:py-6"}>
      {nativeApp ? (
        <div className="bg-[#f7faf6] px-5 pb-5 pt-[calc(env(safe-area-inset-top)+1.25rem)] dark:bg-[#111827]">
          <div className="flex items-start justify-between gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white text-[#1f7a3a] shadow-sm dark:bg-[#0f172a] dark:text-[#93c5fd]">
              {user?.avatarUrl ? <img alt={user.displayName || user.email || "Usuario"} className="h-full w-full object-cover" src={user.avatarUrl} /> : <Icon name="person" />}
            </span>
            <button className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[#5b6d61] active:bg-white dark:text-[#c7d2e0] dark:active:bg-[#0f172a]" onClick={onClose} type="button">
              <Icon name="close" />
            </button>
          </div>
          <div className="mt-4 min-w-0">
            <strong className="block truncate text-base font-semibold text-[#183325] dark:text-[#f8fafc]">{user?.displayName || businessName}</strong>
            <span className="mt-1 block truncate text-xs text-[#6a7b70] dark:text-[#94a3b8]">{user?.email || "Panel administrativo"}</span>
          </div>
        </div>
      ) : null}
      <nav className={nativeApp ? "grid gap-1 p-3" : "flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0"}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            className={({ isActive }) =>
              nativeApp
                ? `relative flex min-h-[48px] items-center gap-3 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors active:bg-[#eef5ef] ${
                    isActive ? "bg-[#eef5ef] text-[#166534] dark:bg-[#1e293b] dark:text-[#f8fafc]" : "text-[#35463c] hover:bg-[#f7faf6] dark:text-[#c7d2e0] dark:hover:bg-[#111827]"
                  }`
                : `${baseLink} min-w-max lg:min-w-0 ${isActive ? "bg-[#f6f3ea] text-[#183325] dark:bg-[#1e293b] dark:text-[#f8fafc]" : "text-[#5b6d61] hover:bg-[#f7faf6] dark:text-[#c7d2e0] dark:hover:bg-[#111827]"}`
            }
            end={link.end}
            onClick={nativeApp ? onClose : undefined}
            to={link.to}
          >
            <Icon className={nativeApp ? "text-[23px]" : ""} name={link.icon} />
            <span className="max-w-full truncate">{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
    </>
  );
}
