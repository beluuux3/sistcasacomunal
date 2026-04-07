import { useState, useCallback } from "react";
import {
  registrarAsistenciaRequest,
  getHistorialAsistenciaRequest,
} from "@/lib/auth";

/**
 * Hook para gestionar Asistencia
 * @returns {Object} Estado y funciones para registro de asistencia
 */
export function useAsistencia() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [historial, setHistorial] = useState([]);
  const [selectedTaller, setSelectedTaller] = useState(null);

  // Registrar asistencia
  const registrarAsistencia = useCallback(
    async (tallerId, fecha, registros) => {
      setIsLoading(true);
      setError("");
      try {
        await registrarAsistenciaRequest(tallerId, fecha, registros);
        return true;
      } catch (err) {
        const errorMsg =
          err.response?.data?.detail ||
          err.message ||
          "Error al registrar asistencia";
        setError(errorMsg);
        throw { message: errorMsg };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Cargar historial de asistencia
  const loadHistorial = useCallback(async (tallerId, fecha = null) => {
    setIsLoading(true);
    setError("");
    try {
      const data = await getHistorialAsistenciaRequest(tallerId, fecha);
      setHistorial(Array.isArray(data) ? data : []);
      setSelectedTaller(tallerId);
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail ||
        err.message ||
        "Error al cargar historial";
      setError(errorMsg);
      setHistorial([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    historial,
    isLoading,
    error,
    selectedTaller,
    setSelectedTaller,
    registrarAsistencia,
    loadHistorial,
  };
}
