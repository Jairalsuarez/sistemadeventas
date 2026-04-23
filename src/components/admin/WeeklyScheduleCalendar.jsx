const DAY_LABELS = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getWeekDays(items) {
  const reference = items[0]?.fecha ? new Date(`${items[0].fecha}T00:00:00`) : new Date();
  const start = new Date(reference);
  start.setDate(start.getDate() - start.getDay());

  return Array.from({ length: 7 }).map((_, index) => {
    const current = new Date(start);
    current.setDate(start.getDate() + index);
    return {
      key: formatDateKey(current),
      shortLabel: DAY_LABELS[current.getDay()],
      dateLabel: new Intl.DateTimeFormat("es-EC", { day: "numeric", month: "short" }).format(current),
    };
  });
}

export default function WeeklyScheduleCalendar({ schedules }) {
  const weekDays = getWeekDays(schedules);

  return (
    <div className="grid gap-4">
      <div>
        <h4 className="text-lg font-black tracking-tight text-[#20130A] dark:text-white">Vista semanal</h4>
        <p className="mt-1 text-sm text-[#142026]/65 dark:text-white/70">Consulta rapido quien cubre cada dia y en que horario.</p>
      </div>

      <div className="grid gap-3 lg:grid-cols-7">
        {weekDays.map((day) => {
          const daySchedules = schedules.filter((item) => item.fecha === day.key);

          return (
            <section key={day.key} className="min-h-[180px] rounded-[24px] border border-[#123142]/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#142026]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <span className="block text-xs font-bold uppercase tracking-[0.16em] text-[#3B657A] dark:text-[#E9F0C9]">{day.shortLabel}</span>
                  <strong className="block text-base font-black text-[#20130A] dark:text-white">{day.dateLabel}</strong>
                </div>
                <span className="rounded-full bg-[#E9F0C9] px-3 py-1 text-xs font-bold text-[#123142] dark:bg-[#123142] dark:text-[#E9F0C9]">
                  {daySchedules.length}
                </span>
              </div>

              <div className="grid gap-2">
                {daySchedules.length ? (
                  daySchedules.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-[#123142]/10 bg-[#F6F8F8] px-3 py-3 dark:border-white/10 dark:bg-[#123142]">
                      <strong className="block text-sm font-black text-[#20130A] dark:text-white">{item.responsable}</strong>
                      <span className="mt-1 block text-xs text-[#142026]/70 dark:text-white/72">
                        {item.inicio} - {item.fin}
                      </span>
                      <span className="mt-2 inline-flex rounded-full bg-white px-2 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#288990] dark:bg-[#142026] dark:text-[#E9F0C9]">
                        {item.turno}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#123142]/14 px-3 py-5 text-center text-xs text-[#142026]/55 dark:border-white/10 dark:text-white/60">
                    Sin turnos
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
