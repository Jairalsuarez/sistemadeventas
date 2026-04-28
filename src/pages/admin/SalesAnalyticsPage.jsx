import { useMemo, useState } from "react";
import SaleDetailsModal from "../../components/modals/SaleDetailsModal";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";
import SectionBlock from "../../components/ui/SectionBlock";
import StatCard from "../../components/ui/StatCard";

function startOfDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function sumAmount(items, key) {
  return items.reduce((acc, item) => acc + Number(item?.[key] || 0), 0);
}

function capitalizeLabel(value = "") {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatPaymentMethod(value = "") {
  const map = {
    efectivo: "Efectivo",
    transferencia_directa: "Transferencia directa",
    deuna: "Deuna",
  };
  return map[value] || value || "Sin definir";
}

function buildMonthlySeries({ expenses, sales, today }) {
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - (5 - index), 1);
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const monthSales = sales.filter((item) => {
      const time = new Date(item.createdAt).getTime();
      return time >= start.getTime() && time <= end.getTime();
    });
    const monthExpenses = expenses.filter((item) => {
      const time = new Date(item.createdAt).getTime();
      return time >= start.getTime() && time <= end.getTime();
    });

    return {
      id: `${date.getFullYear()}-${date.getMonth()}`,
      label: new Intl.DateTimeFormat("es-EC", { month: "short" }).format(date),
      fullLabel: capitalizeLabel(new Intl.DateTimeFormat("es-EC", { month: "long", year: "numeric" }).format(date)),
      income: sumAmount(monthSales, "total"),
      expense: sumAmount(monthExpenses, "monto"),
      salesCount: monthSales.length,
    };
  });
}

