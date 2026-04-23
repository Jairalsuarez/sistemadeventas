import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import CommunityFeedbackSection from "../../components/community/CommunityFeedbackSection.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Icon from "../../components/ui/Icon";
import TopNav from "../../components/shell/TopNav";
import { openWhatsAppChat, resolveBusinessWhatsapp } from "../../services/publicContactService.js";

function SectionHeading({ title, description, action }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f97316]">Catalogo en linea</p>
        <h2 className="mt-2 text-2xl font-semibold text-[#183325]">{title}</h2>
        {description ? <p className="mt-2 text-sm leading-7 text-[#5b6d61]">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

function CategoryCircle({ active, count, label, onClick, product }) {
  return (
    <button
      className={`group flex min-w-[112px] flex-col items-center gap-3 rounded-[28px] border px-4 py-5 text-center transition ${
        active ? "border-[#7fd39b] bg-[#f3fbf5] shadow-[0_18px_35px_rgba(31,122,58,0.12)]" : "border-[#e2ece3] bg-white hover:-translate-y-0.5 hover:shadow-[0_18px_30px_rgba(24,51,37,0.08)]"
      }`}
      onClick={onClick}
      type="button"
    >
      <div className="flex h-18 w-18 items-center justify-center overflow-hidden rounded-full bg-[radial-gradient(circle_at_top,#f3faf5,#e3efe5)]">
        {product?.imagen_url ? <img alt={label} className="h-full w-full object-cover" src={product.imagen_url} /> : <Icon className="text-[#1f7a3a]" name="category" />}
      </div>
      <div>
        <p className="text-sm font-semibold text-[#183325]">{label}</p>
        <p className="mt-1 text-xs text-[#6b7c71]">{count} productos</p>
      </div>
    </button>
  );
}

function ProductShowcaseCard({ money, onView, onWhatsApp, product }) {
  const stockTone =
    Number(product.stock) <= 0 ? "bg-[#fff1f2] text-[#b91c1c]" : Number(product.stock) <= 5 ? "bg-[#fff7ed] text-[#c2410c]" : "bg-[#f0fdf4] text-[#166534]";

  return (
    <article className="flex min-w-[260px] flex-col overflow-hidden rounded-[28px] border border-[#e1ece3] bg-white shadow-[0_18px_34px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_26px_45px_rgba(15,23,42,0.1)]">
      <button className="relative h-56 overflow-hidden bg-white" onClick={() => onView(product)} type="button">
        <img alt={product.nombre} className="h-full w-full object-cover transition duration-500 hover:scale-105" src={product.imagen_url} />
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5a7163]">{product.categoria}</span>
        </div>
      </button>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-[#183325]">{product.nombre}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#5b6d61]">{product.descripcion}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${stockTone}`}>{Number(product.stock) > 0 ? `${product.stock} disp.` : "Agotado"}</span>
        </div>

        <div className="mt-5 flex items-end justify-between gap-3">
          <strong className="text-3xl font-semibold text-[#183325]">{money(product.precio)}</strong>
          <button className="inline-flex items-center gap-2 text-sm font-semibold text-[#1f7a3a]" onClick={() => onView(product)} type="button">
            <Icon name="visibility" />
            Ver detalle
          </button>
        </div>

        <div className="mt-5">
          <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25d366] px-4 py-3 text-sm font-semibold text-white" onClick={() => onWhatsApp(product.nombre)} type="button">
            <Icon name="chat" />
            Consultar por WhatsApp
          </button>
        </div>
      </div>
    </article>
  );
}

