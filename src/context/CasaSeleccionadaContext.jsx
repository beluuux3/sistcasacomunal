"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { getGrillaHorariosRequest } from "@/lib/auth";

const CasaSeleccionadaContext = createContext();

export function CasaSeleccionadaProvider({ children }) {
  const { usuario } = useAuth();
  const [casasDelFacilitador, setCasasDelFacilitador] = useState([]);
  const [casaSeleccionada, setCasaSeleccionada] = useState(null);
  const [isLoadingCasas, setIsLoadingCasas] = useState(false);

  // Cargar casas del facilitador desde sus horarios
  useEffect(() => {
    if (usuario?.rol === "Facilitador" && usuario?.id) {
      loadCasasFacilitador();
    } else if (usuario?.rol !== "Facilitador") {
      // Si no es facilitador, limpiar
      setCasasDelFacilitador([]);
      setCasaSeleccionada(null);
    }
  }, [usuario?.id, usuario?.rol]);

  const loadCasasFacilitador = async () => {
    setIsLoadingCasas(true);
    try {
      // Obtener todos los horarios del facilitador
      const horarios = await getGrillaHorariosRequest(null, null, null);

      // Filtrar solo los horarios del facilitador actual
      const horariosDelFacilitador = horarios.filter(
        (h) => h.facilitador_id === usuario?.id,
      );

      // Extraer casas únicas
      const casasUnicas = [
        ...new Map(
          horariosDelFacilitador.map((h) => [
            h.casa_comunal_id,
            {
              id: h.casa_comunal_id,
              nombre: h.casa_nombre,
              macrodistrito: h.macrodistrito,
            },
          ]),
        ).values(),
      ];

      setCasasDelFacilitador(casasUnicas);

      // Si solo hay 1 casa, seleccionarla automáticamente
      if (casasUnicas.length === 1) {
        setCasaSeleccionada(casasUnicas[0]);
        localStorage.setItem(
          `casaSeleccionada_${usuario?.id}`,
          casasUnicas[0].id,
        );
      } else if (casasUnicas.length > 1) {
        // Si hay múltiples, intentar recuperar la última seleccionada
        const savedCasaId = localStorage.getItem(
          `casaSeleccionada_${usuario?.id}`,
        );
        const savedCasa = casasUnicas.find(
          (c) => c.id === parseInt(savedCasaId),
        );
        if (savedCasa) {
          setCasaSeleccionada(savedCasa);
        }
      }
    } catch (err) {
      console.error("Error loading casas del facilitador:", err);
      setCasasDelFacilitador([]);
    } finally {
      setIsLoadingCasas(false);
    }
  };

  const handleSelectCasa = (casa) => {
    setCasaSeleccionada(casa);
    if (usuario?.id) {
      localStorage.setItem(`casaSeleccionada_${usuario?.id}`, casa.id);
    }
  };

  const handleDeselectCasa = () => {
    setCasaSeleccionada(null);
    if (usuario?.id) {
      localStorage.removeItem(`casaSeleccionada_${usuario?.id}`);
    }
  };

  return (
    <CasaSeleccionadaContext.Provider
      value={{
        casasDelFacilitador,
        casaSeleccionada,
        selectCasa: handleSelectCasa,
        deselectCasa: handleDeselectCasa,
        isLoadingCasas,
        reloadCasas: loadCasasFacilitador,
      }}
    >
      {children}
    </CasaSeleccionadaContext.Provider>
  );
}

export function useCasaSeleccionada() {
  const context = useContext(CasaSeleccionadaContext);
  if (!context) {
    throw new Error(
      "useCasaSeleccionada debe ser usado dentro de CasaSeleccionadaProvider",
    );
  }
  return context;
}
