export default function Modal({ open, title, text, onClose, children, wide = false, closeOnBackdrop = false, variant = "default", containerClassName = "" }) {
  if (!open) return null;

  const isPublic = variant === "public";

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto p-3 backdrop-blur-sm sm:grid sm:place-items-center sm:p-4 ${isPublic ? "bg-[#0f2116]/42" : "bg-[#0b1220]/55"}`} onClick={closeOnBackdrop ? onClose : undefined}>
      <div
        className={`mx-auto mt-3 w-full max-h-[calc(100vh-1.5rem)] overflow-y-auto border p-4 shadow-[0_24px_60px_rgba(24,51,37,0.16)] dark:border-[#23314d] dark:bg-[#111827] sm:mt-0 sm:max-h-[calc(100vh-2rem)] sm:p-5 ${
          isPublic
            ? "rounded-[28px] border-[#d6e6d9] bg-white"
            : "rounded-lg border-[#dfe7db] bg-white"
        } ${wide ? "max-w-5xl" : "max-w-2xl"} ${containerClassName}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-[#183325] dark:text-[#f8fafc] sm:text-2xl">{title}</h2>
            <p className="mt-1 text-sm text-[#5b6d61] dark:text-[#c7d2e0]">{text}</p>
          </div>
          <button
            aria-label="Cerrar modal"
            className={`grid h-10 w-10 shrink-0 place-items-center text-base font-semibold text-[#183325] transition dark:border-[#314056] dark:bg-[#182235] dark:text-[#f8fafc] dark:hover:bg-[#1e293b] ${
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
