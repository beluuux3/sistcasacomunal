import { useState, useCallback } from "react";
import { getEstadisticasRequest, listParticipantesRequest } from "@/lib/auth";
import api from "@/lib/api";

/**
 * Hook para obtener estadísticas del dashboard desde /reportes/estadisticas
 * @param {number} [casaId] - Optional casa ID for filtering to specific casa (used for facilitadores)
 * @returns {{ stats, charts, isLoading, error, loadStats }}
 */
export function useDashboardStats(casaId = null) {
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

      // Para facilitadores, obtener solo el count de participantes de su casa
      let totalParticipantes = data?.total_participantes ?? 0;
      if (casaId) {
        console.log(`📊 Obteniendo participantes para casa_id: ${casaId}`);
        try {
          // Obtener todos los participantes SIN parámetros
          const response = await api.get("/participantes");
          const participantesData = response.data;

          console.log(`📋 ESTRUCTURA COMPLETA de response:`, participantesData);
          console.log(
            `📋 Tipo de participantesData:`,
            typeof participantesData,
          );
          console.log(
            `📋 Keys del response:`,
            Object.keys(participantesData || {}),
          );

          // Intentar entender la estructura
          let participantsArray = [];
          if (Array.isArray(participantesData)) {
            console.log("✅ participantesData es un array");
            participantsArray = participantesData;
          } else if (
            participantesData?.items &&
            Array.isArray(participantesData.items)
          ) {
            console.log("✅ participantesData.items es un array");
            participantsArray = participantesData.items;
          } else if (
            participantesData?.data &&
            Array.isArray(participantesData.data)
          ) {
            console.log("✅ participantesData.data es un array");
            participantsArray = participantesData.data;
          }

          console.log(`🔍 Array de participantes:`, participantsArray);
          if (participantsArray.length > 0) {
            console.log(
              `🔍 Primer participante:`,
              JSON.stringify(participantsArray[0], null, 2),
            );
          }

          // Filtrar por casa seleccionada
          const participantesDelaCasa = participantsArray.filter((p) => {
            return p?.casa_comunal_id === casaId;
          });

          totalParticipantes = participantesDelaCasa.length;
          console.log(
            `📌 Participantes filtrados para casa ${casaId}: ${totalParticipantes}`,
            participantesDelaCasa,
          );
        } catch (err) {
          console.error(
            `❌ Error al obtener participantes de la casa ${casaId}:`,
            err,
          );
          // Usar el total general si hay error
        }
      }

      setStats({
        total_casas: data?.total_casas_comunales ?? 0,
        talleres_activos: data?.total_talleres_activos ?? 0,
        total_participantes: totalParticipantes,
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
          : (err.response?.data?.detail ??
              err.message ??
              "Error al cargar estadísticas"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [casaId]);

  return { stats, charts, isLoading, error, loadStats };
}
