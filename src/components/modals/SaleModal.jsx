import { useEffect, useMemo, useState } from "react";
import Modal from "../Modal";
import Icon from "../ui/Icon";

const fieldClassName =
  "rounded-md border border-[#dfe7db] bg-[#f8faf6] px-4 py-3 text-[#183325] transition focus:border-[#f59e0b] focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/20 dark:border-[#314056] dark:bg-[#0f172a] dark:text-white";

const subtleButtonClassName =
  "rounded-md border border-[#dfe7db] px-4 py-3 text-sm font-medium text-[#183325] transition hover:bg-[#f7faf6] dark:border-[#314056] dark:bg-[#0f172a] dark:text-white dark:hover:bg-[#182235]";

const primaryButtonClassName =
  "rounded-md bg-[#1f7a3a] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#17612d] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[linear-gradient(135deg,#2563eb,#1d4ed8)] dark:hover:brightness-110";

const paymentOptions = [
  {
    value: "efectivo",
    label: "Efectivo",
    description: "Pago inmediato en caja, sin comprobante adicional.",
    icon: "payments",
    accentClassName: "bg-[#eaf7ee] text-[#1f7a3a]",
  },
  {
    value: "transferencia_directa",
    label: "Transferencia directa",
    description: "Necesita comprobante para registrar la venta.",
    icon: "account_balance",
    accentClassName: "bg-[#fff2e2] text-[#f59e0b]",
  },
];

const steps = [
  { id: 1, title: "Productos" },
  { id: 2, title: "Metodo de pago" },
  { id: 3, title: "Resumen" },
];

