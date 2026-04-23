import ActivityFeed from "../../components/dashboard/ActivityFeed";
import Icon from "../../components/ui/Icon";
import PageHeader from "../../components/ui/PageHeader";
import SectionBlock from "../../components/ui/SectionBlock";
import StatCard from "../../components/ui/StatCard";

export default function AdminDashboardPage({
  adminStats,
  formatDate,
  lowStock,
  onNewProduct,
  onNewSale,
  onCloseShift,
  recentActivity,
  sellerShiftRows,
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Resumen del negocio"
        description="Ventas, inventario y flujo operativo actualizados en tiempo real desde el panel principal."
        action={
          <>
            <button className="rounded-md bg-[#1f7a3a] px-4 py-2 text-sm font-medium text-white" onClick={onNewSale} type="button">
              Nueva venta
            </button>
            <button className="rounded-md border border-[#dfe7db] px-4 py-2 text-sm font-medium dark:border-white/10" onClick={onNewProduct} type="button">
              Producto
            </button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-4">
        {adminStats.map((stat, index) => (
          <StatCard key={stat.label} accent={index === 1 ? "orange" : index === 2 ? "yellow" : "green"} detail={stat.detail} label={stat.label} value={stat.value} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_380px]">
        <SectionBlock
          description="Lo mas reciente del negocio para tomar decisiones sin salir del dashboard."
          title="Actividad reciente"
        >
          <ActivityFeed items={recentActivity} />
        </SectionBlock>

        <SectionBlock description="Mira quien esta activo y cierra un turno si necesitas intervenir." title="Turnos del equipo">
          <div className="space-y-3">
            {sellerShiftRows.map((seller) => (
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
                      seller.activeShift ? "bg-[#eef8f1] text-[#1f7a3a]" : "bg-[#f5f7f4] text-[#6a7b70]"
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
            {!sellerShiftRows.length ? <p className="text-sm text-[#5b6d61] dark:text-white/65">Todavia no hay vendedores cargados para monitorear turnos.</p> : null}
          </div>
        </SectionBlock>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)]">
        <SectionBlock description="Productos con prioridad de reposicion." title="Alertas de stock">
          <div className="space-y-3">
            {lowStock.slice(0, 5).map((product) => (
              <article key={product.id} className="rounded-lg border border-[#e4ece2] px-4 py-3 dark:border-white/10">
                <strong className="block text-sm font-semibold text-[#183325] dark:text-white">{product.nombre}</strong>
                <p className="mt-1 text-sm text-[#5b6d61] dark:text-white/68">{product.stock} unidades disponibles</p>
              </article>
            ))}
            {!lowStock.length ? <p className="text-sm text-[#5b6d61] dark:text-white/65">Todo el inventario esta en niveles sanos.</p> : null}
          </div>
        </SectionBlock>
      </div>
    </div>
  );
}
