import { useEffect, useState } from "react";
import Modal from "../Modal";
import Icon from "../ui/Icon";

const fieldClassName =
  "rounded-md border border-[#dfe7db] bg-[#f8faf6] px-4 py-3 text-[#183325] transition focus:border-[#f59e0b] focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/20 dark:border-[#314056] dark:bg-[#0f172a] dark:text-white";

const subtleButtonClassName =
  "rounded-md border border-[#dfe7db] px-4 py-3 text-sm font-medium text-[#183325] transition hover:bg-[#f7faf6] dark:border-[#314056] dark:bg-[#0f172a] dark:text-white dark:hover:bg-[#182235]";

const primaryButtonClassName =
  "rounded-md bg-[#111827] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#1f2937] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#f97316] dark:text-[#fff7ed] dark:hover:bg-[#ea580c]";

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
];

const steps = [
  { id: 1, title: "Detalle" },
  { id: 2, title: "Metodo de pago" },
  { id: 3, title: "Resumen" },
];

function parseMoneyInput(value) {
  const normalized = String(value || "")
    .replace(",", ".")
    .replace(/[^\d.]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function InformalSaleModal({
  activeShift,
  createInformalSale,
  informalSale,
  informalSalePayment,
  informalSaleSubmitting,
  money,
  onClose,
  open,
  setInformalSale,
  setInformalSalePayment,
  uploadError,
  uploadInformalSaleEvidence,
  uploading,
  userRole,
  wallet,
}) {
  const [step, setStep] = useState(1);
  const stepPanelClassName = "max-h-[min(58vh,24rem)] overflow-y-auto pr-1 sm:min-h-[24rem] sm:max-h-[24rem]";

  useEffect(() => {
    if (open) setStep(1);
  }, [open]);

  const requiresShift = userRole === "vendedor";
  const paymentNeedsEvidence = informalSalePayment.method === "transferencia_directa";
  const totalAmount = parseMoneyInput(informalSale.totalInput || informalSale.total);
  const nextWalletTotal = Number(wallet?.saldoActual || 0) + totalAmount;
  const selectedPayment = paymentOptions.find((item) => item.value === informalSalePayment.method) || paymentOptions[0];

  const canContinueDetail = totalAmount > 0 && Boolean(informalSale.description.trim());
  const canContinuePayment = informalSalePayment.method && (!paymentNeedsEvidence || Boolean(informalSalePayment.evidenceUrl));

  const nextStep = () => {
    if (step === 1 && !canContinueDetail) return;
    if (step === 2 && !canContinuePayment) return;
    setStep((current) => Math.min(current + 1, 3));
  };

  const prevStep = () => setStep((current) => Math.max(current - 1, 1));

  const renderPaymentSummary = () => {
    if (informalSalePayment.method === "efectivo") {
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
          <p className="text-sm font-semibold text-[#183325]">{selectedPayment.label}</p>
          <p className="mt-1 text-sm text-[#5b6d61]">Adjunta el comprobante antes de continuar con el registro.</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className={`${subtleButtonClassName} inline-flex items-center gap-2`}>
              {uploading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#f59e0b]/30 border-t-[#f59e0b]" /> : null}
              <span>{uploading ? "Subiendo..." : informalSalePayment.evidenceUrl ? "Tomar otra foto" : "Tomar foto"}</span>
              <input
                accept="image/*"
                capture="environment"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadInformalSaleEvidence(file);
                }}
                type="file"
              />
            </label>
            <label className={subtleButtonClassName}>
              <span>{informalSalePayment.evidenceUrl ? "Elegir otra foto" : "Elegir foto"}</span>
              <input
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadInformalSaleEvidence(file);
                }}
                type="file"
              />
            </label>
            {informalSalePayment.evidenceName ? <span className="text-sm text-[#5b6d61]">{informalSalePayment.evidenceName}</span> : null}
          </div>
          {uploading ? <p className="mt-3 text-sm font-medium text-[#f59e0b]">Subiendo evidencia. Mantén esta pantalla abierta.</p> : null}
          {uploadError ? <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{uploadError}</p> : null}
        </div>

        {informalSalePayment.evidenceUrl ? (
          <div className="rounded-lg border border-[#dbe6d8] bg-white p-3">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6a7b70]">Vista previa de evidencia</p>
            <div className="overflow-hidden rounded-lg border border-[#edf1ea] bg-[#f8faf6]">
              <img alt="Evidencia del pago" className="h-48 w-full object-contain" src={informalSalePayment.evidenceUrl} />
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <Modal open={open} onClose={onClose} text="Registra una venta sin afectar stock, solo balance y actividad." title="Agregar venta informal" wide>
      <div className="grid gap-5">
        {requiresShift && !activeShift ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-[#4b5563] dark:bg-[#172033] dark:text-[#fca5a5]">Debes iniciar un turno antes de vender.</div> : null}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((item) => {
            const active = step === item.id;
            const completed = step > item.id;
            return (
              <div
                key={item.id}
                className={`rounded-lg border px-4 py-3 transition ${
                  active
                    ? "border-[#f59e0b]/40 bg-[#fff7ed] dark:border-[#2563eb]/50 dark:bg-[#172554]"
                    : completed
                      ? "border-[#cde4d3] bg-[#f6faf4] dark:border-[#314056] dark:bg-[#182235]"
                      : "border-[#e4ece2] bg-white dark:border-[#23314d] dark:bg-[#111827]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                      active
                        ? "bg-[#f59e0b] text-white dark:bg-[#2563eb] dark:text-[#eff6ff]"
                        : completed
                          ? "bg-[#1f7a3a] text-white dark:bg-[#2563eb]"
                          : "bg-[#edf1ea] text-[#183325] dark:bg-[#0f172a] dark:text-[#f8fafc]"
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
              <label className="grid gap-2 text-sm font-semibold text-[#183325] dark:text-white">
                Valor total
                <input
                  className={fieldClassName}
                  min="0"
                  onChange={(e) => setInformalSale((current) => ({ ...current, totalInput: e.target.value, total: parseMoneyInput(e.target.value) }))}
                  placeholder="0.00"
                  step="0.01"
                  type="number"
                  value={informalSale.totalInput}
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-[#183325] dark:text-white">
                Descripcion de la venta
                <textarea
                  className={`${fieldClassName} min-h-[180px] resize-none`}
                  onChange={(e) => setInformalSale((current) => ({ ...current, description: e.target.value }))}
                  placeholder="Describe que se esta vendiendo. Este campo es obligatorio."
                  rows="6"
                  value={informalSale.description}
                />
              </label>

              <div className="rounded-lg border border-[#e4ece2] bg-[#f8faf6] p-4 dark:border-[#23314d] dark:bg-[#182235]">
                <span className="block text-sm text-[#5b6d61] dark:text-[#c7d2e0]">Total calculado</span>
                <strong className="mt-1 block text-3xl font-black tracking-tight text-[#20130A] dark:text-[#f8fafc]">{money(totalAmount)}</strong>
              </div>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className={stepPanelClassName}>
            <div className="grid gap-4">
              <div className="grid gap-3 md:grid-cols-2">
                {paymentOptions.map((option) => {
                  const selected = informalSalePayment.method === option.value;
                  return (
                    <button
                      key={option.value}
                      className={`rounded-lg border px-4 py-4 text-left transition ${
                        selected
                          ? "border-[#f59e0b]/40 bg-[#fff7ed] shadow-[0_14px_30px_rgba(245,158,11,0.12)] dark:border-[#314056] dark:bg-[#182235]"
                          : "border-[#e4ece2] bg-white hover:bg-[#fafcf9] dark:border-[#23314d] dark:bg-[#111827] dark:hover:bg-[#182235]"
                      }`}
                      onClick={() => setInformalSalePayment((current) => ({ ...current, method: option.value, evidenceUrl: "", evidenceName: "" }))}
                      type="button"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className={`inline-flex h-11 w-11 items-center justify-center rounded-full text-xl ${selected ? "bg-white text-[#183325] dark:bg-[#0f172a] dark:text-[#93c5fd]" : option.accentClassName}`}>
                          <Icon name={option.icon} />
                        </span>
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${selected ? "bg-[#f59e0b] text-white" : "bg-[#edf1ea] text-[#5b6d61] dark:bg-[#0f172a] dark:text-[#94a3b8]"}`}>
                          {selected ? "Seleccionado" : "Elegir"}
                        </span>
                      </div>
                      <strong className="mt-4 block text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">{option.label}</strong>
                      <span className="mt-1 block text-sm leading-6 text-[#5b6d61] dark:text-[#c7d2e0]">{option.description}</span>
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
              <div className="rounded-lg border border-[#e4ece2] bg-white p-4 dark:border-[#23314d] dark:bg-[#111827]">
                <h3 className="text-base font-semibold text-[#183325] dark:text-[#f8fafc]">Detalle de la venta informal</h3>
                <div className="mt-4 rounded-lg border border-[#edf1ea] px-4 py-4 dark:border-[#23314d] dark:bg-[#182235]">
                  <p className="text-sm leading-7 text-[#5b6d61] dark:text-[#c7d2e0]">{informalSale.description.trim()}</p>
                </div>
              </div>

              <div className="rounded-lg border border-[#e4ece2] bg-[#f8faf6] p-4 dark:border-[#23314d] dark:bg-[#182235]">
                <h3 className="text-base font-semibold text-[#183325] dark:text-[#f8fafc]">Resumen de registro</h3>
                <div className="mt-4 space-y-3 text-sm text-[#5b6d61] dark:text-[#c7d2e0]">
                  <div className="flex items-center justify-between gap-3">
                    <span>Metodo de pago</span>
                    <strong className="text-[#183325] dark:text-[#f8fafc]">{selectedPayment.label}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Total de la venta</span>
                    <strong className="text-[#183325] dark:text-[#f8fafc]">{money(totalAmount)}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Saldo actual de cartera</span>
                    <strong className="text-[#183325] dark:text-[#f8fafc]">{money(wallet?.saldoActual || 0)}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Saldo luego de registrar</span>
                    <strong className="text-[#1f7a3a] dark:text-[#93c5fd]">{money(nextWalletTotal)}</strong>
                  </div>
                  {informalSalePayment.evidenceName ? <div className="rounded-md border border-[#dbe6d8] bg-white px-3 py-2 text-xs text-[#5b6d61] dark:border-[#314056] dark:bg-[#0f172a] dark:text-[#c7d2e0]">Evidencia: {informalSalePayment.evidenceName}</div> : null}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-3 border-t border-[#edf1ea] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <button className={`${subtleButtonClassName} w-full sm:w-auto`} onClick={step === 1 ? onClose : prevStep} type="button">
            {step === 1 ? "Cancelar" : "Volver"}
          </button>

          <div className="flex w-full flex-wrap gap-3 sm:w-auto sm:justify-end">
            {step < 3 ? (
              <button
                className={`${primaryButtonClassName} w-full sm:w-auto`}
                disabled={(step === 1 && !canContinueDetail) || (step === 2 && !canContinuePayment) || uploading}
                onClick={nextStep}
                type="button"
              >
                Continuar
              </button>
            ) : (
              <button className={`${primaryButtonClassName} w-full sm:w-auto`} disabled={informalSaleSubmitting || !canContinueDetail || !canContinuePayment} onClick={createInformalSale} type="button">
                {informalSaleSubmitting ? "Procesando..." : "Finalizar venta informal"}
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
