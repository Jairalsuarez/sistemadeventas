import Modal from "../Modal";

export default function ProductModal({
  editing,
  onClose,
  open,
  productForm,
  removeProduct,
  saveProduct,
  setProductForm,
  uploadProductImage,
}) {
  const hasChanges = editing
    ? productForm.nombre !== editing.nombre ||
      productForm.categoria !== editing.categoria ||
      productForm.marca !== (editing.marca || "") ||
      Number(productForm.precio) !== Number(editing.precio) ||
      Number(productForm.stock) !== Number(editing.stock) ||
      productForm.descripcion !== editing.descripcion ||
      productForm.imagen_url !== editing.imagen_url ||
      Boolean(productForm.activo) !== Boolean(editing.activo)
    : true;
  const fieldClassName =
    "rounded-md border border-[#dfe7db] bg-[#f8faf6] px-4 py-3 text-[#183325] transition focus:border-[#f59e0b] focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/20 dark:border-white/10 dark:bg-[#0d1710] dark:text-white";

  return (
    <Modal open={open} onClose={onClose} text="Formulario sencillo y directo." title={editing ? "Editar producto" : "Nuevo producto"} wide>
      <div className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {["Nombre", "Categoria", "Marca", "Precio", "Stock"].map((label, index) => {
            const key = ["nombre", "categoria", "marca", "precio", "stock"][index];
            return (
              <label key={key} className="grid gap-2 text-sm font-semibold text-ink-900 dark:text-white">
                {label}
                <input
                  className={fieldClassName}
                  onChange={(e) => setProductForm((current) => ({ ...current, [key]: e.target.value }))}
                  step={key === "precio" ? "0.01" : undefined}
                  type={key === "precio" || key === "stock" ? "number" : "text"}
                  value={productForm[key] || ""}
                />
              </label>
            );
          })}
        </div>
        <label className="grid gap-2 text-sm font-semibold text-ink-900 dark:text-white">
          Descripcion
          <textarea className={fieldClassName} onChange={(e) => setProductForm((current) => ({ ...current, descripcion: e.target.value }))} rows="3" value={productForm.descripcion} />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink-900 dark:text-white">
          Imagen URL
          <input className={fieldClassName} onChange={(e) => setProductForm((current) => ({ ...current, imagen_url: e.target.value }))} placeholder="Se llena al subir una imagen" value={productForm.imagen_url} />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-md border border-[#dfe7db] px-4 py-3 text-sm font-medium text-[#183325] transition hover:bg-[#f7faf6] dark:border-white/10 dark:text-white dark:hover:bg-[#183325]">
            <span>Subir imagen</span>
            <input className="absolute inset-0 cursor-pointer opacity-0" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadProductImage(e.target.files[0])} type="file" />
          </label>
          <span className="text-sm text-[#142026]/55 dark:text-white/55">Sube una foto clara del producto para el catalogo.</span>
        </div>
        <label className="flex items-center gap-3 text-sm font-semibold text-ink-900 dark:text-white">
          <input checked={productForm.activo} onChange={(e) => setProductForm((current) => ({ ...current, activo: e.target.checked }))} type="checkbox" />
          Visible en catalogo
        </label>
        <div className="flex flex-wrap gap-3">
          <button className="rounded-md bg-[#1f7a3a] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#17612d] disabled:cursor-not-allowed disabled:opacity-50" disabled={!hasChanges} onClick={saveProduct} type="button">
            {editing ? "Guardar cambios" : "Crear producto"}
          </button>
          <button className="rounded-md border border-[#dfe7db] px-4 py-3 text-sm font-medium text-[#183325] transition hover:bg-[#f7faf6] dark:border-white/10 dark:text-white dark:hover:bg-[#183325]" onClick={onClose} type="button">
            Terminar
          </button>
          {editing ? (
            <button className="rounded-md border border-[#f2c6bf] px-4 py-3 text-sm font-medium text-[#c2410c]" onClick={() => removeProduct(editing.id)} type="button">
              Eliminar
            </button>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
