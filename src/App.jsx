import { Suspense, lazy, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import ProductDetailsModal from "./components/modals/ProductDetailsModal";
import ExpenseModal from "./components/modals/ExpenseModal";
import InformalSaleModal from "./components/modals/InformalSaleModal";
import ProductModal from "./components/modals/ProductModal";
import SaleModal from "./components/modals/SaleModal";
import WalletModal from "./components/modals/WalletModal";
import ToastViewport from "./components/notifications/ToastViewport";
import CookieBanner from "./components/CookieBanner.jsx";
import PageSkeleton from "./components/ui/PageSkeleton.jsx";
import { useAppContext } from "./context/AppContext";
import PanelLayout from "./layouts/PanelLayout.jsx";
import ProtectedRoute from "./routes/ProtectedRoute";
import { isNativeApp } from "./utils/platform.js";

const ProfilePage = lazy(() => import("./pages/account/ProfilePage.jsx"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage.jsx"));
const ProductsPage = lazy(() => import("./pages/catalog/ProductsPage.jsx"));
const DashboardPage = lazy(() => import("./pages/dashboard/DashboardPage.jsx"));
const WalletPage = lazy(() => import("./pages/finance/WalletPage.jsx"));
const SchedulePage = lazy(() => import("./pages/admin/SchedulePage.jsx"));
const UsersPage = lazy(() => import("./pages/admin/UsersPage.jsx"));
const SalesAnalyticsPage = lazy(() => import("./pages/admin/SalesAnalyticsPage.jsx"));

function App() {
  const location = useLocation();
  const nativeApp = isNativeApp();
  const {
    activeShift,
    app,
    createExpense,
    createInformalSale,
    createSale,
    createSchedule,
    deleteSchedule,
    dismissToast,
    editing,
    expense,
    expenseCategories,
    expenseModal,
    expenseSubmitting,
    informalSale,
    informalSaleModal,
    informalSalePayment,
    informalSaleSubmitting,
    money,
    openCreateProduct,
    openEditProduct,
    openSaleFlow,
    openInformalSaleFlow,
    productForm,
    productModal,
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
    setExpenseModal,
    setInformalSale,
    setInformalSaleModal,
    setInformalSalePayment,
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
    uploadExpenseEvidence,
    uploadInformalSaleEvidence,
    uploadSaleEvidence,
    uploadProfileAvatar,
    user,
    visibleProducts,
    walletForm,
    walletModal,
    adjustWallet,
    distributors,
    theme,
  } = useAppContext();

  useEffect(() => {
    const isPanelRoute = location.pathname.startsWith("/panel");
    document.documentElement.classList.toggle("dark", isPanelRoute && theme === "dark");
  }, [location.pathname, theme]);

  return (
    <>
      {!nativeApp ? <CookieBanner /> : null}
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
                    onNewProduct={openCreateProduct}
                    onNewInformalSale={openInformalSaleFlow}
                    onNewSale={openSaleFlow}
                    onOpenExpense={() => setExpenseModal(true)}
                    onOpenWallet={() => setWalletModal(true)}
                  />
                }
              />
              <Route
                path="/panel/cartera"
                element={
                  <WalletPage
                    expenses={app.expenses || []}
                    isAdmin={user?.role === "admin"}
                    money={money}
                    onOpenExpense={() => setExpenseModal(true)}
                    onOpenWallet={() => setWalletModal(true)}
                    wallet={app.wallet}
                  />
                }
              />
              <Route
                path="/panel/productos"
                element={
                  <ProductsPage
                    app={app}
                    canCreate={["admin", "vendedor"].includes(user?.role)}
                    canEdit={user?.role === "admin"}
                    money={money}
                    onEdit={openEditProduct}
                    onNewProduct={openCreateProduct}
                    onView={setSelected}
                    products={user?.role === "admin" ? app.products : visibleProducts}
                  />
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
              <Route path="/panel/usuarios" element={<UsersPage users={app.users || []} />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate replace to={session ? "/panel" : nativeApp ? "/login" : "/"} />} />
        </Routes>
      </Suspense>

      <SaleModal
        activeShift={activeShift}
        app={app}
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

      <ProductModal
        editing={editing}
        onClose={resetProductFlow}
        open={productModal}
        productForm={productForm}
        removeProduct={removeProduct}
        saveProduct={saveProduct}
        setProductForm={setProductForm}
        storageReady={storageReady}
        uploadError={uploadError}
        uploadProductImage={uploadProductImage}
        uploading={uploading}
      />

      <ExpenseModal
        createExpense={createExpense}
        distributors={distributors || []}
        expense={expense}
        expenseCategories={expenseCategories || []}
        expenseSubmitting={expenseSubmitting}
        money={money}
        onClose={() => setExpenseModal(false)}
        open={expenseModal}
        setExpense={setExpense}
        uploadError={uploadError}
        uploadExpenseEvidence={uploadExpenseEvidence}
        uploading={uploading}
        wallet={app.wallet}
      />
      <WalletModal adjustWallet={adjustWallet} onClose={() => setWalletModal(false)} open={walletModal} setWalletForm={setWalletForm} walletForm={walletForm} />
      <ProductDetailsModal money={money} onClose={() => setSelected(null)} open={Boolean(selected)} product={selected} variant={session || nativeApp ? "default" : "public"} whatsappNumber={app.business.whatsapp} />
    </>
  );
}

export default App;
