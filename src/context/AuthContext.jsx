"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { loginRequest, getMeRequest } from "@/lib/auth";

/**
 * @type {React.Context<import('@/lib/types').AuthContextType>}
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Al cargar la app, restaurar sesión desde localStorage
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
          setToken(storedToken);
          try {
            const userData = await getMeRequest();
            setUsuario(userData);
          } catch (err) {
            // Si getMeRequest falla, simplemente no cargar el usuario
            // El usuario puede intentar iniciar sesión de nuevo
            console.warn("No se pudo restaurar sesión:", err.message);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (username, contraseña) => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Login para obtener token
      const tokenData = await loginRequest(username, contraseña);
      const accessToken = tokenData.access_token;

      // 2. Guardar token en localStorage
      localStorage.setItem("token", accessToken);
      setToken(accessToken);

      // 3. Obtener datos del usuario
      const userData = await getMeRequest();
      setUsuario(userData);
      localStorage.setItem("usuario", JSON.stringify(userData));

      return userData;
    } catch (err) {
      const errorMessage = !err.response
        ? "No se pudo conectar al servidor. Si es la primera vez que lo usa hoy, espere unos segundos e intente de nuevo."
        : (err.response?.data?.detail ??
          err.message ??
          "Error al iniciar sesión");
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUsuario(null);
    setToken(null);
    setError(null);
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        isLoading,
        error,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
