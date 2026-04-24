import Icon from "../ui/Icon";

export default function ToastViewport({ suspended = false, toasts, onDismiss }) {
  if (suspended) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[70] space-y-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex min-w-[280px] items-start justify-between gap-3 rounded-lg border border-[#dbe8db] bg-white px-4 py-3 shadow-[0_18px_38px_rgba(24,51,37,0.12)] dark:border-[#23314d] dark:bg-[#111827]"
        >
          <div className="flex items-start gap-3">
            <Icon className="mt-0.5 text-[#f97316]" name={toast.type === "error" ? "error" : "notifications"} />
            <div>
            <strong className="block text-sm font-semibold text-[#183325] dark:text-white">{toast.type === "error" ? "Aviso" : "Notificacion"}</strong>
            <p className="mt-1 text-sm text-[#5b6d61] dark:text-[#c7d2e0]">{toast.message}</p>
            </div>
          </div>
          <button className="text-sm text-[#5b6d61] dark:text-[#c7d2e0]" onClick={() => onDismiss(toast.id)} type="button">
            <Icon name="close" />
          </button>
        </div>
      ))}
    </div>
  );
}
