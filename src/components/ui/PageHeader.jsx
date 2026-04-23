export default function PageHeader({ eyebrow, title, description, action, align = "left" }) {
  const isCentered = align === "center";

  return (
    <header className={`flex flex-col gap-4 ${isCentered ? "items-center text-center" : "lg:flex-row lg:items-end lg:justify-between"}`}>
      <div className={`space-y-2 ${isCentered ? "mx-auto" : ""}`}>
        {eyebrow ? <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f97316]">{eyebrow}</span> : null}
        <h1 className="text-3xl font-semibold text-[#183325] dark:text-white sm:text-4xl">{title}</h1>
        {description ? <p className={`text-sm leading-6 text-[#5b6d61] dark:text-white/70 ${isCentered ? "mx-auto max-w-2xl" : "max-w-3xl"}`}>{description}</p> : null}
      </div>
      {action ? <div className={`flex flex-wrap gap-3 ${isCentered ? "justify-center" : ""}`}>{action}</div> : null}
    </header>
  );
}
