import { useMemo } from "react";

export default function useDashboardMetrics({
  app,
  session,
  user,
  saleLines,
  lowStockLimit,
  money,
  formatDate,
  personName,
}) {
  const activeShift = useMemo(
    () => (session ? app.turnos.find((turno) => turno.userId === session.userId && turno.estado === "abierto") || null : null),
    [app.turnos, session]
  );

  const lowStock = useMemo(() => app.products.filter((product) => product.stock <= lowStockLimit), [app.products, lowStockLimit]);

  const featuredProduct = useMemo(() => {
    if (!app.products.length) return null;
    return app.products.find((product) => product.id === app.business?.featuredProductId) || app.products[0];
  }, [app.business?.featuredProductId, app.products]);

  const upcomingSchedules = useMemo(
    () =>
      [...(app.schedules || [])].sort(
        (a, b) => new Date(`${a.fecha}T${a.inicio || "00:00"}`).getTime() - new Date(`${b.fecha}T${b.inicio || "00:00"}`).getTime()
      ),
    [app.schedules]
  );

  const visibleProducts = useMemo(() => app.products.filter((product) => product.activo), [app.products]);

  const salePreview = useMemo(
    () =>
      saleLines
        .map((line) => {
          const product = app.products.find((item) => item.id === line.productId);
          return product
            ? {
                productId: product.id,
                nombre: product.nombre,
                precio: product.precio,
                cantidad: Number(line.cantidad || 0),
                subtotal: product.precio * Number(line.cantidad || 0),
              }
            : null;
        })
        .filter(Boolean),
    [saleLines, app.products]
  );

  const saleTotal = useMemo(() => salePreview.reduce((acc, item) => acc + item.subtotal, 0), [salePreview]);

  const salesToday = useMemo(
    () =>
      app.sales
        .filter((sale) => new Date(sale.createdAt).toDateString() === new Date().toDateString())
        .reduce((acc, item) => acc + item.total, 0),
    [app.sales]
  );

  const mySalesToday = useMemo(
    () =>
      app.sales
        .filter(
          (sale) => sale.userId === user?.id && new Date(sale.createdAt).toDateString() === new Date().toDateString()
        )
        .reduce((acc, item) => acc + item.total, 0),
    [app.sales, user?.id]
  );

  const unreadNotifications = useMemo(
    () => (app.notifications || []).filter((notification) => !notification.read).length,
    [app.notifications]
  );

  const adminStats = useMemo(() => {
    const todaySalesCount = app.sales.filter((sale) => new Date(sale.createdAt).toDateString() === new Date().toDateString()).length;
    return [
      { label: "Ventas hoy", value: money(salesToday), detail: todaySalesCount ? `${todaySalesCount} venta(s) hoy` : "Sin ventas hoy" },
      {
        label: "Saldo general",
        value: money(app.wallet.saldoActual),
        detail: `Actualizado ${formatDate(app.wallet.updatedAt, { dateStyle: "medium", timeStyle: "short" })}`,
      },
    ];
  }, [app.sales, app.wallet, formatDate, money, salesToday]);

  const sellerStats = useMemo(
    () => [
      { label: "Mi venta de hoy", value: money(mySalesToday), detail: activeShift ? "Tu turno esta abierto" : "Abre tu turno para registrar" },
      { label: "Cartera actual", value: money(app.wallet.saldoActual), detail: "Referencia general del negocio" },
    ],
    [activeShift, app.wallet.saldoActual, money, mySalesToday]
  );

  return {
    activeShift,
    lowStock,
    featuredProduct,
    upcomingSchedules,
    visibleProducts,
    salePreview,
    saleTotal,
    salesToday,
    mySalesToday,
    unreadNotifications,
    adminStats,
    sellerStats,
  };
}