export default function SalesAnalyticsPage({ expenses, money, sales }) {
  const [selectedSaleId, setSelectedSaleId] = useState(null);
  const today = useMemo(() => new Date(), []);
  const todayStart = startOfDay(today);
  const currentMonthStart = startOfMonth(today);
  const currentMonthEnd = endOfMonth(today);

  const salesThisMonth = useMemo(
    () =>
      sales.filter((item) => {
        const time = new Date(item.createdAt).getTime();
        return time >= currentMonthStart.getTime() && time <= currentMonthEnd.getTime();
      }),
    [currentMonthEnd, currentMonthStart, sales]
  );

  const expensesThisMonth = useMemo(
    () =>
      expenses.filter((item) => {
        const time = new Date(item.createdAt).getTime();
        return time >= currentMonthStart.getTime() && time <= currentMonthEnd.getTime();
      }),
    [currentMonthEnd, currentMonthStart, expenses]
  );

  const salesToday = useMemo(
    () =>
      sales.filter((item) => {
        const time = new Date(item.createdAt).getTime();
        return time >= todayStart.getTime();
      }),
    [sales, todayStart]
  );

  const monthlySeries = useMemo(() => buildMonthlySeries({ expenses, sales, today }), [expenses, sales, today]);
  const chartMax = Math.max(1, ...monthlySeries.flatMap((item) => [item.income, item.expense]));

  const summary = useMemo(() => {
    const incomeMonth = sumAmount(salesThisMonth, "total");
    const expenseMonth = sumAmount(expensesThisMonth, "monto");
    const incomeToday = sumAmount(salesToday, "total");
    return [
      {
        label: "Total por mes",
        value: money(incomeMonth),
        detail: `${salesThisMonth.length} venta(s) registradas este mes`,
        accent: "green",
      },
      {
        label: "Egresos del mes",
        value: money(expenseMonth),
        detail: `${expensesThisMonth.length} egreso(s) cargados este mes`,
        accent: "orange",
      },
      {
        label: "Total de hoy",
        value: money(incomeToday),
        detail: `${salesToday.length} venta(s) registradas hoy`,
        accent: "yellow",
      },
    ];
  }, [expensesThisMonth, money, salesThisMonth, salesToday]);

  const recentSales = useMemo(
    () =>
      [...sales]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 12),
    [sales]
  );
  const getSaleDetails = (saleId) => sales.find((sale) => sale.id === saleId) || null;
  const selectedSale = selectedSaleId ? getSaleDetails(selectedSaleId) : null;

  const sellerRows = useMemo(() => {
    const map = new Map();
    salesThisMonth.forEach((sale) => {
      const key = sale.userName || "Sin nombre";
      const current = map.get(key) || { seller: key, total: 0, count: 0, lastSaleAt: sale.createdAt };
      current.total += Number(sale.total || 0);
      current.count += 1;
      if (new Date(sale.createdAt).getTime() > new Date(current.lastSaleAt).getTime()) {
        current.lastSaleAt = sale.createdAt;
      }
      map.set(key, current);
    });

    return [...map.values()].sort((a, b) => b.total - a.total);
  }, [salesThisMonth]);

  const formatDateTime = (value) =>
    new Intl.DateTimeFormat("es-EC", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Ventas"
        description="Revisión clara de ingresos, egresos y ventas recientes para saber quién vendió, cuándo y cuánto se movió."
      />

      <div className="grid gap-4 xl:grid-cols-3">
        {summary.map((card) => (
          <StatCard key={card.label} accent={card.accent} detail={card.detail} label={card.label} value={card.value} />
        ))}
      </div>

      <SectionBlock
        title="Ingresos y egresos"
        description="Comparación mensual de los últimos seis meses para leer rápido cómo se viene moviendo el negocio."
      >
        {monthlySeries.length ? (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-4 text-sm text-[#5b6d61] dark:text-[#c7d2e0]">
              <span className="inline-flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#1f7a3a] dark:bg-[#60a5fa]" />
                Ingresos
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#f97316]" />
                Egresos
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
              {monthlySeries.map((item) => (
                <article key={item.id} className="rounded-xl border border-[#e4ece2] bg-white p-4 dark:border-[#23314d] dark:bg-[#182235]">
                  <div className="flex h-44 items-end justify-center gap-3">
                    <div className="flex h-full flex-col items-center justify-end gap-2">
                      <div
                        className="w-8 rounded-t-xl bg-[#1f7a3a] shadow-[0_10px_20px_rgba(31,122,58,0.22)] dark:bg-[#60a5fa] dark:shadow-[0_10px_20px_rgba(96,165,250,0.2)]"
                        style={{ height: `${Math.max((item.income / chartMax) * 100, item.income ? 8 : 0)}%` }}
                      />
                      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6a7b70] dark:text-[#94a3b8]">Ing</span>
                    </div>
                    <div className="flex h-full flex-col items-center justify-end gap-2">
                      <div
                        className="w-8 rounded-t-xl bg-[#f97316] shadow-[0_10px_20px_rgba(249,115,22,0.22)]"
                        style={{ height: `${Math.max((item.expense / chartMax) * 100, item.expense ? 8 : 0)}%` }}
                      />
                      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6a7b70] dark:text-[#94a3b8]">Egr</span>
                    </div>
                  </div>
                  <div className="mt-4 space-y-1">
                    <strong className="block text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">{item.fullLabel}</strong>
                    <p className="text-xs text-[#5b6d61] dark:text-[#c7d2e0]">Ingresos: {money(item.income)}</p>
                    <p className="text-xs text-[#5b6d61] dark:text-[#c7d2e0]">Egresos: {money(item.expense)}</p>
                    <p className="text-xs text-[#6a7b70] dark:text-[#94a3b8]">{item.salesCount} venta(s)</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState title="Sin movimientos" description="Todavia no hay datos suficientes para construir la grafica." />
        )}
      </SectionBlock>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_360px]">
        <SectionBlock
          title="Registro de ventas"
          description="Vista directa para revisar quien hizo cada venta, cuando la hizo y el monto registrado."
        >
          {recentSales.length ? (
            <>
              <div className="space-y-3 md:hidden">
                {recentSales.map((sale) => (
                  <button key={sale.id} className="block w-full rounded-xl border border-[#edf1ea] p-4 text-left transition hover:border-[#1f7a3a] hover:bg-[#fafcf9] dark:border-[#23314d] dark:bg-[#182235] dark:hover:border-[#60a5fa]" onClick={() => setSelectedSaleId(sale.id)} type="button">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <strong className="block text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">{sale.userName || "Sin nombre"}</strong>
                          <span className="mt-1 block text-xs text-[#5b6d61] dark:text-[#c7d2e0]">{formatDateTime(sale.createdAt)}</span>
                        </div>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            sale.informal
                              ? "bg-[#fff7ed] text-[#c2410c] dark:bg-[#3b1d12] dark:text-[#fdba74]"
                              : "bg-[#eff6ff] text-[#1d4ed8] dark:bg-[#172554] dark:text-[#93c5fd]"
                          }`}
                        >
                          {sale.informal ? "Informal" : "Formal"}
                        </span>
                      </div>
                      {sale.description ? <p className="text-sm text-[#5b6d61] dark:text-[#c7d2e0]">{sale.description}</p> : null}
                      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                        <span className="text-[#5b6d61] dark:text-[#c7d2e0]">{formatPaymentMethod(sale.paymentMethod)}</span>
                        <strong className="text-[#183325] dark:text-[#f8fafc]">{money(sale.total)}</strong>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-[#6a7b70] dark:text-[#94a3b8]">
                    <tr>
                      <th className="pb-3">Fecha</th>
                      <th className="pb-3">Vendedor</th>
                      <th className="pb-3 pr-6">Tipo</th>
                      <th className="pb-3 pl-4">Pago</th>
                      <th className="pb-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSales.map((sale) => (
                      <tr key={sale.id} className="cursor-pointer border-t border-[#edf1ea] transition hover:bg-[#f8faf6] dark:border-[#23314d] dark:hover:bg-[#111827]" onClick={() => setSelectedSaleId(sale.id)}>
                        <td className="py-3 text-[#183325] dark:text-[#f8fafc]">{formatDateTime(sale.createdAt)}</td>
                        <td className="py-3">
                          <div>
                            <strong className="block text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">{sale.userName || "Sin nombre"}</strong>
                            {sale.description ? <span className="mt-1 block text-xs text-[#5b6d61] dark:text-[#c7d2e0]">{sale.description}</span> : null}
                          </div>
                        </td>
                        <td className="py-3 pr-6">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              sale.informal
                                ? "bg-[#fff7ed] text-[#c2410c] dark:bg-[#3b1d12] dark:text-[#fdba74]"
                                : "bg-[#eff6ff] text-[#1d4ed8] dark:bg-[#172554] dark:text-[#93c5fd]"
                            }`}
                          >
                            {sale.informal ? "Informal" : "Formal"}
                          </span>
                        </td>
                        <td className="py-3 pl-4 text-[#5b6d61] dark:text-[#c7d2e0]">{formatPaymentMethod(sale.paymentMethod)}</td>
                        <td className="py-3 text-right font-semibold text-[#183325] dark:text-[#f8fafc]">{money(sale.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <EmptyState title="Sin ventas recientes" description="Cuando registres ventas, aqui aparecera el historial mas reciente." />
          )}
        </SectionBlock>

        <SectionBlock
          title="Ventas por vendedor"
          description="Resumen del mes actual para ver quien esta moviendo mas dinero."
        >
          {sellerRows.length ? (
            <div className="space-y-3">
              {sellerRows.map((item) => (
                <article key={item.seller} className="rounded-xl border border-[#e4ece2] bg-white px-4 py-4 dark:border-[#23314d] dark:bg-[#182235]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <strong className="block text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">{item.seller}</strong>
                      <p className="mt-1 text-sm text-[#5b6d61] dark:text-[#c7d2e0]">
                        {item.count} venta(s) este mes
                      </p>
                    </div>
                    <strong className="text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">{money(item.total)}</strong>
                  </div>
                  <p className="mt-3 text-xs text-[#6a7b70] dark:text-[#94a3b8]">Ultima venta: {formatDateTime(item.lastSaleAt)}</p>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="Sin ventas en el mes" description="Todavia no hay ventas registradas este mes para comparar vendedores." />
          )}
        </SectionBlock>
      </div>
      <SaleDetailsModal
        formatDateTime={formatDateTime}
        money={money}
        onClose={() => setSelectedSaleId(null)}
        open={Boolean(selectedSale)}
        sale={selectedSale}
      />
    </div>
  );
}
