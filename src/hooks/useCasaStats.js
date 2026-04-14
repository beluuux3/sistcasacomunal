import { useState, useCallback, useEffect } from "react";
import { listParticipantesRequest } from "@/lib/auth";

/**
 * Hook para obtener estadísticas de una casa específica (SOLO para facilitadores)
 * @param {number} [casaId] - Casa ID del facilitador
 * @returns {{ stats, isLoading, error, loadStats }}
 */
export function useCasaStats(casaId = null) {
  const [stats, setStats] = useState({
    total_participantes: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Limpiar estado inmediatamente cuando cambia casaId
  useEffect(() => {
    if (casaId) {
      setStats({
        total_participantes: 0,
      });
      setError("");
    }
  }, [casaId]);

  const loadStats = useCallback(async () => {
    if (!casaId) {
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      // Obtener participantes de la casa específica
      const participantesData = await listParticipantesRequest(
        0,
        100,
        null,
        casaId,
      );

      // Convertir a array si es necesario
      let participantsArray = Array.isArray(participantesData)
        ? participantesData
        : [];

      // Filtrar localmente por casa_comunal_id como seguridad
      const participantesDelaCasa = participantsArray.filter(
        (p) => p?.casa_comunal_id === casaId,
      );

      const totalParticipantes = participantesDelaCasa.length;

      setStats({
        total_participantes: totalParticipantes,
      });
    } catch (err) {
      setError("Error al cargar participantes de la casa");
    } finally {
      setIsLoading(false);
    }
  }, [casaId]);

  return { stats, isLoading, error, loadStats };
}
