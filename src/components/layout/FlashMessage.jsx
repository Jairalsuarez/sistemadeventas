export default function FlashMessage({ message }) {
  if (!message) return null;

  return (
    <div className="mb-5 rounded-2xl border border-[#123142]/10 bg-[#E9F0C9] px-4 py-3 text-sm font-semibold text-[#123142] dark:border-white/10 dark:bg-[#123142] dark:text-[#E9F0C9]">
      {message}
    </div>
  );
}
