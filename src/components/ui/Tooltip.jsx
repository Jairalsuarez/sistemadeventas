export default function Tooltip({ label, children }) {
  return (
    <div className="group relative inline-flex">
      {children}
      <div className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-56 -translate-x-1/2 rounded-lg border border-[#dfe7db] bg-white px-3 py-2 text-xs leading-5 text-[#4c5b52] opacity-0 shadow-[0_12px_30px_rgba(28,47,36,0.12)] transition group-hover:opacity-100 dark:border-white/10 dark:bg-[#122117] dark:text-white/78">
        {label}
      </div>
    </div>
  );
}
