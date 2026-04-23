import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import NotificationPanel from "../notifications/NotificationPanel";
import Icon from "../ui/Icon";
import SideNav from "./SideNav";
import TopNav from "./TopNav";
import useClickOutside from "../../hooks/useClickOutside.jsx";

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeShift, app, logout, markAllNotificationsRead, markNotificationRead, notifications, session, theme, unreadNotifications, user, setTheme } =
    useAppContext();
  const [openNotifications, setOpenNotifications] = useState(false);
  const notificationRef = useRef(null);
  const isAdmin = ["admin", "superadmin"].includes(user?.role);
  const canManageUsers = user?.role === "superadmin";

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
        className="relative inline-flex items-center gap-2 rounded-md border border-[#dfe7db] px-4 py-2.5 text-sm font-medium text-[#183325] dark:border-white/10 dark:text-white"
        onClick={() => setOpenNotifications((current) => !current)}
        type="button"
      >
        <Icon name="notifications" />
        Notificaciones
        {visibleUnreadNotifications ? (
          <span className="ml-2 rounded-full bg-[#f97316] px-2 py-0.5 text-[11px] font-semibold text-white">{visibleUnreadNotifications}</span>
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
    <div className="min-h-screen bg-white text-[#183325] dark:bg-[#0d1710] dark:text-white">
      <TopNav
        activeShift={activeShift}
        businessName={app.business.nombre}
        darkMode={theme === "dark"}
        notificationButton={notificationButton}
        onLogout={() => {
          setOpenNotifications(false);
          logout();
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

      <div className="mx-auto flex max-w-[1440px]">
        <SideNav canManageUsers={canManageUsers} isAdmin={isAdmin} />
        <div className="min-w-0 flex-1">
          <main className="px-4 py-6 lg:px-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
