import { useState, useCallback } from "react";
import {
  listParticipantesRequest,
  createParticipanteRequest,
  updateParticipanteRequest,
  uploadParticipanteDocumentoRequest,
} from "@/lib/auth";

/**
 * Hook para gestionar Participantes
 * @returns {Object} Estado y funciones para CRUD de participantes
 */
export function useParticipantes() {
  const [participantes, setParticipantes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [filtro, setFiltro] = useState("");

  // Cargar participantes
  const loadParticipantes = useCallback(
    async (casaId = null) => {
      setIsLoading(true);
      setError("");
      try {
        const data = await listParticipantesRequest(
          0,
          100,
          filtro || null,
          casaId,
        );

        // Validar que los datos sean de la casa seleccionada (seguridad)
        let participantesData = Array.isArray(data) ? data : [];
        if (casaId) {
          participantesData = participantesData.filter(
            (p) => p.casa_comunal_id === casaId,
          );
          if (participantesData.length !== data.length) {
            console.warn(
              "Datos de participantes de otras casas fueron filtrados",
            );
          }
        }

        // Ordenar por fecha de creación (más recientes primero)
        participantesData.sort((a, b) => {
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          return dateB - dateA; // Orden descendente
        });

        setParticipantes(participantesData);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            err.message ||
            "Error al cargar participantes",
        );
        setParticipantes([]);
      } finally {
        setIsLoading(false);
      }
    },
    [filtro],
  );

  // Crear participante
  const createParticipante = useCallback(async (data) => {
    try {
      const newParticipante = await createParticipanteRequest(data);
      setParticipantes((prev) => [...prev, newParticipante]);
      return newParticipante;
    } catch (err) {
      let errorMsg = "Error al crear participante";

      // Manejar errores de validación (422)
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (Array.isArray(detail)) {
          // Array de errores de validación
          errorMsg = detail.map((e) => e.msg || JSON.stringify(e)).join("; ");
        } else if (typeof detail === "string") {
          errorMsg = detail;
        }
      } else if (err.message) {
        errorMsg = err.message;
      }

      throw { message: errorMsg };
    }
  }, []);

  // Actualizar participante
  const updateParticipante = useCallback(async (participanteId, data) => {
    try {
      const updated = await updateParticipanteRequest(participanteId, data);
      setParticipantes((prev) =>
        prev.map((p) => (p.id === participanteId ? updated : p)),
      );
      return updated;
    } catch (err) {
      let errorMsg = "Error al actualizar participante";

      // Manejar errores de validación (422)
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (Array.isArray(detail)) {
          // Array de errores de validación
          errorMsg = detail.map((e) => e.msg || JSON.stringify(e)).join("; ");
        } else if (typeof detail === "string") {
          errorMsg = detail;
        }
      } else if (err.message) {
        errorMsg = err.message;
      }

      throw { message: errorMsg };
    }
  }, []);

  // Subir documento CI
  const uploadDocumento = useCallback(async (participanteId, archivo) => {
    try {
      const updated = await uploadParticipanteDocumentoRequest(
        participanteId,
        archivo,
      );
      setParticipantes((prev) =>
        prev.map((p) => (p.id === participanteId ? updated : p)),
      );
      return updated;
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail || err.message || "Error al subir documento";
      throw { message: errorMsg };
    }
  }, []);

  // Filtrar participantes
  const getParticipantesFiltrados = useCallback(() => {
    if (!filtro.trim()) return participantes;
    const filtered = participantes.filter(
      (p) =>
        p.nombres?.toLowerCase().includes(filtro.toLowerCase()) ||
        p.apellidos?.toLowerCase().includes(filtro.toLowerCase()) ||
        p.ci?.includes(filtro),
    );
    return filtered;
  }, [participantes, filtro]);

  return {
    participantes: getParticipantesFiltrados(),
    isLoading,
    error,
    filtro,
    setFiltro,
    loadParticipantes,
    createParticipante,
    updateParticipante,
    uploadDocumento,
  };
}
