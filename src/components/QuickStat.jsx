export default function QuickStat({ value, label }) {
  return (
    <div className="rounded-[22px] border border-[#123142]/10 bg-[#F6F8F8] p-4 dark:border-white/10 dark:bg-[#123142]">
      <strong className="block text-2xl font-black tracking-tight text-[#20130A] dark:text-white">{value}</strong>
      <span className="mt-1 block text-sm text-[#142026]/65 dark:text-white/70">{label}</span>
    </div>
  );
}
