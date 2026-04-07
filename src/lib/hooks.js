"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute({ children }) {
  const router = useRouter();
  const { usuario, isLoading, token } = useAuth();

  useEffect(() => {
    if (!isLoading && (!usuario || !token)) {
      router.push("/login");
    }
  }, [usuario, isLoading, token, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!usuario) {
    return null;
  }

  return children;
}

/**
 * Hook para verificar si el usuario tiene un rol específico
 * @param {string | string[]} requiredRoles
 * @returns {boolean}
 */
export function useRoleCheck(requiredRoles) {
  const { usuario } = useAuth();
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  return usuario && roles.includes(usuario.rol);
}

/**
 * Hook para verificar si el usuario es admin
 * @returns {boolean}
 */
export function useIsAdmin() {
  return useRoleCheck("Administrador");
}

/**
 * Hook para verificar si el usuario es facilitador
 * @returns {boolean}
 */
export function useIsFacilitador() {
  return useRoleCheck("Facilitador");
}
