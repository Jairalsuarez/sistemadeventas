import Icon from "./Icon.jsx";

export default function AuthCheckingScreen() {
  return (
    <div className="min-h-screen bg-white px-4 py-10 text-[#183325] dark:bg-[#0b1220] dark:text-[#f8fafc]">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-[1440px] items-center justify-center">
        <div className="w-full max-w-xl rounded-[28px] border border-[#e4ece2] bg-white px-8 py-10 text-center shadow-[0_30px_80px_rgba(24,51,37,0.08)] dark:border-[#23314d] dark:bg-[#111827] dark:shadow-[0_30px_80px_rgba(2,6,23,0.45)]">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center">
            <div className="relative h-24 w-24">
              <div className="absolute inset-0 rounded-full border border-[#d9e4d9] dark:border-[#314056]" />
              <div className="absolute inset-[10px] rounded-full border border-[#e9f2eb] dark:border-[#1e293b]" />
              <div className="absolute inset-0 animate-spin rounded-full border-[4px] border-transparent border-t-[#15803d] border-r-[#4ade80] shadow-[0_0_24px_rgba(21,128,61,0.22)] dark:border-t-[#2563eb] dark:border-r-[#60a5fa] dark:shadow-[0_0_24px_rgba(37,99,235,0.28)]" />
              <div className="absolute inset-[22px] grid place-items-center rounded-full bg-white shadow-[0_14px_34px_rgba(15,23,42,0.12)] dark:bg-[#0f172a] dark:shadow-[0_14px_34px_rgba(2,6,23,0.38)]">
                <Icon className="text-[28px] text-[#15803d] dark:text-[#93c5fd]" name="lock" />
              </div>
            </div>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-[#183325] dark:text-[#f8fafc] sm:text-4xl">
            Autenticando acceso
          </h1>

          <div className="mt-7 flex items-center justify-center gap-2">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#15803d] dark:bg-[#2563eb]" />
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#22c55e] [animation-delay:150ms] dark:bg-[#60a5fa]" />
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#86efac] [animation-delay:300ms] dark:bg-[#93c5fd]" />
          </div>
        </div>
      </div>
    </div>
  );
}
