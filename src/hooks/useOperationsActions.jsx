const getScheduleHours = (turno = "") => {
  const value = String(turno).toLowerCase();
  if (value.includes("tarde")) return { inicio: "13:30", fin: "17:00", turno: "Tarde" };
  if (value.includes("noche")) return { inicio: "17:00", fin: "22:00", turno: "Noche" };
  return { inicio: "08:00", fin: "13:30", turno: "Manana" };
};

const SCHEDULE_MATCH_TOLERANCE_MINUTES = 45;

const normalizeText = (value = "") =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const toMinutes = (value = "") => {
  const [hours = "0", minutes = "0"] = String(value || "").split(":");
  return Number(hours) * 60 + Number(minutes);
};

const formatLocalDate = (value) =>
  new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Guayaquil",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));

const formatLocalTime = (value) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Guayaquil",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));

const findMatchingSchedule = ({ schedules = [], startedAt, userName }) => {
  const localDate = formatLocalDate(startedAt);
  const startMinutes = toMinutes(formatLocalTime(startedAt));
  const normalizedUserName = normalizeText(userName);

  const matches = schedules
    .filter((schedule) => {
      if (!["programado", "en_progreso"].includes(schedule.estado)) return false;
      if (schedule.fecha !== localDate) return false;
      if (normalizeText(schedule.responsable) !== normalizedUserName) return false;

      const scheduleStart = toMinutes(schedule.inicio);
      const scheduleEnd = toMinutes(schedule.fin);
      return startMinutes >= scheduleStart - SCHEDULE_MATCH_TOLERANCE_MINUTES && startMinutes <= scheduleEnd;
    })
    .sort((a, b) => Math.abs(toMinutes(a.inicio) - startMinutes) - Math.abs(toMinutes(b.inicio) - startMinutes));

  return matches[0] || null;
};

const completedScheduledShift = ({ closedAt, matchedSchedule, startedAt }) => {
  if (!matchedSchedule) return false;
  const realStartMinutes = toMinutes(formatLocalTime(startedAt));
  const realEndMinutes = toMinutes(formatLocalTime(closedAt));
  const scheduledStartMinutes = toMinutes(matchedSchedule.inicio);
  const scheduledEndMinutes = toMinutes(matchedSchedule.fin);

  return realStartMinutes <= scheduledStartMinutes + SCHEDULE_MATCH_TOLERANCE_MINUTES && realEndMinutes >= scheduledEndMinutes;
};

