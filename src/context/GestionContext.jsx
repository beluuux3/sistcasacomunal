"use client";

import React, { createContext, useState, useEffect, useCallback } from "react";
import {
  listGestionesRequest,
  getGestionActivaRequest,
  activarGestionRequest,
} from "@/lib/auth";

export const GestionContext = createContext();

export function GestionProvider({ children }) {
  const [gestionActiva, setGestionActiva] = useState(null);
  const [gestiones, setGestiones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar gestiones al montar
  useEffect(() => {
    const cargarGestiones = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [gestionesData, gestionActivaData] = await Promise.all([
          listGestionesRequest(),
          getGestionActivaRequest(),
        ]);

        setGestiones(Array.isArray(gestionesData) ? gestionesData : []);
        setGestionActiva(gestionActivaData || null);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            err.message ||
            "Error al cargar gestiones",
        );
      } finally {
        setIsLoading(false);
      }
    };

    cargarGestiones();
  }, []);

  // Cambiar gestión vista (solo frontend, sin backend)
  const cambiarGestion = useCallback(
    (id) => {
      const gestion = gestiones.find((g) => g.id === id);
      if (gestion) {
        setGestionActiva(gestion);
      }
    },
    [gestiones],
  );

  // Activar gestión (backend se encarga de desactivar la anterior)
  const activarGestion = useCallback(async (id) => {
    try {
      const gestionActivada = await activarGestionRequest(id);
      setGestionActiva(gestionActivada);
      setGestiones((prevGestiones) =>
        prevGestiones.map((g) => ({
          ...g,
          activo: g.id === id,
        })),
      );
    } catch (err) {
      throw new Error(
        err.response?.data?.detail || err.message || "Error al activar gestión",
      );
    }
  }, []);

  // Recargar listado de gestiones
  const recargarGestiones = useCallback(async () => {
    try {
      const gestionesData = await listGestionesRequest();
      setGestiones(Array.isArray(gestionesData) ? gestionesData : []);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Error al recargar gestiones",
      );
    }
  }, []);

  const value = {
    gestionActiva,
    gestiones,
    cambiarGestion,
    activarGestion,
    recargarGestiones,
    isLoading,
    error,
  };

  return (
    <GestionContext.Provider value={value}>{children}</GestionContext.Provider>
  );
}

/**
 * Hook para usar el contexto de gestiones
 * @returns {GestionContextType}
 */
export function useGestion() {
  const context = React.useContext(GestionContext);
  if (!context) {
    throw new Error("useGestion must be used within GestionProvider");
  }
  return context;
}
