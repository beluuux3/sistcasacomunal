import { useState, useCallback } from "react";
import { getEstadisticasRequest } from "@/lib/auth";

/**
 * Hook para obtener estadísticas del dashboard desde /reportes/estadisticas
 * @returns {{ stats, charts, isLoading, error, loadStats }}
 */
export function useDashboardStats() {
  const [stats, setStats] = useState({
    total_casas: 0,
    talleres_activos: 0,
    total_participantes: 0,
  });
  const [charts, setCharts] = useState({
    porMacrodistrito: [],
    porGenero: {},
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await getEstadisticasRequest();
      setStats({
        total_casas: data?.total_casas_comunales ?? 0,
        talleres_activos: data?.total_talleres_activos ?? 0,
        total_participantes: data?.total_participantes ?? 0,
      });
      setCharts({
        porMacrodistrito: Array.isArray(data?.participantes_por_macrodistrito)
          ? data.participantes_por_macrodistrito
          : [],
        porGenero: data?.participantes_por_genero ?? {},
      });
    } catch (err) {
      const isNetworkError = !err.response;
      setError(
        isNetworkError
          ? "No se pudo conectar al servidor. El servidor puede estar iniciando, intente nuevamente en unos segundos."
          : (err.response?.data?.detail ?? err.message ?? "Error al cargar estadísticas"),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { stats, charts, isLoading, error, loadStats };
}
