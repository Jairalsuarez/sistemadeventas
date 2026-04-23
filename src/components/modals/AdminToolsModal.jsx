import Modal from "../Modal";

const subtleButtonClassName =
  "rounded-md border border-[#dfe7db] px-4 py-3 text-sm font-medium text-[#183325] transition hover:bg-[#f7faf6] dark:border-white/10 dark:text-white dark:hover:bg-[#183325]";

const cardClassName =
  "rounded-lg border border-[#e4ece2] bg-[#f8faf6] p-4 dark:border-white/10 dark:bg-[#0d1710]";

const fieldClassName =
  "rounded-md border border-[#dfe7db] bg-white px-4 py-3 text-[#183325] transition focus:border-[#f59e0b] focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/20 dark:border-white/10 dark:bg-[#0d1710] dark:text-white";

export default function AdminToolsModal({
  app,
  featuredProduct,
  lowStock,
  onClose,
  onOpenExpense,
  onOpenWallet,
  open,
  setFeaturedProduct,
}) {
  return (
    <Modal open={open} onClose={onClose} text="Acciones administrativas secundarias para no recargar la operacion diaria." title="Herramientas administrativas" wide>
      <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="grid gap-4">
          <button className={subtleButtonClassName} onClick={onOpenExpense} type="button">
            Registrar egreso
          </button>
          <button className={subtleButtonClassName} onClick={onOpenWallet} type="button">
            Cambiar saldo general
          </button>
        </div>

        <div className="grid gap-4 rounded-[20px] border border-[#e4ece2] bg-white p-5 dark:border-white/10 dark:bg-[#122117]">
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-[#183325] dark:text-white">Resumen administrativo</h3>
            <p className="mt-1 text-sm text-[#5b6d61] dark:text-white/70">Deja aqui los ajustes clave y usa la agenda como una vista separada y mas comoda.</p>
          </div>

          <label className="grid gap-2 text-sm font-semibold text-ink-900 dark:text-white">
            Producto estrella
            <select className={fieldClassName} onChange={(e) => setFeaturedProduct(e.target.value)} value={featuredProduct?.id || ""}>
              {app.products.filter((product) => product.activo).map((product) => (
                <option key={product.id} value={product.id}>
                  {product.nombre}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 md:grid-cols-3">
            <div className={cardClassName}>
              <span className="block text-sm text-[#5b6d61] dark:text-white/70">Alertas de stock</span>
              <strong className="mt-1 block text-3xl font-black tracking-tight text-[#20130A] dark:text-white">{lowStock.length}</strong>
            </div>
            <div className={cardClassName}>
              <span className="block text-sm text-[#5b6d61] dark:text-white/70">Turnos cerrados</span>
              <strong className="mt-1 block text-3xl font-black tracking-tight text-[#20130A] dark:text-white">{app.turnos.filter((turno) => turno.estado === "cerrado").length}</strong>
            </div>
            <div className={cardClassName}>
              <span className="block text-sm text-[#5b6d61] dark:text-white/70">Saldo actual</span>
              <strong className="mt-1 block text-3xl font-black tracking-tight text-[#20130A] dark:text-white">${Number(app.wallet.saldoActual || 0).toFixed(2)}</strong>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
