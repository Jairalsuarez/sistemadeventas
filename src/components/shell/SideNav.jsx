import { NavLink } from "react-router-dom";
import Icon from "../ui/Icon";

const baseLink = "flex items-center gap-3 rounded-md px-4 py-3 text-base font-medium transition whitespace-nowrap";

export default function SideNav({ isAdmin }) {
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
    <aside className="w-full shrink-0 border-b border-[#edf1ea] px-4 py-4 dark:border-[#23314d] lg:w-[270px] lg:border-b-0 lg:border-r lg:px-4 lg:py-6">
      <nav className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
        {links.map((link) => (
          <NavLink
            key={link.to}
            className={({ isActive }) =>
              `${baseLink} min-w-max lg:min-w-0 ${isActive ? "bg-[#f6f3ea] text-[#183325] dark:bg-[#1e293b] dark:text-[#f8fafc]" : "text-[#5b6d61] hover:bg-[#f7faf6] dark:text-[#c7d2e0] dark:hover:bg-[#111827]"}`
            }
            end={link.end}
            to={link.to}
          >
            <Icon name={link.icon} />
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
