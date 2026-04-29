import { useEffect, useMemo, useState } from "react";
import Modal from "../Modal";
import Icon from "../ui/Icon";

const fieldClassName =
  "rounded-md border border-[#dfe7db] bg-[#f8faf6] px-4 py-3 text-[#183325] transition focus:border-[#f59e0b] focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/20 dark:border-[#314056] dark:bg-[#0f172a] dark:text-white";

const subtleButtonClassName =
  "rounded-md border border-[#dfe7db] px-4 py-3 text-sm font-medium text-[#183325] transition hover:bg-[#f7faf6] dark:border-[#314056] dark:bg-[#0f172a] dark:text-white dark:hover:bg-[#182235]";

const primaryButtonClassName =
  "rounded-md bg-[#1f7a3a] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#17612d] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[linear-gradient(135deg,#2563eb,#1d4ed8)] dark:hover:brightness-110";

const selectClassName = `${fieldClassName} w-full appearance-none pr-11`;

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
      className={`rounded-xl border px-3 py-3 text-left transition ${
        active
          ? "border-[#f59e0b]/40 bg-[#fff7ed] shadow-[0_8px_18px_rgba(245,158,11,0.10)] dark:border-[#314056] dark:bg-[#182235]"
          : "border-[#e4ece2] bg-white hover:bg-[#fafcf9] dark:border-[#23314d] dark:bg-[#111827] dark:hover:bg-[#182235]"
      }`}
      onClick={onClick}
      type="button"
    >
      <div className="flex items-center gap-3">
        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-xl ${active ? "bg-white text-[#183325] dark:bg-[#0f172a] dark:text-[#93c5fd]" : "bg-[#eef6f0] text-[#1f7a3a] dark:bg-[#0f172a] dark:text-[#93c5fd]"}`}>
          <Icon name={icon} />
        </span>
        <strong className="block text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">{title}</strong>
      </div>
      {description ? <span className="mt-1 block text-sm leading-6 text-[#5b6d61] dark:text-[#c7d2e0]">{description}</span> : null}
    </button>
  );
}

function getCategoryMeta(name = "") {
  const value = String(name || "").trim().toLowerCase();

  if (value === "mercaderia") {
    return {
      icon: "inventory_2",
      accent: "border-[#f59e0b]/30 bg-[#fff7ed] text-[#9a3412] dark:border-[#7c4a03] dark:bg-[#2b2111] dark:text-[#fdba74]",
      hint: "Pide distribuidor",
    };
  }

  if (value === "servicios") {
    return {
      icon: "handyman",
      accent: "border-[#cde4d3] bg-[#f3fbf5] text-[#166534] dark:border-[#224c34] dark:bg-[#14281d] dark:text-[#86efac]",
      hint: "Pagos operativos",
    };
  }

  if (value === "pagos") {
    return {
      icon: "payments",
      accent: "border-[#d8def8] bg-[#f1f5ff] text-[#1d4ed8] dark:border-[#2b4378] dark:bg-[#16233d] dark:text-[#93c5fd]",
      hint: "Compromisos del negocio",
    };
  }

  if (value === "inversion") {
    return {
      icon: "trending_up",
      accent: "border-[#e5dbfb] bg-[#f7f2ff] text-[#7c3aed] dark:border-[#4a3379] dark:bg-[#211633] dark:text-[#c4b5fd]",
      hint: "Mejoras o crecimiento",
    };
  }

  if (value === "transporte") {
    return {
      icon: "local_shipping",
      accent: "border-[#d7ecf5] bg-[#f1fbff] text-[#0f766e] dark:border-[#285a63] dark:bg-[#13282d] dark:text-[#99f6e4]",
      hint: "Traslados y envios",
    };
  }

  return {
    icon: "category",
    accent: "border-[#e4ece2] bg-white text-[#183325] dark:border-[#314056] dark:bg-[#111827] dark:text-[#f8fafc]",
    hint: "Categoria general",
  };
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
  uploadError,
  uploadExpenseEvidence,
  uploading,
  wallet,
}) {
  const [step, setStep] = useState(1);
  const stepPanelClassName = "max-h-[min(58vh,26rem)] overflow-y-auto pr-1 sm:min-h-[26rem] sm:max-h-[26rem]";

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
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-[#edf1ea] bg-[#fbfcfa] px-4 py-3 dark:border-[#23314d] dark:bg-[#111827]">
          {steps.map((item) => {
            const active = step === item.id;
            const completed = step > item.id;
            return (
              <button
                key={item.id}
                aria-label={item.title}
                className={`grid h-9 w-9 place-items-center rounded-full text-sm font-semibold transition ${
                  active
                    ? "bg-[#f59e0b] text-white shadow-[0_8px_18px_rgba(245,158,11,0.22)] dark:bg-[#2563eb]"
                    : completed
                      ? "bg-[#1f7a3a] text-white dark:bg-[#2563eb]"
                      : "bg-[#edf1ea] text-[#183325] dark:bg-[#0f172a] dark:text-[#f8fafc]"
                }`}
                onClick={() => {
                  if (item.id < step) setStep(item.id);
                }}
                type="button"
              >
                {completed ? <Icon name="check" /> : item.id}
              </button>
            );
          })}
        </div>

        {step === 1 ? (
          <div className={stepPanelClassName}>
            <div className="grid gap-4">
              {!expense.isNewCategory ? (
                <div className="grid gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">Categorias disponibles</p>
                    <span className="text-xs font-medium text-[#6a7b70] dark:text-[#94a3b8]">{sortedCategories.length} opcion(es)</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
                    {sortedCategories.map((item) => {
                      const isSelected = expense.categoryId === item.id;
                      const meta = getCategoryMeta(item.nombre);

                      return (
                        <button
                          key={item.id}
                          className={`rounded-xl border p-3 text-left transition ${
                            isSelected
                              ? "border-[#f59e0b]/45 bg-[#fff7ed] shadow-[0_8px_18px_rgba(245,158,11,0.12)] dark:border-[#415a86] dark:bg-[#182235]"
                              : "border-[#e4ece2] bg-white active:bg-[#f7faf6] dark:border-[#23314d] dark:bg-[#111827] dark:active:bg-[#182235]"
                          }`}
                          onClick={() => {
                            const nextCategoryName = item.nombre || "";
                            const needsDistributor = nextCategoryName.toLowerCase() === "mercaderia";
                            updateExpense({
                              categoryId: item.id,
                              categoryName: nextCategoryName,
                              categoria: nextCategoryName,
                              distributorId: needsDistributor ? expense.distributorId : "",
                              distributorName: needsDistributor ? expense.distributorName : "",
                              isNewDistributor: needsDistributor ? expense.isNewDistributor : false,
                              newDistributorName: needsDistributor ? expense.newDistributorName : "",
                            });
                          }}
                          type="button"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border ${meta.accent}`}>
                              <Icon name={meta.icon} />
                            </span>
                            <span
                              className={`grid h-7 w-7 place-items-center rounded-full text-[11px] font-semibold ${
                                isSelected
                                  ? "bg-[#f59e0b] text-white"
                                  : "bg-[#edf1ea] text-[#5b6d61] dark:bg-[#0f172a] dark:text-[#94a3b8]"
                              }`}
                            >
                              {isSelected ? <Icon className="text-[17px]" name="check" /> : <Icon className="text-[17px]" name="add" />}
                            </span>
                          </div>

                          <strong className="mt-3 block truncate text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">{item.nombre}</strong>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#dfe7db] px-3 py-2 text-sm font-semibold text-[#183325] active:bg-[#f7faf6] dark:border-[#314056] dark:text-[#f8fafc] dark:active:bg-[#111827]"
                    onClick={() => updateExpense({ isNewCategory: true, categoryId: "", categoryName: "", distributorId: "", distributorName: "", isNewDistributor: false, newDistributorName: "" })}
                    type="button"
                  >
                    <Icon name="add_circle" />
                    Crear categoria
                  </button>

                  <div className="relative">
                    <select
                      className={`${selectClassName} sr-only`}
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
                  </div>
                </div>
              ) : (
                <div className="grid gap-3">
                  <button
                    className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#dfe7db] px-3 py-2 text-sm font-semibold text-[#183325] active:bg-[#f7faf6] dark:border-[#314056] dark:text-[#f8fafc] dark:active:bg-[#111827]"
                    onClick={() => updateExpense({ isNewCategory: false, newCategoryName: "" })}
                    type="button"
                  >
                    <Icon name="category" />
                    Elegir categoria
                  </button>
                  <label className="grid gap-2 text-sm font-semibold text-ink-900 dark:text-white">
                    Nombre de la nueva categoria
                    <input
                      className={fieldClassName}
                      onChange={(e) => updateExpense({ newCategoryName: e.target.value, categoryName: e.target.value, categoria: e.target.value })}
                      placeholder="Ej. Mantenimiento"
                      value={expense.newCategoryName}
                    />
                  </label>
                </div>
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
                  <div className="relative">
                    <select
                      className={selectClassName}
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
                    <span className="pointer-events-none absolute inset-y-0 right-3 grid place-items-center text-[#6a7b70] dark:text-[#94a3b8]">
                      <Icon name="expand_more" />
                    </span>
                  </div>
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
                  <label className={`${subtleButtonClassName} inline-flex items-center gap-2`}>
                    {uploading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#f59e0b]/30 border-t-[#f59e0b]" /> : null}
                    <span>{uploading ? "Subiendo..." : expense.evidenceUrl ? "Tomar otra foto" : "Tomar foto"}</span>
                    <input
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadExpenseEvidence(file);
                      }}
                      type="file"
                    />
                  </label>
                  <label className={subtleButtonClassName}>
                    <span>{expense.evidenceUrl ? "Elegir otra foto" : "Elegir foto"}</span>
                    <input
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadExpenseEvidence(file);
                      }}
                      type="file"
                    />
                  </label>
                  {expense.evidenceName ? <span className="text-sm text-[#5b6d61] dark:text-[#c7d2e0]">{expense.evidenceName}</span> : null}
                </div>
                {uploading ? <p className="mt-3 text-sm font-medium text-[#f59e0b]">Subiendo evidencia. Mantén esta pantalla abierta.</p> : null}
                {uploadError ? <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">{uploadError}</p> : null}
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

        <div className="flex flex-col-reverse gap-3 border-t border-[#edf1ea] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <button className={`${subtleButtonClassName} w-full sm:w-auto`} onClick={step === 1 ? onClose : prevStep} type="button">
            {step === 1 ? "Cancelar" : "Volver"}
          </button>

          {step < steps.length ? (
            <button
              className={`${primaryButtonClassName} w-full sm:w-auto`}
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
            <button className={`${primaryButtonClassName} w-full sm:w-auto`} disabled={expenseSubmitting || !canSubmit} onClick={createExpense} type="button">
              {expenseSubmitting ? "Procesando..." : "Confirmar egreso"}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
