import { useState, useCallback } from "react";
import {
  listGestionesRequest,
  getGestionActivaRequest,
  createGestionRequest,
  activarGestionRequest,
  getGestionCasasRequest,
  addCasaToGestionRequest,
  removeCasaFromGestionRequest,
} from "@/lib/auth";

/**
 * Hook para gestionar Gestiones Trimestrales
 * @returns {Object} Estado y funciones
 */
export function useGestiones() {
  const [gestiones, setGestiones] = useState([]);
  const [gestionActiva, setGestionActiva] = useState(null);
  const [gestionSeleccionada, setGestionSeleccionada] = useState(null);
  const [casasGestion, setCasasGestion] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Cargar todas las gestiones
  const loadGestiones = useCallback(async () => {
    setIsLoading(true);
    setError("");
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
  }, []);

  // Crear nueva gestión
  const createGestion = useCallback(
    async (anio, trimestre, fechaInicio, fechaFin) => {
      try {
        const newGestion = await createGestionRequest(
          anio,
          trimestre,
          fechaInicio,
          fechaFin,
        );
        setGestiones((prev) => [...prev, newGestion]);
        return newGestion;
      } catch (err) {
        const errorMsg =
          err.response?.data?.detail || err.message || "Error al crear gestión";
        throw { message: errorMsg };
      }
    },
    [],
  );

  // Activar gestión
  const activarGestion = useCallback(async (gestionId) => {
    try {
      const gestionActivada = await activarGestionRequest(gestionId);
      setGestionActiva(gestionActivada);
      setGestiones((prev) =>
        prev.map((g) => ({
          ...g,
          activo: g.id === gestionId,
        })),
      );
      return gestionActivada;
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail || err.message || "Error al activar gestión";
      throw { message: errorMsg };
    }
  }, []);

  // Cargar casas de una gestión
  const loadCasasGestion = useCallback(async (gestionId) => {
    try {
      const casas = await getGestionCasasRequest(gestionId);
      setCasasGestion(Array.isArray(casas) ? casas : []);
      setGestionSeleccionada(gestionId);
    } catch (err) {
      console.error("Error al cargar casas de la gestión:", err);
    }
  }, []);

  // Agregar casa a gestión
  const agregarCasaGestion = useCallback(
    async (gestionId, casaId) => {
      try {
        await addCasaToGestionRequest(gestionId, casaId);
        await loadCasasGestion(gestionId);
        return true;
      } catch (err) {
        const errorMsg =
          err.response?.data?.detail || err.message || "Error al agregar casa";
        throw { message: errorMsg };
      }
    },
    [loadCasasGestion],
  );

  // Remover casa de gestión
  const removerCasaGestion = useCallback(
    async (gestionId, casaId) => {
      try {
        await removeCasaFromGestionRequest(gestionId, casaId);
        await loadCasasGestion(gestionId);
        return true;
      } catch (err) {
        const errorMsg =
          err.response?.data?.detail || err.message || "Error al remover casa";
        throw { message: errorMsg };
      }
    },
    [loadCasasGestion],
  );

  return {
    gestiones,
    gestionActiva,
    gestionSeleccionada,
    casasGestion,
    isLoading,
    error,
    loadGestiones,
    createGestion,
    activarGestion,
    loadCasasGestion,
    agregarCasaGestion,
    removerCasaGestion,
  };
}
