import { Suspense, lazy } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import ProductDetailsModal from "./components/modals/ProductDetailsModal";
import ExpenseModal from "./components/modals/ExpenseModal";
import ProductModal from "./components/modals/ProductModal";
import SaleModal from "./components/modals/SaleModal";
import WalletModal from "./components/modals/WalletModal";
import ToastViewport from "./components/notifications/ToastViewport";
import CookieBanner from "./components/CookieBanner.jsx";
import PageSkeleton from "./components/ui/PageSkeleton.jsx";
import { useAppContext } from "./context/AppContext";
import PanelLayout from "./layouts/PanelLayout.jsx";
import ProtectedRoute from "./routes/ProtectedRoute";

const ProfilePage = lazy(() => import("./pages/account/ProfilePage.jsx"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage.jsx"));
const ProductsPage = lazy(() => import("./pages/catalog/ProductsPage.jsx"));
const PublicCatalogPage = lazy(() => import("./pages/catalog/PublicCatalogPage.jsx"));
const PublicSearchResultsPage = lazy(() => import("./pages/catalog/PublicSearchResultsPage.jsx"));
const AboutPage = lazy(() => import("./pages/public/AboutPage.jsx"));
const CommunityPage = lazy(() => import("./pages/public/CommunityPage.jsx"));
const DirectionsPage = lazy(() => import("./pages/public/DirectionsPage.jsx"));
const HomePage = lazy(() => import("./pages/public/HomePage.jsx"));
const DashboardPage = lazy(() => import("./pages/dashboard/DashboardPage.jsx"));
const WalletPage = lazy(() => import("./pages/finance/WalletPage.jsx"));
const SchedulePage = lazy(() => import("./pages/admin/SchedulePage.jsx"));
const UsersPage = lazy(() => import("./pages/admin/UsersPage.jsx"));
const CommunityAdminPage = lazy(() => import("./pages/admin/CommunityAdminPage.jsx"));
const SalesAnalyticsPage = lazy(() => import("./pages/admin/SalesAnalyticsPage.jsx"));

function App() {
  const navigate = useNavigate();
  const {
    activeShift,
    app,
    createExpense,
    createSale,
    createSchedule,
    deleteCommunityFeedback,
    deleteSchedule,
    dismissToast,
    editing,
    expense,
    expenseCategories,
    expenseModal,
    expenseSubmitting,
    feedbackSubmitting,
    money,
    openCreateProduct,
    openEditProduct,
    openSaleFlow,
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
    submitCommunityFeedback,
    setExpense,
    setExpenseModal,
    setProductForm,
    setSaleLines,
    setSaleModal,
    setSalePayment,
    setScheduleForm,
    setSelected,
    setWalletForm,
    setWalletModal,
    storageReady,
    toasts,
    upcomingSchedules,
    uploading,
    updateScheduleStatus,
    uploadProductImage,
    uploadExpenseEvidence,
    uploadSaleEvidence,
    uploadProfileAvatar,
    user,
    visibleProducts,
    walletForm,
    walletModal,
    adjustWallet,
    communityFeedbacks,
    distributors,
  } = useAppContext();

  return (
    <>
      <CookieBanner />
      <ToastViewport onDismiss={dismissToast} toasts={toasts} />
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route
            path="/"
            element={<HomePage app={app} onOpenLoginPage={() => navigate("/login")} />}
          />
          <Route
            path="/productos"
            element={
              <PublicCatalogPage
                app={app}
                communityFeedbacks={communityFeedbacks}
                feedbackSubmitting={feedbackSubmitting}
                money={money}
                onOpenLoginPage={() => navigate("/login")}
                onSubmitFeedback={submitCommunityFeedback}
                onView={setSelected}
                products={visibleProducts}
              />
            }
          />
          <Route
            path="/productos/resultados"
            element={
              <PublicSearchResultsPage
                app={app}
                money={money}
                onOpenLoginPage={() => navigate("/login")}
                onView={setSelected}
                products={visibleProducts}
              />
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/about-us" element={<AboutPage app={app} />} />
          <Route path="/comunidad" element={<CommunityPage app={app} feedbacks={communityFeedbacks} />} />
          <Route path="/como-llegar" element={<DirectionsPage app={app} />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<PanelLayout />}>
              <Route
                index
                path="/panel"
                element={
                  <DashboardPage
                    onNewProduct={openCreateProduct}
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
                    canEdit={user?.role === "admin"}
                    money={money}
                    onEdit={openEditProduct}
                    onNewProduct={openCreateProduct}
                    onView={setSelected}
                    products={visibleProducts}
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
              <Route path="/panel/comentarios" element={<CommunityAdminPage feedbacks={communityFeedbacks} onDelete={deleteCommunityFeedback} />} />
              <Route path="/panel/analitica" element={<SalesAnalyticsPage expenses={app.expenses || []} money={money} sales={app.sales || []} />} />
              <Route path="/panel/usuarios" element={<UsersPage users={app.users || []} />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate replace to={session ? "/panel" : "/"} />} />
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
        uploadSaleEvidence={uploadSaleEvidence}
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
        uploadProductImage={uploadProductImage}
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
        uploadExpenseEvidence={uploadExpenseEvidence}
        uploading={uploading}
        wallet={app.wallet}
      />
      <WalletModal adjustWallet={adjustWallet} onClose={() => setWalletModal(false)} open={walletModal} setWalletForm={setWalletForm} walletForm={walletForm} />
      <ProductDetailsModal money={money} onClose={() => setSelected(null)} open={Boolean(selected)} product={selected} variant={session ? "default" : "public"} whatsappNumber={app.business.whatsapp} />
    </>
  );
}

export default App;
