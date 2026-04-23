import { useMemo } from "react";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";
import SectionBlock from "../../components/ui/SectionBlock";
import StatCard from "../../components/ui/StatCard";

function startOfDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function startOfWeek(date) {
  const next = startOfDay(date);
  const day = next.getDay();
  const diff = (day + 6) % 7;
  next.setDate(next.getDate() - diff);
  return next;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfYear(date) {
  return new Date(date.getFullYear(), 0, 1);
}

function endOfRange(date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function isInRange(value, start, end) {
  const time = new Date(value).getTime();
  return time >= start.getTime() && time <= end.getTime();
}

function sumAmount(items) {
  return items.reduce((acc, item) => acc + Number(item.total ?? item.monto ?? 0), 0);
}

function groupSalesBy(items, getKey) {
  const map = new Map();

  items.forEach((item) => {
    const key = getKey(item);
    const current = map.get(key) || { label: key, sales: 0, amount: 0 };
    current.sales += 1;
    current.amount += Number(item.total || 0);
    map.set(key, current);
  });

  return [...map.values()];
}

export default function SalesAnalyticsPage({ expenses, money, sales }) {
  const today = new Date();
  const dayStart = startOfDay(today);
  const weekStart = startOfWeek(today);
  const monthStart = startOfMonth(today);
  const yearStart = startOfYear(today);
  const periodEnd = endOfRange(today);

  const dailySales = useMemo(() => sales.filter((item) => isInRange(item.createdAt, dayStart, periodEnd)), [dayStart, periodEnd, sales]);
  const weeklySales = useMemo(() => sales.filter((item) => isInRange(item.createdAt, weekStart, periodEnd)), [periodEnd, sales, weekStart]);
  const monthlySales = useMemo(() => sales.filter((item) => isInRange(item.createdAt, monthStart, periodEnd)), [monthStart, periodEnd, sales]);
  const yearlySales = useMemo(() => sales.filter((item) => isInRange(item.createdAt, yearStart, periodEnd)), [periodEnd, sales, yearStart]);

  const dailyExpenses = useMemo(() => expenses.filter((item) => isInRange(item.createdAt, dayStart, periodEnd)), [dayStart, expenses, periodEnd]);
  const weeklyExpenses = useMemo(() => expenses.filter((item) => isInRange(item.createdAt, weekStart, periodEnd)), [expenses, periodEnd, weekStart]);
  const monthlyExpenses = useMemo(() => expenses.filter((item) => isInRange(item.createdAt, monthStart, periodEnd)), [expenses, monthStart, periodEnd]);
  const yearlyExpenses = useMemo(() => expenses.filter((item) => isInRange(item.createdAt, yearStart, periodEnd)), [expenses, periodEnd, yearStart]);

  const periods = [
    { label: "Hoy", sales: dailySales, expenses: dailyExpenses, accent: "green" },
    { label: "Semana", sales: weeklySales, expenses: weeklyExpenses, accent: "orange" },
    { label: "Mes", sales: monthlySales, expenses: monthlyExpenses, accent: "yellow" },
    { label: "Año", sales: yearlySales, expenses: yearlyExpenses, accent: "green" },
  ];

  const summaryCards = periods.map((period) => {
    const salesAmount = sumAmount(period.sales);
    const expensesAmount = sumAmount(period.expenses);
    const net = salesAmount - expensesAmount;
    return {
      label: `${period.label} neto`,
      value: money(net),
      detail: `${period.sales.length} ventas · ${money(salesAmount)} en ingresos`,
      accent: period.accent,
    };
  });

  const salesBySeller = useMemo(() => {
    const map = new Map();
    yearlySales.forEach((sale) => {
      const key = sale.userName || "Sin nombre";
      const current = map.get(key) || { seller: key, sales: 0, amount: 0 };
      current.sales += 1;
      current.amount += Number(sale.total || 0);
      map.set(key, current);
    });
    return [...map.values()].sort((a, b) => b.amount - a.amount);
  }, [yearlySales]);

  const recentDailyTrend = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      const start = startOfDay(date);
      const end = endOfRange(date);
      const daySales = sales.filter((item) => isInRange(item.createdAt, start, end));
      const dayExpenses = expenses.filter((item) => isInRange(item.createdAt, start, end));

      return {
        label: new Intl.DateTimeFormat("es-EC", { weekday: "short", day: "numeric" }).format(date),
        salesCount: daySales.length,
        income: sumAmount(daySales),
        expense: sumAmount(dayExpenses),
      };
    });

    return days;
  }, [expenses, sales, today]);

  const monthlyTrend = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(today.getFullYear(), today.getMonth() - (5 - index), 1);
      const start = startOfMonth(date);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
      const monthSales = sales.filter((item) => isInRange(item.createdAt, start, end));
      const monthExpenses = expenses.filter((item) => isInRange(item.createdAt, start, end));
      return {
        label: new Intl.DateTimeFormat("es-EC", { month: "short", year: "2-digit" }).format(date),
        income: sumAmount(monthSales),
        expense: sumAmount(monthExpenses),
        net: sumAmount(monthSales) - sumAmount(monthExpenses),
      };
    });

    return months;
  }, [expenses, sales, today]);

  const paymentMix = useMemo(() => {
    const map = new Map();
    yearlySales.forEach((sale) => {
      const key = sale.paymentMethod || "efectivo";
      const current = map.get(key) || { method: key, sales: 0, amount: 0 };
      current.sales += 1;
      current.amount += Number(sale.total || 0);
      map.set(key, current);
    });
    return [...map.values()].sort((a, b) => b.amount - a.amount);
  }, [yearlySales]);

  const topProducts = useMemo(() => {
    const map = new Map();
    yearlySales.forEach((sale) => {
      (sale.items || []).forEach((item) => {
        const key = item.nombre || "Producto";
        const current = map.get(key) || { product: key, units: 0, amount: 0 };
        current.units += Number(item.cantidad || 0);
        current.amount += Number(item.subtotal || 0);
        map.set(key, current);
      });
    });
    return [...map.values()].sort((a, b) => b.amount - a.amount).slice(0, 5);
  }, [yearlySales]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Analitica de ventas"
        description="Resumen financiero vivo del negocio con lectura diaria, semanal, mensual y anual segun las ventas registradas."
      />

      <div className="grid gap-4 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <StatCard key={card.label} accent={card.accent} detail={card.detail} label={card.label} value={card.value} />
        ))}
      </div>

      <SectionBlock description="Cruce entre ingresos por ventas y egresos registrados para leer la salud financiera del negocio." title="Resumen por periodo">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-[#6a7b70] dark:text-white/55">
              <tr>
                <th className="pb-3">Periodo</th>
                <th className="pb-3">Ventas</th>
                <th className="pb-3">Ingresos</th>
                <th className="pb-3">Egresos</th>
                <th className="pb-3">Neto</th>
                <th className="pb-3">Ticket promedio</th>
              </tr>
            </thead>
            <tbody>
              {periods.map((period) => {
                const income = sumAmount(period.sales);
                const outgoing = sumAmount(period.expenses);
                const net = income - outgoing;
                const avgTicket = period.sales.length ? income / period.sales.length : 0;
                return (
                  <tr key={period.label} className="border-t border-[#edf1ea] dark:border-white/10">
                    <td className="py-3 font-medium">{period.label}</td>
                    <td className="py-3">{period.sales.length}</td>
                    <td className="py-3">{money(income)}</td>
                    <td className="py-3">{money(outgoing)}</td>
                    <td className={`py-3 font-semibold ${net >= 0 ? "text-[#1f7a3a]" : "text-[#b42318]"}`}>{money(net)}</td>
                    <td className="py-3">{money(avgTicket)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionBlock>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionBlock description="Ultimos 7 dias para ver si el ritmo comercial viene subiendo o bajando." title="Tendencia diaria">
          {recentDailyTrend.length ? (
            <div className="space-y-3">
              {recentDailyTrend.map((item) => (
                <article key={item.label} className="rounded-lg border border-[#e4ece2] px-4 py-4 dark:border-white/10">
                  <div className="flex items-center justify-between gap-3">
                    <strong className="text-sm font-semibold text-[#183325] dark:text-white">{item.label}</strong>
                    <span className="text-sm text-[#5b6d61] dark:text-white/68">{item.salesCount} ventas</span>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-[#5b6d61] dark:text-white/68 md:grid-cols-3">
                    <span>Ingresos: {money(item.income)}</span>
                    <span>Egresos: {money(item.expense)}</span>
                    <span>Neto: {money(item.income - item.expense)}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="Sin datos diarios" description="Aun no hay ventas suficientes para construir la tendencia." />
          )}
        </SectionBlock>

        <SectionBlock description="Lectura mensual del rendimiento financiero reciente." title="Tendencia mensual">
          {monthlyTrend.length ? (
            <div className="space-y-3">
              {monthlyTrend.map((item) => (
                <article key={item.label} className="rounded-lg border border-[#e4ece2] px-4 py-4 dark:border-white/10">
                  <div className="flex items-center justify-between gap-3">
                    <strong className="text-sm font-semibold text-[#183325] dark:text-white">{item.label}</strong>
                    <strong className={`text-sm ${item.net >= 0 ? "text-[#1f7a3a]" : "text-[#b42318]"}`}>{money(item.net)}</strong>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-[#5b6d61] dark:text-white/68 md:grid-cols-2">
                    <span>Ingresos: {money(item.income)}</span>
                    <span>Egresos: {money(item.expense)}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="Sin datos mensuales" description="No hay ventas registradas para este tramo de tiempo." />
          )}
        </SectionBlock>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <SectionBlock description="Quien esta moviendo mas ventas en el acumulado anual." title="Rendimiento por vendedor">
          {salesBySeller.length ? (
            <div className="space-y-3">
              {salesBySeller.map((item) => (
                <article key={item.seller} className="rounded-lg border border-[#e4ece2] px-4 py-4 dark:border-white/10">
                  <strong className="block text-sm font-semibold text-[#183325] dark:text-white">{item.seller}</strong>
                  <p className="mt-1 text-sm text-[#5b6d61] dark:text-white/68">
                    {item.sales} ventas · {money(item.amount)}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="Sin vendedores con ventas" description="Aun no hay registros para comparar rendimiento." />
          )}
        </SectionBlock>

        <SectionBlock description="Metodos de pago que mas aportan a las ventas." title="Mix de pagos">
          {paymentMix.length ? (
            <div className="space-y-3">
              {paymentMix.map((item) => (
                <article key={item.method} className="rounded-lg border border-[#e4ece2] px-4 py-4 dark:border-white/10">
                  <strong className="block text-sm font-semibold text-[#183325] dark:text-white">{item.method}</strong>
                  <p className="mt-1 text-sm text-[#5b6d61] dark:text-white/68">
                    {item.sales} ventas · {money(item.amount)}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="Sin pagos registrados" description="La mezcla de metodos aparecera cuando existan ventas." />
          )}
        </SectionBlock>

        <SectionBlock description="Productos con mayor aporte en ingresos durante el año." title="Top productos">
          {topProducts.length ? (
            <div className="space-y-3">
              {topProducts.map((item) => (
                <article key={item.product} className="rounded-lg border border-[#e4ece2] px-4 py-4 dark:border-white/10">
                  <strong className="block text-sm font-semibold text-[#183325] dark:text-white">{item.product}</strong>
                  <p className="mt-1 text-sm text-[#5b6d61] dark:text-white/68">
                    {item.units} unidades · {money(item.amount)}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="Sin ranking de productos" description="El ranking aparecera cuando ya existan ventas con items." />
          )}
        </SectionBlock>
      </div>
    </div>
  );
}
