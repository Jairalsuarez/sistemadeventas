import { NavLink } from "react-router-dom";
import Icon from "../ui/Icon";
import { isNativeApp } from "../../utils/platform.js";

const baseLink = "flex items-center gap-3 rounded-md px-4 py-3 text-base font-medium transition whitespace-nowrap";

export default function SideNav({ isAdmin }) {
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
    <aside className={nativeApp ? "fixed inset-x-0 bottom-0 z-40 border-t border-[#edf1ea] bg-white/96 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur dark:border-[#23314d] dark:bg-[#0f172a]/96 lg:static lg:w-[270px] lg:border-r lg:border-t-0 lg:bg-transparent lg:px-4 lg:py-6 lg:backdrop-blur-none" : "w-full shrink-0 border-b border-[#edf1ea] px-4 py-4 dark:border-[#23314d] lg:w-[270px] lg:border-b-0 lg:border-r lg:px-4 lg:py-6"}>
      <nav className={nativeApp ? "grid grid-cols-4 gap-1 lg:block lg:space-y-2" : "flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0"}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            className={({ isActive }) =>
              nativeApp
                ? `flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[11px] font-semibold transition lg:min-h-0 lg:flex-row lg:justify-start lg:gap-3 lg:rounded-md lg:px-4 lg:py-3 lg:text-base ${
                    isActive ? "bg-[#f6f3ea] text-[#183325] dark:bg-[#1e293b] dark:text-[#f8fafc]" : "text-[#5b6d61] hover:bg-[#f7faf6] dark:text-[#c7d2e0] dark:hover:bg-[#111827]"
                  }`
                : `${baseLink} min-w-max lg:min-w-0 ${isActive ? "bg-[#f6f3ea] text-[#183325] dark:bg-[#1e293b] dark:text-[#f8fafc]" : "text-[#5b6d61] hover:bg-[#f7faf6] dark:text-[#c7d2e0] dark:hover:bg-[#111827]"}`
            }
            end={link.end}
            to={link.to}
          >
            <Icon name={link.icon} />
            <span className="max-w-full truncate">{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