export default function useOperationsActions({
  app,
  session,
  user,
  activeShift,
  shiftCash,
  setShiftCash,
  saleLines,
  setSaleLines,
  salePayment,
  setSalePayment,
  informalSale,
  setInformalSale,
  informalSalePayment,
  setInformalSalePayment,
  salePreview,
  saleTotal,
  saleSubmitting,
  setSaleSubmitting,
  informalSaleSubmitting,
  setInformalSaleSubmitting,
  setSaleModal,
  setInformalSaleModal,
  expense,
  expenseCategories,
  distributors,
  setExpense,
  expenseSubmitting,
  setExpenseSubmitting,
  setExpenseModal,
  walletForm,
  setWalletForm,
  setWalletModal,
  scheduleForm,
  setScheduleForm,
  commit,
  notify,
  inform,
  personName,
  money,
  shortTime,
  isMissingRelationError,
  emptyWalletForm,
  emptyScheduleForm,
  createRemoteShift,
  updateRemoteShift,
  createRemoteSale,
  createRemoteInformalSale,
  upsertRemoteWalletState,
  createRemoteWalletMovement,
  createRemoteExpense,
  createRemoteExpenseCategory,
  createRemoteDistributor,
  createRemoteNotification,
  createRemoteSchedule,
  updateRemoteScheduleStatus,
  deleteRemoteSchedule,
  verifySupabasePassword,
}) {
  const isAdminRole = user?.role === "admin";

  const findUserRoleById = (userId) => {
    if (!userId) return null;
    if (userId === user?.id) return user?.role || null;
    return app.users.find((item) => item.id === userId)?.role || null;
  };

  const parseMoneyInput = (value) => {
    const normalized = String(value || "")
      .replace(",", ".")
      .replace(/[^\d.]/g, "");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const cleanName = (value) => String(value || "").trim();

  const startShift = async () => {
    if (user?.role !== "vendedor") return inform("Los turnos solo aplican para vendedores.", "warning");
    if (activeShift) return inform("Ya tienes un turno abierto.", "warning");
    const openShift = app.turnos.find((turno) => turno.estado === "abierto" && findUserRoleById(turno.userId) === "vendedor");
    if (openShift) return inform(`Ya hay un turno activo de ${openShift.userName}. Debe cerrarlo antes de abrir otro.`, "warning");

    const draftShift = {
      id: crypto.randomUUID(),
      userId: user.id,
      userName: personName(user),
      estado: "abierto",
      saldoInicial: Number(shiftCash || 0),
      saldoFinal: null,
      totalVentas: 0,
      startedAt: new Date().toISOString(),
      closedAt: null,
    };

    const remote = await createRemoteShift(draftShift);
    if (session?.mode === "supabase" && !remote.ok) {
      return inform("No se pudo abrir el turno. Intenta de nuevo.", "error");
    }

    const finalShift = remote.ok ? remote.shift : draftShift;
    commit((current) => ({ ...current, turnos: [finalShift, ...current.turnos] }));

    const matchedSchedule = findMatchingSchedule({
      schedules: app.schedules || [],
      startedAt: finalShift.startedAt,
      userName: finalShift.userName,
    });

    if (matchedSchedule) {
      const remoteSchedule = await updateRemoteScheduleStatus(matchedSchedule.id, "en_progreso");
      const nextSchedule = remoteSchedule.ok ? remoteSchedule.schedule : { ...matchedSchedule, estado: "en_progreso" };

      commit((current) => ({
        ...current,
        schedules: (current.schedules || []).map((item) => (item.id === matchedSchedule.id ? nextSchedule : item)),
      }));
    }

    notify(`${personName(user)} inicio un turno.`, personName(user), "success");
    inform(`Inicio de turno registrado a las ${shortTime(finalShift.startedAt)}.`, "success");
  };

  const closeShift = async (targetShift = activeShift) => {
    if (!targetShift) return;
    const targetRole = findUserRoleById(targetShift.userId);
    const isOwnShift = targetShift.userId === user?.id;
    const isAdminClosing = isAdminRole;

    if (!isAdminClosing && !isOwnShift) {
      return inform("Solo puedes cerrar tu propio turno.", "warning");
    }

    if (targetRole !== "vendedor") {
      return inform("Solo se pueden cerrar turnos de vendedores.", "warning");
    }

    if (!isAdminClosing) {
      const startedAt = new Date(targetShift.startedAt).getTime();
      const minCloseTime = startedAt + 5 * 60 * 60 * 1000;
      if (Date.now() < minCloseTime) {
        return inform("Debes esperar 5 horas desde el inicio del turno para poder cerrarlo.", "warning");
      }
    }

    const total = app.sales.filter((sale) => sale.shiftId === targetShift.id).reduce((acc, item) => acc + item.total, 0);
    const closedShift = {
      ...targetShift,
      estado: "cerrado",
      saldoFinal: targetShift.saldoInicial + total,
      totalVentas: total,
      closedAt: new Date().toISOString(),
    };

    const remote = await updateRemoteShift(closedShift);
    if (session?.mode === "supabase" && !remote.ok) {
      return inform(`No se pudo cerrar el turno. ${remote.error || "Intenta de nuevo."}`, "error");
    }

    const finalShift = remote.ok ? remote.shift : closedShift;
    commit((current) => ({
      ...current,
      turnos: current.turnos.map((turno) => (turno.id === targetShift.id ? finalShift : turno)),
    }));

    const matchedSchedule = findMatchingSchedule({
      schedules: app.schedules || [],
      startedAt: targetShift.startedAt,
      userName: targetShift.userName,
    });

    if (matchedSchedule) {
      const nextStatus = completedScheduledShift({
        closedAt: finalShift.closedAt,
        matchedSchedule,
        startedAt: targetShift.startedAt,
      })
        ? "completado"
        : "en_progreso";

      const remoteSchedule = await updateRemoteScheduleStatus(matchedSchedule.id, nextStatus);
      const nextSchedule = remoteSchedule.ok ? remoteSchedule.schedule : { ...matchedSchedule, estado: nextStatus };

      commit((current) => ({
        ...current,
        schedules: (current.schedules || []).map((item) => (item.id === matchedSchedule.id ? nextSchedule : item)),
      }));
    }

    notify(
      isAdminClosing
        ? `${personName(user)} cerro el turno de ${targetShift.userName}.`
        : `${personName(user)} cerro su turno.`,
      personName(user)
    );
    inform(`Cierre de turno registrado a las ${shortTime(finalShift.closedAt)}.`, "success");
  };

  const createSale = async () => {
    if (saleSubmitting) return false;
    if (user?.role === "vendedor" && !activeShift) {
      inform("Debes iniciar un turno.", "warning");
      return false;
    }
    if (!salePreview.length || salePreview.some((line) => !line.cantidad)) {
      inform("Agrega productos validos.", "warning");
      return false;
    }
    if (!salePayment.method) {
      inform("Selecciona un metodo de pago.", "warning");
      return false;
    }
    if (["transferencia_directa", "deuna"].includes(salePayment.method) && !salePayment.evidenceUrl) {
      inform("Debes subir la evidencia del pago antes de finalizar.", "warning");
      return false;
    }

    const bad = salePreview.find((line) => (app.products.find((product) => product.id === line.productId)?.stock || 0) < line.cantidad);
    if (bad) {
      inform(`Sin stock suficiente para ${bad.nombre}.`, "warning");
      return false;
    }

    setSaleSubmitting(true);

    const draftSale = {
      id: crypto.randomUUID(),
      shiftId: activeShift?.id || null,
      userId: user.id,
      userName: personName(user),
      items: salePreview,
      total: saleTotal,
      paymentMethod: salePayment.method,
      paymentEvidenceUrl: salePayment.evidenceUrl || "",
      paymentEvidenceName: salePayment.evidenceName || "",
      createdAt: new Date().toISOString(),
    };

    const nextWallet = { saldoActual: app.wallet.saldoActual + saleTotal, updatedAt: new Date().toISOString() };
    const nextShift = activeShift ? { ...activeShift, totalVentas: activeShift.totalVentas + saleTotal } : null;

    commit((current) => ({
      ...current,
      sales: [draftSale, ...current.sales],
      wallet: nextWallet,
      products: current.products.map((product) => {
        const line = salePreview.find((item) => item.productId === product.id);
        return line ? { ...product, stock: product.stock - line.cantidad } : product;
      }),
      turnos: nextShift ? current.turnos.map((turno) => (turno.id === activeShift.id ? nextShift : turno)) : current.turnos,
    }));

    notify(`${personName(user)} registro una venta por ${money(saleTotal)}.`, personName(user), "success");
    setSaleLines([{ productId: "", cantidad: 1 }]);
    setSalePayment({ method: "efectivo", evidenceUrl: "", evidenceName: "" });
    setSaleModal(false);
    inform("Venta registrada con exito.", "success");
    const savedLocally = true;

    try {
      const saleRemote = await createRemoteSale(draftSale);
      if (session?.mode === "supabase" && !saleRemote.ok) {
        commit((current) => ({
          ...current,
          sales: app.sales,
          wallet: app.wallet,
          products: app.products,
          turnos: app.turnos,
        }));
        inform(`No se pudo guardar la venta en Supabase. ${saleRemote.error || "Intenta de nuevo."}`, "error");
        return false;
      }

      const saleRecord = saleRemote.ok ? saleRemote.sale : draftSale;
      const walletRemote = await upsertRemoteWalletState(nextWallet, session?.mode === "supabase" ? session.userId : null);
      if (session?.mode === "supabase" && !walletRemote.ok) {
        inform(`La venta se registro, pero no se pudo actualizar la cartera en Supabase. ${walletRemote.error || "Revisa wallet_state."}`, "warning");
      }

      if (session?.mode === "supabase") {
        await createRemoteWalletMovement({
          tipo: "venta",
          monto: saleTotal,
          descripcion: `Venta ${saleRecord.id} - ${salePayment.method}`,
          createdBy: session.userId,
        });
      }

      const finalWallet = walletRemote.ok ? walletRemote.wallet : nextWallet;
      const shiftRemote = nextShift ? await updateRemoteShift(nextShift) : null;
      const finalShift = nextShift ? (shiftRemote?.ok ? remoteShiftOr(nextShift, shiftRemote) : nextShift) : null;

      commit((current) => ({
        ...current,
        sales: current.sales.map((sale) => (sale.id === draftSale.id ? saleRecord : sale)),
        wallet: finalWallet,
        turnos: finalShift ? current.turnos.map((turno) => (turno.id === activeShift.id ? finalShift : turno)) : current.turnos,
      }));
    } catch (error) {
      commit((current) => ({
        ...current,
        sales: app.sales,
        wallet: app.wallet,
        products: app.products,
        turnos: app.turnos,
      }));
      inform(`No se pudo completar la venta. ${error?.message || "Intenta de nuevo."}`, "error");
      return false;
    } finally {
      setSaleSubmitting(false);
    }
    return savedLocally;
  };

  const createInformalSale = async () => {
    if (informalSaleSubmitting) return false;
    if (user?.role === "vendedor" && !activeShift) {
      inform("Debes iniciar un turno.", "warning");
      return false;
    }

    const total = parseMoneyInput(informalSale.totalInput || informalSale.total);
    const description = String(informalSale.description || "").trim();
    if (total <= 0) {
      inform("Ingresa un valor total valido.", "warning");
      return false;
    }
    if (!description) {
      inform("Escribe una descripcion de la venta.", "warning");
      return false;
    }
    if (!informalSalePayment.method) {
      inform("Selecciona un metodo de pago.", "warning");
      return false;
    }
    if (["transferencia_directa", "deuna"].includes(informalSalePayment.method) && !informalSalePayment.evidenceUrl) {
      inform("Debes subir la evidencia del pago antes de finalizar.", "warning");
      return false;
    }

    setInformalSaleSubmitting(true);

    const draftSale = {
      id: crypto.randomUUID(),
      shiftId: activeShift?.id || null,
      userId: user.id,
      userName: personName(user),
      items: [],
      total,
      description,
      informal: true,
      paymentMethod: informalSalePayment.method,
      paymentEvidenceUrl: informalSalePayment.evidenceUrl || "",
      paymentEvidenceName: informalSalePayment.evidenceName || "",
      createdAt: new Date().toISOString(),
    };

    const nextWallet = { saldoActual: app.wallet.saldoActual + total, updatedAt: new Date().toISOString() };
    const nextShift = activeShift ? { ...activeShift, totalVentas: activeShift.totalVentas + total } : null;

    commit((current) => ({
      ...current,
      sales: [draftSale, ...current.sales],
      wallet: nextWallet,
      turnos: nextShift ? current.turnos.map((turno) => (turno.id === activeShift.id ? nextShift : turno)) : current.turnos,
    }));

    try {
      const saleRemote = await createRemoteInformalSale(draftSale);
      if (session?.mode === "supabase" && !saleRemote.ok) {
        commit((current) => ({
          ...current,
          sales: app.sales,
          wallet: app.wallet,
          turnos: app.turnos,
        }));
        inform(`No se pudo guardar la venta informal en Supabase. ${saleRemote.error || "Intenta de nuevo."}`, "error");
        return false;
      }

      notify(`${personName(user)} registro una venta informal por ${money(total)}.`, personName(user), "success");
      setInformalSale({ total: 0, totalInput: "", description: "" });
      setInformalSalePayment({ method: "efectivo", evidenceUrl: "", evidenceName: "" });
      setInformalSaleModal(false);
      inform("Venta informal registrada con exito.", "success");

      const saleRecord = saleRemote.ok ? saleRemote.sale : draftSale;
      commit((current) => ({
        ...current,
        sales: current.sales.map((sale) => (sale.id === draftSale.id ? saleRecord : sale)),
        wallet: nextWallet,
        turnos: nextShift ? current.turnos.map((turno) => (turno.id === activeShift.id ? nextShift : turno)) : current.turnos,
      }));
    } catch (error) {
      commit((current) => ({
        ...current,
        sales: app.sales,
        wallet: app.wallet,
        turnos: app.turnos,
      }));
      inform(`No se pudo completar la venta informal. ${error?.message || "Intenta de nuevo."}`, "error");
      return false;
    } finally {
      setInformalSaleSubmitting(false);
    }
    return true;
  };

  const createExpense = async () => {
    if (expenseSubmitting) return;
    const amount = parseMoneyInput(expense.montoInput || expense.monto);
    const categoryName = expense.isNewCategory ? cleanName(expense.newCategoryName) : cleanName(expense.categoryName);
    const needsDistributor = categoryName.toLowerCase() === "mercaderia";
    const distributorName = expense.isNewDistributor ? cleanName(expense.newDistributorName) : cleanName(expense.distributorName);
    const currentCategories = expenseCategories || [];
    const currentDistributors = distributors || [];
    if (!user || !categoryName || (needsDistributor && !distributorName) || !expense.descripcion.trim() || !expense.detalleOferta.trim() || !expense.evidenceUrl || amount <= 0 || !expense.confirmationAccepted) {
      return inform("Completa el egreso correctamente.", "warning");
    }

    setExpenseSubmitting(true);
    try {
      let nextCategory =
        currentCategories.find((item) =>
          expense.isNewCategory
            ? cleanName(item?.nombre).toLowerCase() === categoryName.toLowerCase()
            : item.id === expense.categoryId
        ) || null;

      if (!nextCategory && expense.isNewCategory) {
        if (session?.mode === "supabase") {
          const remoteCategory = await createRemoteExpenseCategory({
            nombre: categoryName,
            createdBy: session.userId,
          });

          if (!remoteCategory.ok) {
            inform(`No se pudo crear la categoria en Supabase. ${remoteCategory.error || "Revisa la tabla y sus politicas."}`, "error");
            return;
          }

          nextCategory = remoteCategory.category;
        } else {
          nextCategory = {
            id: crypto.randomUUID(),
            nombre: categoryName,
            createdAt: new Date().toISOString(),
          };
        }
      }

      let nextDistributor =
        needsDistributor
          ? currentDistributors.find((item) =>
              expense.isNewDistributor
                ? cleanName(item?.nombre).toLowerCase() === distributorName.toLowerCase()
                : item.id === expense.distributorId
            ) || null
          : null;

      if (needsDistributor && !nextDistributor && expense.isNewDistributor) {
        if (session?.mode === "supabase") {
          const remoteDistributor = await createRemoteDistributor({
            nombre: distributorName,
            telefono: "",
            notas: "",
            createdBy: session.userId,
          });

          if (!remoteDistributor.ok) {
            inform(`No se pudo crear el distribuidor en Supabase. ${remoteDistributor.error || "Revisa la tabla y sus politicas."}`, "error");
            return;
          }

          nextDistributor = remoteDistributor.distributor;
        } else {
          nextDistributor = {
            id: crypto.randomUUID(),
            nombre: distributorName,
            telefono: "",
            notas: "",
            createdAt: new Date().toISOString(),
          };
        }
      }

      const draftExpense = {
        ...expense,
        id: crypto.randomUUID(),
        categoria: nextCategory?.nombre || categoryName,
        categoryId: nextCategory?.id || expense.categoryId || null,
        categoryName,
        descripcion: expense.descripcion.trim(),
        detalleOferta: expense.detalleOferta.trim(),
        distributorId: needsDistributor ? nextDistributor?.id || expense.distributorId || null : null,
        distributorName: needsDistributor ? distributorName : "",
        monto: amount,
        cantidad: amount > 0 ? 1 : 0,
        unitCost: amount,
        userId: user.id,
        userName: personName(user),
        createdAt: new Date().toISOString(),
      };

      const nextWallet = { saldoActual: app.wallet.saldoActual - amount, updatedAt: new Date().toISOString() };

      commit((current) => ({
        ...current,
        expenseCategories:
          nextCategory && !(current.expenseCategories || []).some((item) => item.id === nextCategory.id)
            ? [nextCategory, ...(current.expenseCategories || [])]
            : current.expenseCategories || [],
        distributors:
          nextDistributor && !(current.distributors || []).some((item) => item.id === nextDistributor.id)
            ? [nextDistributor, ...(current.distributors || [])]
            : current.distributors || [],
        expenses: [draftExpense, ...current.expenses],
        wallet: nextWallet,
      }));

      notify(`${personName(user)} registro un egreso de ${money(amount)}.`, personName(user), "warning");
      const nextCategoriesSnapshot =
        nextCategory && !currentCategories.some((item) => item.id === nextCategory.id) ? [nextCategory, ...currentCategories] : currentCategories;
      const defaultCategory = nextCategoriesSnapshot.find((item) => item.nombre === "Mercaderia") || nextCategoriesSnapshot[0] || null;
      setExpense({
        categoria: defaultCategory?.nombre || "Mercaderia",
        categoryId: "",
        categoryName: defaultCategory?.nombre || "Mercaderia",
        isNewCategory: false,
        newCategoryName: "",
        descripcion: "",
        detalleOferta: "",
        distributorId: "",
        distributorName: "",
        isNewDistributor: false,
        newDistributorName: "",
        evidenceUrl: "",
        evidencePreviewUrl: "",
        evidenceName: "",
        cantidad: 1,
        unitCost: 0,
        monto: 0,
        montoInput: "",
        confirmationAccepted: false,
      });
      setExpenseModal(false);
      inform("Egreso registrado con exito.", "success");

      const expenseRemote = await createRemoteExpense(draftExpense);
      if (session?.mode === "supabase" && !expenseRemote.ok && !isMissingRelationError(expenseRemote.error)) {
        inform("No se pudo guardar el egreso. Intenta de nuevo.", "error");
        return;
      }

      const expenseRecord = expenseRemote.ok ? expenseRemote.expense : draftExpense;
      const walletRemote = await upsertRemoteWalletState(nextWallet, session?.mode === "supabase" ? session.userId : null);

      if (session?.mode === "supabase") {
        await createRemoteWalletMovement({
          tipo: "egreso",
          monto: amount,
          descripcion: expense.descripcion,
          createdBy: session.userId,
        });
      }

      const finalWallet = walletRemote.ok ? walletRemote.wallet : nextWallet;
      commit((current) => ({
        ...current,
        expenses: current.expenses.map((item) => (item.id === draftExpense.id ? expenseRecord : item)),
        wallet: finalWallet,
      }));
    } catch (error) {
      inform(`No se pudo completar el egreso. ${error?.message || "Intenta de nuevo."}`, "error");
    } finally {
      setExpenseSubmitting(false);
    }
  };

  const adjustWallet = async () => {
    if (!isAdminRole) return inform("Solo administracion puede cambiar el saldo.", "warning");
    const nextBalance = Number(walletForm.saldo || 0);
    const reason = walletForm.motivo.trim();
    const password = String(walletForm.password || "").trim();
    if (!Number.isFinite(nextBalance) || !reason) return inform("Indica el saldo y un motivo del ajuste.", "warning");
    if (!password) return inform("Ingresa tu contrasena para confirmar el ajuste.", "warning");
    if (!walletForm.confirmationAccepted) return inform("Confirma que estas de acuerdo con modificar la cartera.", "warning");

    if (session?.mode === "supabase") {
      const verification = await verifySupabasePassword?.(session.email, password);
      if (!verification?.ok) return inform(verification?.error || "No se pudo validar tu contrasena actual.", "error");
    } else {
      const localAdmin = app.users.find((item) => item.id === user?.id);
      if (!localAdmin || localAdmin.password !== password) {
        return inform("La contrasena ingresada no coincide con la del administrador.", "error");
      }
    }

    const draftWallet = { saldoActual: nextBalance, updatedAt: new Date().toISOString() };
    const remote = await upsertRemoteWalletState(draftWallet, session?.mode === "supabase" ? session.userId : null);

    if (session?.mode === "supabase") {
      await createRemoteWalletMovement({
        tipo: "ajuste",
        monto: nextBalance,
        descripcion: reason,
        createdBy: session.userId,
      });
    }

    const finalWallet = remote.ok ? remote.wallet : draftWallet;
    commit((current) => ({ ...current, wallet: finalWallet }));
    notify(`${personName(user)} ajusto el saldo general a ${money(finalWallet.saldoActual)}.`, personName(user));
    setWalletModal(false);
    setWalletForm({ ...emptyWalletForm, saldo: finalWallet.saldoActual, password: "", confirmationAccepted: false });
    inform("Saldo general actualizado.", "success");
  };

  const createSchedule = async () => {
    if (!isAdminRole) return inform("Solo administracion puede programar agenda.", "warning");
    const scheduleHours = getScheduleHours(scheduleForm.turno);
    if (!scheduleForm.fecha || !scheduleForm.responsable.trim()) {
      return inform("Completa fecha, turno y responsable.", "warning");
    }
    const assignedSeller = (app.users || []).find((item) => item.id === scheduleForm.responsableId);

    const schedule = {
      id: crypto.randomUUID(),
      ...scheduleForm,
      turno: scheduleHours.turno,
      inicio: scheduleHours.inicio,
      fin: scheduleHours.fin,
      responsable: scheduleForm.responsable.trim(),
      notas: scheduleForm.notas.trim(),
      estado: "programado",
      createdAt: new Date().toISOString(),
    };

    const remote = await createRemoteSchedule(schedule);
    const finalSchedule = remote.ok ? remote.schedule : schedule;

    commit((current) => ({
      ...current,
      schedules: [finalSchedule, ...(current.schedules || [])],
    }));
    notify(`${personName(user)} programo un turno para ${finalSchedule.responsable} el ${finalSchedule.fecha}.`, personName(user));
    if (assignedSeller) {
      const scheduleNotification = {
        id: crypto.randomUUID(),
        message: `Tienes un turno programado el ${finalSchedule.fecha} de ${finalSchedule.inicio} a ${finalSchedule.fin}.`,
        type: "agenda",
        actorId: assignedSeller.id,
        actorName: personName(assignedSeller),
        read: false,
        createdAt: new Date().toISOString(),
      };
      const remoteNotification = await createRemoteNotification(scheduleNotification);
      commit((current) => ({
        ...current,
        notifications: [remoteNotification.ok ? remoteNotification.notification : scheduleNotification, ...(current.notifications || [])].slice(0, 60),
      }));
    }
    setScheduleForm(emptyScheduleForm);
    inform("Turno agendado correctamente.", "success");
  };

  const updateScheduleStatus = async (id, estado) => {
    if (!isAdminRole) return inform("Solo administracion puede cambiar estados de agenda.", "warning");
    const target = (app.schedules || []).find((item) => item.id === id);
    if (!target) return;

    const remote = await updateRemoteScheduleStatus(id, estado);
    const finalSchedule = remote.ok ? remote.schedule : { ...target, estado };

    commit((current) => ({
      ...current,
      schedules: (current.schedules || []).map((item) => (item.id === id ? finalSchedule : item)),
    }));
    notify(`${personName(user)} marco la agenda de ${target.responsable} como ${estado}.`, personName(user));
    inform("Agenda actualizada.", "success");
  };

  const deleteSchedule = async (id) => {
    if (!isAdminRole) return inform("Solo administracion puede eliminar turnos.", "warning");
    const target = (app.schedules || []).find((item) => item.id === id);
    if (!target) return;

    await deleteRemoteSchedule(id);
    commit((current) => ({
      ...current,
      schedules: (current.schedules || []).filter((item) => item.id !== id),
    }));
    notify(`${personName(user)} elimino el turno de ${target.responsable} del ${target.fecha}.`, personName(user), "warning");
    inform("Turno eliminado.", "success");
  };

  return {
    startShift,
    closeShift,
    createSale,
    createInformalSale,
    createExpense,
    adjustWallet,
    createSchedule,
    updateScheduleStatus,
    deleteSchedule,
  };
}

function remoteShiftOr(fallback, remote) {
  return remote.ok ? remote.shift : fallback;
}
