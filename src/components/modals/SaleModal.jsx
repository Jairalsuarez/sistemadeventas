import { useEffect, useMemo, useState } from "react";
import Modal from "../Modal";
import Icon from "../ui/Icon";

const fieldClassName =
  "rounded-md border border-[#dfe7db] bg-[#f8faf6] px-4 py-3 text-[#183325] transition focus:border-[#f59e0b] focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/20 dark:border-white/10 dark:bg-[#0d1710] dark:text-white";

const subtleButtonClassName =
  "rounded-md border border-[#dfe7db] px-4 py-3 text-sm font-medium text-[#183325] transition hover:bg-[#f7faf6] dark:border-white/10 dark:text-white dark:hover:bg-[#183325]";

const primaryButtonClassName =
  "rounded-md bg-[#1f7a3a] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#17612d] disabled:cursor-not-allowed disabled:opacity-60";

const paymentOptions = [
  {
    value: "efectivo",
    label: "Efectivo",
    description: "Pago inmediato en caja, sin comprobante adicional.",
    icon: "payments",
    accentClassName: "bg-[#eaf7ee] text-[#1f7a3a]",
  },
  {
    value: "transferencia_directa",
    label: "Transferencia directa",
    description: "Necesita comprobante para registrar la venta.",
    icon: "account_balance",
    accentClassName: "bg-[#fff2e2] text-[#f59e0b]",
  },
  {
    value: "deuna",
    label: "Deuna",
    description: "Adjunta la evidencia del pago realizado.",
    icon: "qr_code_2",
    accentClassName: "bg-[#eef2ff] text-[#4f46e5]",
  },
];

const steps = [
  { id: 1, title: "Productos" },
  { id: 2, title: "Metodo de pago" },
  { id: 3, title: "Resumen" },
];

