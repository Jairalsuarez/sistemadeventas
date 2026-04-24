import Icon from "../ui/Icon";

function StockBadge({ stock }) {
  const tone =
    Number(stock) <= 0
      ? "bg-[#fff1f2] text-[#b91c1c] dark:bg-[#1f2937] dark:text-[#fca5a5]"
      : Number(stock) <= 5
        ? "bg-[#fff7ed] text-[#c2410c] dark:bg-[#172033] dark:text-[#fdba74]"
        : "bg-[#f0fdf4] text-[#166534] dark:bg-[#0f172a] dark:text-[#93c5fd]";

  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{Number(stock) <= 0 ? "Agotado" : `${stock} disponibles`}</span>;
}

export default function ProductListTable({ canEdit = false, emptyMessage, money, onEdit, onView, products }) {
  if (!products.length) {
    return (
      <div className="rounded-md border border-dashed border-[#dfe7db] px-4 py-10 text-center text-sm text-[#5b6d61] dark:border-[#314056] dark:text-[#94a3b8]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="text-[#6a7b70] dark:text-[#94a3b8]">
          <tr>
            <th className="pb-3">Producto</th>
            <th className="pb-3">Categoria</th>
            <th className="pb-3">Precio</th>
            <th className="pb-3">Stock</th>
            <th className="pb-3">Estado</th>
            <th className="pb-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-t border-[#edf1ea] align-top dark:border-[#23314d]">
              <td className="py-4">
                <div className="flex gap-3">
                  <button className="h-16 w-16 overflow-hidden rounded-md border border-[#e4ece2] bg-[#f7faf6] dark:border-[#314056] dark:bg-[#0f172a]" onClick={() => onView(product)} type="button">
                    <img alt={product.nombre} className="h-full w-full object-cover" src={product.imagen_url} />
                  </button>
                  <div className="min-w-0">
                    <strong className="block font-semibold text-[#183325] dark:text-[#f8fafc]">{product.nombre}</strong>
                    <p className="mt-1 line-clamp-2 max-w-xl text-xs leading-6 text-[#5b6d61] dark:text-[#c7d2e0]">{product.descripcion}</p>
                  </div>
                </div>
              </td>
              <td className="py-4">{product.categoria}</td>
              <td className="py-4 font-medium">{money(product.precio)}</td>
              <td className="py-4">{product.stock}</td>
              <td className="py-4">
                <StockBadge stock={product.stock} />
              </td>
              <td className="py-4">
                <div className="flex justify-end gap-2">
                  <button className="inline-flex items-center gap-2 rounded-md border border-[#dfe7db] px-3 py-2 dark:border-[#314056] dark:bg-[#0f172a] dark:text-[#f8fafc]" onClick={() => onView(product)} type="button">
                    <Icon name="visibility" />
                    Ver
                  </button>
                  {canEdit ? (
                    <button className="inline-flex items-center gap-2 rounded-md bg-[#1f7a3a] px-3 py-2 text-white dark:bg-[linear-gradient(135deg,#2563eb,#1d4ed8)]" onClick={() => onEdit(product)} type="button">
                      <Icon name="edit" />
                      Editar
                    </button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
