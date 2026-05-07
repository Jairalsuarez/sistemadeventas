import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CloseShiftModal from "../../components/modals/CloseShiftModal";
import ShiftSummaryModal from "../../components/modals/ShiftSummaryModal";
import Icon from "../../components/ui/Icon";
import PageHeader from "../../components/ui/PageHeader";
import SectionBlock from "../../components/ui/SectionBlock";
import StatCard from "../../components/ui/StatCard";

export default function AdminDashboardPage({
  adminStats,
  formatDate,
  onNewInformalSale,
  onNewSale,
  onCloseShift,
  sellerShiftRows,
  money,
}) {
  const navigate = useNavigate();
  const [shiftToClose, setShiftToClose] = useState(null);
  const [summaryToView, setSummaryToView] = useState(null);
  const sellers = sellerShiftRows || [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Resumen del negocio"
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
              className="inline-flex items-center gap-3 rounded-xl bg-[#1f7a3a] px-6 py-4 text-base font-semibold text-white shadow-[0_16px_30px_rgba(31,122,58,0.24)] transition hover:-translate-y-0.5 dark:bg-[linear-gradient(135deg,#2563eb,#1d4ed8)] dark:shadow-[0_16px_30px_rgba(37,99,235,0.24)]"
              onClick={onNewSale}
              type="button"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-2xl text-white dark:bg-white/10">
                <Icon name="add" />
              </span>
              Registrar venta
            </button>
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-2">
        {adminStats.map((stat, index) => (
          <StatCard key={stat.label} accent={index === 1 ? "orange" : index === 2 ? "yellow" : "green"} detail={stat.detail} label={stat.label} value={stat.value} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_380px]">
        <div className="grid content-start gap-3">
          <button
            className="flex min-h-[76px] w-full items-center justify-between gap-4 rounded-xl border border-[#dfe7db] bg-white px-5 py-4 text-left transition active:scale-[0.99] dark:border-[#314056] dark:bg-[#182235]"
            onClick={() => navigate("/panel/saldo")}
            type="button"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#eef6f0] text-[#1f7a3a] dark:bg-[#0f172a] dark:text-[#93c5fd]">
                <Icon name="account_balance_wallet" />
              </span>
              <span className="min-w-0">
                <strong className="block text-base font-semibold text-[#183325] dark:text-[#f8fafc]">Saldo</strong>
                <span className="mt-1 block text-sm text-[#5b6d61] dark:text-[#c7d2e0]">Egresos, mercaderia y saldo actual</span>
              </span>
            </span>
            <Icon className="shrink-0 text-[#1f7a3a] dark:text-[#60a5fa]" name="chevron_right" />
          </button>

          <button
            className="flex min-h-[76px] w-full items-center justify-between gap-4 rounded-xl border border-[#dfe7db] bg-white px-5 py-4 text-left transition active:scale-[0.99] dark:border-[#314056] dark:bg-[#182235]"
            onClick={() => navigate("/panel/productos")}
            type="button"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#fff7ed] text-[#c2410c] dark:bg-[#0f172a] dark:text-[#fdba74]">
                <Icon name="inventory_2" />
              </span>
              <span className="min-w-0">
                <strong className="block text-base font-semibold text-[#183325] dark:text-[#f8fafc]">Productos</strong>
                <span className="mt-1 block text-sm text-[#5b6d61] dark:text-[#c7d2e0]">Inventario, precios y existencias</span>
              </span>
            </span>
            <Icon className="shrink-0 text-[#1f7a3a] dark:text-[#60a5fa]" name="chevron_right" />
          </button>
        </div>

        <SectionBlock title="Turnos del equipo">
          <div className="space-y-3">
            {sellers.map((seller) => (
              <article key={seller.id} className="rounded-lg border border-[#e4ece2] px-4 py-4 dark:border-[#23314d] dark:bg-[#182235]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <strong className="block text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">{seller.name}</strong>
                    <p className="mt-1 text-sm text-[#5b6d61] dark:text-[#c7d2e0]">{seller.statusLabel}</p>
                    {seller.activeShift ? (
                      <p className="mt-2 text-xs text-[#6a7b70] dark:text-[#94a3b8]">
                        Abierto el {formatDate(seller.activeShift.startedAt, { dateStyle: "medium", timeStyle: "short" })}
                      </p>
                    ) : null}
                  </div>
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                      seller.activeShift ? "bg-white text-[#1f7a3a] dark:bg-[#0f172a] dark:text-[#60a5fa]" : "bg-white text-[#6a7b70] dark:bg-[#0f172a] dark:text-[#94a3b8]"
                    }`}
                  >
                    <Icon className="text-sm" name={seller.activeShift ? "schedule" : "check_circle"} />
                    {seller.activeShift ? "Activo" : "Sin turno"}
                  </span>
                </div>
                {seller.activeShift ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      className="rounded-md border border-[#dfe7db] bg-white px-4 py-2 text-sm font-medium text-[#183325] transition hover:bg-[#f8fafc] dark:border-[#314056] dark:bg-[#172033] dark:text-[#f8fafc] dark:hover:bg-[#22304a]"
                      onClick={() => setSummaryToView(seller.shiftSummary)}
                      type="button"
                    >
                      Ver resumen del turno
                    </button>
                    <button
                      className="rounded-md border border-[#f0c7ba] bg-[#fff7f4] px-4 py-2 text-sm font-medium text-[#b42318] transition hover:bg-[#ffefe8] dark:border-[#4b5563] dark:bg-[#111827] dark:text-[#fca5a5] dark:hover:bg-[#172033]"
                      onClick={() => setShiftToClose(seller.activeShift)}
                      type="button"
                    >
                      Terminar turno
                    </button>
                  </div>
                ) : null}
              </article>
            ))}
            {!sellers.length ? <p className="text-sm text-[#5b6d61] dark:text-[#c7d2e0]">Todavia no hay vendedores cargados para monitorear turnos.</p> : null}
          </div>
        </SectionBlock>
      </div>

      <CloseShiftModal
        onClose={() => setShiftToClose(null)}
        onConfirm={() => {
          onCloseShift(shiftToClose);
          setShiftToClose(null);
        }}
        open={Boolean(shiftToClose)}
        text={shiftToClose ? `Desea cerrar manualmente el turno de ${shiftToClose.userName || "este vendedor"}?` : "Desea cerrar manualmente este turno?"}
        title="Cerrar turno del vendedor"
      />
      <ShiftSummaryModal money={money} onClose={() => setSummaryToView(null)} open={Boolean(summaryToView)} summary={summaryToView} />
    </div>
  );
}
