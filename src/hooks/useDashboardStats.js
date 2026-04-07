import { useState, useCallback } from "react";
import { getEstadisticasRequest } from "@/lib/auth";

/**
 * Hook para obtener estadísticas del dashboard
 * @returns {Object} Estadísticas y funciones de carga
 */
export function useDashboardStats() {
  const [stats, setStats] = useState({
    total_casas: 0,
    talleres_activos: 0,
    total_participantes: 0,
    total_facilitadores: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await getEstadisticasRequest();
      setStats({
        total_casas: data?.total_casas || 0,
        talleres_activos: data?.talleres_activos || 0,
        total_participantes: data?.total_participantes || 0,
        total_facilitadores: data?.total_facilitadores || 0,
      });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Error al cargar estadísticas",
      );
      // Mantener valores previos en caso de error
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    stats,
    isLoading,
    error,
    loadStats,
  };
}
