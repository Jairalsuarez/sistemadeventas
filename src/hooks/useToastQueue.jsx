import { useEffect, useState } from "react";

export default function useToastQueue(limit = 4, duration = 3500) {
  const [toasts, setToasts] = useState([]);

  const pushToast = (message, type = "info") => {
    setToasts((current) => [...current, { id: crypto.randomUUID(), message, type }].slice(-limit));
  };

  const dismissToast = (id) => setToasts((current) => current.filter((toast) => toast.id !== id));

  useEffect(() => {
    if (!toasts.length) return undefined;
    const timer = window.setTimeout(() => dismissToast(toasts[0].id), duration);
    return () => window.clearTimeout(timer);
  }, [duration, toasts]);

  return { toasts, pushToast, dismissToast };
}
