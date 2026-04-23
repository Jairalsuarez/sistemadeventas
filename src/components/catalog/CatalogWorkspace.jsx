import ProductCard from "../ProductCard";
import EmptyState from "../ui/EmptyState";
import PageHeader from "../ui/PageHeader";
import useCatalogFilters from "../../hooks/useCatalogFilters.jsx";

function FilterChip({ active, children, onClick }) {
  return (
    <button
      className={`rounded-md px-3 py-2 text-sm font-medium transition ${active ? "bg-[#1f7a3a] text-white" : "border border-[#dfe7db] bg-white text-[#183325] hover:bg-[#f7faf6] dark:border-white/10 dark:bg-[#122117] dark:text-white dark:hover:bg-[#183325]"}`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function SidebarPanel({ category, categories, mode, search, setCategory, setSearch, setSortBy, setStockFilter, sortBy, stockFilter, total }) {
  const isPublic = mode === "public";

  return (
    <aside className="xl:sticky xl:top-24 xl:self-start">
      <div className="space-y-5 rounded-xl border border-[#e4ece2] bg-white p-5 shadow-[0_18px_40px_rgba(24,51,37,0.06)] dark:border-white/10 dark:bg-[#122117]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#f97316]">Filtros</p>
          <h3 className="mt-2 text-xl font-semibold">Explorar productos</h3>
          <p className="mt-2 text-sm text-[#5b6d61] dark:text-white/65">{total} resultados disponibles</p>
        </div>

        <label className="grid gap-2 text-sm">
          Buscar
          <input
            className="rounded-md border border-[#dfe7db] bg-[#fbfcfa] px-3 py-2 dark:border-white/10 dark:bg-[#0d1710]"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nombre o descripcion"
            value={search}
          />
        </label>

        <label className="grid gap-2 text-sm">
          Ordenar
          <select className="rounded-md border border-[#dfe7db] bg-[#fbfcfa] px-3 py-2 dark:border-white/10 dark:bg-[#0d1710]" onChange={(event) => setSortBy(event.target.value)} value={sortBy}>
            <option value="nombre-asc">Nombre A-Z</option>
            <option value="nombre-desc">Nombre Z-A</option>
            <option value="precio-asc">Menor precio</option>
            <option value="precio-desc">Mayor precio</option>
            <option value="stock-desc">Mas stock</option>
          </select>
        </label>

        <div className="space-y-3">
          <span className="text-sm font-semibold">Disponibilidad</span>
          <div className="flex flex-wrap gap-2">
            <FilterChip active={stockFilter === "todos"} onClick={() => setStockFilter("todos")}>Todos</FilterChip>
            <FilterChip active={stockFilter === "disponibles"} onClick={() => setStockFilter("disponibles")}>Disponibles</FilterChip>
            {!isPublic ? <FilterChip active={stockFilter === "bajo"} onClick={() => setStockFilter("bajo")}>Bajo stock</FilterChip> : null}
            {!isPublic ? <FilterChip active={stockFilter === "agotados"} onClick={() => setStockFilter("agotados")}>Agotados</FilterChip> : null}
          </div>
        </div>

        <div className="space-y-3">
          <span className="text-sm font-semibold">Categorias</span>
          <div className="flex flex-wrap gap-2">
            {categories.map((item) => (
              <FilterChip key={item} active={category === item} onClick={() => setCategory(item)}>
                {item}
              </FilterChip>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

function FeaturedProductPanel({ app, heroAction, mode, money, onView, product }) {
  if (!product) return null;

  const stockTone =
    product.stock <= 0 ? "bg-[#fff1f2] text-[#b91c1c]" : product.stock <= 5 ? "bg-[#fff7ed] text-[#c2410c]" : "bg-[#f0fdf4] text-[#166534]";

  return (
    <aside className="xl:sticky xl:top-24 xl:self-start">
      <div className="overflow-hidden rounded-[10px] border border-[#e4ece2] bg-white shadow-[0_28px_55px_rgba(24,51,37,0.08)] dark:border-white/10 dark:bg-[#122117]">
        <button className="block w-full bg-[#f7faf6] p-5 dark:bg-[#0d1710]" onClick={() => onView(product)} type="button">
          <img alt={product.nombre} className="h-[260px] w-full rounded-lg object-cover" src={product.imagen_url} />
        </button>

        <div className="space-y-4 p-5">
          <div className="space-y-2">
            <span className="inline-flex rounded-full bg-[#f4f8ef] px-3 py-1 text-xs font-semibold text-[#56705d] dark:bg-[#1d3425] dark:text-white/70">{product.categoria}</span>
            <h3 className="text-2xl font-semibold">{product.nombre}</h3>
            <p className="text-sm leading-6 text-[#5b6d61] dark:text-white/68">{product.descripcion}</p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <strong className="text-2xl font-semibold">{money(product.precio)}</strong>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${stockTone}`}>{product.stock > 0 ? `${product.stock} disponibles` : "Agotado"}</span>
          </div>

          <div className="rounded-lg border border-[#edf1ea] bg-[#fbfcfa] p-4 dark:border-white/10 dark:bg-[#0d1710]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#f97316]">{mode === "public" ? "Pedido rapido" : "Vista destacada"}</p>
            <p className="mt-2 text-sm text-[#5b6d61] dark:text-white/65">
              {mode === "public"
                ? `Compra o consulta directamente con ${app.business.nombre}.`
                : "Revisa este producto mientras exploras el resto del catalogo."}
            </p>
          </div>

          {heroAction ? <div className="grid gap-3">{heroAction}</div> : null}
        </div>
      </div>
    </aside>
  );
}

export default function CatalogWorkspace({
  app,
  canEdit = false,
  description,
  eyebrow,
  headerAction = null,
  heroAction = null,
  mode = "panel",
  onEdit,
  onView,
  onWhatsApp,
  products,
  title,
  money,
}) {
  const { category, categories, filteredProducts, search, setCategory, setSearch, setSortBy, setStockFilter, sortBy, stockFilter } = useCatalogFilters(products);
  const featuredProduct = filteredProducts[0] || products[0] || null;
  const isPublic = mode === "public";

  return (
    <div className="space-y-6">
      <PageHeader align={isPublic ? "center" : "left"} eyebrow={eyebrow} title={title} description={description} action={headerAction} />

      <div className={`grid gap-6 ${isPublic ? "xl:grid-cols-[250px_minmax(0,1fr)]" : "xl:grid-cols-[250px_minmax(0,1fr)_320px]"}`}>
        <SidebarPanel
          category={category}
          categories={categories}
          mode={mode}
          search={search}
          setCategory={setCategory}
          setSearch={setSearch}
          setSortBy={setSortBy}
          setStockFilter={setStockFilter}
          sortBy={sortBy}
          stockFilter={stockFilter}
          total={filteredProducts.length}
        />

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e4ece2] bg-white px-5 py-4 shadow-[0_18px_40px_rgba(24,51,37,0.05)] dark:border-white/10 dark:bg-[#122117]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#f97316]">{mode === "public" ? "Catalogo en linea" : "Inventario activo"}</p>
              <h2 className="mt-1 text-xl font-semibold">{filteredProducts.length} productos para revisar</h2>
            </div>
            <div className="text-sm text-[#5b6d61] dark:text-white/65">
              {mode === "public" ? `Ubicacion: ${app.business.ubicacion}` : "Usa los filtros laterales para encontrar mas rapido."}
            </div>
          </div>

          {filteredProducts.length ? (
            <div className={`grid gap-4 ${isPublic ? "md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3" : "md:grid-cols-2 2xl:grid-cols-3"}`}>
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  money={money}
                  mode={mode}
                  onEdit={canEdit ? onEdit : undefined}
                  onView={onView}
                  onWhatsApp={onWhatsApp}
                  product={product}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-[#e4ece2] bg-white p-6 dark:border-white/10 dark:bg-[#122117]">
              <EmptyState description="No encontramos productos con esos filtros." title="Sin resultados" />
            </div>
          )}
        </section>

        {!isPublic ? <FeaturedProductPanel app={app} heroAction={heroAction} mode={mode} money={money} onView={onView} product={featuredProduct} /> : null}
      </div>
    </div>
  );
}
