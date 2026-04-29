import { NavLink } from "react-router-dom";
import Icon from "../ui/Icon";
import { getOptimizedImageUrl } from "../../services/storageService.js";
import { isNativeApp } from "../../utils/platform.js";

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
    return <img alt={fullName(user)} className="h-9 w-9 rounded-full object-cover" decoding="async" loading="lazy" src={getOptimizedImageUrl(user.avatarUrl, { width: 72, height: 72 })} />;
  }

  return <div className="grid h-9 w-9 place-items-center rounded-full border border-[#e1ece3] bg-white text-sm font-semibold text-[#183325] dark:border-[#314056] dark:bg-[#182235] dark:text-[#f8fafc]">{initials(user)}</div>;
}

function NavItem({ link, landingMobile = false }) {
  const className = landingMobile
    ? "inline-flex w-full items-center justify-center rounded-xl border border-[#dce7dd] bg-[#f7faf6] px-4 py-3 text-sm font-semibold text-[#183325] transition hover:border-[#c6d8ca] hover:bg-white dark:border-[#314056] dark:bg-[#182235] dark:text-[#f8fafc] dark:hover:bg-[#22304a]"
    : "inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-[#56685d] transition hover:bg-[#f4f7f2] hover:text-[#183325] dark:text-[#c7d2e0] dark:hover:bg-[#182235] dark:hover:text-white";

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
  mobileMenuButton = null,
  user,
}) {
  const isPublic = !session;
  const showActiveShiftBadge = session && user?.role === "vendedor" && activeShift;
  const isLanding = isPublic && publicVariant === "landing";
  const nativeApp = isNativeApp();

  return (
    <header className={isLanding ? "sticky top-0 z-40 px-3 pt-2 lg:px-6 lg:pt-5" : `sticky top-0 z-40 border-b border-[#e7ede3] bg-white dark:border-[#23314d] dark:bg-[#0f172a] ${nativeApp ? "pt-[env(safe-area-inset-top)]" : ""}`}>
      <div className={isLanding ? "mx-auto max-w-[1440px]" : `mx-auto max-w-[1440px] ${nativeApp ? "px-3" : "px-4 lg:px-6"}`}>
        <div
          className={
            isLanding
              ? "mx-auto flex w-full max-w-[1320px] flex-row items-center justify-between gap-2 rounded-2xl border border-white/70 bg-white/88 px-3 py-2 shadow-[0_8px_24px_rgba(24,51,37,0.08)] backdrop-blur-md sm:px-5 sm:py-3 lg:flex-wrap"
              : `flex w-full flex-wrap items-center justify-between gap-3 ${nativeApp ? "px-0 py-3" : isPublic ? "py-4" : "px-1 py-4"}`
          }
        >
          <NavLink className={`flex min-w-0 items-center gap-3 ${isLanding ? "flex-1 text-left lg:flex-1" : "flex-1 sm:flex-none"}`} to={session ? "/panel" : "/"}>
            <img alt="Sabores Tropicales" className={`shrink-0 object-contain ${isLanding ? "h-9 w-9 sm:h-12 sm:w-12" : nativeApp ? "h-11 w-11" : "h-12 w-12"}`} src="/images/IcoSinFondo.png" />
            <div className="min-w-0">
              <strong className={`block truncate font-semibold text-[#183325] dark:text-[#f8fafc] ${nativeApp ? "text-[15px] leading-tight" : "text-sm sm:text-[17px]"}`}>{businessName}</strong>
            </div>
          </NavLink>

          {!session && publicSearch ? <div className="order-3 w-full lg:order-none lg:flex-1 lg:px-4 xl:flex xl:min-w-[360px] xl:justify-center">{publicSearch}</div> : null}

          <div className={`${nativeApp && session ? "hidden" : "flex"} min-w-0 items-center gap-2 sm:flex-wrap sm:gap-3 ${isLanding ? "shrink-0 justify-end" : "w-full justify-end sm:w-auto"}`}>
            {!session && publicLinks.length ? <nav className="hidden items-center gap-1 lg:flex">{publicLinks.map((link) => <NavItem key={link.label} link={link} />)}</nav> : null}

            {showActiveShiftBadge ? (
              <div className="hidden items-center gap-2 rounded-xl border border-[#cfe5d5] bg-white px-3 py-2 text-sm font-semibold text-[#1f7a3a] shadow-[0_8px_20px_rgba(31,122,58,0.08)] dark:border-[#314056] dark:bg-[#182235] dark:text-[#93c5fd] dark:shadow-[0_8px_20px_rgba(37,99,235,0.12)] md:inline-flex">
                <span className="relative inline-flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2b8e46]/35 dark:bg-[#60a5fa]/35" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-[#1f7a3a] dark:bg-[#60a5fa]" />
                </span>
                Turno activo
              </div>
            ) : null}

            {!session ? publicActions : null}

            {showThemeToggle && !(nativeApp && session) ? (
              <button
                aria-label={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                className={`relative inline-flex h-11 w-[68px] shrink-0 items-center rounded-full border transition ${
                  isLanding
                    ? "border-[#dfe7db] bg-white shadow-[0_6px_18px_rgba(24,51,37,0.04)]"
                    : "border-[#dfe7db] bg-[#f8faf6] dark:border-[#314056] dark:bg-[#111827]"
                }`}
                onClick={onToggleTheme}
                type="button"
              >
                <span className="pointer-events-none absolute inset-0 grid grid-cols-2">
                  <span className="grid place-items-center text-[#f59e0b]">
                    <Icon name="light_mode" />
                  </span>
                  <span className="grid place-items-center text-[#cbd5e1]">
                    <Icon name="dark_mode" />
                  </span>
                </span>
                <span
                  className={`absolute top-1 grid h-9 w-9 place-items-center rounded-full shadow-[0_8px_18px_rgba(15,23,42,0.16)] transition ${
                    darkMode ? "translate-x-[29px] bg-[#f8fafc] text-[#0f172a]" : "translate-x-[2px] bg-white text-[#183325]"
                  }`}
                >
                  <Icon name={darkMode ? "dark_mode" : "light_mode"} />
                </span>
              </button>
            ) : null}

            {session ? (
              <>
                {nativeApp ? null : <div className="min-w-0">{notificationButton}</div>}
                <NavLink className="hidden rounded-md px-2 py-2 text-sm font-medium text-[#5b6d61] dark:text-[#f8fafc] lg:block" to="/panel/perfil">
                  {fullName(user)}
                </NavLink>
                {nativeApp ? null : <UserAvatar user={user} />}
                <button
                  className={`items-center gap-2 bg-[linear-gradient(135deg,#1f7a3a,#2b8e46)] text-sm font-medium text-white transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-[linear-gradient(135deg,#2563eb,#1d4ed8)] ${nativeApp ? "hidden lg:inline-flex" : "inline-flex"} ${
                    isLanding
                      ? "rounded-xl px-4 py-2.5 shadow-[0_10px_24px_rgba(31,122,58,0.18)]"
                      : "rounded-md px-3 py-2.5 shadow-[0_8px_20px_rgba(31,122,58,0.14)] sm:px-4"
                  }`}
                  onClick={onLogout}
                  type="button"
                >
                  <Icon name="logout" />
                  <span className="hidden md:inline">Salir</span>
                </button>
              </>
            ) : (
              <button
                className={`inline-flex items-center justify-center gap-2 rounded-md bg-[linear-gradient(135deg,#1f7a3a,#2b8e46)] px-3 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(31,122,58,0.18)] transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-[linear-gradient(135deg,#2563eb,#1d4ed8)] dark:shadow-[0_12px_24px_rgba(37,99,235,0.2)] ${isLanding ? "flex-1 sm:flex-none" : ""} sm:px-4`}
                onClick={onOpenLoginPage}
                type="button"
              >
                <Icon name="login" />
                <span className={`${isLanding ? "inline" : "hidden md:inline"}`}>Iniciar sesion</span>
              </button>
            )}
          </div>

          {nativeApp && session ? (
            <div className="order-4 flex w-full items-center justify-between gap-3 border-t border-[#e7ede3] pt-3 dark:border-[#23314d]">
              {mobileMenuButton}
              <div className="flex min-w-0 items-center gap-2">
                {showThemeToggle ? (
                  <button
                    aria-label={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                    className="relative inline-flex h-10 w-[60px] shrink-0 items-center rounded-full border border-[#dfe7db] bg-[#f8faf6] transition dark:border-[#314056] dark:bg-[#111827]"
                    onClick={onToggleTheme}
                    type="button"
                  >
                    <span className="pointer-events-none absolute inset-0 grid grid-cols-2">
                      <span className="grid place-items-center text-[#f59e0b]">
                        <Icon name="light_mode" />
                      </span>
                      <span className="grid place-items-center text-[#94a3b8]">
                        <Icon name="dark_mode" />
                      </span>
                    </span>
                    <span
                      className={`absolute top-1 grid h-8 w-8 place-items-center rounded-full shadow-[0_6px_14px_rgba(15,23,42,0.14)] transition ${
                        darkMode ? "translate-x-[26px] bg-[#f8fafc] text-[#0f172a]" : "translate-x-[2px] bg-white text-[#183325]"
                      }`}
                    >
                      <Icon name={darkMode ? "dark_mode" : "light_mode"} />
                    </span>
                  </button>
                ) : null}
                <div className="min-w-0">{notificationButton}</div>
                <UserAvatar user={user} />
                <button
                  className="inline-flex h-10 w-12 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#1f7a3a,#2b8e46)] text-white shadow-[0_8px_18px_rgba(31,122,58,0.16)] dark:bg-[linear-gradient(135deg,#2563eb,#1d4ed8)]"
                  onClick={onLogout}
                  type="button"
                >
                  <Icon name="logout" />
                </button>
              </div>
            </div>
          ) : null}

          {!session && publicLinks.length && !isLanding ? (
            <nav className={`order-4 w-full lg:hidden ${isLanding ? "grid grid-cols-2 gap-2" : "flex overflow-x-auto gap-2 pb-1"}`}>
              {publicLinks.map((link) => (
                <NavItem key={link.label} landingMobile={isLanding} link={link} />
              ))}
            </nav>
          ) : null}
        </div>
      </div>
    </header>
  );
}
