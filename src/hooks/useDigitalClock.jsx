import { useEffect, useState } from "react";

export default function useDigitalClock(locale = "es-EC") {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return {
    timeLabel: new Intl.DateTimeFormat(locale, { timeStyle: "medium" }).format(now),
    dateLabel: new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" }).format(now),
  };
}
