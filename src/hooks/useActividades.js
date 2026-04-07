import { useState, useCallback } from "react";
import {
  listActividadesRequest,
  createActividadFullRequest,
  registrarAsistenciaActividadFullRequest,
  getReporteActividadRequest,
} from "@/lib/auth";

/**
 * Hook para gestionar Actividades Extracurriculares
 * @returns {Object} Estado y funciones
 */
export function useActividades() {
  const [actividades, setActividades] = useState([]);
  const [actividadSeleccionada, setActividadSeleccionada] = useState(null);
  const [reporteActividad, setReporteActividad] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Cargar actividades (filtrable)
  const loadActividades = useCallback(
    async (esGlobal = null, gestionId = null) => {
      setIsLoading(true);
      setError("");
      try {
        const data = await listActividadesRequest(esGlobal, gestionId);
        setActividades(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            err.message ||
            "Error al cargar actividades",
        );
        setActividades([]);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Crear actividad
  const createActividad = useCallback(async (data) => {
    try {
      const newActividad = await createActividadFullRequest(data);
      setActividades((prev) => [...prev, newActividad]);
      return newActividad;
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail || err.message || "Error al crear actividad";
      throw { message: errorMsg };
    }
  }, []);

  // Registrar asistencia a actividad
  const registrarAsistencia = useCallback(
    async (actividadId, participanteIds, fecha) => {
      try {
        await registrarAsistenciaActividadFullRequest(
          actividadId,
          participanteIds,
          fecha,
        );
        return true;
      } catch (err) {
        const errorMsg =
          err.response?.data?.detail ||
          err.message ||
          "Error al registrar asistencia";
        throw { message: errorMsg };
      }
    },
    [],
  );

  // Cargar reporte de actividad
  const loadReporteActividad = useCallback(async (actividadId) => {
    try {
      const reporte = await getReporteActividadRequest(actividadId);
      setReporteActividad(reporte);
      setActividadSeleccionada(actividadId);
      return reporte;
    } catch (err) {
      console.error("Error al cargar reporte:", err);
    }
  }, []);

  return {
    actividades,
    actividadSeleccionada,
    reporteActividad,
    isLoading,
    error,
    loadActividades,
    createActividad,
    registrarAsistencia,
    loadReporteActividad,
  };
}
