import Icon from "../../components/ui/Icon";
import PublicPageShell from "../../components/public/PublicPageShell.jsx";

export default function ContactPage({ app }) {
  return (
    <PublicPageShell
      app={app}
      badge="Canales directos"
      description="Si quieres hacer un pedido, consultar disponibilidad o hablar con nosotros, aqui tienes los datos principales del negocio en un formato rapido y claro."
      title="Contacto"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-[28px] border border-[#e1ece3] bg-white/90 p-6 shadow-[0_24px_48px_rgba(24,51,37,0.06)]">
          <h2 className="text-2xl font-semibold">Datos del negocio</h2>
          <div className="mt-4 space-y-3 text-sm text-[#5b6d61]">
            <p>Ubicacion: Calle 7 de Agosto y Franklin Torres, en el Parque Infantil local #4.</p>
            <p>Telefono: {app.business.telefono}</p>
            <p>WhatsApp: {app.business.whatsapp}</p>
            <p>Horario: {app.business.horario}</p>
          </div>
        </article>

        <article className="rounded-[28px] border border-[#e1ece3] bg-white/90 p-6 shadow-[0_24px_48px_rgba(24,51,37,0.06)]">
          <h2 className="text-2xl font-semibold">Atencion directa</h2>
          <p className="mt-3 text-sm leading-7 text-[#5b6d61]">
            La forma mas rapida de pedir o consultar es por WhatsApp. Desde ahi puedes confirmar precios, stock y coordinar la atencion.
          </p>
          <a className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1f7a3a] px-4 py-3 text-sm font-medium text-white" href={`https://wa.me/${app.business.whatsapp}`} rel="noreferrer" target="_blank">
            <Icon name="chat" />
            Escribir por WhatsApp
          </a>
          <a className="mt-3 inline-flex items-center gap-2 rounded-xl border border-[#dfe7db] bg-white px-4 py-3 text-sm font-medium" href="/como-llegar">
            <Icon name="map" />
            Ver como llegar
          </a>
        </article>
      </div>
    </PublicPageShell>
  );
}
