const LOGO_URL = "/images/IcoSinFondo.png";

export default function AuthCheckingScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-white px-4 py-10 dark:bg-[#0b1220]">
      <img alt="Sabores Tropicales" className="auth-checking-logo h-28 w-28 object-contain" src={LOGO_URL} />
    </div>
  );
}
