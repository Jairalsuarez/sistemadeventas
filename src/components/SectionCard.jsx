export default function SectionCard({ title, text, action, children, subtle = false }) {
  return (
    <section
      className={`rounded-[28px] border border-[#123142]/10 ${subtle ? "bg-[#F6F8F8] dark:bg-[#123142]" : "bg-white dark:bg-[#142026]"} p-6 shadow-[0_18px_40px_rgba(18,49,66,0.08)] dark:border-white/10`}
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black tracking-tight text-[#20130A] dark:text-white">{title}</h2>
          <p className="mt-1 text-sm text-[#142026]/65 dark:text-white/70">{text}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
