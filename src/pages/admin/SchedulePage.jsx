import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";
import SectionBlock from "../../components/ui/SectionBlock";

export default function SchedulePage({
  createSchedule,
  deleteSchedule,
  scheduleForm,
  setScheduleForm,
  upcomingSchedules,
  updateScheduleStatus,
}) {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Agenda" title="Turnos y plan semanal" description="Programa responsables, franjas horarias y estado de cada turno." />

      <SectionBlock description="Formulario simple para crear nuevos turnos." title="Nuevo turno">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label className="grid gap-2 text-sm">
            Fecha
            <input className="rounded-md border border-[#dfe7db] px-3 py-2 dark:border-white/10 dark:bg-[#0d1710]" onChange={(event) => setScheduleForm((current) => ({ ...current, fecha: event.target.value }))} type="date" value={scheduleForm.fecha} />
          </label>
          <label className="grid gap-2 text-sm">
            Responsable
            <input className="rounded-md border border-[#dfe7db] px-3 py-2 dark:border-white/10 dark:bg-[#0d1710]" onChange={(event) => setScheduleForm((current) => ({ ...current, responsable: event.target.value }))} value={scheduleForm.responsable} />
          </label>
          <label className="grid gap-2 text-sm">
            Turno
            <select className="rounded-md border border-[#dfe7db] px-3 py-2 dark:border-white/10 dark:bg-[#0d1710]" onChange={(event) => setScheduleForm((current) => ({ ...current, turno: event.target.value }))} value={scheduleForm.turno}>
              <option>Mañana</option>
              <option>Tarde</option>
              <option>Noche</option>
              <option>Apoyo</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm">
            Inicio
            <input className="rounded-md border border-[#dfe7db] px-3 py-2 dark:border-white/10 dark:bg-[#0d1710]" onChange={(event) => setScheduleForm((current) => ({ ...current, inicio: event.target.value }))} type="time" value={scheduleForm.inicio} />
          </label>
          <label className="grid gap-2 text-sm">
            Fin
            <input className="rounded-md border border-[#dfe7db] px-3 py-2 dark:border-white/10 dark:bg-[#0d1710]" onChange={(event) => setScheduleForm((current) => ({ ...current, fin: event.target.value }))} type="time" value={scheduleForm.fin} />
          </label>
          <label className="grid gap-2 text-sm md:col-span-2 xl:col-span-3">
            Notas
            <input className="rounded-md border border-[#dfe7db] px-3 py-2 dark:border-white/10 dark:bg-[#0d1710]" onChange={(event) => setScheduleForm((current) => ({ ...current, notas: event.target.value }))} value={scheduleForm.notas} />
          </label>
        </div>

        <button className="rounded-md bg-[#1f7a3a] px-4 py-2 text-sm font-medium text-white" onClick={createSchedule} type="button">
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
                    {item.fecha} • {item.inicio} - {item.fin} • {item.turno}
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
