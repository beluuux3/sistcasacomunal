"use client";

import { useState, useEffect } from "react";
import {
  listTalleresRequest,
  createTallerRequest,
  updateTallerRequest,
  deactivateTallerRequest,
  getTallerParticipantesRequest,
  inscribirParticipanteRequest,
  desinscribirParticipanteRequest,
} from "@/lib/auth";

export function useTalleres() {
  const [talleres, setTalleres] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState("");
  const [selectedTaller, setSelectedTaller] = useState(null);
  const [participantes, setParticipantes] = useState([]);

  const loadTalleres = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listTalleresRequest();
      setTalleres(data);
    } catch (err) {
      setError(err.message || "Error al cargar talleres");
      console.error("Error loading talleres:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const createTaller = async (data) => {
    try {
      const newTaller = await createTallerRequest(data);
      setTalleres([...talleres, newTaller]);
      return newTaller;
    } catch (err) {
      throw new Error(err.response?.data?.detail || err.message);
    }
  };

  const updateTaller = async (tallerId, data) => {
    try {
      const updatedTaller = await updateTallerRequest(tallerId, data);
      setTalleres(talleres.map((t) => (t.id === tallerId ? updatedTaller : t)));
      return updatedTaller;
    } catch (err) {
      throw new Error(err.response?.data?.detail || err.message);
    }
  };

  const deactivateTaller = async (tallerId) => {
    try {
      const deactivatedTaller = await deactivateTallerRequest(tallerId);
      setTalleres(
        talleres.map((t) => (t.id === tallerId ? deactivatedTaller : t)),
      );
      return deactivatedTaller;
    } catch (err) {
      throw new Error(err.response?.data?.detail || err.message);
    }
  };

  const loadParticipantes = async (tallerId) => {
    try {
      const data = await getTallerParticipantesRequest(tallerId);
      setParticipantes(data);
      setSelectedTaller(tallerId);
    } catch (err) {
      console.error("Error loading participantes:", err);
      setError(err.message);
    }
  };

  const inscribirParticipante = async (tallerId, participanteId) => {
    try {
      await inscribirParticipanteRequest(tallerId, participanteId);
      if (selectedTaller === tallerId) {
        await loadParticipantes(tallerId);
      }
    } catch (err) {
      throw new Error(err.response?.data?.detail || err.message);
    }
  };

  const desinscribirParticipante = async (inscripcionId, tallerId) => {
    try {
      await desinscribirParticipanteRequest(inscripcionId);
      if (selectedTaller === tallerId) {
        await loadParticipantes(tallerId);
      }
    } catch (err) {
      throw new Error(err.response?.data?.detail || err.message);
    }
  };

  const getTalleresFiltrados = () => {
    if (!filtro) return talleres;
    const query = filtro.toLowerCase();
    return talleres.filter(
      (taller) =>
        taller.nombre.toLowerCase().includes(query) ||
        (taller.descripcion &&
          taller.descripcion.toLowerCase().includes(query)),
    );
  };

  return {
    talleres: getTalleresFiltrados(),
    allTalleres: talleres,
    isLoading,
    error,
    filtro,
    setFiltro,
    loadTalleres,
    createTaller,
    updateTaller,
    deactivateTaller,
    participantes,
    selectedTaller,
    loadParticipantes,
    inscribirParticipante,
    desinscribirParticipante,
  };
}
