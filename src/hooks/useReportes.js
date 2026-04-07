import { useState, useCallback } from "react";
import {
  getEstadisticasRequest,
  getReporteAsistenciaParticipanteRequest,
  getReporteAsistenciaCasaRequest,
  getReporteEvaluacionesRequest,
  getReporteActividadRequest,
  verificarCertificadoRequest,
} from "@/lib/auth";

/**
 * Hook para gestionar Reportes
 * @returns {Object} Estado y funciones
 */
export function useReportes() {
  const [estadisticas, setEstadisticas] = useState(null);
  const [reporteAsistenciaParticipante, setReporteAsistenciaParticipante] =
    useState(null);
  const [reporteAsistenciaCasa, setReporteAsistenciaCasa] = useState(null);
  const [reporteEvaluaciones, setReporteEvaluaciones] = useState(null);
  const [reporteActividad, setReporteActividad] = useState(null);
  const [certificadoInfo, setCertificadoInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Cargar estadísticas del dashboard
  const loadEstadisticas = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await getEstadisticasRequest();
      setEstadisticas(data || {});
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Error al cargar estadísticas",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar reporte de asistencia de participante
  const loadReporteAsistenciaParticipante = useCallback(
    async (participanteId, tallerId = null) => {
      setIsLoading(true);
      setError("");
      try {
        const data = await getReporteAsistenciaParticipanteRequest(
          participanteId,
          tallerId,
        );
        setReporteAsistenciaParticipante(data || {});
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            err.message ||
            "Error al cargar reporte",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Cargar reporte de asistencia de casa
  const loadReporteAsistenciaCasa = useCallback(
    async (casaId, tallerId = null) => {
      setIsLoading(true);
      setError("");
      try {
        const data = await getReporteAsistenciaCasaRequest(casaId, tallerId);
        setReporteAsistenciaCasa(data || {});
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            err.message ||
            "Error al cargar reporte",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Cargar reporte de evaluaciones
  const loadReporteEvaluaciones = useCallback(async (tallerId) => {
    setIsLoading(true);
    setError("");
    try {
      const data = await getReporteEvaluacionesRequest(tallerId);
      setReporteEvaluaciones(data || {});
    } catch (err) {
      setError(
        err.response?.data?.detail || err.message || "Error al cargar reporte",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar reporte de actividad
  const loadReporteActividad = useCallback(async (actividadId) => {
    setIsLoading(true);
    setError("");
    try {
      const data = await getReporteActividadRequest(actividadId);
      setReporteActividad(data || {});
    } catch (err) {
      setError(
        err.response?.data?.detail || err.message || "Error al cargar reporte",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verificar elegibilidad para certificado
  const verificarCertificado = useCallback(async (participanteId, tallerId) => {
    try {
      const data = await verificarCertificadoRequest(participanteId, tallerId);
      setCertificadoInfo(data || {});
      return data;
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail ||
        err.message ||
        "Error al verificar certificado";
      throw { message: errorMsg };
    }
  }, []);

  return {
    estadisticas,
    reporteAsistenciaParticipante,
    reporteAsistenciaCasa,
    reporteEvaluaciones,
    reporteActividad,
    certificadoInfo,
    isLoading,
    error,
    loadEstadisticas,
    loadReporteAsistenciaParticipante,
    loadReporteAsistenciaCasa,
    loadReporteEvaluaciones,
    loadReporteActividad,
    verificarCertificado,
  };
}
