import { useEffect, useMemo, useState } from "react";
import ActivityFeed from "../../components/dashboard/ActivityFeed";
import CloseShiftModal from "../../components/modals/CloseShiftModal";
import ShiftSummaryModal from "../../components/modals/ShiftSummaryModal";
import StartShiftModal from "../../components/modals/StartShiftModal";
import Icon from "../../components/ui/Icon";
import PageHeader from "../../components/ui/PageHeader";
import SectionBlock from "../../components/ui/SectionBlock";
import StatCard from "../../components/ui/StatCard";

const formatEcShortDate = (value) => {
  if (!value) return "";
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("es-EC", {
    timeZone: "America/Guayaquil",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
};

export default function SellerDashboardPage({
  activeShift,
  canCloseShift,
  formatDate,
  onCloseShift,
  onNewInformalSale,
  onNewSale,
  onStartShift,
  recentActivity,
  sellerSchedules,
  sellerStats,
  shiftSummary,
  money,
}) {
  const [startShiftModalOpen, setStartShiftModalOpen] = useState(false);
  const [closeShiftModalOpen, setCloseShiftModalOpen] = useState(false);
  const [shiftSummaryOpen, setShiftSummaryOpen] = useState(false);
  const [showRecentActivity, setShowRecentActivity] = useState(false);
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
        action={
          <div className="flex flex-wrap items-end gap-3">
            <button
              className="inline-flex items-center px-1 py-2 text-sm font-semibold text-[#64748b] underline underline-offset-4 transition hover:text-[#334155] dark:text-[#94a3b8] dark:hover:text-white"
              onClick={onNewInformalSale}
              type="button"
            >
              Agregar venta informal
            </button>
            <button
              className={`inline-flex items-center justify-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition sm:px-6 sm:py-4 sm:text-base ${
                canRegisterSale
                  ? "bg-[#1f7a3a] text-white shadow-[0_16px_30px_rgba(31,122,58,0.24)] hover:-translate-y-0.5 dark:bg-[linear-gradient(135deg,#2563eb,#1d4ed8)] dark:shadow-[0_16px_30px_rgba(37,99,235,0.24)]"
                  : "cursor-not-allowed bg-[#d9dfdb] text-[#6f7d74] shadow-none dark:bg-[#1f2937] dark:text-[#94a3b8]"
              }`}
              disabled={!canRegisterSale}
              onClick={onNewSale}
              type="button"
            >
              <span
                className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-xl sm:h-10 sm:w-10 sm:text-2xl ${
                  canRegisterSale ? "bg-white/15 text-white dark:bg-white/10" : "bg-white/70 text-[#6f7d74] dark:bg-[#0f172a] dark:text-[#94a3b8]"
                }`}
              >
                <Icon name="add" />
              </span>
              Registrar venta
            </button>
            <button
              className="rounded-xl border border-[#dfe7db] px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#314056] dark:bg-[#182235] dark:text-[#f8fafc] sm:px-6 sm:py-4 sm:text-base"
              disabled={Boolean(activeShift) && !canCloseShift}
              onClick={activeShift ? () => setCloseShiftModalOpen(true) : () => setStartShiftModalOpen(true)}
              type="button"
            >
              {activeShift ? "Cerrar turno" : "Iniciar turno"}
            </button>
            {shiftSummary ? (
              <button
                className="rounded-xl border border-[#dfe7db] px-4 py-3 text-sm font-semibold dark:border-[#314056] dark:bg-[#182235] dark:text-[#f8fafc] sm:px-6 sm:py-4 sm:text-base"
                onClick={() => setShiftSummaryOpen(true)}
                type="button"
              >
                Ver resumen del turno
              </button>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {sellerStats.map((stat, index) => (
          <StatCard key={stat.label} accent={index === 1 ? "orange" : "green"} detail={stat.detail} label={stat.label} value={stat.value} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
        <SectionBlock title="Actividad reciente">
          <button
            className="flex w-full items-center justify-between gap-4 rounded-xl border border-[#dfe7db] bg-white px-5 py-4 text-left transition hover:border-[#1f7a3a] dark:border-[#314056] dark:bg-[#182235] dark:hover:border-[#60a5fa]"
            onClick={() => setShowRecentActivity((current) => !current)}
            type="button"
          >
            <span>
              <span className="block text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">Ver actividad reciente</span>
              <span className="mt-1 block text-sm text-[#5b6d61] dark:text-[#c7d2e0]">{recentActivity.length} movimiento(s) disponibles</span>
            </span>
            <Icon className="text-[#1f7a3a] dark:text-[#60a5fa]" name={showRecentActivity ? "keyboard_arrow_up" : "keyboard_arrow_down"} />
          </button>

          {showRecentActivity ? (
            <div className="mt-4">
              <ActivityFeed items={recentActivity} />
            </div>
          ) : null}
        </SectionBlock>

        <SectionBlock title="Tiempo de turno">
          {activeShift ? (
            <div className="rounded-2xl border border-[#e4ece2] bg-white px-5 py-5 shadow-sm dark:border-[#23314d] dark:bg-[#182235]">
              <span className="block text-sm font-medium text-[#5b6d61] dark:text-[#c7d2e0]">Hora actual: {clockLabel}</span>
              <span className="mt-3 block text-sm text-[#5b6d61] dark:text-[#c7d2e0]">
                {shiftCountdown?.ready ? "Ya puedes cerrar tu turno" : "Tiempo restante para cerrar"}
              </span>
              <strong className={`mt-1 block text-3xl font-black tracking-tight ${shiftCountdown?.ready ? "text-[#1f7a3a] dark:text-[#60a5fa]" : "text-[#183325] dark:text-[#f8fafc]"}`}>
                {shiftCountdown?.ready ? "Listo" : shiftCountdown?.remainingLabel}
              </strong>
              <p className="mt-3 text-sm leading-6 text-[#5b6d61] dark:text-[#c7d2e0]">
                {shiftCountdown?.ready
                  ? "Ya cumpliste las 5 horas minimas del turno y puedes cerrarlo cuando lo necesites."
                  : `Podras cerrarlo a partir de ${shiftCountdown?.unlockLabel}.`}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#dfe7db] px-4 py-4 text-sm leading-6 text-[#5b6d61] dark:border-[#314056] dark:text-[#c7d2e0]">
              Cuando abras tu turno veras aqui el tiempo restante para poder cerrarlo.
            </div>
          )}
        </SectionBlock>
      </div>

      <SectionBlock title="Mis turnos programados">
        {sellerSchedules?.length ? (
          <div className="space-y-3">
            {sellerSchedules.map((item) => (
              <article key={item.id} className="rounded-xl border border-[#e4ece2] px-4 py-4 dark:border-[#23314d] dark:bg-[#182235]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <strong className="block text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">{formatEcShortDate(item.fecha)}</strong>
                    <p className="mt-1 text-sm text-[#5b6d61] dark:text-[#c7d2e0]">
                      {item.inicio} - {item.fin} - {item.turno}
                    </p>
                    {item.notas ? <p className="mt-2 text-sm text-[#5b6d61] dark:text-[#94a3b8]">{item.notas}</p> : null}
                  </div>
                  <span className="inline-flex w-fit rounded-full bg-[#f4f8ef] px-3 py-2 text-xs font-semibold text-[#56705d] dark:bg-[#0f172a] dark:text-[#93c5fd]">
                    {item.estado}
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#dfe7db] px-4 py-5 text-sm text-[#5b6d61] dark:border-[#314056] dark:text-[#c7d2e0]">
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
      <CloseShiftModal
        onClose={() => setCloseShiftModalOpen(false)}
        onConfirm={() => {
          setCloseShiftModalOpen(false);
          onCloseShift();
        }}
        open={closeShiftModalOpen}
      />
      <ShiftSummaryModal money={money} onClose={() => setShiftSummaryOpen(false)} open={shiftSummaryOpen} summary={shiftSummary} />
    </div>
  );
}
