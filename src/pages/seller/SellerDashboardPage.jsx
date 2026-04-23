import { useEffect, useMemo, useState } from "react";
import ActivityFeed from "../../components/dashboard/ActivityFeed";
import StartShiftModal from "../../components/modals/StartShiftModal";
import Icon from "../../components/ui/Icon";
import PageHeader from "../../components/ui/PageHeader";
import SectionBlock from "../../components/ui/SectionBlock";
import StatCard from "../../components/ui/StatCard";

export default function SellerDashboardPage({
  activeShift,
  canCloseShift,
  formatDate,
  onCloseShift,
  onNewSale,
  onStartShift,
  recentActivity,
  sellerSchedules,
  sellerStats,
  visibleProducts,
}) {
  const [startShiftModalOpen, setStartShiftModalOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const canRegisterSale = Boolean(activeShift);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const shiftCountdown = useMemo(() => {
    if (!activeShift?.startedAt) return null;

    const unlockAt = new Date(activeShift.startedAt).getTime() + 5 * 60 * 60 * 1000;
    const remainingMs = Math.max(unlockAt - now, 0);
    const totalSeconds = Math.floor(remainingMs / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");

    return {
      ready: remainingMs === 0,
      remainingLabel: `${hours}:${minutes}:${seconds}`,
      unlockLabel: formatDate(unlockAt, { timeStyle: "short", dateStyle: "medium" }),
    };
  }, [activeShift?.startedAt, formatDate, now]);

  const clockLabel = useMemo(
    () => formatDate(now, { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    [formatDate, now]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Vendedor"
        title="Operacion comercial"
        description="Tu vista prioriza cartera, ventas del dia, inventario visible y ritmo de trabajo."
        action={
          <>
            <button
              className={`inline-flex items-center gap-3 rounded-xl px-6 py-4 text-base font-semibold transition ${
                canRegisterSale
                  ? "bg-[#1f7a3a] text-white shadow-[0_16px_30px_rgba(31,122,58,0.24)] hover:-translate-y-0.5"
                  : "cursor-not-allowed bg-[#d9dfdb] text-[#6f7d74] shadow-none"
              }`}
              disabled={!canRegisterSale}
              onClick={onNewSale}
              type="button"
            >
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-2xl ${
                  canRegisterSale ? "bg-white/15 text-white" : "bg-white/70 text-[#6f7d74]"
                }`}
              >
                <Icon name="add" />
              </span>
              Registrar venta
            </button>
            <button
              className="rounded-xl border border-[#dfe7db] px-6 py-4 text-base font-semibold disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10"
              disabled={Boolean(activeShift) && !canCloseShift}
              onClick={activeShift ? onCloseShift : () => setStartShiftModalOpen(true)}
              type="button"
            >
              {activeShift ? "Cerrar turno" : "Iniciar turno"}
            </button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-4">
        {sellerStats.map((stat, index) => (
          <StatCard key={stat.label} accent={index === 1 ? "orange" : "green"} detail={stat.detail} label={stat.label} value={stat.value} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
        <SectionBlock description="Movimientos recientes y alertas utiles para vender mas rapido." title="Mi ritmo del dia">
          <ActivityFeed items={recentActivity} />
        </SectionBlock>

        <SectionBlock description="Sigue el reloj del turno y el tiempo que falta para poder cerrarlo." title="Tiempo de turno">
          <div className="space-y-4">
            <div className="rounded-lg border border-[#e4ece2] bg-[#f8faf6] px-4 py-4 dark:border-white/10 dark:bg-[#0d1710]">
              <span className="block text-sm text-[#5b6d61] dark:text-white/65">Reloj actual</span>
              <strong className="mt-1 block text-3xl font-black tracking-tight text-[#183325] dark:text-white">{clockLabel}</strong>
            </div>

            {activeShift ? (
              <div className="rounded-lg border border-[#e4ece2] bg-white px-4 py-4 dark:border-white/10 dark:bg-[#0d1710]">
                <span className="block text-sm text-[#5b6d61] dark:text-white/65">
                  {shiftCountdown?.ready ? "Ya puedes cerrar tu turno" : "Tiempo restante para cerrar"}
                </span>
                <strong className={`mt-1 block text-3xl font-black tracking-tight ${shiftCountdown?.ready ? "text-[#1f7a3a]" : "text-[#183325] dark:text-white"}`}>
                  {shiftCountdown?.ready ? "Listo" : shiftCountdown?.remainingLabel}
                </strong>
                <p className="mt-3 text-sm leading-6 text-[#5b6d61] dark:text-white/65">
                  {shiftCountdown?.ready
                    ? "Ya cumpliste las 5 horas minimas del turno y puedes cerrarlo cuando lo necesites."
                    : `Podras cerrarlo a partir de ${shiftCountdown?.unlockLabel}.`}
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-[#dfe7db] px-4 py-4 text-sm leading-6 text-[#5b6d61] dark:border-white/10 dark:text-white/65">
                Cuando abras tu turno veras aqui el tiempo restante para poder cerrarlo.
              </div>
            )}

            <div className="rounded-lg border border-[#e4ece2] bg-[#f8faf6] px-4 py-4 text-sm leading-6 text-[#5b6d61] dark:border-white/10 dark:bg-[#0d1710] dark:text-white/65">
              Productos visibles hoy: <strong className="text-[#183325] dark:text-white">{visibleProducts.length}</strong>
            </div>
          </div>
        </SectionBlock>
      </div>

      <SectionBlock description="Estos son los turnos que administracion te ha asignado en la agenda." title="Mis turnos programados">
        {sellerSchedules?.length ? (
          <div className="space-y-3">
            {sellerSchedules.map((item) => (
              <article key={item.id} className="rounded-lg border border-[#e4ece2] px-4 py-4 dark:border-white/10">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <strong className="block text-sm font-semibold text-[#183325] dark:text-white">{item.turno}</strong>
                    <p className="mt-1 text-sm text-[#5b6d61] dark:text-white/68">
                      {item.fecha} • {item.inicio} - {item.fin}
                    </p>
                    {item.notas ? <p className="mt-2 text-sm text-[#5b6d61] dark:text-white/60">{item.notas}</p> : null}
                  </div>
                  <span className="rounded-full bg-[#f4f8ef] px-3 py-2 text-xs font-semibold text-[#56705d] dark:bg-[#1d3425] dark:text-white/70">
                    {item.estado}
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-[#dfe7db] px-4 py-5 text-sm text-[#5b6d61] dark:border-white/10 dark:text-white/65">
            Aun no tienes turnos asignados por administracion.
          </div>
        )}
      </SectionBlock>

      <StartShiftModal
        onClose={() => setStartShiftModalOpen(false)}
        onConfirm={() => {
          setStartShiftModalOpen(false);
          onStartShift();
        }}
        open={startShiftModalOpen}
      />
    </div>
  );
}
