import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Icon from "../../components/ui/Icon";
import { useAppContext } from "../../context/AppContext";
import { isNativeApp } from "../../utils/platform.js";

const LOGO_URL = "/images/IcoSinFondo.png";

export default function LoginPage() {
  const navigate = useNavigate();
  const { handleLogin, loginError, loginForm, loginLoading, session, setLoginForm } = useAppContext();
  const [showPassword, setShowPassword] = useState(false);
  const nativeApp = isNativeApp();

  if (session) {
    return <Navigate replace to="/panel" />;
  }

  const submit = async (event) => {
    event.preventDefault();
    const ok = await handleLogin();
    if (ok) navigate("/panel");
  };

  return (
    <div className={`min-h-screen bg-white text-[#183325] ${nativeApp ? "px-3 py-4 sm:px-5 sm:py-6" : "px-4 py-8"}`}>
      <div className="mx-auto max-w-6xl">
        <div className={`relative overflow-hidden border border-[#dfe7db] bg-white shadow-[0_32px_90px_rgba(24,51,37,0.16)] ${nativeApp ? "min-h-[calc(100dvh-2rem)] rounded-[24px]" : "rounded-[32px]"}`}>
          <div className="relative grid min-h-[calc(100dvh-2rem)]">
          <section className="relative flex items-center bg-white px-5 py-6 sm:px-10 lg:px-12">
            <div className="relative mx-auto w-full max-w-md">
              {!nativeApp ? <button
                className="inline-flex items-center gap-2 rounded-md border border-[#d6ddd1] bg-white px-4 py-2 text-sm font-medium text-[#183325] transition duration-200 hover:border-[#c8d3c2] hover:bg-white"
                onClick={() => navigate("/")}
                type="button"
              >
                <Icon name="arrow_back" />
                Volver
              </button> : null}

              <div className={`${nativeApp ? "mt-2" : "mt-8"} flex items-center gap-4`}>
                <img alt="Sabores Tropicales" className="h-14 w-14 shrink-0 object-contain sm:h-16 sm:w-16" src={LOGO_URL} />
                <div>
                  <p className="text-lg font-semibold leading-tight text-[#183325] sm:text-xl">Sabores Tropicales y Algo Mas</p>
                </div>
              </div>

              <div className={`${nativeApp ? "mt-8" : "mt-10"}`}>
                <h1 className="mt-4 text-3xl font-semibold leading-tight text-[#183325] sm:text-4xl">Iniciar sesion</h1>
              </div>

              <div className="mt-6 rounded-[24px] border border-[#dfe7db] bg-white p-4 shadow-[0_20px_50px_rgba(24,51,37,0.1)] sm:mt-8 sm:p-6">
                <form className="grid gap-4" onSubmit={submit}>
                  <label className="grid gap-2 text-sm">
                    Correo
                    <div className="flex items-center rounded-md border border-[#d8dfd3] bg-white px-4 transition duration-200 focus-within:border-[#f59e0b] focus-within:ring-2 focus-within:ring-[#f59e0b]/20">
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
                    <div className="flex items-center rounded-md border border-[#d8dfd3] bg-white px-4 transition duration-200 focus-within:border-[#f59e0b] focus-within:ring-2 focus-within:ring-[#f59e0b]/20">
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

                  <label className="-mt-1 inline-flex w-fit items-center gap-2 text-sm font-medium text-[#5f7064]">
                    <input
                      checked={Boolean(loginForm.rememberLogin)}
                      className="h-4 w-4 rounded border-[#c8d3c2] text-[#1f7a3a]"
                      onChange={(event) => setLoginForm((current) => ({ ...current, rememberLogin: event.target.checked }))}
                      type="checkbox"
                    />
                    Recordar correo
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
              </div>
            </div>
          </section>
          </div>
        </div>
      </div>
    </div>
  );
}
