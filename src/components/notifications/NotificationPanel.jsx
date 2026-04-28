import Icon from "../ui/Icon";

export default function NotificationPanel({ notifications, onClose, onMarkAllRead, onRead }) {
  return (
    <div className="fixed inset-x-2 top-[5.25rem] z-50 max-h-[calc(100dvh-6rem)] overflow-hidden rounded-lg border border-[#dfe7db] bg-white p-3 shadow-[0_24px_50px_rgba(24,51,37,0.14)] dark:border-[#23314d] dark:bg-[#111827] sm:absolute sm:inset-x-auto sm:right-0 sm:top-[calc(100%+0.75rem)] sm:w-[min(360px,calc(100vw-2rem))] sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-start gap-2">
          <Icon className="mt-0.5 text-[#f97316]" name="notifications_active" />
          <div>
            <h3 className="text-sm font-semibold text-[#183325] dark:text-white">Novedades</h3>
            <p className="text-xs text-[#5b6d61] dark:text-[#94a3b8]">Aqui ves los movimientos recientes del negocio.</p>
          </div>
        </div>
        <button className="text-xs font-semibold text-[#f97316]" onClick={onMarkAllRead} type="button">
          Marcar todo
        </button>
      </div>

      <div className="mt-4 max-h-[calc(100dvh-14rem)] space-y-3 overflow-auto sm:max-h-[420px]">
        {notifications.length ? (
          notifications.map((notification) => (
            <button
              key={notification.id}
              className={`w-full rounded-lg border p-3 text-left ${notification.read ? "border-[#e7efe5]" : "border-[#f7c28f] bg-[#fff8f2] dark:border-[#f97316]/30 dark:bg-[#2b1b10]"} dark:bg-transparent`}
              onClick={() => onRead(notification.id)}
              type="button"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Icon className="text-[#1f7a3a]" name={notification.read ? "draft" : "mark_email_unread"} />
                  <strong className="text-sm font-semibold text-[#183325] dark:text-white">{notification.actorName || "Sabores Tropicales"}</strong>
                </div>
                <span className="text-[11px] text-[#738378] dark:text-[#94a3b8]">{new Date(notification.createdAt).toLocaleString("es-EC")}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-[#5b6d61] dark:text-[#c7d2e0]">{notification.message}</p>
            </button>
          ))
        ) : (
          <p className="text-sm text-[#5b6d61] dark:text-[#c7d2e0]">Todavia no hay novedades recientes.</p>
        )}
      </div>

      <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-[#dfe7db] px-3 py-2 text-sm font-medium text-[#183325] dark:border-[#314056] dark:text-[#f8fafc]" onClick={onClose} type="button">
        <Icon name="close" />
        Cerrar
      </button>
    </div>
  );
}
