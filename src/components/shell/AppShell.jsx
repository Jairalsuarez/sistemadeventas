import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import Modal from "../Modal";
import NotificationPanel from "../notifications/NotificationPanel";
import Icon from "../ui/Icon";
import SideNav from "./SideNav";
import TopNav from "./TopNav";
import useClickOutside from "../../hooks/useClickOutside.jsx";

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    activeShift,
    app,
    logout,
    markAllNotificationsRead,
    markNotificationRead,
    notificationPermission,
    notifications,
    requestBrowserNotificationPermission,
    session,
    theme,
    user,
    setTheme,
  } =
    useAppContext();
  const [openNotifications, setOpenNotifications] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const notificationRef = useRef(null);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    setOpenNotifications(false);
  }, [location.pathname]);

  useClickOutside(notificationRef, openNotifications, () => setOpenNotifications(false));
  const visibleNotifications = isAdmin
    ? notifications
    : (notifications || []).filter((notification) => notification.actorId === user?.id || notification.actorName === user?.displayName);
  const visibleUnreadNotifications = visibleNotifications.filter((notification) => !notification.read).length;

  const notificationButton = (
    <div ref={notificationRef} className="relative">
      <button
        className="relative inline-flex min-w-0 items-center gap-2 rounded-md border border-[#dfe7db] bg-white px-3 py-2.5 text-sm font-medium text-[#183325] dark:border-[#314056] dark:bg-[#111827] dark:text-[#f8fafc] sm:px-4"
        onClick={async () => {
          if (notificationPermission === "default") {
            await requestBrowserNotificationPermission();
          }
          setOpenNotifications((current) => !current);
        }}
        type="button"
      >
        <Icon name="notifications" />
        <span className="hidden sm:inline">Notificaciones</span>
        {visibleUnreadNotifications ? (
          <span className="rounded-full bg-[#f97316] px-2 py-0.5 text-[11px] font-semibold text-white sm:ml-2">{visibleUnreadNotifications}</span>
        ) : null}
      </button>
      {openNotifications ? (
        <NotificationPanel
          notifications={visibleNotifications}
          onClose={() => setOpenNotifications(false)}
          onMarkAllRead={() => {
            markAllNotificationsRead();
            setOpenNotifications(false);
          }}
          onRead={(id) => {
            markNotificationRead(id);
            setOpenNotifications(false);
          }}
        />
      ) : null}
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-[#183325] dark:bg-[#0b1220] dark:text-[#f8fafc]">
      <TopNav
        activeShift={activeShift}
        businessName={app.business.nombre}
        darkMode={theme === "dark"}
        notificationButton={notificationButton}
        onLogout={() => {
          setOpenNotifications(false);
          setLogoutModalOpen(true);
        }}
        onOpenLoginPage={() => {
          setOpenNotifications(false);
          navigate("/login");
        }}
        onToggleTheme={() => {
          setOpenNotifications(false);
          setTheme((current) => (current === "dark" ? "light" : "dark"));
        }}
        session={session}
        user={user}
      />

      <div className="mx-auto flex max-w-[1440px] flex-col lg:flex-row">
        <SideNav isAdmin={isAdmin} />
        <div className="min-w-0 flex-1">
          <main className="overflow-hidden px-3 py-5 sm:px-4 sm:py-6 lg:px-6">
            <Outlet />
          </main>
        </div>
      </div>

      <Modal containerClassName="max-w-[420px] p-4" open={logoutModalOpen} onClose={() => setLogoutModalOpen(false)} text="Desea cerrar la sesion?" title="Cerrar sesion">
        <div className="mx-auto w-full max-w-[280px]">
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
            <button
              className="rounded-xl bg-[#dc2626] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#b91c1c] dark:bg-[#ef4444] dark:hover:bg-[#dc2626]"
              onClick={() => {
                setLogoutModalOpen(false);
                logout();
              }}
              type="button"
            >
              Cerrar sesion
            </button>
            <button
              className="rounded-xl border border-[#d8dee4] px-5 py-3 text-sm font-semibold text-[#1f2937] transition hover:bg-[#f8fafc] dark:border-[#334155] dark:bg-[#172033] dark:text-white dark:hover:bg-[#22304a]"
              onClick={() => setLogoutModalOpen(false)}
              type="button"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
