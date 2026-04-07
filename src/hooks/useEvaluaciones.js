import { useState, useCallback } from "react";
import {
  cargarEvaluacionRequest,
  getEvaluacionesTallerRequest,
  getEvaluacionesParticipanteRequest,
} from "@/lib/auth";

/**
 * Hook para gestionar Evaluaciones
 * @returns {Object} Estado y funciones para gestión de evaluaciones
 */
export function useEvaluaciones() {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("taller"); // 'taller' o 'participante'
  const [selectedId, setSelectedId] = useState(null);

  // Cargar evaluaciones de taller
  const loadEvaluacionesTaller = useCallback(async (tallerId) => {
    setIsLoading(true);
    setError("");
    try {
      const data = await getEvaluacionesTallerRequest(tallerId);
      setEvaluaciones(Array.isArray(data) ? data : []);
      setSelectedId(tallerId);
      setViewMode("taller");
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail ||
        err.message ||
        "Error al cargar evaluaciones";
      setError(errorMsg);
      setEvaluaciones([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar evaluaciones de participante
  const loadEvaluacionesParticipante = useCallback(async (participanteId) => {
    setIsLoading(true);
    setError("");
    try {
      const data = await getEvaluacionesParticipanteRequest(participanteId);
      setEvaluaciones(Array.isArray(data) ? data : []);
      setSelectedId(participanteId);
      setViewMode("participante");
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail ||
        err.message ||
        "Error al cargar evaluaciones";
      setError(errorMsg);
      setEvaluaciones([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar/actualizar evaluación
  const cargarEvaluacion = useCallback(
    async (participanteId, tallerId, nota1, nota2, observaciones) => {
      try {
        const updated = await cargarEvaluacionRequest({
          participante_id: participanteId,
          taller_id: tallerId,
          nota_1: nota1,
          nota_2: nota2,
          observaciones: observaciones || "",
        });

        // Actualizar en la lista
        setEvaluaciones((prev) =>
          prev.map((e) =>
            e.participante_id === participanteId && e.taller_id === tallerId
              ? updated
              : e,
          ),
        );

        return updated;
      } catch (err) {
        const errorMsg =
          err.response?.data?.detail ||
          err.message ||
          "Error al cargar evaluación";
        throw { message: errorMsg };
      }
    },
    [],
  );

  return {
    evaluaciones,
    isLoading,
    error,
    viewMode,
    selectedId,
    loadEvaluacionesTaller,
    loadEvaluacionesParticipante,
    cargarEvaluacion,
  };
}
