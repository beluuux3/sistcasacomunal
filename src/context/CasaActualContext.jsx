"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

/**
 * Contexto que almacena la casa comunal actualmente seleccionada
 * para facilitadores con múltiples asignaciones.
 *
 * Estructura:
 * {
 *   casaId: number,
 *   casaNombre: string,
 *   macrodistrito?: string,
 *   facilitadorId?: number
 * }
 */
const CasaActualContext = createContext(null);

export const CasaActualProvider = ({ children }) => {
  const [casaActual, setCasaActual] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restaurar casa seleccionada del localStorage al montar
  useEffect(() => {
    try {
      const stored = localStorage.getItem("casaActual");
      if (stored) {
        const parsed = JSON.parse(stored);
        setCasaActual(parsed);
      }
    } catch (err) {
      console.warn("Error restaurando casa actual:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Selecciona una casa y la persiste en localStorage
   */
  const selectCasa = (casa) => {
    if (!casa || !casa.id) {
      console.error("Casa inválida:", casa);
      return;
    }
    const casaData = {
      casaId: casa.id,
      casaNombre: casa.nombre || casa.casa_nombre,
      macrodistrito: casa.macrodistrito,
      facilitadorId: casa.facilitador_id,
    };
    setCasaActual(casaData);
    localStorage.setItem("casaActual", JSON.stringify(casaData));
  };

  /**
   * Limpia la casa seleccionada (ej: al logout)
   */
  const resetCasa = () => {
    setCasaActual(null);
    localStorage.removeItem("casaActual");
  };

  return (
    <CasaActualContext.Provider
      value={{ casaActual, selectCasa, resetCasa, loading }}
    >
      {children}
    </CasaActualContext.Provider>
  );
};

/**
 * Hook para acceder al contexto de casa actual
 */
export const useCasaActual = () => {
  const context = useContext(CasaActualContext);
  if (!context) {
    throw new Error("useCasaActual debe usarse dentro de <CasaActualProvider>");
  }
  return context;
};
