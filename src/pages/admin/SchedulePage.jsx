import { useMemo } from "react";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";
import SectionBlock from "../../components/ui/SectionBlock";

const SHIFT_TIMES = {
  Manana: { label: "Manana", inicio: "08:00", fin: "13:30" },
  Tarde: { label: "Tarde", inicio: "13:30", fin: "17:00" },
  Noche: { label: "Noche", inicio: "17:00", fin: "22:00" },
};

const sellerName = (seller = {}) => [seller.nombre, seller.apellido].filter(Boolean).join(" ").trim() || seller.nombre || "Sin nombre";

const normalizeShiftKey = (turno = "") => {
  const value = String(turno).toLowerCase();
  if (value.includes("tarde")) return "Tarde";
  if (value.includes("noche")) return "Noche";
  return "Manana";
};

export default function SchedulePage({
  createSchedule,
  deleteSchedule,
  scheduleForm,
  setScheduleForm,
  upcomingSchedules,
  updateScheduleStatus,
  users = [],
}) {
  const sellers = useMemo(() => users.filter((item) => item.role === "vendedor"), [users]);
  const currentShiftKey = normalizeShiftKey(scheduleForm.turno);
  const selectedShift = SHIFT_TIMES[currentShiftKey] || SHIFT_TIMES.Manana;
  const formStart = scheduleForm.inicio || selectedShift.inicio;
  const formEnd = scheduleForm.fin || selectedShift.fin;

  const availableSellers = useMemo(() => {
    if (!scheduleForm.fecha || !formStart || !formEnd) return sellers;

    return sellers.filter((seller) => {
      const name = sellerName(seller);
      const hasConflict = upcomingSchedules.some(
        (item) =>
          item.estado === "programado" &&
          item.fecha === scheduleForm.fecha &&
          item.responsable === name &&
          formStart < item.fin &&
          formEnd > item.inicio
      );
      return !hasConflict || scheduleForm.responsableId === seller.id;
    });
  }, [formEnd, formStart, scheduleForm.fecha, scheduleForm.responsableId, sellers, upcomingSchedules]);

  const handleSellerChange = (event) => {
    const selectedSeller = sellers.find((item) => item.id === event.target.value);
    setScheduleForm((current) => ({
      ...current,
      responsableId: selectedSeller?.id || "",
      responsable: selectedSeller ? sellerName(selectedSeller) : "",
    }));
  };

  const handleShiftChange = (event) => {
    const turno = event.target.value;
    const hours = SHIFT_TIMES[turno] || SHIFT_TIMES.Manana;
    setScheduleForm((current) => ({ ...current, turno, inicio: hours.inicio, fin: hours.fin }));
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Agenda" title="Turnos y plan semanal" description="Programa responsables, franjas horarias y estado de cada turno." />

      <SectionBlock description="Elige el vendedor, la fecha y una franja. El horario se asigna automaticamente." title="Nuevo turno">
        <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
          <div className="grid gap-4 rounded-2xl border border-[#e4ece2] bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
          <label className="grid gap-2 text-sm">
            <span className="font-semibold text-[#183325] dark:text-white">Fecha del turno</span>
            <input
              className="h-12 rounded-xl border border-[#dfe7db] bg-white px-4 text-sm outline-none transition focus:border-[#1f7a3a] focus:ring-4 focus:ring-[#1f7a3a]/10 dark:border-white/10 dark:bg-[#0d1710]"
              onChange={(event) => setScheduleForm((current) => ({ ...current, fecha: event.target.value }))}
              type="date"
              value={scheduleForm.fecha}
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-semibold text-[#183325] dark:text-white">Vendedor disponible</span>
            <select className="h-12 rounded-xl border border-[#dfe7db] bg-white px-4 text-sm outline-none transition focus:border-[#1f7a3a] focus:ring-4 focus:ring-[#1f7a3a]/10 dark:border-white/10 dark:bg-[#0d1710]" onChange={handleSellerChange} value={scheduleForm.responsableId || ""}>
              <option value="">Selecciona un vendedor</option>
              {availableSellers.map((seller) => (
                <option key={seller.id} value={seller.id}>
                  {sellerName(seller)}
                </option>
              ))}
            </select>
            {!availableSellers.length ? <span className="text-xs text-[#c2410c]">No hay vendedores disponibles para ese turno.</span> : null}
          </label>
          </div>

          <div className="rounded-2xl border border-[#e4ece2] bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
            <span className="text-sm font-semibold text-[#183325] dark:text-white">Selecciona el turno</span>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {Object.values(SHIFT_TIMES).map((shift) => {
                const selected = currentShiftKey === shift.label;
                return (
                  <button
                    className={`rounded-2xl border px-4 py-4 text-left transition ${
                      selected
                        ? "border-[#1f7a3a] bg-[#1f7a3a] text-white shadow-lg shadow-[#1f7a3a]/20"
                        : "border-[#dfe7db] bg-white text-[#183325] hover:border-[#1f7a3a] dark:border-white/10 dark:bg-[#0d1710] dark:text-white"
                    }`}
                    key={shift.label}
                    onClick={() => handleShiftChange({ target: { value: shift.label } })}
                    type="button"
                  >
                    <span className="block text-sm font-semibold">{shift.label}</span>
                    <span className={`mt-2 block text-xs ${selected ? "text-white/80" : "text-[#5b6d61] dark:text-white/60"}`}>
                      {shift.inicio} - {shift.fin}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <label className="grid gap-2 text-sm lg:col-span-2">
            <span className="font-semibold text-[#183325] dark:text-white">Notas opcionales</span>
            <input
              className="h-12 rounded-xl border border-[#dfe7db] bg-white px-4 text-sm outline-none transition focus:border-[#1f7a3a] focus:ring-4 focus:ring-[#1f7a3a]/10 dark:border-white/10 dark:bg-[#0d1710]"
              onChange={(event) => setScheduleForm((current) => ({ ...current, notas: event.target.value }))}
              placeholder="Ejemplo: cubrir caja, revisar inventario o apoyar cierre."
              value={scheduleForm.notas}
            />
          </label>
        </div>

        <button className="mt-5 rounded-xl bg-[#1f7a3a] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#1f7a3a]/20 transition hover:bg-[#17642f]" onClick={createSchedule} type="button">
          Guardar turno
        </button>
      </SectionBlock>

      <SectionBlock description="Estados y acciones administrativas sobre los turnos existentes." title="Agenda programada">
        {upcomingSchedules.length ? (
          <div className="space-y-3">
            {upcomingSchedules.map((item) => (
              <article key={item.id} className="flex flex-col gap-4 rounded-lg border border-[#e4ece2] p-4 dark:border-white/10 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <strong className="block text-sm font-semibold text-[#183325] dark:text-white">{item.responsable}</strong>
                  <p className="mt-1 text-sm text-[#5b6d61] dark:text-white/68">
                    {item.fecha} - {item.inicio} a {item.fin} - {item.turno}
                  </p>
                  {item.notas ? <p className="mt-1 text-sm text-[#5b6d61] dark:text-white/60">{item.notas}</p> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#f4f8ef] px-3 py-2 text-xs font-semibold text-[#56705d] dark:bg-[#1d3425] dark:text-white/70">{item.estado}</span>
                  <button className="rounded-md border border-[#dfe7db] px-3 py-2 text-sm dark:border-white/10" onClick={() => updateScheduleStatus(item.id, "completado")} type="button">
                    Completar
                  </button>
                  <button className="rounded-md border border-[#dfe7db] px-3 py-2 text-sm dark:border-white/10" onClick={() => updateScheduleStatus(item.id, "cancelado")} type="button">
                    Cancelar
                  </button>
                  <button className="rounded-md border border-[#f7c2bf] px-3 py-2 text-sm text-[#c2410c]" onClick={() => deleteSchedule(item.id)} type="button">
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState description="Todavia no hay turnos programados." title="Agenda vacia" />
        )}
      </SectionBlock>
    </div>
  );
}
