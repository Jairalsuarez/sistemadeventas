import PublicPageShell from "../../components/public/PublicPageShell.jsx";

function toneClasses(index) {
  const styles = [
    "border-[#d9efde] bg-[#f6fbf7]",
    "border-[#fde8d9] bg-[#fffaf5]",
    "border-[#e3e8ff] bg-[#f7f8ff]",
    "border-[#f2e4ff] bg-[#fcf8ff]",
  ];
  return styles[index % styles.length];
}

function commentShape(index) {
  const layouts = [
    "md:col-span-2 xl:col-span-2",
    "",
    "",
    "xl:translate-y-6",
    "",
    "md:col-span-2 xl:col-span-1",
  ];
  return layouts[index % layouts.length];
}

function formatCommentDate(value) {
  return new Intl.DateTimeFormat("es-EC", { dateStyle: "medium" }).format(new Date(value));
}

export default function CommunityPage({ app, feedbacks }) {
  return (
    <PublicPageShell
      app={app}
      badge="Voces reales"
      description="Comentarios anonimos de clientes y visitantes que ya probaron productos, hicieron pedidos o compartieron su experiencia con el negocio."
      title="Comunidad"
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {feedbacks.map((item, index) => (
          <article key={item.id} className={`rounded-[28px] border p-5 shadow-[0_16px_32px_rgba(24,51,37,0.05)] ${toneClasses(index)} ${commentShape(index)}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f97316]">Voz de la comunidad</span>
                <h2 className="mt-2 text-lg font-semibold">Comentario {String(index + 1).padStart(2, "0")}</h2>
              </div>
              <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold text-[#5b6d61]">{formatCommentDate(item.createdAt)}</span>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#5b6d61]">{item.comment}</p>
          </article>
        ))}
      </div>
    </PublicPageShell>
  );
}
