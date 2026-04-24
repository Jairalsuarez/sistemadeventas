import { useState } from "react";
import { clearSession, loginUser, logoutSupabaseSession } from "../services/authService.js";

export default function useAuthSession({ inform, personName, setSession, setSkipNextSessionRestore }) {
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [authChecking, setAuthChecking] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  const handleLogin = async () => {
    setLoginLoading(true);
    setLoginError("");
    const result = await loginUser(loginForm);
    setLoginLoading(false);

    if (!result.ok) {
      setLoginError(result.error);
      return false;
    }

    setAuthChecking(true);
    setSession(result.session);
    setLoginForm({ email: "", password: "" });
    inform(`Bienvenida, ${result.session.displayName || personName(result.session)}.`, "success");
    return true;
  };

  const logout = () => {
    setSkipNextSessionRestore(true);
    setAuthChecking(false);
    clearSession();
    logoutSupabaseSession();
    setSession(null);
  };

  return {
    loginLoading,
    authChecking,
    setAuthChecking,
    loginError,
    loginForm,
    setLoginForm,
    handleLogin,
    logout,
  };
}
