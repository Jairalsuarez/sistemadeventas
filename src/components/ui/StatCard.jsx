export default function StatCard({ label, value, detail, accent = "green" }) {
  const accents = {
    green: "border-[#dbe8db] bg-white dark:border-[#23314d] dark:bg-[#111827]",
    orange: "border-[#f5dbc7] bg-white dark:border-[#23314d] dark:bg-[#111827]",
    yellow: "border-[#f4e9c5] bg-white dark:border-[#23314d] dark:bg-[#111827]",
  };

  return (
    <article className={`rounded-lg border p-5 ${accents[accent] || accents.green}`}>
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6c7c72] dark:text-[#94a3b8]">{label}</span>
      <strong className="mt-3 block text-2xl font-semibold text-[#183325] dark:text-[#f8fafc]">{value}</strong>
      {detail ? <p className="mt-2 text-sm text-[#5b6d61] dark:text-[#c7d2e0]">{detail}</p> : null}
    </article>
  );
}
