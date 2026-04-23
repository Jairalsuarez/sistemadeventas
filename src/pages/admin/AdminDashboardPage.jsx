import { useEffect, useState } from "react";
import ActivityFeed from "../../components/dashboard/ActivityFeed";
import Icon from "../../components/ui/Icon";
import PageHeader from "../../components/ui/PageHeader";
import SectionBlock from "../../components/ui/SectionBlock";
import StatCard from "../../components/ui/StatCard";
import { fetchPublicAnalytics, getPublicAnalytics } from "../../services/publicAnalyticsService.js";

export default function AdminDashboardPage({
  adminStats,
  formatDate,
  onNewSale,
  onCloseShift,
  upcomingSchedules,
  recentActivity,
  sellerShiftRows,
  visibleProducts,
}) {
  const [showRecentActivity, setShowRecentActivity] = useState(false);
  const [publicAnalytics, setPublicAnalytics] = useState(() => getPublicAnalytics());
  const scheduleRows = upcomingSchedules || [];
  const sellers = sellerShiftRows || [];
  const nextSchedule = scheduleRows[0] || null;

  useEffect(() => {
    const syncAnalytics = async () => setPublicAnalytics(await fetchPublicAnalytics());
    syncAnalytics();
    window.addEventListener("storage", syncAnalytics);
    window.addEventListener("focus", syncAnalytics);
    window.addEventListener("public-analytics-updated", syncAnalytics);
    return () => {
      window.removeEventListener("storage", syncAnalytics);
      window.removeEventListener("focus", syncAnalytics);
      window.removeEventListener("public-analytics-updated", syncAnalytics);
    };
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Resumen del negocio"
        description="Ventas, inventario y flujo operativo actualizados en tiempo real desde el panel principal."
        action={
          <button className="inline-flex items-center gap-3 rounded-xl bg-[#1f7a3a] px-6 py-4 text-base font-semibold text-white shadow-[0_16px_30px_rgba(31,122,58,0.24)] transition hover:-translate-y-0.5" onClick={onNewSale} type="button">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-2xl text-white">
              <Icon name="add" />
            </span>
            Registrar venta
          </button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-2">
        {adminStats.map((stat, index) => (
          <StatCard key={stat.label} accent={index === 1 ? "orange" : index === 2 ? "yellow" : "green"} detail={stat.detail} label={stat.label} value={stat.value} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_380px]">
        <SectionBlock description="Abre el historial cuando necesites revisar los ultimos movimientos." title="Actividad reciente">
          <button
            className="flex w-full items-center justify-between gap-4 rounded-xl border border-[#dfe7db] bg-white px-5 py-4 text-left transition hover:border-[#1f7a3a]"
            onClick={() => setShowRecentActivity((current) => !current)}
            type="button"
          >
            <span>
              <span className="block text-sm font-semibold text-[#183325]">Ver actividad reciente</span>
              <span className="mt-1 block text-sm text-[#5b6d61]">{recentActivity.length} movimiento(s) disponibles</span>
            </span>
            <Icon className="text-[#1f7a3a]" name={showRecentActivity ? "keyboard_arrow_up" : "keyboard_arrow_down"} />
          </button>

          {showRecentActivity ? (
            <div className="mt-4">
              <ActivityFeed items={recentActivity} />
            </div>
          ) : null}
        </SectionBlock>

        <SectionBlock description="Mira quien esta activo y cierra un turno si necesitas intervenir." title="Turnos del equipo">
          <div className="space-y-3">
            {sellers.map((seller) => (
              <article key={seller.id} className="rounded-lg border border-[#e4ece2] px-4 py-4 dark:border-white/10">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <strong className="block text-sm font-semibold text-[#183325] dark:text-white">{seller.name}</strong>
                    <p className="mt-1 text-sm text-[#5b6d61] dark:text-white/68">{seller.statusLabel}</p>
                    {seller.activeShift ? (
                      <p className="mt-2 text-xs text-[#6a7b70]">
                        Abierto el {formatDate(seller.activeShift.startedAt, { dateStyle: "medium", timeStyle: "short" })}
                      </p>
                    ) : null}
                  </div>
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                      seller.activeShift ? "bg-white text-[#1f7a3a]" : "bg-white text-[#6a7b70]"
                    }`}
                  >
                    <Icon className="text-sm" name={seller.activeShift ? "schedule" : "check_circle"} />
                    {seller.activeShift ? "Activo" : "Sin turno"}
                  </span>
                </div>
                {seller.activeShift ? (
                  <button
                    className="mt-4 rounded-md border border-[#f0c7ba] bg-[#fff7f4] px-4 py-2 text-sm font-medium text-[#b42318] transition hover:bg-[#ffefe8]"
                    onClick={() => onCloseShift(seller.activeShift)}
                    type="button"
                  >
                    Terminar turno
                  </button>
                ) : null}
              </article>
            ))}
            {!sellers.length ? <p className="text-sm text-[#5b6d61] dark:text-white/65">Todavia no hay vendedores cargados para monitorear turnos.</p> : null}
          </div>
        </SectionBlock>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)]">
        <SectionBlock title="Resumen operativo">
          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-lg border border-[#e4ece2] bg-white px-4 py-4 dark:border-white/10 dark:bg-[#122117]">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dfe7db] text-[#1f7a3a]">
                <Icon name="visibility" />
              </span>
              <strong className="mt-4 block text-2xl font-semibold text-[#183325] dark:text-white">{publicAnalytics.pageVisits}</strong>
              <p className="mt-1 text-sm text-[#5b6d61] dark:text-white/65">Visitas al catálogo público</p>
            </article>

            <article className="rounded-lg border border-[#e4ece2] bg-white px-4 py-4 dark:border-white/10 dark:bg-[#122117]">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dfe7db] text-[#1f7a3a]">
                <Icon name="chat" />
              </span>
              <strong className="mt-4 block text-2xl font-semibold text-[#183325] dark:text-white">{publicAnalytics.whatsappClicks}</strong>
              <p className="mt-1 text-sm text-[#5b6d61] dark:text-white/65">Clics para pedir por WhatsApp</p>
            </article>

            <article className="rounded-lg border border-[#e4ece2] bg-white px-4 py-4 dark:border-white/10 dark:bg-[#122117]">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dfe7db] text-[#1f7a3a]">
                <Icon name="event" />
              </span>
              <strong className="mt-4 block text-2xl font-semibold text-[#183325] dark:text-white">{scheduleRows.length}</strong>
              <p className="mt-1 text-sm text-[#5b6d61] dark:text-white/65">
                {nextSchedule ? `Próximo: ${nextSchedule.fecha} ${nextSchedule.inicio}` : "Sin agenda pendiente"}
              </p>
            </article>
          </div>
        </SectionBlock>
      </div>
    </div>
  );
}
