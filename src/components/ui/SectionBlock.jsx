export default function SectionBlock({ title, description, action, children }) {
  return (
    <section className="space-y-4 rounded-lg border border-[#e4ece2] bg-white p-5 dark:border-[#23314d] dark:bg-[#111827]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#183325] dark:text-[#f8fafc]">{title}</h2>
          {description ? <p className="mt-1 text-sm text-[#5b6d61] dark:text-[#c7d2e0]">{description}</p> : null}
        </div>
        {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
