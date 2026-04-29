import { NavLink } from "react-router-dom";
import Icon from "../ui/Icon";
import { isNativeApp } from "../../utils/platform.js";

const baseLink = "flex items-center gap-3 rounded-md px-4 py-3 text-base font-medium transition whitespace-nowrap";

export default function SideNav({ isAdmin, open = false, onClose = () => {} }) {
  const nativeApp = isNativeApp();
  const links = [
    { to: "/panel", label: "Dashboard", icon: "dashboard", end: true },
    { to: "/panel/cartera", label: "Cartera", icon: "account_balance_wallet" },
    { to: "/panel/productos", label: "Productos", icon: "inventory_2" },
    { to: "/panel/perfil", label: "Perfil", icon: "person" },
  ];

  if (isAdmin) {
    links.splice(2, 0, { to: "/panel/agenda", label: "Agenda", icon: "calendar_month" });
    links.splice(3, 0, { to: "/panel/usuarios", label: "Usuarios", icon: "groups" });
    links.splice(4, 0, { to: "/panel/analitica", label: "Ventas", icon: "monitoring" });
  }

  return (
    <>
    {nativeApp && open ? <button aria-label="Cerrar menu" className="fixed inset-0 z-40 bg-transparent lg:hidden" onClick={onClose} type="button" /> : null}
    <aside className={nativeApp ? `fixed left-3 top-[calc(env(safe-area-inset-top)+7.4rem)] z-50 w-[min(320px,calc(100vw-1.5rem))] origin-top-left rounded-2xl border border-[#dfe7db] bg-white p-2 shadow-[0_12px_28px_rgba(15,23,42,0.16)] transition-[opacity,transform] duration-150 ease-out dark:border-[#23314d] dark:bg-[#0b1220] lg:static lg:w-[270px] lg:translate-y-0 lg:border-r lg:bg-transparent lg:px-4 lg:py-6 lg:opacity-100 lg:shadow-none ${open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0 lg:pointer-events-auto"}` : "w-full shrink-0 border-b border-[#edf1ea] px-4 py-4 dark:border-[#23314d] lg:w-[270px] lg:border-b-0 lg:border-r lg:px-4 lg:py-6"}>
      {nativeApp ? (
        <div className="mb-1 flex items-center justify-between px-2 py-1 lg:hidden">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#f97316]">Menu</span>
          <button className="grid h-9 w-9 place-items-center rounded-xl text-[#5b6d61] active:bg-[#f4f7f2] dark:text-[#c7d2e0] dark:active:bg-[#111827]" onClick={onClose} type="button">
            <Icon name="close" />
          </button>
        </div>
      ) : null}
      <nav className={nativeApp ? "grid gap-1 lg:block lg:space-y-2" : "flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0"}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            className={({ isActive }) =>
              nativeApp
                ? `relative flex min-h-[48px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors active:bg-[#eef5ef] lg:min-h-0 lg:rounded-md lg:px-4 lg:py-3 lg:text-base ${
                    isActive ? "bg-[#eaf7ee] text-[#166534] dark:bg-[#1e293b] dark:text-[#f8fafc]" : "text-[#5b6d61] hover:bg-[#f7faf6] dark:text-[#c7d2e0] dark:hover:bg-[#111827]"
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
