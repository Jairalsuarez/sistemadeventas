import { NavLink } from "react-router-dom";
import Icon from "../ui/Icon";

function fullName(user = {}) {
  return [user.nombre, user.apellido].filter(Boolean).join(" ").trim() || user.nombre || "Usuario";
}

function initials(user = {}) {
  const letters = [user.nombre, user.apellido]
    .map((value) => value?.trim()?.slice(0, 1)?.toUpperCase())
    .filter(Boolean)
    .slice(0, 2);
  return letters.join("") || "U";
}

function UserAvatar({ user }) {
  if (user?.avatarUrl) {
    return <img alt={fullName(user)} className="h-9 w-9 rounded-full object-cover" src={user.avatarUrl} />;
  }

  return <div className="grid h-9 w-9 place-items-center rounded-full border border-[#e1ece3] bg-white text-sm font-semibold text-[#183325]">{initials(user)}</div>;
}

function NavItem({ link }) {
  const className =
    "inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-[#56685d] transition hover:bg-[#f4f7f2] hover:text-[#183325]";

  if (link.to) {
    return (
      <NavLink className={className} key={link.label} to={link.to}>
        {link.label}
      </NavLink>
    );
  }

  return (
    <a className={className} href={link.href} key={link.label}>
      {link.label}
    </a>
  );
}

export default function TopNav({
  activeShift,
  businessName,
  darkMode,
  notificationButton,
  onLogout,
  onOpenLoginPage,
  onToggleTheme,
  publicLinks = [],
  publicActions = null,
  publicSearch = null,
  publicVariant = "catalog",
  session,
  showThemeToggle = true,
  user,
}) {
  const isPublic = !session;
  const showActiveShiftBadge = session && user?.role === "vendedor" && activeShift;
  const isLanding = isPublic && publicVariant === "landing";

  return (
    <header className={isLanding ? "sticky top-0 z-40 px-4 pt-3 lg:px-6 lg:pt-5" : "sticky top-0 z-40 border-b border-[#e7ede3] bg-white"}>
      <div className={isLanding ? "mx-auto max-w-[1440px]" : "mx-auto max-w-[1440px] px-4 lg:px-6"}>
        <div
          className={
            isLanding
              ? "mx-auto flex w-full max-w-[1320px] items-center justify-between gap-4 rounded-[24px] border border-[#e7ede3] bg-white px-5 py-3 shadow-[0_12px_34px_rgba(24,51,37,0.08)]"
              : `flex w-full items-center justify-between gap-4 ${isPublic ? "py-4" : "px-1 py-4"}`
          }
        >
          <NavLink className="flex min-w-0 items-center gap-3" to={session ? "/panel" : "/"}>
            <img alt="Sabores Tropicales" className="h-12 w-12 shrink-0 object-contain" src="/images/IcoSinFondo.png" />
            <div className="min-w-0">
              <strong className="block truncate text-[17px] font-semibold text-[#183325]">{businessName}</strong>
            </div>
          </NavLink>

          <div className="flex items-center gap-2">
            {!session && publicSearch ? <div className="hidden min-w-[360px] flex-1 xl:flex xl:justify-center">{publicSearch}</div> : null}
            {!session && publicLinks.length ? <nav className="hidden items-center gap-1 lg:flex">{publicLinks.map((link) => <NavItem key={link.label} link={link} />)}</nav> : null}

            {showActiveShiftBadge ? (
              <div className="hidden items-center gap-2 rounded-xl border border-[#cfe5d5] bg-white px-3 py-2 text-sm font-semibold text-[#1f7a3a] shadow-[0_8px_20px_rgba(31,122,58,0.08)] md:inline-flex">
                <span className="relative inline-flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2b8e46]/35" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-[#1f7a3a]" />
                </span>
                Turno activo
              </div>
            ) : null}

            {!session ? publicActions : null}

            {showThemeToggle ? (
              <button
                className={`inline-flex items-center gap-2 border border-[#dfe7db] bg-white text-sm font-medium text-[#183325] transition hover:bg-[#f6faf4] ${
                  isLanding
                    ? "rounded-xl px-3.5 py-2.5 shadow-[0_6px_18px_rgba(24,51,37,0.04)]"
                    : "rounded-md px-4 py-2.5"
                }`}
                onClick={onToggleTheme}
                type="button"
              >
                <Icon name={darkMode ? "light_mode" : "dark_mode"} />
                {darkMode ? "Modo claro" : "Modo oscuro"}
              </button>
            ) : null}

            {session ? (
              <>
                {notificationButton}
                <NavLink className="hidden rounded-md px-2 py-2 text-sm font-medium text-[#5b6d61] md:block" to="/panel/perfil">
                  {fullName(user)}
                </NavLink>
                <UserAvatar user={user} />
                <button
                  className={`inline-flex items-center gap-2 bg-[linear-gradient(135deg,#1f7a3a,#2b8e46)] text-sm font-medium text-white transition hover:-translate-y-0.5 hover:shadow-lg ${
                    isLanding
                      ? "rounded-xl px-4 py-2.5 shadow-[0_10px_24px_rgba(31,122,58,0.18)]"
                      : "rounded-md px-4 py-2.5 shadow-[0_8px_20px_rgba(31,122,58,0.14)]"
                  }`}
                  onClick={onLogout}
                  type="button"
                >
                  <Icon name="logout" />
                  Salir
                </button>
              </>
            ) : (
              <button
                className="inline-flex items-center gap-2 rounded-md bg-[linear-gradient(135deg,#1f7a3a,#2b8e46)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(31,122,58,0.18)] transition hover:-translate-y-0.5 hover:shadow-lg"
                onClick={onOpenLoginPage}
                type="button"
              >
                <Icon name="login" />
                Iniciar sesion
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
