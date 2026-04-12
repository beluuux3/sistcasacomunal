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

      console.log(
        "📊 HORARIOS COMPLETOS del facilitador:",
        horariosDelFacilitador,
      );
      if (horariosDelFacilitador.length > 0) {
        console.log(
          "🔍 PRIMER horario (JSON):",
          JSON.stringify(horariosDelFacilitador[0], null, 2),
        );
      }
      if (horariosDelFacilitador.length > 1) {
        console.log(
          "🔍 SEGUNDO horario (JSON):",
          JSON.stringify(horariosDelFacilitador[1], null, 2),
        );
      }
      console.log(
        "�📌 IDs de casas en horarios:",
        horariosDelFacilitador.map(
          (h) =>
            `Casa ID: ${h.casa_comunal_id}, Nombre: ${h.casa_nombre}, Macrodistrito: ${h.macrodistrito}`,
        ),
      );

      // Extraer casas únicas
      const casasUnicas = [
        ...new Map(
          horariosDelFacilitador.map((h) => [
            h.casa_id, // ✅ CORRECCIÓN: era casa_comunal_id, es casa_id
            {
              id: h.casa_id, // ✅ CORRECCIÓN
              nombre: h.casa_nombre,
              macrodistrito: h.macrodistrito,
            },
          ]),
        ).values(),
      ];

      console.log(
        `✅ Casas del Facilitador extraídas (${casasUnicas.length} casas):`,
        casasUnicas,
      );
      setCasasDelFacilitador(casasUnicas);

      // Si solo hay 1 casa, seleccionarla automáticamente
      if (casasUnicas.length === 1) {
        console.log("Auto-seleccionando única casa:", casasUnicas[0].nombre);
        setCasaSeleccionada(casasUnicas[0]);
        localStorage.setItem(
          `casaSeleccionada_${usuario?.id}`,
          JSON.stringify(casasUnicas[0]),
        );
      } else if (casasUnicas.length > 1) {
        // Si hay múltiples, SOLO intentar recuperar si el usuario ya seleccionó una antes
        console.log(
          `❓ Hay ${casasUnicas.length} casas, intentando restaurar selección anterior...`,
        );
        const savedCasaStr = localStorage.getItem(
          `casaSeleccionada_${usuario?.id}`,
        );
        if (savedCasaStr) {
          try {
            const savedCasa = JSON.parse(savedCasaStr);
            if (savedCasa && savedCasa.id) {
              console.log("✅ Casa anterior restaurada:", savedCasa.nombre);
              setCasaSeleccionada(savedCasa);
            }
          } catch (e) {
            // Si hay error al parsear, dejar sin casa seleccionada
            console.warn("Invalid saved casa data:", e);
            setCasaSeleccionada(null);
          }
        } else {
          // No hay selección anterior - dejar en null para que se muestre selector
          console.log(
            "❓ Sin selección anterior, esperando que usuario elija en el selector",
          );
          setCasaSeleccionada(null);
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
      localStorage.setItem(
        `casaSeleccionada_${usuario?.id}`,
        JSON.stringify(casa),
      );
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
