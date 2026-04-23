export default function AppNavbar({
  logoUrl,
  locationPath,
  navigate,
  session,
  setLoginModal,
  setTheme,
  subtitle,
  theme,
  logoutAndHome,
  user,
}) {
  return (
    <nav className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4 px-5 pb-0 pt-5">
      <div className="flex items-center gap-4">
        <div className="grid h-14 w-20 place-items-center overflow-hidden rounded-2xl border border-[#123142]/10 bg-white text-xs font-black text-[#123142] shadow-sm dark:border-white/10 dark:bg-[#142026] dark:text-white">
          {logoUrl ? <img alt="Logo del negocio" className="h-full w-full object-contain p-2" src={logoUrl} /> : <span>LOGO</span>}
        </div>
        <div>
          <strong className="block text-base font-black tracking-tight text-[#20130A] dark:text-white">Jugos Tropicales</strong>
          <span className="block text-sm text-[#142026]/65 dark:text-[#e9f0c9]/80">{subtitle}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          className="cursor-pointer rounded-2xl border border-[#123142]/10 bg-white px-4 py-3 text-sm font-semibold text-[#142026] transition hover:bg-[#E9F0C9] dark:border-white/10 dark:bg-[#142026] dark:text-white dark:hover:bg-[#123142]"
          onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
          type="button"
        >
          {theme === "dark" ? "Modo claro" : "Modo oscuro"}
        </button>

        {session ? (
          <>
            {locationPath !== "/panel" ? (
              <button
                className="cursor-pointer rounded-2xl bg-[#288990] px-5 py-3 text-sm font-bold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#45769e] hover:shadow-[0_14px_28px_rgba(40,137,144,0.22)]"
                onClick={() => navigate("/panel")}
                type="button"
              >
                Administrar
              </button>
            ) : null}
            <span className="rounded-full bg-[#F3F6F7] px-3 py-2 text-sm font-semibold text-[#142026] dark:bg-[#123142] dark:text-white">{user?.nombre}</span>
            <button
              className="cursor-pointer rounded-2xl border border-[#123142]/10 bg-white px-4 py-3 text-sm font-semibold text-[#142026] transition hover:bg-[#E9F0C9] dark:border-white/10 dark:bg-[#142026] dark:text-white dark:hover:bg-[#123142]"
              onClick={logoutAndHome}
              type="button"
            >
              Cerrar sesion
            </button>
          </>
        ) : (
          <button
            className="cursor-pointer rounded-2xl bg-[#3B657A] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#123142]"
            onClick={() => setLoginModal(true)}
            type="button"
          >
            Iniciar sesion
          </button>
        )}
      </div>
    </nav>
  );
}
