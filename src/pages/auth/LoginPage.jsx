import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Icon from "../../components/ui/Icon";
import { useAppContext } from "../../context/AppContext";

const LOGIN_SLIDES = [
  { src: "/carrusel/IMG_20260421_143641_455.jpg", type: "image" },
  { src: "/carrusel/IMG_20260421_143712_458.jpg", type: "image" },
  { src: "/carrusel/IMG_20260421_143742_848.jpg", type: "image" },
  { src: "/carrusel/IMG_20260421_143755_378.jpg", type: "image" },
  { src: "/carrusel/IMG_20260421_143818_910.jpg", type: "image" },
  { src: "/carrusel/VID_20260421_143905.mp4", type: "video" },
  { src: "/carrusel/IMG_20260421_143840_153.jpg", type: "image" },
];

const LOGO_URL = "/images/IcoSinFondo.png";

export default function LoginPage() {
  const navigate = useNavigate();
  const { handleLogin, loginError, loginForm, loginLoading, session, setLoginForm } = useAppContext();
  const [showPassword, setShowPassword] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const timeoutRef = useRef(null);
  const activeSlide = useMemo(() => LOGIN_SLIDES[activeIndex] || LOGIN_SLIDES[0], [activeIndex]);

  useEffect(() => {
    if (!activeSlide || activeSlide.type !== "image") return undefined;
    timeoutRef.current = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % LOGIN_SLIDES.length);
    }, 30000);

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [activeSlide]);

  const nextSlide = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setActiveIndex((current) => (current + 1) % LOGIN_SLIDES.length);
  };

  if (session) {
    return <Navigate replace to="/panel" />;
  }

  const submit = async (event) => {
    event.preventDefault();
    const ok = await handleLogin();
    if (ok) navigate("/panel");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f7f5ef_0%,#eef3ec_42%,#f5f7f4_100%)] px-4 py-8 text-[#183325]">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[32px] border border-[#dfe7db] bg-white/80 shadow-[0_32px_90px_rgba(24,51,37,0.16)] backdrop-blur-sm">
          <div className="relative grid min-h-[720px] lg:grid-cols-[1.04fr_0.96fr]">
          <section className="relative hidden lg:block">
            {activeSlide?.type === "video" ? (
              <video
                autoPlay
                className="h-full w-full object-cover"
                key={activeSlide.src}
                muted
                onEnded={nextSlide}
                playsInline
                src={activeSlide.src}
              />
            ) : (
              <img alt="Sabores Tropicales" className="h-full w-full object-cover" src={activeSlide?.src} />
            )}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,24,16,0.08),rgba(13,24,16,0.38))]" />
            <div className="absolute inset-x-8 bottom-8 rounded-[22px] border border-white/16 bg-[rgba(20,24,18,0.30)] px-5 py-4 text-white backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/74">Sabores Tropicales</p>
              <p className="mt-2 text-[1.7rem] font-semibold leading-tight tracking-[-0.02em]">Acceso unicamente para administradores</p>
              <p className="mt-1.5 text-sm leading-6 text-white/74">
                Ingresa con tu cuenta autorizada para continuar.
              </p>
            </div>
          </section>

          <section className="relative flex items-center bg-[rgba(251,249,244,0.9)] px-6 py-8 sm:px-10 lg:px-12">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(247,244,238,0.88))]" />
            <div className="relative mx-auto w-full max-w-md">
              <button
                className="inline-flex items-center gap-2 rounded-md border border-[#d6ddd1] bg-white/70 px-4 py-2 text-sm font-medium text-[#183325] transition duration-200 hover:border-[#c8d3c2] hover:bg-white"
                onClick={() => navigate("/")}
                type="button"
              >
                <Icon name="arrow_back" />
                Volver
              </button>

              <div className="mt-8 flex items-center gap-4">
                <img alt="Sabores Tropicales" className="h-16 w-16 shrink-0 object-contain" src={LOGO_URL} />
                <div>
                  <p className="text-xl font-semibold text-[#183325]">Sabores Tropicales y Algo Mas</p>
                  <p className="mt-1 text-sm text-[#5f7064]">Acceso administrativo</p>
                </div>
              </div>

              <div className="mt-10">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f97316]">Acceso interno</p>
                <h1 className="mt-4 text-4xl font-semibold leading-tight text-[#183325]">Iniciar sesion</h1>
                <p className="mt-3 text-sm leading-7 text-[#5f7064]">Solo para administradores.</p>
              </div>

              <div className="mt-8 rounded-[28px] border border-white/70 bg-[rgba(255,252,247,0.76)] p-6 shadow-[0_20px_50px_rgba(24,51,37,0.1)] backdrop-blur-md">
                <form className="grid gap-4" onSubmit={submit}>
                  <label className="grid gap-2 text-sm">
                    Correo
                    <div className="flex items-center rounded-md border border-[#d8dfd3] bg-white/80 px-4 transition duration-200 focus-within:border-[#f59e0b] focus-within:ring-2 focus-within:ring-[#f59e0b]/20">
                      <Icon className="text-[#748377]" name="mail" />
                      <input
                        className="w-full border-0 bg-transparent px-3 py-3.5 text-[#183325] outline-none placeholder:text-[#7a877d]"
                        onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                        placeholder="correo@empresa.com"
                        required
                        type="email"
                        value={loginForm.email}
                      />
                    </div>
                  </label>

                  <label className="grid gap-2 text-sm">
                    Contrasena
                    <div className="flex items-center rounded-md border border-[#d8dfd3] bg-white/80 px-4 transition duration-200 focus-within:border-[#f59e0b] focus-within:ring-2 focus-within:ring-[#f59e0b]/20">
                      <Icon className="text-[#748377]" name="lock" />
                      <input
                        className="w-full border-0 bg-transparent px-3 py-3.5 text-[#183325] outline-none placeholder:text-[#7a877d]"
                        onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                        placeholder="Tu contrasena"
                        required
                        type={showPassword ? "text" : "password"}
                        value={loginForm.password}
                      />
                      <button className="inline-flex items-center text-[#748377] transition hover:text-[#183325]" onClick={() => setShowPassword((current) => !current)} type="button">
                        <Icon name={showPassword ? "visibility_off" : "visibility"} />
                      </button>
                    </div>
                  </label>

                  {loginError ? (
                    <div className="rounded-md border border-[#7f1d1d] bg-[#3c1116] px-4 py-3 text-sm text-[#fecaca]">{loginError}</div>
                  ) : null}

                  <button
                    className="group mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-[linear-gradient(135deg,#1f7a3a,#2b8e46)] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(31,122,58,0.22)] transition duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60"
                    disabled={loginLoading}
                    type="submit"
                  >
                    <span className="transition duration-200 group-hover:translate-x-0.5">
                      <Icon name="login" />
                    </span>
                    {loginLoading ? "Autenticando..." : "Entrar al panel"}
                  </button>
                </form>

                <div className="mt-5 border-t border-[#d7ddd1] pt-4 text-xs leading-6 text-[#6f7f73]">
                  Acceso protegido para personal autorizado.
                </div>
              </div>
            </div>
          </section>
          </div>
        </div>
      </div>
    </div>
  );
}
