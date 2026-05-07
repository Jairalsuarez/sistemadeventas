import { Suspense, lazy, useEffect } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import ProductDetailsModal from "./components/modals/ProductDetailsModal";
import CashWithdrawalModal from "./components/modals/CashWithdrawalModal";
import ExpenseModal from "./components/modals/ExpenseModal";
import InformalSaleModal from "./components/modals/InformalSaleModal";
import MerchandiseModal from "./components/modals/MerchandiseModal";
import ProductModal from "./components/modals/ProductModal";
import SaleModal from "./components/modals/SaleModal";
import WalletModal from "./components/modals/WalletModal";
import ToastViewport from "./components/notifications/ToastViewport";
import CookieBanner from "./components/CookieBanner.jsx";
import NativeBootSplash from "./components/ui/NativeBootSplash.jsx";
import PageSkeleton from "./components/ui/PageSkeleton.jsx";
import { useAppContext } from "./context/AppContext";
import PanelLayout from "./layouts/PanelLayout.jsx";
import ProtectedRoute from "./routes/ProtectedRoute";
import { isNativeApp } from "./utils/platform.js";

const ProfilePage = lazy(() => import("./pages/account/ProfilePage.jsx"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage.jsx"));
const ProductsPage = lazy(() => import("./pages/catalog/ProductsPage.jsx"));
const TransferInventoryPage = lazy(() => import("./pages/catalog/TransferInventoryPage.jsx"));
const DashboardPage = lazy(() => import("./pages/dashboard/DashboardPage.jsx"));
const WalletPage = lazy(() => import("./pages/finance/WalletPage.jsx"));
const SchedulePage = lazy(() => import("./pages/admin/SchedulePage.jsx"));
const SalesAnalyticsPage = lazy(() => import("./pages/admin/SalesAnalyticsPage.jsx"));

function ProductEditorPage({
  app,
  editing,
  mode,
  onEditProduct,
  onNewProduct,
  productForm,
  removeProduct,
  resetProductFlow,
  saveProduct,
  setProductForm,
  storageReady,
  uploadError,
  uploadProductImage,
  uploading,
}) {
  const navigate = useNavigate();
  const { productId } = useParams();
  const product = mode === "edit" ? (app.products || []).find((item) => item.id === productId) : null;

  useEffect(() => {
    if (mode === "edit") {
      if (product) onEditProduct(product);
      return;
    }
    onNewProduct();
  }, [mode, productId]);

  if (mode === "edit" && !product) return <Navigate replace to="/panel/productos" />;

  return (
    <ProductModal
      editing={mode === "edit" ? editing || product : null}
      onClose={() => {
        resetProductFlow();
        navigate("/panel/productos");
      }}
      open
      presentation="page"
      productForm={productForm}
      removeProduct={async (id) => {
        const removed = await removeProduct(id);
        if (removed) navigate("/panel/productos");
      }}
      saveProduct={async () => {
        const saved = await saveProduct();
        if (saved) navigate("/panel/productos");
      }}
      setProductForm={setProductForm}
      storageReady={storageReady}
      uploadError={uploadError}
      uploadProductImage={uploadProductImage}
      uploading={uploading}
    />
  );
}

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const nativeApp = isNativeApp();
  const {
    activeShift,
    app,
    createExpense,
    createInformalSale,
    createMerchandiseExpense,
    createSale,
    createSchedule,
    cashWithdrawalForm,
    cashWithdrawalModal,
    deleteSchedule,
    dismissToast,
    editing,
    expense,
    expenseModal,
    expenseSubmitting,
    informalSale,
    informalSaleModal,
    informalSalePayment,
    informalSaleSubmitting,
    merchandise,
    merchandiseLines,
    merchandiseSubmitting,
    money,
    openCreateProduct,
    openEditProduct,
    openSaleFlow,
    openInformalSaleFlow,
    openMerchandiseFlow,
    productForm,
    removeProduct,
    resetProductFlow,
    saleLines,
    salePayment,
    saleModal,
    saleSubmitting,
    saleTotal,
    saveProduct,
    saveProfile,
    scheduleForm,
    selected,
    session,
    authChecking,
    setExpense,
    setCashWithdrawalForm,
    setCashWithdrawalModal,
    setExpenseModal,
    setInformalSale,
    setInformalSaleModal,
    setInformalSalePayment,
    setMerchandise,
    setMerchandiseLines,
    setProductForm,
    setSaleLines,
    setSaleModal,
    setSalePayment,
    setScheduleForm,
    setSelected,
    setWalletForm,
    setWalletModal,
    storageReady,
    syncing,
    toasts,
    upcomingSchedules,
    uploading,
    uploadError,
    updateScheduleStatus,
    uploadProductImage,
    uploadInformalSaleEvidence,
    uploadSaleEvidence,
    uploadProfileAvatar,
    user,
    visibleProducts,
    walletForm,
    walletModal,
    adjustWallet,
    withdrawCashToWallet,
    distributors,
    theme,
    transferInventory,
  } = useAppContext();

  useEffect(() => {
    const isPanelRoute = location.pathname.startsWith("/panel");
    document.documentElement.classList.toggle("dark", isPanelRoute && theme === "dark");
  }, [location.pathname, theme]);

  const openSaleAction = nativeApp ? () => navigate("/panel/ventas/nueva") : openSaleFlow;
  const openInformalSaleAction = nativeApp ? () => navigate("/panel/ventas/informal") : openInformalSaleFlow;
  const openExpenseAction = nativeApp ? () => navigate("/panel/saldo/egreso") : () => setExpenseModal(true);
  const openMerchandiseAction = () => {
    openMerchandiseFlow({ asPage: true });
    navigate("/panel/saldo/mercaderia");
  };
  const openProductCreateAction = () => {
    openCreateProduct();
    navigate("/panel/productos/nuevo");
  };
  const openProductEditAction = (product) => {
    openEditProduct(product);
    navigate(`/panel/productos/${product.id}/editar`);
  };
  const openTransferInventoryAction = () => navigate("/panel/productos/transferir");

  return (
    <>
      {!nativeApp ? <CookieBanner /> : null}
      <NativeBootSplash checking={authChecking || syncing} />
      <ToastViewport onDismiss={dismissToast} suspended={authChecking || syncing} toasts={toasts} />
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/" element={<Navigate replace to={session ? "/panel" : "/login"} />} />
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<PanelLayout />}>
              <Route
                index
                path="/panel"
                element={
                  <DashboardPage
                    onNewProduct={openProductCreateAction}
                    onNewInformalSale={openInformalSaleAction}
                    onNewSale={openSaleAction}
                    onOpenCashWithdrawal={() => setCashWithdrawalModal(true)}
                    onOpenExpense={openExpenseAction}
                    onOpenWallet={() => setWalletModal(true)}
                  />
                }
              />
              <Route
                path="/panel/ventas/nueva"
                element={
                  <SaleModal
                    activeShift={activeShift}
                    app={app}
                    cashBox={app.cashBox}
                    createSale={createSale}
                    money={money}
                    onClose={() => navigate("/panel")}
                    open
                    presentation="page"
                    saleLines={saleLines}
                    salePayment={salePayment}
                    saleSubmitting={saleSubmitting}
                    saleTotal={saleTotal}
                    setSaleLines={setSaleLines}
                    setSalePayment={setSalePayment}
                    uploadError={uploadError}
                    uploadSaleEvidence={uploadSaleEvidence}
                    uploading={uploading}
                    userRole={user?.role}
                    wallet={app.wallet}
                  />
                }
              />
              <Route
                path="/panel/ventas/informal"
                element={
                  <InformalSaleModal
                    activeShift={activeShift}
                    cashBox={app.cashBox}
                    createInformalSale={createInformalSale}
                    informalSale={informalSale}
                    informalSalePayment={informalSalePayment}
                    informalSaleSubmitting={informalSaleSubmitting}
                    money={money}
                    onClose={() => navigate("/panel")}
                    open
                    presentation="page"
                    setInformalSale={setInformalSale}
                    setInformalSalePayment={setInformalSalePayment}
                    uploadError={uploadError}
                    uploadInformalSaleEvidence={uploadInformalSaleEvidence}
                    uploading={uploading}
                    userRole={user?.role}
                    wallet={app.wallet}
                  />
                }
              />
              <Route
                path="/panel/saldo"
                element={
                  <WalletPage
                    cashBox={app.cashBox}
                    expenses={app.expenses || []}
                    isAdmin={user?.role === "admin"}
                    money={money}
                    onOpenCashWithdrawal={() => setCashWithdrawalModal(true)}
                    onOpenExpense={openExpenseAction}
                    onOpenMerchandise={openMerchandiseAction}
                    onOpenWallet={() => setWalletModal(true)}
                    wallet={app.wallet}
                  />
                }
              />
              <Route
                path="/panel/saldo/egreso"
                element={
                  <ExpenseModal
                    createExpense={createExpense}
                    expense={expense}
                    expenseSubmitting={expenseSubmitting}
                    money={money}
                    onClose={() => navigate("/panel/saldo")}
                    open
                    presentation="page"
                    setExpense={setExpense}
                    wallet={app.wallet}
                  />
                }
              />
              <Route
                path="/panel/saldo/mercaderia"
                element={
                  <MerchandiseModal
                    createMerchandiseExpense={async () => {
                      const saved = await createMerchandiseExpense();
                      if (saved) navigate("/panel/saldo");
                      return saved;
                    }}
                    distributors={distributors || []}
                    merchandise={merchandise}
                    merchandiseLines={merchandiseLines}
                    merchandiseSubmitting={merchandiseSubmitting}
                    money={money}
                    onClose={() => navigate("/panel/saldo")}
                    open
                    presentation="page"
                    products={app.products || []}
                    setMerchandise={setMerchandise}
                    setMerchandiseLines={setMerchandiseLines}
                    wallet={app.wallet}
                  />
                }
              />
              <Route path="/panel/cartera" element={<Navigate replace to="/panel/saldo" />} />
              <Route path="/panel/cartera/egreso" element={<Navigate replace to="/panel/saldo/egreso" />} />
              <Route
                path="/panel/productos"
                element={
                  <ProductsPage
                    app={app}
                    canCreate={["admin", "vendedor"].includes(user?.role)}
                    canEdit={user?.role === "admin"}
                    money={money}
                    onEdit={openProductEditAction}
                    onNewProduct={openProductCreateAction}
                    onTransfer={openTransferInventoryAction}
                    onView={setSelected}
                    products={user?.role === "admin" ? app.products : visibleProducts}
                  />
                }
              />
              <Route
                path="/panel/productos/transferir"
                element={
                  user?.role === "admin" ? (
                    <TransferInventoryPage
                      money={money}
                      onBack={() => navigate("/panel/productos")}
                      products={app.products || []}
                      transferInventory={transferInventory}
                    />
                  ) : (
                    <Navigate replace to="/panel/productos" />
                  )
                }
              />
              <Route
                path="/panel/productos/nuevo"
                element={
                  ["admin", "vendedor"].includes(user?.role) ? (
                  <ProductEditorPage
                    app={app}
                    editing={editing}
                    mode="create"
                    onEditProduct={openEditProduct}
                    onNewProduct={openCreateProduct}
                    productForm={productForm}
                    removeProduct={removeProduct}
                    resetProductFlow={resetProductFlow}
                    saveProduct={saveProduct}
                    setProductForm={setProductForm}
                    storageReady={storageReady}
                    uploadError={uploadError}
                    uploadProductImage={uploadProductImage}
                    uploading={uploading}
                  />
                  ) : (
                    <Navigate replace to="/panel/productos" />
                  )
                }
              />
              <Route
                path="/panel/productos/:productId/editar"
                element={
                  user?.role === "admin" ? (
                  <ProductEditorPage
                    app={app}
                    editing={editing}
                    mode="edit"
                    onEditProduct={openEditProduct}
                    onNewProduct={openCreateProduct}
                    productForm={productForm}
                    removeProduct={removeProduct}
                    resetProductFlow={resetProductFlow}
                    saveProduct={saveProduct}
                    setProductForm={setProductForm}
                    storageReady={storageReady}
                    uploadError={uploadError}
                    uploadProductImage={uploadProductImage}
                    uploading={uploading}
                  />
                  ) : (
                    <Navigate replace to="/panel/productos" />
                  )
                }
              />
              <Route path="/panel/perfil" element={<ProfilePage onSave={saveProfile} onUploadAvatar={uploadProfileAvatar} user={user} />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route element={<PanelLayout />}>
              <Route
                path="/panel/agenda"
                element={
                  <SchedulePage
                    createSchedule={createSchedule}
                    deleteSchedule={deleteSchedule}
                    scheduleForm={scheduleForm}
                    setScheduleForm={setScheduleForm}
                    upcomingSchedules={upcomingSchedules}
                    updateScheduleStatus={updateScheduleStatus}
                    users={app.users || []}
                  />
                }
              />
              <Route path="/panel/analitica" element={<SalesAnalyticsPage expenses={app.expenses || []} money={money} sales={app.sales || []} schedules={app.schedules || []} turnos={app.turnos || []} />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate replace to={session ? "/panel" : nativeApp ? "/login" : "/"} />} />
        </Routes>
      </Suspense>

      <SaleModal
        activeShift={activeShift}
        app={app}
        cashBox={app.cashBox}
        createSale={createSale}
        money={money}
        onClose={() => setSaleModal(false)}
        open={saleModal}
        saleLines={saleLines}
        salePayment={salePayment}
        saleSubmitting={saleSubmitting}
        saleTotal={saleTotal}
        setSaleLines={setSaleLines}
        setSalePayment={setSalePayment}
        uploadError={uploadError}
        uploadSaleEvidence={uploadSaleEvidence}
        uploading={uploading}
        userRole={user?.role}
        wallet={app.wallet}
      />

      <InformalSaleModal
        activeShift={activeShift}
        cashBox={app.cashBox}
        createInformalSale={createInformalSale}
        informalSale={informalSale}
        informalSalePayment={informalSalePayment}
        informalSaleSubmitting={informalSaleSubmitting}
        money={money}
        onClose={() => setInformalSaleModal(false)}
        open={informalSaleModal}
        setInformalSale={setInformalSale}
        setInformalSalePayment={setInformalSalePayment}
        uploadError={uploadError}
        uploadInformalSaleEvidence={uploadInformalSaleEvidence}
        uploading={uploading}
        userRole={user?.role}
        wallet={app.wallet}
      />

      <ExpenseModal
        createExpense={createExpense}
        expense={expense}
        expenseSubmitting={expenseSubmitting}
        money={money}
        onClose={() => setExpenseModal(false)}
        open={expenseModal}
        setExpense={setExpense}
        wallet={app.wallet}
      />
      <WalletModal adjustWallet={adjustWallet} onClose={() => setWalletModal(false)} open={walletModal} setWalletForm={setWalletForm} walletForm={walletForm} />
      <CashWithdrawalModal
        cashBox={app.cashBox}
        cashWithdrawalForm={cashWithdrawalForm}
        money={money}
        onClose={() => setCashWithdrawalModal(false)}
        open={cashWithdrawalModal}
        setCashWithdrawalForm={setCashWithdrawalForm}
        withdrawCashToWallet={withdrawCashToWallet}
      />
      <ProductDetailsModal money={money} onClose={() => setSelected(null)} open={Boolean(selected)} product={selected} variant={session || nativeApp ? "default" : "public"} whatsappNumber={app.business.whatsapp} />
    </>
  );
}

export default App;
