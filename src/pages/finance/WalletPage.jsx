import { useEffect, useMemo, useState } from "react";
import Icon from "../../components/ui/Icon";
import PageHeader from "../../components/ui/PageHeader";
import Pagination from "../../components/ui/Pagination";
import SectionBlock from "../../components/ui/SectionBlock";
import StatCard from "../../components/ui/StatCard";

const isToday = (value) => new Date(value).toDateString() === new Date().toDateString();
const EXPENSES_PER_PAGE = 8;

export default function WalletPage({ expenses, isAdmin, money, onOpenExpense, onOpenWallet, wallet }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [showExpenseMovements, setShowExpenseMovements] = useState(false);
  const expensesToday = expenses.filter((item) => isToday(item.createdAt)).reduce((acc, item) => acc + Number(item.monto || 0), 0);
  const orderedExpenses = useMemo(
    () => [...expenses].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [expenses]
  );
  const totalPages = Math.max(1, Math.ceil(orderedExpenses.length / EXPENSES_PER_PAGE));
  const latestExpenses = useMemo(() => {
    const start = (currentPage - 1) * EXPENSES_PER_PAGE;
    return orderedExpenses.slice(start, start + EXPENSES_PER_PAGE);
  }, [currentPage, orderedExpenses]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const stats = [
    { label: "Saldo actual", value: money(wallet?.saldoActual || 0), detail: "Disponible para la operacion diaria" },
    { label: "Egresos de hoy", value: money(expensesToday), detail: `${expenses.filter((item) => isToday(item.createdAt)).length} movimientos hoy` },
    { label: "Total de egresos", value: `${expenses.length}`, detail: "Historial registrado en el sistema" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Cartera"
        title="Control de cartera"
        action={
          <>
            <button className="rounded-md border border-[#dfe7db] px-4 py-2 text-sm font-medium dark:border-white/10" onClick={onOpenExpense} type="button">
              Registrar egreso
            </button>
            {isAdmin ? (
              <button className="rounded-md bg-[#1f7a3a] px-4 py-2 text-sm font-medium text-white" onClick={onOpenWallet} type="button">
                Ajustar cartera
              </button>
            ) : null}
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <StatCard key={stat.label} accent={index === 1 ? "orange" : "green"} detail={stat.detail} label={stat.label} value={stat.value} />
        ))}
      </div>

      <SectionBlock title="Movimientos de egresos">
        <button
          className="flex w-full items-center justify-between gap-4 rounded-xl border border-[#dfe7db] bg-white px-5 py-4 text-left transition hover:border-[#1f7a3a] dark:border-white/10 dark:bg-white/[0.03]"
          onClick={() => setShowExpenseMovements((current) => !current)}
          type="button"
        >
          <span>
            <span className="block text-sm font-semibold text-[#183325] dark:text-white">Ver movimientos de egresos</span>
            <span className="mt-1 block text-sm text-[#5b6d61] dark:text-white/65">{orderedExpenses.length} egreso(s) registrados</span>
          </span>
          <Icon className="text-[#1f7a3a]" name={showExpenseMovements ? "keyboard_arrow_up" : "keyboard_arrow_down"} />
        </button>

        {showExpenseMovements ? (
          latestExpenses.length ? (
            <div className="mt-4 space-y-4">
              <div className="space-y-3">
              {latestExpenses.map((expense) => (
                <article key={expense.id} className="flex flex-col gap-3 rounded-lg border border-[#e4ece2] px-4 py-4 dark:border-white/10 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <strong className="block text-sm font-semibold text-[#183325] dark:text-white">{expense.descripcion}</strong>
                    <p className="mt-1 text-sm text-[#5b6d61] dark:text-white/68">
                      {expense.categoria}
                      {expense.userName ? ` • ${expense.userName}` : ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-left md:text-right">
                    <strong className="block text-sm font-semibold text-[#c2410c]">{money(expense.monto)}</strong>
                    <span className="mt-1 block text-sm text-[#5b6d61] dark:text-white/65">
                      {new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeStyle: "short" }).format(new Date(expense.createdAt))}
                    </span>
                  </div>
                </article>
              ))}
              </div>

            <Pagination
              currentPage={currentPage}
              itemLabel="egresos"
              onPageChange={setCurrentPage}
              pageSize={EXPENSES_PER_PAGE}
              totalItems={orderedExpenses.length}
              totalPages={totalPages}
            />
            </div>
          ) : (
            <p className="mt-4 text-sm text-[#5b6d61] dark:text-white/65">Todavia no hay egresos registrados.</p>
          )
        ) : null}
      </SectionBlock>
    </div>
  );
}
