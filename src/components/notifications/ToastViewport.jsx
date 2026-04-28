import { useState } from "react";
import Icon from "../ui/Icon";

function ToastCard({ toast, onDismiss }) {
  const [drag, setDrag] = useState({ active: false, startX: 0, currentX: 0 });
  const offsetX = drag.active ? drag.currentX - drag.startX : 0;
  const dismissThreshold = 90;
  const opacity = Math.max(0.35, 1 - Math.min(Math.abs(offsetX), 160) / 220);

  const resetDrag = () => setDrag({ active: false, startX: 0, currentX: 0 });

  const finishDrag = () => {
    if (Math.abs(offsetX) >= dismissThreshold) {
      onDismiss(toast.id);
      resetDrag();
      return;
    }

    resetDrag();
  };

  return (
    <div
      className="pointer-events-auto flex w-full touch-pan-y select-none items-start justify-between gap-3 rounded-lg border border-[#dbe8db] bg-white px-3 py-3 shadow-[0_18px_38px_rgba(24,51,37,0.12)] transition-[opacity,transform] dark:border-[#23314d] dark:bg-[#111827] sm:min-w-[280px] sm:max-w-[380px] sm:px-4"
      onPointerCancel={finishDrag}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture?.(event.pointerId);
        setDrag({ active: true, startX: event.clientX, currentX: event.clientX });
      }}
      onPointerMove={(event) => {
        if (!drag.active) return;
        setDrag((current) => ({ ...current, currentX: event.clientX }));
      }}
      onPointerUp={finishDrag}
      style={{ opacity, transform: `translateX(${offsetX}px)` }}
    >
      <div className="flex min-w-0 items-start gap-3">
        <Icon className="mt-0.5 shrink-0 text-[#f97316]" name={toast.type === "error" ? "error" : "notifications"} />
        <div className="min-w-0">
          <strong className="block text-sm font-semibold text-[#183325] dark:text-white">{toast.type === "error" ? "Aviso" : "Notificacion"}</strong>
          <p className="mt-1 text-sm leading-5 text-[#5b6d61] dark:text-[#c7d2e0]">{toast.message}</p>
        </div>
      </div>
      <button
        className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-sm text-[#5b6d61] transition hover:bg-[#f4f7f2] dark:text-[#c7d2e0] dark:hover:bg-[#182235]"
        onClick={() => onDismiss(toast.id)}
        onPointerDown={(event) => event.stopPropagation()}
        type="button"
      >
        <Icon name="close" />
      </button>
    </div>
  );
}

export default function ToastViewport({ suspended = false, toasts, onDismiss }) {
  if (suspended) return null;

  return (
    <div className="pointer-events-none fixed inset-x-2 top-2 z-[70] space-y-2 sm:inset-x-auto sm:right-4 sm:top-4 sm:space-y-3">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} onDismiss={onDismiss} toast={toast} />
      ))}
    </div>
  );
}
