import { useEffect, useMemo, useState } from "react";
import ProductListTable from "../../components/catalog/ProductListTable";
import Icon from "../../components/ui/Icon";
import PageHeader from "../../components/ui/PageHeader";
import Pagination from "../../components/ui/Pagination";
import SectionBlock from "../../components/ui/SectionBlock";
import useCatalogFilters from "../../hooks/useCatalogFilters.jsx";

const PRODUCTS_PER_PAGE = 8;

function ProductsInventoryView({ canCreate, canEdit, money, onEdit, onNewProduct, onView, products }) {
  const { category, categories, filteredProducts, search, setCategory, setSearch, setSortBy, setStockFilter, sortBy, stockFilter } =
    useCatalogFilters(products);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [currentPage, filteredProducts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [category, search, sortBy, stockFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="space-y-6">
      <PageHeader
        action={
          canCreate ? (
            <button className="inline-flex items-center gap-2 rounded-md bg-[#1f7a3a] px-4 py-2 text-sm font-medium text-white dark:bg-[linear-gradient(135deg,#2563eb,#1d4ed8)]" onClick={onNewProduct} type="button">
              <Icon name="add" />
              Agregar producto
            </button>
          ) : null
        }
        eyebrow="Inventario"
        title={canEdit ? "Productos del panel" : "Productos disponibles"}
      />

      <SectionBlock description="Filtros para encontrar productos por nombre, categoria, disponibilidad y orden." title="Control del inventario">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,0.7fr))]">
          <label className="grid gap-2 text-sm">
            Buscar
            <input
              className="rounded-md border border-[#dfe7db] bg-[#fbfcfa] px-3 py-2 dark:border-[#314056] dark:bg-[#0f172a] dark:text-[#f8fafc]"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nombre, categoria o descripcion"
              value={search}
            />
          </label>

          <label className="grid gap-2 text-sm">
            Categoria
            <select className="rounded-md border border-[#dfe7db] bg-[#fbfcfa] px-3 py-2 dark:border-[#314056] dark:bg-[#0f172a] dark:text-[#f8fafc]" onChange={(event) => setCategory(event.target.value)} value={category}>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm">
            Disponibilidad
            <select className="rounded-md border border-[#dfe7db] bg-[#fbfcfa] px-3 py-2 dark:border-[#314056] dark:bg-[#0f172a] dark:text-[#f8fafc]" onChange={(event) => setStockFilter(event.target.value)} value={stockFilter}>
              <option value="todos">Todos</option>
              <option value="disponibles">Disponibles</option>
              <option value="bajo">Bajo stock</option>
              <option value="agotados">Agotados</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm">
            Ordenar
            <select className="rounded-md border border-[#dfe7db] bg-[#fbfcfa] px-3 py-2 dark:border-[#314056] dark:bg-[#0f172a] dark:text-[#f8fafc]" onChange={(event) => setSortBy(event.target.value)} value={sortBy}>
              <option value="nombre-asc">Nombre A-Z</option>
              <option value="nombre-desc">Nombre Z-A</option>
              <option value="precio-asc">Menor precio</option>
              <option value="precio-desc">Mayor precio</option>
              <option value="stock-desc">Mas stock</option>
            </select>
          </label>
        </div>
      </SectionBlock>

      <SectionBlock description={`${filteredProducts.length} productos encontrados.`} title="Listado de productos">
        <div className="space-y-4">
          <ProductListTable
            canEdit={canEdit}
            emptyMessage="No hay productos con esos filtros."
            money={money}
            onEdit={onEdit}
            onView={onView}
            products={paginatedProducts}
          />

          <Pagination
            currentPage={currentPage}
            itemLabel="productos"
            onPageChange={setCurrentPage}
            pageSize={PRODUCTS_PER_PAGE}
            totalItems={filteredProducts.length}
            totalPages={totalPages}
          />
        </div>
      </SectionBlock>
    </div>
  );
}

export default function ProductsPage({ canCreate, canEdit, money, onNewProduct, onEdit, onView, products }) {
  return <ProductsInventoryView canCreate={canCreate} canEdit={canEdit} money={money} onEdit={onEdit} onNewProduct={onNewProduct} onView={onView} products={products} />;
}
