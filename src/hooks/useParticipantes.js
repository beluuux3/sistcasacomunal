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
  const loadParticipantes = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await listParticipantesRequest(0, 100, filtro || null);
      setParticipantes(Array.isArray(data) ? data : []);
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
  }, [filtro]);

  // Crear participante
  const createParticipante = useCallback(async (data) => {
    try {
      const newParticipante = await createParticipanteRequest(data);
      setParticipantes((prev) => [...prev, newParticipante]);
      return newParticipante;
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail ||
        err.message ||
        "Error al crear participante";
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
      const errorMsg =
        err.response?.data?.detail ||
        err.message ||
        "Error al actualizar participante";
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
