import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import Modal from "../Modal";
import NotificationPanel from "../notifications/NotificationPanel";
import Icon from "../ui/Icon";
import SideNav from "./SideNav";
import TopNav from "./TopNav";
import useClickOutside from "../../hooks/useClickOutside.jsx";
import { isNativeApp } from "../../utils/platform.js";

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const nativeApp = isNativeApp();
  const {
    activeShift,
    app,
    logout,
    markAllNotificationsRead,
    markNotificationRead,
    notificationPermission,
    notifications,
    refreshAppData,
    requestBrowserNotificationPermission,
    session,
    theme,
    user,
    setTheme,
  } =
    useAppContext();
  const [openNotifications, setOpenNotifications] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pullState, setPullState] = useState({ active: false, armed: false, cancelled: false, startY: 0, distance: 0, maxDistance: 0, refreshing: false });
  const [isOnline, setIsOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));
  const notificationRef = useRef(null);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    setOpenNotifications(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!nativeApp || !session) return;
    if (notificationPermission !== "default") return;
    requestBrowserNotificationPermission();
  }, [nativeApp, notificationPermission, requestBrowserNotificationPermission, session]);

  useEffect(() => {
    const updateOnlineState = () => setIsOnline(typeof navigator === "undefined" ? true : navigator.onLine);
    window.addEventListener("online", updateOnlineState);
    window.addEventListener("offline", updateOnlineState);
    return () => {
      window.removeEventListener("online", updateOnlineState);
      window.removeEventListener("offline", updateOnlineState);
    };
  }, []);

  useClickOutside(notificationRef, openNotifications, () => setOpenNotifications(false));
  const visibleNotifications = isAdmin
    ? notifications
    : (notifications || []).filter((notification) => notification.actorId === user?.id || notification.actorName === user?.displayName);
  const visibleUnreadNotifications = visibleNotifications.filter((notification) => !notification.read).length;

  const notificationButton = (
    <div ref={notificationRef} className="relative">
      <button
        className={`relative inline-flex min-w-0 items-center gap-2 border border-[#dfe7db] bg-white text-sm font-medium text-[#183325] dark:border-[#314056] dark:bg-[#111827] dark:text-[#f8fafc] ${nativeApp ? "h-11 rounded-xl px-3" : "rounded-md px-3 py-2.5 sm:px-4"}`}
        onClick={() => {
          setOpenNotifications((current) => !current);
          if (notificationPermission === "default") {
            requestBrowserNotificationPermission();
          }
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
        mobileMenuButton={
          nativeApp ? (
            <button
              aria-label="Abrir menu"
              aria-expanded={mobileMenuOpen}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-[#dfe7db] bg-white text-[26px] text-[#183325] shadow-[0_8px_18px_rgba(15,23,42,0.08)] transition-colors active:bg-[#f4f7f2] dark:border-[#314056] dark:bg-[#111827] dark:text-[#f8fafc] dark:active:bg-[#182235]"
              onClick={(event) => {
                event.preventDefault();
                setMobileMenuOpen((current) => !current);
              }}
              type="button"
            >
              <Icon name="menu" />
            </button>
          ) : null
        }
        session={session}
        user={user}
      />

      <div className="mx-auto flex max-w-[1440px] flex-col lg:flex-row">
        <SideNav businessName={app.business.nombre} isAdmin={isAdmin} onClose={() => setMobileMenuOpen(false)} open={mobileMenuOpen} user={user} />
        <div className="min-w-0 flex-1">
          {!isOnline ? (
            <div className="mx-3 mt-3 rounded-xl border border-[#f7c28f] bg-[#fff8f2] px-4 py-3 text-sm font-semibold text-[#9a3412] dark:border-[#f97316]/30 dark:bg-[#2b1b10] dark:text-[#fdba74] sm:mx-4 lg:mx-6">
              Sin conexion. Puedes revisar datos guardados, pero los cambios pueden tardar en sincronizar.
            </div>
          ) : null}
          <main
            className={`relative overflow-hidden px-3 py-5 sm:px-4 sm:py-6 lg:px-6 ${nativeApp ? "pb-6 lg:pb-6" : ""}`}
            onTouchEnd={async () => {
              if (!nativeApp || !pullState.active) return;
              const shouldRefresh = pullState.armed && !pullState.cancelled && pullState.distance >= 94;
              setPullState((current) => ({ ...current, active: false, refreshing: shouldRefresh, distance: shouldRefresh ? 56 : 0 }));
              if (shouldRefresh) {
                await refreshAppData?.();
                setPullState({ active: false, armed: false, cancelled: false, startY: 0, distance: 0, maxDistance: 0, refreshing: false });
              } else {
                setPullState({ active: false, armed: false, cancelled: false, startY: 0, distance: 0, maxDistance: 0, refreshing: false });
              }
            }}
            onTouchMove={(event) => {
              if (!nativeApp || !pullState.active || window.scrollY > 0) return;
              const distance = Math.max(0, Math.min(110, (event.touches[0].clientY - pullState.startY) * 0.55));
              const maxDistance = Math.max(pullState.maxDistance, distance);
              const armed = pullState.armed || distance > 94;
              const cancelled = armed && distance < 92;
              if (distance > 4) event.preventDefault();
              setPullState((current) => ({ ...current, armed, cancelled, distance, maxDistance }));
            }}
            onTouchStart={(event) => {
              if (!nativeApp || window.scrollY > 0 || pullState.refreshing) return;
              setPullState({ active: true, armed: false, cancelled: false, startY: event.touches[0].clientY, distance: 0, maxDistance: 0, refreshing: false });
            }}
          >
            {nativeApp ? (
              <div
                className="pointer-events-none absolute inset-x-0 top-0 z-30 flex justify-center transition-transform"
                style={{ transform: `translateY(${Math.max(-52, pullState.distance - 52)}px)` }}
              >
                <div className={`mt-1 inline-flex h-10 min-w-10 items-center justify-center rounded-full border bg-white px-3 text-[#183325] shadow-[0_10px_22px_rgba(15,23,42,0.12)] transition-colors dark:bg-[#111827] dark:text-[#f8fafc] ${
                  pullState.cancelled ? "border-[#fecaca] text-[#dc2626] dark:border-[#7f1d1d] dark:text-[#fca5a5]" : "border-[#dfe7db] dark:border-[#314056]"
                }`}>
                  <Icon className={`${pullState.refreshing ? "animate-spin" : ""}`} name={pullState.cancelled ? "close" : pullState.armed ? "sync" : "keyboard_arrow_down"} />
                  {pullState.armed && !pullState.refreshing && !pullState.cancelled ? <span className="ml-2 text-xs font-semibold">Suelta</span> : null}
                </div>
              </div>
            ) : null}
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
