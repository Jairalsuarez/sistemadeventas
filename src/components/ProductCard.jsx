import Icon from "./ui/Icon";

export default function ProductCard({ product, money, mode = "panel", onEdit, onView, onWhatsApp }) {
  const isPublic = mode === "public";
  const stockTone =
    product.stock <= 0 ? "bg-[#fff1f2] text-[#b91c1c]" : product.stock <= 5 ? "bg-[#fff7ed] text-[#c2410c]" : "bg-[#f0fdf4] text-[#166534]";

  return (
    <article className="overflow-hidden rounded-xl border border-[#e4ece2] bg-white shadow-[0_16px_35px_rgba(24,51,37,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_42px_rgba(24,51,37,0.1)] dark:border-white/10 dark:bg-[#122117]">
      <button className={`block w-full overflow-hidden bg-[#f6f8f4] ${isPublic ? "h-60" : "h-52"}`} onClick={() => onView(product)} type="button">
        <img alt={product.nombre} className="h-full w-full object-cover transition duration-300 hover:scale-[1.03]" src={product.imagen_url} />
      </button>

      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-[#f4f8ef] px-3 py-1 text-xs font-semibold text-[#56705d] dark:bg-[#1d3425] dark:text-white/70">{product.categoria}</span>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${stockTone}`}>{product.stock > 0 ? `${product.stock} disponibles` : "Agotado"}</span>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-[#183325] dark:text-white">{product.nombre}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#5b6d61] dark:text-white/68">{product.descripcion}</p>
        </div>

        <div className="flex items-end justify-between gap-3">
          <strong className="text-2xl font-semibold text-[#183325] dark:text-white">{money(product.precio)}</strong>
          <button className="inline-flex items-center gap-2 text-sm font-medium text-[#1f7a3a] dark:text-[#7dd88f]" onClick={() => onView(product)} type="button">
            <Icon name="visibility" />
            Ver detalle
          </button>
        </div>

        <div className={`grid gap-2 ${onEdit && !isPublic ? "sm:grid-cols-2" : ""}`}>
          <button className="inline-flex items-center justify-center gap-2 rounded-md bg-[#25d366] px-4 py-3 text-sm font-medium text-white" onClick={() => onWhatsApp?.(product)} type="button">
            <Icon name="chat" />
            Comprar en WhatsApp
          </button>
          {onEdit ? (
            <button className="inline-flex items-center justify-center gap-2 rounded-md border border-[#dfe7db] px-4 py-3 text-sm font-medium dark:border-white/10" onClick={() => onEdit(product)} type="button">
              <Icon name="edit" />
              Editar
            </button>
          ) : null}
          {!onEdit && !isPublic ? (
            <button className="inline-flex items-center justify-center gap-2 rounded-md border border-[#dfe7db] px-4 py-3 text-sm font-medium dark:border-white/10" onClick={() => onView(product)} type="button">
              <Icon name="visibility" />
              Ver
            </button>
          ) : null}
          {isPublic ? (
            <button className="inline-flex items-center justify-center gap-2 rounded-md border border-[#dfe7db] px-4 py-3 text-sm font-medium dark:border-white/10" onClick={() => onView(product)} type="button">
              <Icon name="info" />
              Mas detalles
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
