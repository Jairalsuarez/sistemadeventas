export default function SectionBlock({ title, description, action, children }) {
  return (
    <section className="space-y-4 rounded-lg border border-[#e4ece2] bg-white p-5 dark:border-white/10 dark:bg-[#122117]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#183325] dark:text-white">{title}</h2>
          {description ? <p className="mt-1 text-sm text-[#5b6d61] dark:text-white/68">{description}</p> : null}
        </div>
        {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
