import Modal from "../Modal";

const fieldClassName =
  "rounded-md border border-[#dfe7db] bg-[#f8faf6] px-4 py-3 text-[#183325] transition focus:border-[#f59e0b] focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/20 dark:border-[#314056] dark:bg-[#0f172a] dark:text-white";

const primaryButtonClassName =
  "rounded-md bg-[#1f7a3a] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#17612d] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[linear-gradient(135deg,#2563eb,#1d4ed8)] dark:hover:brightness-110";

const subtleButtonClassName =
  "rounded-md border border-[#dfe7db] px-4 py-3 text-sm font-medium text-[#183325] transition hover:bg-[#f7faf6] dark:border-[#314056] dark:bg-[#0f172a] dark:text-white dark:hover:bg-[#182235]";

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

export default function ExpenseModal({
  createExpense,
  expense,
  expenseSubmitting,
  money,
  onClose,
  open,
  presentation = "modal",
  setExpense,
  wallet,
}) {
  const amount = parseMoneyInput(expense.montoInput || expense.monto);
  const description = String(expense.descripcion || "").trim();
  const nextWalletTotal = Number(wallet?.saldoActual || 0) - amount;
  const canSubmit = amount > 0 && Boolean(description);
  const updateExpense = (patch) => setExpense((current) => ({ ...current, ...patch }));

  return (
    <Modal open={open} onClose={onClose} text={presentation === "page" ? "" : "Registra un egreso simple descontando saldo del negocio."} title="Registrar egreso" variant={presentation === "page" ? "page" : "default"}>
      <div className="grid gap-5">
        <label className="grid gap-2 text-sm font-semibold text-[#183325] dark:text-white">
          Saldo a egresar
          <input
            className={fieldClassName}
            inputMode="decimal"
            onChange={(event) =>
              updateExpense({
                montoInput: normalizeMoneyInput(event.target.value),
                monto: parseMoneyInput(event.target.value),
              })
            }
            placeholder="Ej. 25.50"
            type="text"
            value={expense.montoInput ?? ""}
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-[#183325] dark:text-white">
          Descripcion
          <textarea
            className={`${fieldClassName} min-h-28 resize-none`}
            onChange={(event) => updateExpense({ descripcion: event.target.value })}
            placeholder="Ej. Pago de internet, transporte, limpieza"
            value={expense.descripcion}
          />
        </label>

        <div className="rounded-lg border border-[#e4ece2] bg-[#f8faf6] p-4 dark:border-[#23314d] dark:bg-[#182235]">
          <div className="flex items-center justify-between gap-3 text-sm text-[#5b6d61] dark:text-[#c7d2e0]">
            <span>Egreso total</span>
            <strong className="text-[#183325] dark:text-[#f8fafc]">{money(amount)}</strong>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 text-sm text-[#5b6d61] dark:text-[#c7d2e0]">
            <span>Saldo luego</span>
            <strong className="text-[#b42318] dark:text-[#fca5a5]">{money(nextWalletTotal)}</strong>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[#edf1ea] pt-4 dark:border-[#23314d] sm:flex-row sm:items-center sm:justify-between">
          <button className={`${subtleButtonClassName} w-full sm:w-auto`} onClick={onClose} type="button">
            Cancelar
          </button>
          <button
            className={`${primaryButtonClassName} w-full sm:w-auto`}
            disabled={expenseSubmitting || !canSubmit}
            onClick={async () => {
              const saved = await createExpense();
              if (saved && presentation === "page") onClose();
            }}
            type="button"
          >
            {expenseSubmitting ? "Procesando..." : "Confirmar egreso"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
