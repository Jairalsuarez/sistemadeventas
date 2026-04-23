import { useMemo, useState } from "react";

function sortProducts(products, sortBy) {
  const list = [...products];

  switch (sortBy) {
    case "precio-asc":
      return list.sort((a, b) => Number(a.precio) - Number(b.precio));
    case "precio-desc":
      return list.sort((a, b) => Number(b.precio) - Number(a.precio));
    case "stock-desc":
      return list.sort((a, b) => Number(b.stock) - Number(a.stock));
    case "nombre-desc":
      return list.sort((a, b) => b.nombre.localeCompare(a.nombre));
    default:
      return list.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }
}

export default function useCatalogFilters(products = [], initialState = {}) {
  const [search, setSearch] = useState(initialState.search || "");
  const [category, setCategory] = useState(initialState.category || "Todas");
  const [stockFilter, setStockFilter] = useState(initialState.stockFilter || "todos");
  const [sortBy, setSortBy] = useState(initialState.sortBy || "nombre-asc");

  const categories = useMemo(
    () => ["Todas", ...new Set(products.map((product) => product.categoria).filter(Boolean))],
    [products]
  );

  const filteredProducts = useMemo(() => {
    const query = search.toLowerCase().trim();

    const visible = products.filter((product) => {
      const matchesQuery = !query || [product.nombre, product.categoria, product.descripcion].join(" ").toLowerCase().includes(query);
      const matchesCategory = category === "Todas" || product.categoria === category;
      const matchesStock =
        stockFilter === "todos" ||
        (stockFilter === "disponibles" && Number(product.stock) > 0) ||
        (stockFilter === "bajo" && Number(product.stock) > 0 && Number(product.stock) <= 5) ||
        (stockFilter === "agotados" && Number(product.stock) <= 0);

      return matchesQuery && matchesCategory && matchesStock;
    });

    return sortProducts(visible, sortBy);
  }, [category, products, search, sortBy, stockFilter]);

  return {
    search,
    setSearch,
    category,
    setCategory,
    stockFilter,
    setStockFilter,
    sortBy,
    setSortBy,
    categories,
    filteredProducts,
  };
}
