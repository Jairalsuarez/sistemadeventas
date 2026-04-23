export default function Modal({ open, title, text, onClose, children, wide = false, closeOnBackdrop = false, variant = "default" }) {
  if (!open) return null;

  const isPublic = variant === "public";

  return (
    <div className={`fixed inset-0 z-50 grid place-items-center p-4 backdrop-blur-sm ${isPublic ? "bg-[#0f2116]/42" : "bg-[#183325]/18"}`} onClick={closeOnBackdrop ? onClose : undefined}>
      <div
        className={`w-full overflow-hidden border p-5 shadow-[0_24px_60px_rgba(24,51,37,0.16)] dark:border-white/10 dark:bg-[#122117] ${
          isPublic
            ? "rounded-[28px] border-[#d6e6d9] bg-white"
            : "rounded-lg border-[#dfe7db] bg-white"
        } ${wide ? "max-w-5xl" : "max-w-2xl"}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-[#183325] dark:text-white">{title}</h2>
            <p className="mt-1 text-sm text-[#5b6d61] dark:text-white/70">{text}</p>
          </div>
          <button
            aria-label="Cerrar modal"
            className={`grid h-10 w-10 place-items-center text-base font-semibold text-[#183325] transition dark:border-white/10 dark:bg-[#122117] dark:text-white dark:hover:bg-[#183325] ${
              isPublic
                ? "rounded-full border border-[#d6e6d9] bg-white hover:bg-white"
                : "rounded-md border border-[#dfe7db] bg-white hover:bg-white"
            }`}
            onClick={onClose}
            type="button"
          >
            <span className="-mt-px">x</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
