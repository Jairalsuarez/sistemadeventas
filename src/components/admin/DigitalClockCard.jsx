import useDigitalClock from "../../hooks/useDigitalClock.jsx";

export default function DigitalClockCard() {
  const { timeLabel, dateLabel } = useDigitalClock();

  return (
    <div className="rounded-[22px] border border-[#123142]/10 bg-white p-4 shadow-[0_10px_25px_rgba(69,118,158,0.08)] dark:border-white/10 dark:bg-[#122117]">
      <span className="block text-xs font-bold uppercase tracking-[0.2em] text-[#288990] dark:text-[#75c9e3]">Hora actual</span>
      <strong className="mt-2 block text-3xl font-black tracking-tight text-[#14343f] dark:text-white">{timeLabel}</strong>
      <span className="mt-1 block text-sm capitalize text-[#45769e] dark:text-white/72">{dateLabel}</span>
    </div>
  );
}