export default function SaleModal({
  activeShift,
  app,
  createSale,
  money,
  onClose,
  open,
  saleLines,
  salePayment,
  saleSubmitting,
  saleTotal,
  setSaleLines,
  setSalePayment,
  uploadSaleEvidence,
  uploading,
  userRole,
  wallet,
}) {
  const [step, setStep] = useState(1);
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const [activeSearchIndex, setActiveSearchIndex] = useState(null);
  const [productSearch, setProductSearch] = useState("");
  const stepPanelClassName = "min-h-[26rem] max-h-[26rem] overflow-y-auto pr-1";

  useEffect(() => {
    if (open) {
      setStep(1);
      setActiveLineIndex(0);
      setActiveSearchIndex(null);
      setProductSearch("");
    }
  }, [open]);

  useEffect(() => {
    if (activeLineIndex > saleLines.length - 1) {
      setActiveLineIndex(Math.max(saleLines.length - 1, 0));
    }
  }, [activeLineIndex, saleLines.length]);

  const activeProducts = useMemo(() => app.products.filter((product) => product.activo), [app.products]);

  const requiresShift = userRole === "vendedor";
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
    [app.products, saleLines]
  );

  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    if (!query) return activeProducts.slice(0, 8);
    return activeProducts
      .filter((product) =>
        [product.nombre, product.categoria, product.marca, product.descripcion]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query))
      )
      .slice(0, 8);
  }, [activeProducts, productSearch]);

  const selectedPayment = paymentOptions.find((item) => item.value === salePayment.method) || paymentOptions[0];
  const nextWalletTotal = Number(wallet?.saldoActual || 0) + Number(saleTotal || 0);
  const paymentNeedsEvidence = ["transferencia_directa"].includes(salePayment.method);
  const paymentMethodLabelMap = {
    efectivo: "Pago en efectivo",
    transferencia_directa: "Transferencia directa",
  };

  const canContinueProducts =
    (!requiresShift || activeShift) &&
    salePreview.length > 0 &&
    salePreview.every((line) => line.cantidad > 0) &&
    !salePreview.some((line) => (app.products.find((product) => product.id === line.productId)?.stock || 0) < line.cantidad);

  const canContinuePayment = salePayment.method && (!paymentNeedsEvidence || Boolean(salePayment.evidenceUrl));

  const nextStep = () => {
    if (step === 1 && !canContinueProducts) return;
    if (step === 2 && !canContinuePayment) return;
    setStep((current) => Math.min(current + 1, 3));
  };

  const prevStep = () => setStep((current) => Math.max(current - 1, 1));

  const setLineProduct = (index, productId) => {
    const selectedProduct = activeProducts.find((item) => item.id === productId);
    setSaleLines((current) =>
      current.map((item, idx) => {
        if (idx !== index) return item;
        const nextQuantity = Math.max(1, Math.min(Number(item.cantidad || 1), Number(selectedProduct?.stock || item.cantidad || 1)));
        return {
          ...item,
          productId,
          cantidad: nextQuantity,
        };
      })
    );
    setActiveLineIndex(index);
    setActiveSearchIndex(null);
    setProductSearch("");
  };

  const adjustLineQuantity = (index, delta) => {
    setSaleLines((current) =>
      current.map((item, idx) => {
        if (idx !== index) return item;
        const selectedProduct = activeProducts.find((product) => product.id === item.productId);
        const stockLimit = Number(selectedProduct?.stock || 99);
        const nextQuantity = Math.max(1, Math.min(stockLimit, Number(item.cantidad || 1) + delta));
        return { ...item, cantidad: nextQuantity };
      })
    );
    setActiveLineIndex(index);
  };

  const removeLine = (index) => {
    setSaleLines((current) => current.filter((_, idx) => idx !== index));
    setActiveSearchIndex((current) => (current === index ? null : current));
  };

  const addSaleLine = () => {
    setSaleLines((current) => [...current, { productId: "", cantidad: 1 }]);
    setActiveLineIndex(saleLines.length);
    setActiveSearchIndex(null);
    setProductSearch("");
  };

  const renderProductOption = (product, index, mode = "recent") => {
    const selected = saleLines[index]?.productId === product.id;
    return (
      <button
        className={`cursor-pointer rounded-xl border px-3 py-2.5 text-left transition ${
          selected
            ? "border-[#f59e0b]/40 bg-[#fff7ed] shadow-[0_14px_30px_rgba(245,158,11,0.12)] dark:border-[#314056] dark:bg-[#182235]"
            : "border-[#e4ece2] bg-white hover:bg-[#fafcf9] dark:border-[#23314d] dark:bg-[#111827] dark:hover:bg-[#182235]"
        }`}
        key={`${mode}-${product.id}`}
        onClick={() => setLineProduct(index, product.id)}
        type="button"
      >
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl text-xl ${
              selected ? "bg-white text-[#183325] dark:bg-[#0f172a] dark:text-[#93c5fd]" : "bg-[#eef2ff] text-[#2563eb]"
            }`}
          >
            {product.imagen_url ? (
              <img alt={product.nombre} className="h-full w-full object-cover" src={product.imagen_url} />
            ) : (
              <Icon name="inventory_2" />
            )}
          </span>
          <span className={`inline-flex shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${selected ? "bg-[#f59e0b] text-white" : "bg-[#edf1ea] text-[#5b6d61] dark:bg-[#0f172a] dark:text-[#94a3b8]"}`}>
            {selected ? "Agregado" : mode === "recent" ? "Reciente" : "Resultado"}
          </span>
        </div>
        <strong className="mt-2 block text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">{product.nombre}</strong>
        <span className="mt-0.5 block text-xs leading-5 text-[#5b6d61] dark:text-[#c7d2e0]">
          {money(product.precio)} • stock {product.stock}
        </span>
        <span className="mt-1.5 inline-flex items-center gap-2 text-[10px] font-medium text-[#6a7b70] dark:text-[#94a3b8]">
          <Icon className="text-base" name={selected ? "check_circle" : "arrow_forward"} />
          {selected ? "Ya esta en la venta" : "Agregar rapido"}
        </span>
      </button>
    );
  };

  const renderPaymentSummary = () => {
    if (salePayment.method === "efectivo") {
      return (
        <div className="rounded-lg border border-[#dbe6d8] bg-[#f8faf6] p-4">
          <p className="text-sm font-semibold text-[#183325]">Pago en efectivo</p>
          <p className="mt-1 text-sm text-[#5b6d61]">No necesitas adjuntar evidencia para completar esta venta.</p>
        </div>
      );
    }

    return (
      <div className="grid gap-4">
        <div className="rounded-lg border border-[#dbe6d8] bg-[#f8faf6] p-4">
          <p className="text-sm font-semibold text-[#183325]">{paymentMethodLabelMap[salePayment.method]}</p>
          <p className="mt-1 text-sm text-[#5b6d61]">Adjunta el comprobante antes de continuar con el registro.</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className={subtleButtonClassName}>
              <span>{uploading ? "Subiendo..." : salePayment.evidenceUrl ? "Cambiar evidencia" : "Agregar evidencia"}</span>
              <input
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadSaleEvidence(file);
                }}
                type="file"
              />
            </label>
            {salePayment.evidenceName ? <span className="text-sm text-[#5b6d61]">{salePayment.evidenceName}</span> : null}
          </div>
        </div>

        {salePayment.evidenceUrl ? (
          <div className="rounded-lg border border-[#dbe6d8] bg-white p-3">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6a7b70]">Vista previa de evidencia</p>
            <div className="overflow-hidden rounded-lg border border-[#edf1ea] bg-[#f8faf6]">
              <img
                alt="Evidencia del pago"
                className="h-48 w-full object-contain"
                src={salePayment.evidenceUrl}
              />
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <Modal open={open} onClose={onClose} text="Registra la venta en tres pasos claros." title="Nueva venta" wide>
      <div className="grid gap-5">
        {requiresShift && !activeShift ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-[#4b5563] dark:bg-[#172033] dark:text-[#fca5a5]">Debes iniciar un turno antes de vender.</div> : null}

        <div className="grid gap-3 md:grid-cols-3">
          {steps.map((item) => {
            const active = step === item.id;
            const completed = step > item.id;
            return (
              <div
                key={item.id}
                className={`rounded-lg border px-4 py-3 transition ${
                  active
                    ? "border-[#f59e0b]/40 bg-[#fff7ed] dark:border-[#2563eb]/50 dark:bg-[#172554]"
                    : completed
                      ? "border-[#cde4d3] bg-[#f6faf4] dark:border-[#314056] dark:bg-[#182235]"
                      : "border-[#e4ece2] bg-white dark:border-[#23314d] dark:bg-[#111827]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                      active
                        ? "bg-[#f59e0b] text-white dark:bg-[#2563eb] dark:text-[#eff6ff]"
                        : completed
                          ? "bg-[#1f7a3a] text-white dark:bg-[#2563eb]"
                          : "bg-[#edf1ea] text-[#183325] dark:bg-[#0f172a] dark:text-[#f8fafc]"
                    }`}
                  >
                    {completed ? <Icon name="check" /> : item.id}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">{item.title}</p>
                    <p className="text-xs text-[#6a7b70] dark:text-[#94a3b8]">Paso {item.id}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {step === 1 ? (
          <div className="max-h-[min(70vh,32rem)] overflow-y-auto pr-1">
            <div className="grid gap-4">
            {saleLines.map((line, index) => (
              <div
                className={`rounded-2xl border p-3 transition ${
                  activeLineIndex === index
                    ? "border-[#f59e0b]/40 bg-[#fffdf8] dark:border-[#314056] dark:bg-[#182235]"
                    : "border-[#e4ece2] bg-white dark:border-[#23314d] dark:bg-[#111827]"
                }`}
                key={`${index}-${line.productId}`}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">Producto {index + 1}</p>
                    <p className="text-xs text-[#6a7b70] dark:text-[#94a3b8]">
                      {line.productId ? "Puedes cambiarlo o ajustar unidades." : "Elige un producto rapido o buscalo con la lupa."}
                    </p>
                  </div>
                  {saleLines.length > 1 ? (
                    <button className={subtleButtonClassName} onClick={() => removeLine(index)} type="button">
                      Quitar
                    </button>
                  ) : null}
                </div>

                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_56px_150px]">
                  <button
                    className={`${fieldClassName} flex min-h-[56px] cursor-pointer items-center justify-between text-left`}
                    onClick={() => {
                      setActiveLineIndex(index);
                      setActiveSearchIndex((current) => {
                        const nextValue = current === index ? null : index;
                        if (nextValue === index) setProductSearch("");
                        return nextValue;
                      });
                    }}
                    type="button"
                  >
                    <span>
                      <span className="block text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">
                        {line.productId ? activeProducts.find((product) => product.id === line.productId)?.nombre || "Producto seleccionado" : "Selecciona un producto"}
                      </span>
                      <span className="mt-1 block text-xs text-[#6a7b70] dark:text-[#94a3b8]">
                        {line.productId
                          ? `${money(activeProducts.find((product) => product.id === line.productId)?.precio || 0)} • stock ${
                              activeProducts.find((product) => product.id === line.productId)?.stock || 0
                            }`
                          : "Usa una opcion rapida o buscalo."}
                      </span>
                    </span>
                    <Icon className="text-xl text-[#f59e0b] dark:text-[#60a5fa]" name="inventory_2" />
                  </button>

                  <button
                    className={`${subtleButtonClassName} flex min-h-[56px] cursor-pointer items-center justify-center px-0`}
                    onClick={() => {
                      setActiveLineIndex(index);
                      setActiveSearchIndex((current) => (current === index ? null : index));
                      setProductSearch("");
                    }}
                    type="button"
                  >
                    <Icon className="text-[24px]" name="search" />
                  </button>

                  <div className="flex min-h-[56px] items-center justify-between rounded-2xl border border-[#dfe7db] bg-[#f8faf6] px-2.5 dark:border-[#314056] dark:bg-[#0f172a]">
                    <button
                      className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-[#dfe7db] bg-white text-[#183325] transition hover:bg-[#f7faf6] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#314056] dark:bg-[#182235] dark:text-white dark:hover:bg-[#1f2d44]"
                      disabled={Number(line.cantidad || 1) <= 1}
                      onClick={() => adjustLineQuantity(index, -1)}
                      type="button"
                    >
                      <Icon className="text-[20px]" name="remove" />
                    </button>
                    <div className="min-w-[32px] text-center">
                      <span className="block text-base font-semibold text-[#183325] dark:text-[#f8fafc]">{line.cantidad}</span>
                      <span className="block text-[11px] uppercase tracking-[0.14em] text-[#6a7b70] dark:text-[#94a3b8]">uds</span>
                    </div>
                    <button
                      className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-[#dfe7db] bg-white text-[#183325] transition hover:bg-[#f7faf6] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#314056] dark:bg-[#182235] dark:text-white dark:hover:bg-[#1f2d44]"
                      disabled={
                        Boolean(line.productId) &&
                        Number(line.cantidad || 1) >= Number(activeProducts.find((product) => product.id === line.productId)?.stock || 0)
                      }
                      onClick={() => adjustLineQuantity(index, 1)}
                      type="button"
                    >
                      <Icon className="text-[20px]" name="add" />
                    </button>
                  </div>
                </div>

                {activeLineIndex === index ? (
                  <div className="mt-4">
                    {activeSearchIndex === index ? (
                      <div className="rounded-2xl border border-[#e4ece2] bg-white p-3 dark:border-[#23314d] dark:bg-[#111827]">
                        <div className="flex items-center gap-3 rounded-2xl border border-[#dfe7db] bg-[#f8faf6] px-4 py-2.5 dark:border-[#314056] dark:bg-[#0f172a]">
                          <Icon className="text-[22px] text-[#f59e0b] dark:text-[#60a5fa]" name="search" />
                          <input
                            autoFocus
                            className="w-full bg-transparent text-sm text-[#183325] outline-none placeholder:text-[#7b8b80] dark:text-white dark:placeholder:text-[#94a3b8]"
                            onChange={(event) => setProductSearch(event.target.value)}
                            placeholder="Busca por nombre, categoria o marca"
                            value={productSearch}
                          />
                          <button
                            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#dfe7db] bg-white text-[#5b6d61] transition hover:bg-[#f1f5ef] hover:text-[#183325] dark:border-[#314056] dark:bg-[#182235] dark:text-[#c7d2e0] dark:hover:bg-[#1f2d44] dark:hover:text-white"
                            onClick={() => {
                              setActiveSearchIndex(null);
                              setProductSearch("");
                            }}
                            type="button"
                          >
                            <Icon className="text-[18px]" name="close" />
                          </button>
                        </div>

                        <div className="mt-4 grid gap-2">
                          {filteredProducts.length ? (
                            filteredProducts.map((product) => renderProductOption(product, index, "search"))
                          ) : (
                            <div className="rounded-2xl border border-dashed border-[#dfe7db] px-4 py-4 text-sm text-[#5b6d61] dark:border-[#314056] dark:text-[#c7d2e0]">
                              No encontramos productos con esa busqueda.
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}

            <div className="flex justify-start">
              <button
                className="cursor-pointer rounded-xl border border-[#dfe7db] bg-white px-3 py-2 text-sm font-medium text-[#5b6d61] transition hover:bg-[#f7faf6] hover:text-[#183325] dark:border-[#314056] dark:bg-[#111827] dark:text-[#94a3b8] dark:hover:bg-[#182235] dark:hover:text-[#f8fafc]"
                disabled={saleSubmitting}
                onClick={addSaleLine}
                type="button"
              >
                Agregar otro producto
              </button>
            </div>

            <div className="rounded-lg border border-[#e4ece2] bg-[#f8faf6] p-4 dark:border-[#23314d] dark:bg-[#182235]">
              <span className="block text-sm text-[#5b6d61] dark:text-[#c7d2e0]">Total calculado</span>
              <strong className="mt-1 block text-3xl font-black tracking-tight text-[#20130A] dark:text-[#f8fafc]">{money(saleTotal)}</strong>
            </div>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className={stepPanelClassName}>
            <div className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-3">
              {paymentOptions.map((option) => {
                const selected = salePayment.method === option.value;
                return (
                  <button
                    key={option.value}
                    className={`rounded-lg border px-4 py-4 text-left transition ${
                      selected
                        ? "border-[#f59e0b]/40 bg-[#fff7ed] shadow-[0_14px_30px_rgba(245,158,11,0.12)] dark:border-[#314056] dark:bg-[#182235]"
                        : "border-[#e4ece2] bg-white hover:bg-[#fafcf9] dark:border-[#23314d] dark:bg-[#111827] dark:hover:bg-[#182235]"
                    }`}
                    onClick={() => setSalePayment((current) => ({ ...current, method: option.value, evidenceUrl: "", evidenceName: "" }))}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className={`inline-flex h-11 w-11 items-center justify-center rounded-full text-xl ${selected ? "bg-white text-[#183325] dark:bg-[#0f172a] dark:text-[#93c5fd]" : option.accentClassName}`}>
                        <Icon name={option.icon} />
                      </span>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${selected ? "bg-[#f59e0b] text-white" : "bg-[#edf1ea] text-[#5b6d61] dark:bg-[#0f172a] dark:text-[#94a3b8]"}`}>
                        {selected ? "Seleccionado" : "Elegir"}
                      </span>
                    </div>
                    <strong className="mt-4 block text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">{option.label}</strong>
                    <span className="mt-1 block text-sm leading-6 text-[#5b6d61] dark:text-[#c7d2e0]">{option.description}</span>
                    <span className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-[#6a7b70] dark:text-[#94a3b8]">
                      <Icon className="text-base" name="arrow_forward" />
                      {selected ? "Metodo activo" : "Cambiar a este metodo"}
                    </span>
                  </button>
                );
              })}
            </div>

            {renderPaymentSummary()}
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className={stepPanelClassName}>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_320px]">
            <div className="rounded-lg border border-[#e4ece2] bg-white p-4 dark:border-[#23314d] dark:bg-[#111827]">
              <h3 className="text-base font-semibold text-[#183325] dark:text-[#f8fafc]">Detalle de la venta</h3>
              <div className="mt-4 space-y-3">
                {salePreview.map((line) => (
                  <article key={`${line.productId}-${line.nombre}`} className="flex items-center justify-between rounded-lg border border-[#edf1ea] px-4 py-3 dark:border-[#23314d] dark:bg-[#182235]">
                    <div className="min-w-0">
                      <strong className="block text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">{line.nombre}</strong>
                      <span className="text-sm text-[#5b6d61] dark:text-[#c7d2e0]">
                        {line.cantidad} x {money(line.precio)}
                      </span>
                    </div>
                    <strong className="text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">{money(line.subtotal)}</strong>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-[#e4ece2] bg-[#f8faf6] p-4 dark:border-[#23314d] dark:bg-[#182235]">
              <h3 className="text-base font-semibold text-[#183325] dark:text-[#f8fafc]">Resumen de registro</h3>
              <div className="mt-4 space-y-3 text-sm text-[#5b6d61] dark:text-[#c7d2e0]">
                <div className="flex items-center justify-between gap-3">
                  <span>Metodo de pago</span>
                  <strong className="text-[#183325] dark:text-[#f8fafc]">{selectedPayment.label}</strong>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Total de la venta</span>
                  <strong className="text-[#183325] dark:text-[#f8fafc]">{money(saleTotal)}</strong>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Saldo actual de cartera</span>
                  <strong className="text-[#183325] dark:text-[#f8fafc]">{money(wallet?.saldoActual || 0)}</strong>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Saldo luego de registrar</span>
                  <strong className="text-[#1f7a3a] dark:text-[#93c5fd]">{money(nextWalletTotal)}</strong>
                </div>
                {salePayment.evidenceName ? <div className="rounded-md border border-[#dbe6d8] bg-white px-3 py-2 text-xs text-[#5b6d61] dark:border-[#314056] dark:bg-[#0f172a] dark:text-[#c7d2e0]">Evidencia: {salePayment.evidenceName}</div> : null}
              </div>

              {salePayment.evidenceUrl ? (
                <div className="mt-4 rounded-lg border border-[#dbe6d8] bg-white p-3">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6a7b70]">Vista previa de evidencia</p>
                  <div className="overflow-hidden rounded-lg border border-[#edf1ea] bg-[#f8faf6]">
                    <img
                      alt="Vista previa de la evidencia del pago"
                      className="h-36 w-full object-contain"
                      src={salePayment.evidenceUrl}
                    />
                  </div>
                </div>
              ) : null}
            </div>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#edf1ea] pt-4">
          <button className={subtleButtonClassName} onClick={step === 1 ? onClose : prevStep} type="button">
            {step === 1 ? "Cancelar" : "Volver"}
          </button>

          <div className="flex flex-wrap gap-3">
            {step < 3 ? (
              <button
                className={primaryButtonClassName}
                disabled={(step === 1 && !canContinueProducts) || (step === 2 && !canContinuePayment) || uploading}
                onClick={nextStep}
                type="button"
              >
                Continuar
              </button>
            ) : (
              <button className={primaryButtonClassName} disabled={saleSubmitting || !canContinuePayment || !canContinueProducts} onClick={createSale} type="button">
                {saleSubmitting ? "Procesando..." : "Finalizar venta"}
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
