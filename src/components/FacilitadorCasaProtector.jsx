"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCasaSeleccionada } from "@/context/CasaSeleccionadaContext";

export function FacilitadorCasaProtector({ children }) {
  const { usuario, isLoading } = useAuth();
  const { casaSeleccionada, casasDelFacilitador, isLoadingCasas } =
    useCasaSeleccionada();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading || isLoadingCasas) {
      return;
    }

    if (usuario?.rol !== "Facilitador" || casasDelFacilitador.length <= 1) {
      return;
    }

    if (pathname?.includes("/seleccionar-casa")) {
      return;
    }

    if (!casaSeleccionada?.id) {
      router.push("/seleccionar-casa");
    }
  }, [
    usuario?.rol,
    casaSeleccionada?.id,
    casasDelFacilitador.length,
    pathname,
    router,
    isLoading,
    isLoadingCasas,
  ]);

  return children;
}
