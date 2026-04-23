import { NavLink } from "react-router-dom";
import Icon from "../ui/Icon";

const baseLink =
  "flex items-center gap-3 rounded-md px-4 py-3 text-base font-medium transition";

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
    links.splice(4, 0, { to: "/panel/comentarios", label: "Comentarios", icon: "chat" });
    links.splice(5, 0, { to: "/panel/analitica", label: "Analitica", icon: "monitoring" });
  }

  return (
    <aside className="hidden w-[270px] shrink-0 border-r border-[#edf1ea] px-4 py-6 dark:border-white/10 lg:block">
      <nav className="space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            className={({ isActive }) =>
              `${baseLink} ${isActive ? "bg-[#f6f3ea] text-[#183325] dark:bg-[#1d3425] dark:text-white" : "text-[#5b6d61] hover:bg-[#f7faf6] dark:text-white/65 dark:hover:bg-[#122117]"}`
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
