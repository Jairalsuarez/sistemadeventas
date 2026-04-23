import Modal from "../Modal";

export default function WalletModal({ adjustWallet, onClose, open, setWalletForm, walletForm }) {
  const canSave =
    String(walletForm.motivo || "").trim() &&
    String(walletForm.saldo || "") !== "" &&
    String(walletForm.password || "").trim() &&
    Boolean(walletForm.confirmationAccepted);
  const fieldClassName =
    "rounded-md border border-[#dfe7db] bg-[#f8faf6] px-4 py-3 text-[#183325] transition focus:border-[#f59e0b] focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/20 dark:border-white/10 dark:bg-[#0d1710] dark:text-white";

  return (
    <Modal open={open} onClose={onClose} text="Ajuste manual para administracion con motivo obligatorio." title="Cambiar saldo general">
      <div className="grid gap-4">
        <label className="grid gap-2 text-sm font-semibold text-ink-900 dark:text-white">
          Nuevo saldo
          <input className={fieldClassName} onChange={(e) => setWalletForm((current) => ({ ...current, saldo: e.target.value }))} step="0.01" type="number" value={walletForm.saldo} />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink-900 dark:text-white">
          Motivo del cambio
          <textarea className={fieldClassName} onChange={(e) => setWalletForm((current) => ({ ...current, motivo: e.target.value }))} rows="3" value={walletForm.motivo} />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink-900 dark:text-white">
          Contrasena del administrador
          <input
            autoComplete="current-password"
            className={fieldClassName}
            onChange={(e) => setWalletForm((current) => ({ ...current, password: e.target.value }))}
            placeholder="Ingresa tu contrasena actual"
            type="password"
            value={walletForm.password || ""}
          />
        </label>
        <label className="flex items-start gap-3 rounded-lg border border-[#dbe6d8] bg-white px-4 py-3">
          <input
            checked={Boolean(walletForm.confirmationAccepted)}
            className="mt-1 h-4 w-4 rounded border-[#d0dcd0] text-[#1f7a3a] focus:ring-[#1f7a3a]"
            onChange={(e) => setWalletForm((current) => ({ ...current, confirmationAccepted: e.target.checked }))}
            type="checkbox"
          />
          <span className="text-sm leading-6 text-[#5b6d61]">
            Confirmo que entiendo este ajuste manual y que modificara directamente la cartera actual del negocio.
          </span>
        </label>
        <button className="rounded-md bg-[#1f7a3a] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#17612d] disabled:cursor-not-allowed disabled:opacity-50" disabled={!canSave} onClick={adjustWallet} type="button">
          Guardar saldo
        </button>
      </div>
    </Modal>
  );
}