function ProductCarouselCard({ money, onView, onWhatsApp, product }) {
  return (
    <article className="group flex min-w-[220px] max-w-[220px] flex-col overflow-hidden rounded-[22px] border border-[#e3e9e4] bg-white shadow-[0_14px_28px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_22px_36px_rgba(15,23,42,0.1)]">
      <div className="relative p-3">
        <button
          className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/80 bg-white/90 text-[#6c7f73] shadow-sm"
          onClick={() => onView(product)}
          type="button"
        >
          <Icon className="text-[18px]" name="north_east" />
        </button>
        <button className="h-[180px] w-full overflow-hidden rounded-[18px] bg-[#f7faf8]" onClick={() => onView(product)} type="button">
          <img alt={product.nombre} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={product.imagen_url} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4 pt-0">
        <div className="flex items-center gap-1 text-[#f6b400]">
          {Array.from({ length: 5 }).map((_, index) => (
            <Icon key={`${product.id}-star-${index}`} className="text-[14px]" name="star" />
          ))}
        </div>
        <h3 className="mt-3 text-lg font-semibold text-[#183325]">{product.nombre}</h3>
        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#6f8277]">{product.categoria}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <strong className="text-lg font-semibold text-[#183325]">{money(product.precio)}</strong>
          <button className="inline-flex items-center gap-1 text-sm font-semibold text-[#1f7a3a]" onClick={() => onWhatsApp(product.nombre)} type="button">
            <Icon className="text-[18px]" name="chat" />
          </button>
        </div>
      </div>
    </article>
  );
}

export default function PublicCatalogPage({ app, communityFeedbacks, feedbackSubmitting, money, onOpenLoginPage, onSubmitFeedback, onView, products }) {
  const location = useLocation();
  const bestSellersRef = useRef(null);
  const contact = resolveBusinessWhatsapp(app);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [availability, setAvailability] = useState("todos");
  const [heroIndex, setHeroIndex] = useState(0);
  const [introVisible, setIntroVisible] = useState(Boolean(location.state?.fromHome || location.state?.fromPublicPage));
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("featured");

  const categories = useMemo(() => ["Todos", ...new Set(products.map((item) => item.categoria).filter(Boolean))], [products]);
  const heroProducts = useMemo(() => products.slice(0, 5), [products]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = products.filter((product) => {
      const matchesText =
        !query ||
        product.nombre?.toLowerCase().includes(query) ||
        product.descripcion?.toLowerCase().includes(query) ||
        product.categoria?.toLowerCase().includes(query);
      const matchesCategory = activeCategory === "Todos" || product.categoria === activeCategory;
      const matchesAvailability =
        availability === "todos" ||
        (availability === "disponibles" && Number(product.stock) > 0) ||
        (availability === "ultimas" && Number(product.stock) > 0 && Number(product.stock) <= 5);

      return matchesText && matchesCategory && matchesAvailability;
    });

    if (sortBy === "price-asc") return [...list].sort((a, b) => Number(a.precio || 0) - Number(b.precio || 0));
    if (sortBy === "price-desc") return [...list].sort((a, b) => Number(b.precio || 0) - Number(a.precio || 0));
    if (sortBy === "name") return [...list].sort((a, b) => String(a.nombre || "").localeCompare(String(b.nombre || "")));

    return [...list].sort((a, b) => Number(b.stock || 0) - Number(a.stock || 0));
  }, [activeCategory, availability, products, search, sortBy]);

  const categoryPreview = useMemo(
    () =>
      categories
        .filter((item) => item !== "Todos")
        .map((category) => ({
          category,
          count: products.filter((product) => product.categoria === category).length,
          product: products.find((product) => product.categoria === category),
        })),
    [categories, products]
  );

  const featuredProducts = filteredProducts.slice(0, 8);
  const bestSellers = filteredProducts.slice(0, 10);
  const heroProduct = heroProducts[heroIndex] || heroProducts[0] || null;
  const visibleHeroProducts = useMemo(() => {
    if (!heroProducts.length) return [];
    const size = Math.min(4, heroProducts.length);
    return Array.from({ length: size }, (_, index) => heroProducts[(heroIndex + index) % heroProducts.length]);
  }, [heroIndex, heroProducts]);

  useEffect(() => {
    if (!heroProducts.length) return undefined;
    const timeout = window.setTimeout(() => {
      setHeroIndex((current) => (current + 1) % heroProducts.length);
    }, 5500);

    return () => window.clearTimeout(timeout);
  }, [heroIndex, heroProducts]);

  useEffect(() => {
    if (!introVisible) return undefined;
    const timeout = window.setTimeout(() => setIntroVisible(false), 760);
    return () => window.clearTimeout(timeout);
  }, [introVisible]);

  const openCatalogWhatsApp = (productName = "") => {
    const text = productName ? `Hola, me interesa ${productName}` : "Hola, quiero hacer un pedido";
    openWhatsAppChat({
      phone: contact.phone,
      text,
    });
  };

  const scrollCarousel = (ref, direction = 1) => {
    if (!ref?.current) return;
    ref.current.scrollBy({ left: direction * 260, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white text-[#183325]">
      <TopNav
        businessName={app.business.nombre}
        darkMode={false}
        onOpenLoginPage={onOpenLoginPage}
        publicActions={null}
        publicSearch={
          <label className="flex w-full max-w-[560px] items-center gap-3 rounded-full border border-[#dce7dd] bg-white px-5 py-3.5 shadow-[0_10px_24px_rgba(24,51,37,0.04)]">
            <Icon className="text-[#6c7f73]" name="search" />
            <input
              className="w-full border-0 bg-transparent text-[15px] text-[#183325] outline-none placeholder:text-[#819286]"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Busca por nombre, categoria o descripcion"
              value={search}
            />
          </label>
        }
        publicLinks={[
          { label: "Contacto", to: "/contacto" },
          { label: "About us", to: "/about-us" },
          { label: "Comunidad", to: "/comunidad" },
          { label: "Como llegar", to: "/como-llegar" },
        ]}
        publicVariant="catalog"
        session={null}
        showThemeToggle={false}
        user={null}
      />

      <main className={`mx-auto max-w-[1440px] px-4 py-8 transition-all duration-700 lg:px-6 lg:py-10 ${introVisible ? "translate-y-4 scale-[0.985] opacity-0" : "translate-y-0 scale-100 opacity-100"}`}>
        <div className="space-y-8">
          <section className="overflow-hidden rounded-[36px] border border-[#dbe8dd] bg-white shadow-[0_32px_70px_rgba(15,23,42,0.06)]">
            <div className="border-b border-[#e3ece4] px-6 py-4 lg:px-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 text-sm text-[#5f7267]">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-[0_8px_18px_rgba(24,51,37,0.04)]">
                    <Icon name="location_on" />
                    {app.business.ubicacion}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-[0_8px_18px_rgba(24,51,37,0.04)]">
                    <Icon name="inventory_2" />
                    {products.length} productos publicados
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-[0_8px_18px_rgba(24,51,37,0.04)]">
                    <Icon name="chat" />
                    Compra rapida por WhatsApp
                  </span>
                </div>

                <label className="flex items-center gap-3 rounded-full border border-[#dce7dd] bg-white px-4 py-3.5 shadow-[0_10px_24px_rgba(24,51,37,0.04)]">
                  <Icon className="text-[#6c7f73]" name="swap_vert" />
                  <select className="border-0 bg-transparent pr-5 text-[15px] font-medium text-[#183325] outline-none" onChange={(event) => setSortBy(event.target.value)} value={sortBy}>
                    <option value="featured">Mas disponibles</option>
                    <option value="name">Nombre A-Z</option>
                    <option value="price-asc">Menor precio</option>
                    <option value="price-desc">Mayor precio</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="p-6 lg:p-8">
              <div className="relative overflow-hidden rounded-[34px] border border-[#dfe7db] bg-white p-6 text-[#183325] shadow-[0_24px_60px_rgba(24,51,37,0.1)]">
                {heroProducts.length ? (
                  <div className="relative z-10 flex flex-col gap-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1 text-center">
                        <h2 className="text-3xl font-semibold text-[#183325]">Recomendados del momento</h2>
                      </div>

                      <div className="flex items-center gap-2">
                        <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dce7dd] bg-white text-[#183325]" onClick={() => setHeroIndex((heroIndex - 1 + heroProducts.length) % heroProducts.length)} type="button">
                          <Icon name="chevron_left" />
                        </button>
                        <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dce7dd] bg-white text-[#183325]" onClick={() => setHeroIndex((heroIndex + 1) % heroProducts.length)} type="button">
                          <Icon name="chevron_right" />
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-1">
                      {visibleHeroProducts.map((product) => (
                        <ProductCarouselCard
                          key={`hero-${product.id}`}
                          money={money}
                          onView={onView}
                          onWhatsApp={openCatalogWhatsApp}
                          product={product}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-2 border-t border-[#eef3ef] pt-4">
                      {heroProducts.map((item, index) => (
                        <button
                          key={item.id}
                          aria-label={`Ir al producto ${index + 1}`}
                          className={`rounded-full transition ${index === heroIndex ? "h-2.5 w-8 bg-[#1f7a3a]" : "h-2.5 w-2.5 bg-[#c8d5cc]"}`}
                          onClick={() => setHeroIndex(index)}
                          type="button"
                        />
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <div className="space-y-8">
            <section className="rounded-[32px] border border-[#dbe8dd] bg-white p-6 shadow-[0_24px_55px_rgba(15,23,42,0.06)]">
              <SectionHeading
                title="Todos los productos"
                description={`${filteredProducts.length} producto(s) encontrados para tu busqueda actual.`}
                action={
                  <button className="inline-flex items-center gap-2 rounded-xl border border-[#dfe7db] bg-white px-4 py-3 text-sm font-semibold text-[#183325]" onClick={() => {
                    setSearch("");
                    setActiveCategory("Todos");
                    setAvailability("todos");
                    setSortBy("featured");
                  }} type="button">
                    <Icon name="restart_alt" />
                    Reiniciar filtros
                  </button>
                }
              />

              <div className="mt-6 flex flex-wrap gap-2">
                {["todos", "disponibles", "ultimas"].map((item) => (
                  <button
                    key={item}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${availability === item ? "bg-[#1f7a3a] text-white shadow-[0_12px_24px_rgba(31,122,58,0.16)]" : "border border-[#dfe7db] bg-white text-[#183325]"}`}
                    onClick={() => setAvailability(item)}
                    type="button"
                  >
                    {item === "todos" ? "Todos" : item === "disponibles" ? "Disponibles" : "Ultimas unidades"}
                  </button>
                ))}
              </div>

              <div className="mt-5 flex gap-4 overflow-x-auto pb-2">
                <CategoryCircle active={activeCategory === "Todos"} count={products.length} label="Todos" onClick={() => setActiveCategory("Todos")} product={products[0]} />
                {categoryPreview.map((item) => (
                  <CategoryCircle key={item.category} active={activeCategory === item.category} count={item.count} label={item.category} onClick={() => setActiveCategory(item.category)} product={item.product} />
                ))}
              </div>

              {featuredProducts.length ? (
                <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {featuredProducts.map((product) => (
                    <ProductShowcaseCard
                      key={product.id}
                      money={money}
                      onView={onView}
                      onWhatsApp={openCatalogWhatsApp}
                      product={product}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-[24px] border border-dashed border-[#d8e4da] bg-[#fbfdfb] p-6">
                  <EmptyState description="No encontramos productos con esos filtros. Intenta con otra categoria, disponibilidad o termino de busqueda." title="Sin resultados" />
                </div>
              )}
            </section>

            <CommunityFeedbackSection feedbackSubmitting={feedbackSubmitting} feedbacks={communityFeedbacks} onSubmit={onSubmitFeedback} />
          </div>
        </div>
      </main>
    </div>
  );
}
