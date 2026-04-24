import { useEffect, useMemo, useState } from "react";
import Modal from "../Modal";
import Icon from "../ui/Icon";

const fieldClassName =
  "rounded-md border border-[#dfe7db] bg-[#f8faf6] px-4 py-3 text-[#183325] transition focus:border-[#f59e0b] focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/20 dark:border-[#314056] dark:bg-[#0f172a] dark:text-white";

const subtleButtonClassName =
  "rounded-md border border-[#dfe7db] px-4 py-3 text-sm font-medium text-[#183325] transition hover:bg-[#f7faf6] dark:border-[#314056] dark:bg-[#0f172a] dark:text-white dark:hover:bg-[#182235]";

const primaryButtonClassName =
  "rounded-md bg-[#1f7a3a] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#17612d] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[linear-gradient(135deg,#2563eb,#1d4ed8)] dark:hover:brightness-110";

function parseMoneyInput(value) {
  const normalized = String(value || "")
    .replace(",", ".")
    .replace(/[^\d.]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeMoneyInput(value) {
  const raw = String(value ?? "").replace(",", ".").replace(/[^\d.]/g, "");
  const parts = raw.split(".");
  if (parts.length <= 1) return parts[0];
  return `${parts[0]}.${parts.slice(1).join("").slice(0, 2)}`;
}

function OptionCard({ active, description, icon, onClick, title }) {
  return (
    <button
      className={`rounded-lg border px-4 py-4 text-left transition ${
        active
          ? "border-[#f59e0b]/40 bg-[#fff7ed] shadow-[0_14px_30px_rgba(245,158,11,0.12)] dark:border-[#314056] dark:bg-[#182235]"
          : "border-[#e4ece2] bg-white hover:bg-[#fafcf9] dark:border-[#23314d] dark:bg-[#111827] dark:hover:bg-[#182235]"
      }`}
      onClick={onClick}
      type="button"
    >
      <div className="flex items-start justify-between gap-3">
        <span className={`inline-flex h-11 w-11 items-center justify-center rounded-full text-xl ${active ? "bg-white text-[#183325] dark:bg-[#0f172a] dark:text-[#93c5fd]" : "bg-[#eef6f0] text-[#1f7a3a] dark:bg-[#0f172a] dark:text-[#93c5fd]"}`}>
          <Icon name={icon} />
        </span>
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${active ? "bg-[#f59e0b] text-white" : "bg-[#edf1ea] text-[#5b6d61] dark:bg-[#0f172a] dark:text-[#94a3b8]"}`}>
          {active ? "Seleccionado" : "Elegir"}
        </span>
      </div>
      <strong className="mt-4 block text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">{title}</strong>
      <span className="mt-1 block text-sm leading-6 text-[#5b6d61] dark:text-[#c7d2e0]">{description}</span>
    </button>
  );
}

export default function ExpenseModal({
  createExpense,
  distributors,
  expense,
  expenseCategories,
  expenseSubmitting,
  money,
  onClose,
  open,
  setExpense,
  uploadExpenseEvidence,
  uploading,
  wallet,
}) {
  const [step, setStep] = useState(1);
  const stepPanelClassName = "min-h-[26rem] max-h-[26rem] overflow-y-auto pr-1";

  useEffect(() => {
    if (open) setStep(1);
  }, [open]);

  const sortedCategories = useMemo(() => [...expenseCategories].sort((a, b) => a.nombre.localeCompare(b.nombre)), [expenseCategories]);
  const sortedDistributors = useMemo(() => [...distributors].sort((a, b) => a.nombre.localeCompare(b.nombre)), [distributors]);

  const categoryName = expense.isNewCategory ? expense.newCategoryName.trim() : expense.categoryName.trim();
  const distributorName = expense.isNewDistributor ? expense.newDistributorName.trim() : expense.distributorName.trim();
  const requiresDistributor = categoryName.toLowerCase() === "mercaderia";
  const totalAmount = parseMoneyInput(expense.montoInput || expense.monto);
  const nextWalletTotal = Number(wallet?.saldoActual || 0) - totalAmount;

  const steps = requiresDistributor
    ? [
        { id: 1, title: "Categoria" },
        { id: 2, title: "Origen" },
        { id: 3, title: "Detalle y evidencia" },
        { id: 4, title: "Monto" },
        { id: 5, title: "Resumen" },
      ]
    : [
        { id: 1, title: "Categoria" },
        { id: 2, title: "Detalle y evidencia" },
        { id: 3, title: "Monto" },
        { id: 4, title: "Resumen" },
      ];

  useEffect(() => {
    if (step > steps.length) {
      setStep(steps.length);
    }
  }, [step, steps.length]);

  const updateExpense = (patch) => setExpense((current) => ({ ...current, ...patch }));

  const canContinueCategory = Boolean(categoryName);
  const canContinueOrigin = !requiresDistributor || Boolean(distributorName);
  const canContinueDetail = Boolean(expense.descripcion.trim() && expense.detalleOferta.trim() && expense.evidenceUrl);
  const canContinueAmount = totalAmount > 0;
  const canSubmit = canContinueCategory && canContinueOrigin && canContinueDetail && canContinueAmount && expense.confirmationAccepted;

  const nextStep = () => {
    if (step === 1 && !canContinueCategory) return;
    if (requiresDistributor && step === 2 && !canContinueOrigin) return;
    if ((!requiresDistributor && step === 2) || (requiresDistributor && step === 3)) {
      if (!canContinueDetail) return;
    }
    if ((!requiresDistributor && step === 3) || (requiresDistributor && step === 4)) {
      if (!canContinueAmount) return;
    }
    setStep((current) => Math.min(current + 1, steps.length));
  };

  const prevStep = () => setStep((current) => Math.max(current - 1, 1));

  const detailStep = requiresDistributor ? 3 : 2;
  const amountStep = requiresDistributor ? 4 : 3;
  const summaryStep = requiresDistributor ? 5 : 4;

  return (
    <Modal open={open} onClose={onClose} text="Registra el egreso en pasos claros antes de descontarlo de la cartera." title="Registrar egreso" wide>
      <div className="grid gap-5">
        <div className={`grid gap-3 ${steps.length === 5 ? "md:grid-cols-5" : "md:grid-cols-4"}`}>
          {steps.map((item) => {
            const active = step === item.id;
            const completed = step > item.id;
            return (
              <div
                key={item.id}
                className={`flex min-h-[96px] rounded-lg border px-4 py-3 transition ${
                  active
                    ? "border-[#f59e0b]/40 bg-[#fff7ed] dark:border-[#314056] dark:bg-[#182235]"
                    : completed
                      ? "border-[#cde4d3] bg-[#f6faf4] dark:border-[#314056] dark:bg-[#182235]"
                      : "border-[#e4ece2] bg-white dark:border-[#23314d] dark:bg-[#111827]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                      active ? "bg-[#f59e0b] text-white" : completed ? "bg-[#1f7a3a] text-white dark:bg-[#2563eb]" : "bg-[#edf1ea] text-[#183325] dark:bg-[#0f172a] dark:text-[#f8fafc]"
                    }`}
                  >
                    {completed ? <Icon name="check" /> : item.id}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">{item.title}</p>
                    <p className="text-xs text-[#6a7b70] dark:text-[#94a3b8]">Paso {item.id}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {step === 1 ? (
          <div className={stepPanelClassName}>
            <div className="grid gap-4">
              <div className="grid gap-3 md:grid-cols-2">
                <OptionCard
                  active={!expense.isNewCategory}
                  description="Elige una categoria ya creada para reutilizarla en futuros egresos."
                  icon="category"
                  onClick={() => updateExpense({ isNewCategory: false, newCategoryName: "" })}
                  title="Elegir categoria"
                />
                <OptionCard
                  active={expense.isNewCategory}
                  description="Crea una categoria nueva cuando este egreso no encaje en las existentes."
                  icon="add_circle"
                  onClick={() => updateExpense({ isNewCategory: true, categoryId: "", categoryName: "", distributorId: "", distributorName: "", isNewDistributor: false, newDistributorName: "" })}
                  title="Crear categoria"
                />
              </div>

              {!expense.isNewCategory ? (
                <label className="grid gap-2 text-sm font-semibold text-ink-900 dark:text-white">
                  Categoria
                  <select
                    className={fieldClassName}
                    onChange={(e) => {
                      const selected = sortedCategories.find((item) => item.id === e.target.value);
                      const nextCategoryName = selected?.nombre || "";
                      const needsDistributor = nextCategoryName.toLowerCase() === "mercaderia";
                      updateExpense({
                        categoryId: e.target.value,
                        categoryName: nextCategoryName,
                        categoria: nextCategoryName,
                        distributorId: needsDistributor ? expense.distributorId : "",
                        distributorName: needsDistributor ? expense.distributorName : "",
                        isNewDistributor: needsDistributor ? expense.isNewDistributor : false,
                        newDistributorName: needsDistributor ? expense.newDistributorName : "",
                      });
                    }}
                    value={expense.categoryId}
                  >
                    <option value="">Selecciona una categoria</option>
                    {sortedCategories.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nombre}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <label className="grid gap-2 text-sm font-semibold text-ink-900 dark:text-white">
                  Nombre de la nueva categoria
                  <input
                    className={fieldClassName}
                    onChange={(e) => updateExpense({ newCategoryName: e.target.value, categoryName: e.target.value, categoria: e.target.value })}
                    placeholder="Ej. Mantenimiento, Publicidad, Emergencias"
                    value={expense.newCategoryName}
                  />
                </label>
              )}

              <div className="rounded-lg border border-[#e4ece2] bg-[#f8faf6] p-4 dark:border-[#23314d] dark:bg-[#182235]">
                <p className="text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">Categoria actual</p>
                <p className="mt-1 text-sm text-[#5b6d61] dark:text-[#c7d2e0]">{categoryName || "Todavia no has seleccionado una categoria."}</p>
              </div>
            </div>
          </div>
        ) : null}

        {requiresDistributor && step === 2 ? (
          <div className={stepPanelClassName}>
            <div className="grid gap-4">
              <div className="grid gap-3 md:grid-cols-2">
                <OptionCard
                  active={!expense.isNewDistributor}
                  description="Selecciona un distribuidor que ya exista para compras de mercaderia."
                  icon="storefront"
                  onClick={() => updateExpense({ isNewDistributor: false, newDistributorName: "" })}
                  title="Elegir distribuidor"
                />
                <OptionCard
                  active={expense.isNewDistributor}
                  description="Crea un distribuidor nuevo para reutilizarlo en futuras compras."
                  icon="add_business"
                  onClick={() => updateExpense({ isNewDistributor: true, distributorId: "", distributorName: "" })}
                  title="Crear distribuidor"
                />
              </div>

              {!expense.isNewDistributor ? (
                <label className="grid gap-2 text-sm font-semibold text-ink-900 dark:text-white">
                  Distribuidor
                  <select
                    className={fieldClassName}
                    onChange={(e) => {
                      const selected = sortedDistributors.find((item) => item.id === e.target.value);
                      updateExpense({
                        distributorId: e.target.value,
                        distributorName: selected?.nombre || "",
                      });
                    }}
                    value={expense.distributorId}
                  >
                    <option value="">Selecciona un distribuidor</option>
                    {sortedDistributors.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nombre}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <label className="grid gap-2 text-sm font-semibold text-ink-900 dark:text-white">
                  Nombre del nuevo distribuidor
                  <input
                    className={fieldClassName}
                    onChange={(e) => updateExpense({ newDistributorName: e.target.value, distributorName: e.target.value })}
                    placeholder="Ej. Distribuidora El Proveedor"
                    value={expense.newDistributorName}
                  />
                </label>
              )}
            </div>
          </div>
        ) : null}

        {step === detailStep ? (
          <div className={stepPanelClassName}>
            <div className="grid gap-4">
              <label className="grid gap-2 text-sm font-semibold text-ink-900 dark:text-white">
                Descripcion breve
                <input
                  className={fieldClassName}
                  onChange={(e) => updateExpense({ descripcion: e.target.value })}
                  placeholder="Ej. Compra semanal, pago de internet, transporte del dia"
                  value={expense.descripcion}
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-ink-900 dark:text-white">
                Detalle del egreso
                <textarea
                  className={`${fieldClassName} min-h-32 resize-none`}
                  onChange={(e) => updateExpense({ detalleOferta: e.target.value })}
                  placeholder={
                    requiresDistributor
                      ? "Describe los productos, cantidades o condiciones que ofrece el distribuidor."
                      : "Describe claramente en que se gasto este dinero y por que fue necesario."
                  }
                  value={expense.detalleOferta}
                />
              </label>

              <div className="rounded-lg border border-[#dbe6d8] bg-[#f8faf6] p-4 dark:border-[#23314d] dark:bg-[#182235]">
                <p className="text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">Consejo</p>
                <p className="mt-1 text-sm text-[#5b6d61] dark:text-[#c7d2e0]">En la evidencia debe ir la factura y el producto, o una prueba clara del gasto realizado.</p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <label className={subtleButtonClassName}>
                    <span>{uploading ? "Subiendo..." : expense.evidenceUrl ? "Cambiar evidencia" : "Agregar evidencia"}</span>
                    <input
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadExpenseEvidence(file);
                      }}
                      type="file"
                    />
                  </label>
                  {expense.evidenceName ? <span className="text-sm text-[#5b6d61] dark:text-[#c7d2e0]">{expense.evidenceName}</span> : null}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {step === amountStep ? (
          <div className={stepPanelClassName}>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="grid gap-4">
                <label className="grid gap-2 text-sm font-semibold text-ink-900 dark:text-white">
                  Total del egreso
                  <input
                    className={fieldClassName}
                    inputMode="decimal"
                    onChange={(e) =>
                      updateExpense({
                        montoInput: normalizeMoneyInput(e.target.value),
                        monto: parseMoneyInput(e.target.value),
                        cantidad: parseMoneyInput(e.target.value) > 0 ? 1 : 0,
                        unitCost: parseMoneyInput(e.target.value),
                      })
                    }
                    placeholder="Ej. 25.50"
                    type="text"
                    value={expense.montoInput ?? ""}
                  />
                </label>

                <div className="rounded-lg border border-[#e4ece2] bg-white p-4 dark:border-[#23314d] dark:bg-[#111827]">
                  <p className="text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">Que vas a registrar en este paso</p>
                  <p className="mt-2 text-sm leading-6 text-[#5b6d61] dark:text-[#c7d2e0]">
                    Ingresa el valor total final del egreso tal como se descontara de la cartera. No hace falta desglosar este monto aqui.
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-[#e4ece2] bg-[#f8faf6] p-4 dark:border-[#23314d] dark:bg-[#182235]">
                <span className="block text-sm text-[#5b6d61] dark:text-[#c7d2e0]">Total a descontar</span>
                <strong className="mt-1 block text-3xl font-black tracking-tight text-[#20130A] dark:text-[#f8fafc]">{money(totalAmount)}</strong>
                <p className="mt-3 text-sm text-[#5b6d61] dark:text-[#c7d2e0]">Este sera el valor completo que se restara de la cartera.</p>
              </div>
            </div>
          </div>
        ) : null}

        {step === summaryStep ? (
          <div className={stepPanelClassName}>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_320px]">
              <div className="rounded-lg border border-[#e4ece2] bg-white p-4 dark:border-[#23314d] dark:bg-[#111827]">
                <h3 className="text-base font-semibold text-[#183325] dark:text-[#f8fafc]">Detalle del egreso</h3>
                <div className="mt-4 space-y-3 text-sm text-[#5b6d61] dark:text-[#c7d2e0]">
                  <div className="flex items-center justify-between gap-3">
                    <span>Categoria</span>
                    <strong className="text-[#183325] dark:text-[#f8fafc]">{categoryName}</strong>
                  </div>
                  {requiresDistributor ? (
                    <div className="flex items-center justify-between gap-3">
                      <span>Distribuidor</span>
                      <strong className="text-[#183325] dark:text-[#f8fafc]">{distributorName}</strong>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between gap-3">
                    <span>Descripcion</span>
                    <strong className="text-right text-[#183325] dark:text-[#f8fafc]">{expense.descripcion}</strong>
                  </div>
                  <div className="rounded-md border border-[#dbe6d8] bg-[#f8faf6] px-3 py-3 dark:border-[#314056] dark:bg-[#182235]">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6a7b70] dark:text-[#94a3b8]">Detalle registrado</p>
                    <p className="mt-2 leading-6 text-[#5b6d61] dark:text-[#c7d2e0]">{expense.detalleOferta}</p>
                  </div>
                  {expense.evidenceName ? <div className="rounded-md border border-[#dbe6d8] bg-[#f8faf6] px-3 py-2 text-xs text-[#5b6d61] dark:border-[#314056] dark:bg-[#182235] dark:text-[#c7d2e0]">Evidencia: {expense.evidenceName}</div> : null}
                </div>
              </div>

              <div className="rounded-lg border border-[#e4ece2] bg-[#f8faf6] p-4 dark:border-[#23314d] dark:bg-[#182235]">
                <h3 className="text-base font-semibold text-[#183325] dark:text-[#f8fafc]">Resumen de cartera</h3>
                <div className="mt-4 space-y-3 text-sm text-[#5b6d61] dark:text-[#c7d2e0]">
                  <div className="flex items-center justify-between gap-3">
                    <span>Egreso total</span>
                    <strong className="text-[#183325] dark:text-[#f8fafc]">{money(totalAmount)}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Cartera actual</span>
                    <strong className="text-[#183325] dark:text-[#f8fafc]">{money(wallet?.saldoActual || 0)}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Cartera luego del egreso</span>
                    <strong className="text-[#b42318] dark:text-[#fca5a5]">{money(nextWalletTotal)}</strong>
                  </div>
                </div>

                {expense.evidenceUrl ? (
                  <div className="mt-4 rounded-lg border border-[#dbe6d8] bg-white p-3 dark:border-[#314056] dark:bg-[#111827]">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6a7b70] dark:text-[#94a3b8]">Vista previa de evidencia</p>
                    <div className="overflow-hidden rounded-lg border border-[#edf1ea] bg-[#f8faf6] dark:border-[#23314d] dark:bg-[#0f172a]">
                      <img alt="Vista previa del egreso" className="h-36 w-full object-contain" src={expense.evidencePreviewUrl || expense.evidenceUrl} />
                    </div>
                  </div>
                ) : null}

                <label className="mt-4 flex items-start gap-3 rounded-lg border border-[#dbe6d8] bg-white px-4 py-3 dark:border-[#314056] dark:bg-[#111827]">
                  <input
                    checked={Boolean(expense.confirmationAccepted)}
                    className="mt-1 h-4 w-4 rounded border-[#d0dcd0] text-[#1f7a3a] focus:ring-[#1f7a3a] dark:border-[#314056] dark:bg-[#0f172a] dark:text-[#60a5fa] dark:focus:ring-[#60a5fa]"
                    onChange={(e) => updateExpense({ confirmationAccepted: e.target.checked })}
                    type="checkbox"
                  />
                  <span className="text-sm leading-6 text-[#5b6d61] dark:text-[#c7d2e0]">
                    Confirmo que estoy de acuerdo en registrar este egreso y entiendo que reducira la cartera actual.
                  </span>
                </label>
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#edf1ea] pt-4">
          <button className={subtleButtonClassName} onClick={step === 1 ? onClose : prevStep} type="button">
            {step === 1 ? "Cancelar" : "Volver"}
          </button>

          {step < steps.length ? (
            <button
              className={primaryButtonClassName}
              disabled={
                (step === 1 && !canContinueCategory) ||
                (requiresDistributor && step === 2 && !canContinueOrigin) ||
                (step === detailStep && !canContinueDetail) ||
                (step === amountStep && !canContinueAmount) ||
                uploading
              }
              onClick={nextStep}
              type="button"
            >
              Continuar
            </button>
          ) : (
            <button className={primaryButtonClassName} disabled={expenseSubmitting || !canSubmit} onClick={createExpense} type="button">
              {expenseSubmitting ? "Procesando..." : "Confirmar egreso"}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
