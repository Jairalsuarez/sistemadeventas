export default function useCatalogActions({
  app,
  session,
  user,
  editing,
  productForm,
  commit,
  notify,
  inform,
  personName,
  resetProductFlow,
  upsertRemoteProduct,
  deleteRemoteProduct,
}) {
  const saveProduct = async () => {
    if (!productForm.nombre || !productForm.imagen_url) return inform("Completa nombre e imagen.", "warning");

    const draft = {
      ...productForm,
      precio: Number(productForm.precio),
      stock: Number(productForm.stock),
      id: editing?.id || crypto.randomUUID(),
      updatedAt: new Date().toISOString(),
    };

    const remote = await upsertRemoteProduct(draft, session?.mode === "supabase" ? session.userId : null);
    const record = remote.ok ? remote.product : draft;

    commit((current) => ({
      ...current,
      products: editing ? current.products.map((product) => (product.id === editing.id ? record : product)) : [record, ...current.products],
    }));

    notify(`${personName(user)} ${editing ? "actualizo" : "creo"} el producto ${record.nombre}.`, personName(user));
    resetProductFlow();
    inform("Producto guardado correctamente.", "success");
  };

  const removeProduct = async (id) => {
    const product = app.products.find((item) => item.id === id);
    if (!product) return;

    await deleteRemoteProduct(id);
    commit((current) => ({ ...current, products: current.products.filter((item) => item.id !== id) }));
    notify(`${personName(user)} elimino el producto ${product.nombre}.`, personName(user), "warning");
    resetProductFlow();
    inform("Producto eliminado correctamente.", "success");
  };

  const setFeaturedProduct = (productId) => {
    const target = app.products.find((product) => product.id === productId);
    if (!target) return inform("Selecciona un producto valido.", "warning");
    commit((current) => ({
      ...current,
      business: { ...current.business, featuredProductId: productId },
    }));
    notify(`${personName(user)} selecciono ${target.nombre} como producto destacado.`, personName(user));
    inform(`Producto estrella actualizado: ${target.nombre}.`, "success");
  };

  return {
    saveProduct,
    removeProduct,
    setFeaturedProduct,
  };
}
