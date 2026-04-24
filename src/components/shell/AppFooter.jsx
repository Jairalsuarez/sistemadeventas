export default function AppFooter() {
  return (
    <footer className="bg-[#2c2b2a] px-4 py-14 text-[#d6d0c9]">
      <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[1.2fr_0.9fr_1fr_0.9fr] lg:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#f3eee8]">Sabores Tropicales</p>
          <p className="mt-4 max-w-md text-sm leading-7 text-[#c7c0b8]">
            Todos los derechos del nombre, identidad visual y uso de esta pagina estan reservados por los administradores.
          </p>
          <p className="mt-3 text-sm leading-7 text-[#c7c0b8]">
            Este sitio fue creado para la gestion y exhibicion oficial de Sabores Tropicales y Algo Mas.
          </p>
        </div>

        <div>
          <p className="text-lg font-semibold text-white">Reglas y politicas</p>
          <ul className="mt-4 space-y-3 text-sm text-[#c7c0b8]">
            <li>Uso interno del panel solo para personal autorizado.</li>
            <li>La informacion publicada puede cambiar sin previo aviso.</li>
            <li>El uso indebido del contenido o del nombre queda restringido.</li>
          </ul>
        </div>

        <div>
          <p className="text-lg font-semibold text-white">Contacto</p>
          <div className="mt-4 space-y-3 text-sm text-[#c7c0b8]">
            <p>Pagina oficial de Sabores Tropicales y Algo Mas.</p>
            <p>Consultas y pedidos desde la tienda y canales autorizados.</p>
          </div>
        </div>

        <div>
          <p className="text-lg font-semibold text-white">Desarrollador web</p>
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-[#c7c0b8]">Creado por Jair Suarez</p>
            <a
              className="mt-4 inline-flex items-center gap-3 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-[#1f2b23] transition hover:bg-[#f3eee8]"
              href="https://github.com/Jairalsuarez"
              rel="noreferrer"
              target="_blank"
            >
              <img alt="GitHub" className="h-5 w-5 object-contain" src="/images/github.png" />
              Jairalsuarez
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-[1440px] border-t border-white/10 pt-5 text-center text-xs text-[#b7afa6] lg:px-6">
              Sabores Tropicales y Algo Mas · Jair Suarez · Todos los derechos reservados.
      </div>
    </footer>
  );
}