export default function SaleModal({
  activeShift,
  app,
  createSale,
  money,
  onClose,
  open,
  saleLines,
  salePayment,
  saleSubmitting,
  saleTotal,
  setSaleLines,
  setSalePayment,
  uploadSaleEvidence,
  uploading,
  userRole,
  wallet,
}) {
  const [step, setStep] = useState(1);
  const stepPanelClassName = "min-h-[26rem] max-h-[26rem] overflow-y-auto pr-1";

  useEffect(() => {
    if (open) setStep(1);
  }, [open]);

  const requiresShift = userRole === "vendedor";
  const salePreview = useMemo(
    () =>
      saleLines
        .map((line) => {
          const product = app.products.find((item) => item.id === line.productId);
          return product
            ? {
                productId: product.id,
                nombre: product.nombre,
                precio: product.precio,
                cantidad: Number(line.cantidad || 0),
                subtotal: product.precio * Number(line.cantidad || 0),
              }
            : null;
        })
        .filter(Boolean),
    [app.products, saleLines]
  );

  const selectedPayment = paymentOptions.find((item) => item.value === salePayment.method) || paymentOptions[0];
  const nextWalletTotal = Number(wallet?.saldoActual || 0) + Number(saleTotal || 0);
  const paymentNeedsEvidence = ["transferencia_directa", "deuna"].includes(salePayment.method);
  const paymentMethodLabelMap = {
    efectivo: "Pago en efectivo",
    transferencia_directa: "Transferencia directa",
    deuna: "Pago con Deuna",
  };

  const canContinueProducts =
    (!requiresShift || activeShift) &&
    salePreview.length > 0 &&
    salePreview.every((line) => line.cantidad > 0) &&
    !salePreview.some((line) => (app.products.find((product) => product.id === line.productId)?.stock || 0) < line.cantidad);

  const canContinuePayment = salePayment.method && (!paymentNeedsEvidence || Boolean(salePayment.evidenceUrl));

  const nextStep = () => {
    if (step === 1 && !canContinueProducts) return;
    if (step === 2 && !canContinuePayment) return;
    setStep((current) => Math.min(current + 1, 3));
  };

  const prevStep = () => setStep((current) => Math.max(current - 1, 1));

  const renderPaymentSummary = () => {
    if (salePayment.method === "efectivo") {
      return (
        <div className="rounded-lg border border-[#dbe6d8] bg-[#f8faf6] p-4">
          <p className="text-sm font-semibold text-[#183325]">Pago en efectivo</p>
          <p className="mt-1 text-sm text-[#5b6d61]">No necesitas adjuntar evidencia para completar esta venta.</p>
        </div>
      );
    }

    return (
      <div className="grid gap-4">
        <div className="rounded-lg border border-[#dbe6d8] bg-[#f8faf6] p-4">
          <p className="text-sm font-semibold text-[#183325]">{paymentMethodLabelMap[salePayment.method]}</p>
          <p className="mt-1 text-sm text-[#5b6d61]">Adjunta el comprobante antes de continuar con el registro.</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className={subtleButtonClassName}>
              <span>{uploading ? "Subiendo..." : salePayment.evidenceUrl ? "Cambiar evidencia" : "Agregar evidencia"}</span>
              <input
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadSaleEvidence(file);
                }}
                type="file"
              />
            </label>
            {salePayment.evidenceName ? <span className="text-sm text-[#5b6d61]">{salePayment.evidenceName}</span> : null}
          </div>
        </div>

        {salePayment.evidenceUrl ? (
          <div className="rounded-lg border border-[#dbe6d8] bg-white p-3">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6a7b70]">Vista previa de evidencia</p>
            <div className="overflow-hidden rounded-lg border border-[#edf1ea] bg-[#f8faf6]">
              <img
                alt="Evidencia del pago"
                className="h-48 w-full object-contain"
                src={salePayment.evidenceUrl}
              />
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <Modal open={open} onClose={onClose} text="Registra la venta en tres pasos claros." title="Nueva venta" wide>
      <div className="grid gap-5">
        {requiresShift && !activeShift ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">Debes iniciar un turno antes de vender.</div> : null}

        <div className="grid gap-3 md:grid-cols-3">
          {steps.map((item) => {
            const active = step === item.id;
            const completed = step > item.id;
            return (
              <div
                key={item.id}
                className={`rounded-lg border px-4 py-3 transition ${
                  active
                    ? "border-[#f59e0b]/40 bg-[#fff7ed]"
                    : completed
                      ? "border-[#cde4d3] bg-[#f6faf4]"
                      : "border-[#e4ece2] bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                      active
                        ? "bg-[#f59e0b] text-white"
                        : completed
                          ? "bg-[#1f7a3a] text-white"
                          : "bg-[#edf1ea] text-[#183325]"
                    }`}
                  >
                    {completed ? <Icon name="check" /> : item.id}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#183325]">{item.title}</p>
                    <p className="text-xs text-[#6a7b70]">Paso {item.id}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {step === 1 ? (
          <div className={stepPanelClassName}>
            <div className="grid gap-4">
            {saleLines.map((line, index) => (
              <div key={`${index}-${line.productId}`} className="grid gap-3 md:grid-cols-[minmax(0,1.3fr)_110px_auto]">
                <select
                  className={fieldClassName}
                  value={line.productId}
                  onChange={(e) =>
                    setSaleLines((current) => current.map((item, idx) => (idx === index ? { ...item, productId: e.target.value } : item)))
                  }
                >
                  <option value="">Selecciona un producto</option>
                  {app.products
                    .filter((product) => product.activo)
                    .map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.nombre} - {money(product.precio)} - stock {product.stock}
                      </option>
                    ))}
                </select>
                <input
                  className={fieldClassName}
                  min="1"
                  onChange={(e) =>
                    setSaleLines((current) => current.map((item, idx) => (idx === index ? { ...item, cantidad: Number(e.target.value) } : item)))
                  }
                  type="number"
                  value={line.cantidad}
                />
                <button className={subtleButtonClassName} onClick={() => setSaleLines((current) => current.filter((_, idx) => idx !== index))} type="button">
                  Quitar
                </button>
              </div>
            ))}

            <div className="flex flex-wrap gap-3">
              <button className={subtleButtonClassName} disabled={saleSubmitting} onClick={() => setSaleLines((current) => [...current, { productId: "", cantidad: 1 }])} type="button">
                Agregar producto
              </button>
            </div>

            <div className="rounded-lg border border-[#e4ece2] bg-[#f8faf6] p-4">
              <span className="block text-sm text-[#5b6d61]">Total calculado</span>
              <strong className="mt-1 block text-3xl font-black tracking-tight text-[#20130A]">{money(saleTotal)}</strong>
            </div>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className={stepPanelClassName}>
            <div className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-3">
              {paymentOptions.map((option) => {
                const selected = salePayment.method === option.value;
                return (
                  <button
                    key={option.value}
                    className={`rounded-lg border px-4 py-4 text-left transition ${
                      selected
                        ? "border-[#f59e0b]/40 bg-[#fff7ed] shadow-[0_14px_30px_rgba(245,158,11,0.12)]"
                        : "border-[#e4ece2] bg-white hover:bg-[#fafcf9]"
                    }`}
                    onClick={() => setSalePayment((current) => ({ ...current, method: option.value, evidenceUrl: "", evidenceName: "" }))}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className={`inline-flex h-11 w-11 items-center justify-center rounded-full text-xl ${selected ? "bg-white text-[#183325]" : option.accentClassName}`}>
                        <Icon name={option.icon} />
                      </span>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${selected ? "bg-[#f59e0b] text-white" : "bg-[#edf1ea] text-[#5b6d61]"}`}>
                        {selected ? "Seleccionado" : "Elegir"}
                      </span>
                    </div>
                    <strong className="mt-4 block text-sm font-semibold text-[#183325]">{option.label}</strong>
                    <span className="mt-1 block text-sm leading-6 text-[#5b6d61]">{option.description}</span>
                    <span className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-[#6a7b70]">
                      <Icon className="text-base" name="arrow_forward" />
                      {selected ? "Metodo activo" : "Cambiar a este metodo"}
                    </span>
                  </button>
                );
              })}
            </div>

            {renderPaymentSummary()}
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className={stepPanelClassName}>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_320px]">
            <div className="rounded-lg border border-[#e4ece2] bg-white p-4">
              <h3 className="text-base font-semibold text-[#183325]">Detalle de la venta</h3>
              <div className="mt-4 space-y-3">
                {salePreview.map((line) => (
                  <article key={`${line.productId}-${line.nombre}`} className="flex items-center justify-between rounded-lg border border-[#edf1ea] px-4 py-3">
                    <div className="min-w-0">
                      <strong className="block text-sm font-semibold text-[#183325]">{line.nombre}</strong>
                      <span className="text-sm text-[#5b6d61]">
                        {line.cantidad} x {money(line.precio)}
                      </span>
                    </div>
                    <strong className="text-sm font-semibold text-[#183325]">{money(line.subtotal)}</strong>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-[#e4ece2] bg-[#f8faf6] p-4">
              <h3 className="text-base font-semibold text-[#183325]">Resumen de registro</h3>
              <div className="mt-4 space-y-3 text-sm text-[#5b6d61]">
                <div className="flex items-center justify-between gap-3">
                  <span>Metodo de pago</span>
                  <strong className="text-[#183325]">{selectedPayment.label}</strong>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Total de la venta</span>
                  <strong className="text-[#183325]">{money(saleTotal)}</strong>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Saldo actual de cartera</span>
                  <strong className="text-[#183325]">{money(wallet?.saldoActual || 0)}</strong>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Saldo luego de registrar</span>
                  <strong className="text-[#1f7a3a]">{money(nextWalletTotal)}</strong>
                </div>
                {salePayment.evidenceName ? <div className="rounded-md border border-[#dbe6d8] bg-white px-3 py-2 text-xs text-[#5b6d61]">Evidencia: {salePayment.evidenceName}</div> : null}
              </div>

              {salePayment.evidenceUrl ? (
                <div className="mt-4 rounded-lg border border-[#dbe6d8] bg-white p-3">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6a7b70]">Vista previa de evidencia</p>
                  <div className="overflow-hidden rounded-lg border border-[#edf1ea] bg-[#f8faf6]">
                    <img
                      alt="Vista previa de la evidencia del pago"
                      className="h-36 w-full object-contain"
                      src={salePayment.evidenceUrl}
                    />
                  </div>
                </div>
              ) : null}
            </div>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#edf1ea] pt-4">
          <button className={subtleButtonClassName} onClick={step === 1 ? onClose : prevStep} type="button">
            {step === 1 ? "Cancelar" : "Volver"}
          </button>

          <div className="flex flex-wrap gap-3">
            {step < 3 ? (
              <button
                className={primaryButtonClassName}
                disabled={(step === 1 && !canContinueProducts) || (step === 2 && !canContinuePayment) || uploading}
                onClick={nextStep}
                type="button"
              >
                Continuar
              </button>
            ) : (
              <button className={primaryButtonClassName} disabled={saleSubmitting || !canContinuePayment || !canContinueProducts} onClick={createSale} type="button">
                {saleSubmitting ? "Procesando..." : "Finalizar venta"}
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
