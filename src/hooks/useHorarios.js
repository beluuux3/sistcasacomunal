import { useState, useCallback, useEffect } from "react";
import {
  getGrillaHorariosRequest,
  createHorarioRequest,
  deleteHorarioRequest,
} from "@/lib/auth";
import { listCasasRequest } from "@/lib/auth";
import { listTalleresRequest } from "@/lib/auth";
import { listUsersRequest } from "@/lib/auth";
import { useGestion } from "@/context/GestionContext";

/**
 * Hook para gestionar Horarios
 * @returns {Object} Estado y funciones para gestión de horarios
 */
export function useHorarios() {
  const { gestionActiva } = useGestion();
  const [horarios, setHorarios] = useState([]);
  const [casas, setCasas] = useState([]);
  const [talleres, setTalleres] = useState([]);
  const [facilitadores, setFacilitadores] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [filtroDia, setFiltroDia] = useState("");
  const [filtroMacrodistrito, setFiltroMacrodistrito] = useState("");

  // Cargar horarios (grilla semanal) - depende de gestionActiva
  const loadHorarios = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await getGrillaHorariosRequest(
        filtroDia || null,
        filtroMacrodistrito || null,
        gestionActiva?.id || null,
      );
      setHorarios(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.detail || err.message || "Error al cargar horarios",
      );
      setHorarios([]);
    } finally {
      setIsLoading(false);
    }
  }, [filtroDia, filtroMacrodistrito, gestionActiva?.id]);

  // Auto-reload cuando cambia la gestión activa
  useEffect(() => {
    if (gestionActiva?.id) {
      loadHorarios();
    }
  }, [gestionActiva?.id]);

  // Cargar casas comunales y facilitadores
  const loadCasasYFacilitadores = useCallback(async () => {
    try {
      const [casasData, facilitadoresData, talleresData] = await Promise.all([
        listCasasRequest(),
        listUsersRequest(),
        listTalleresRequest(),
      ]);
      setCasas(Array.isArray(casasData) ? casasData : []);
      setFacilitadores(
        Array.isArray(facilitadoresData)
          ? facilitadoresData.filter((u) => u.rol === "Facilitador")
          : [],
      );
      setTalleres(Array.isArray(talleresData) ? talleresData : []);
    } catch (err) {
      console.error("Error loading casas and facilitadores:", err);
    }
  }, []);

  // Crear horario
  const createHorario = useCallback(
    async (casaId, data) => {
      try {
        const newHorario = await createHorarioRequest({
          ...data,
          casa_comunal_id: casaId,
          gestion_id: gestionActiva?.id,
        });
        setHorarios((prev) => [...prev, newHorario]);
        return newHorario;
      } catch (err) {
        const errorMsg =
          err.response?.data?.detail || err.message || "Error al crear horario";
        throw { message: errorMsg };
      }
    },
    [gestionActiva?.id],
  );

  // Eliminar horario
  const deleteHorario = useCallback(async (horarioId) => {
    try {
      await deleteHorarioRequest(horarioId);
      setHorarios((prev) => prev.filter((h) => h.id !== horarioId));
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail ||
        err.message ||
        "Error al eliminar horario";
      throw { message: errorMsg };
    }
  }, []);

  // Filtrar por día
  const getHorariosPorDia = useCallback(() => {
    if (!filtroDia) return horarios;
    return horarios.filter((h) => h.dia_semana === parseInt(filtroDia));
  }, [horarios, filtroDia]);

  // Obtener días únicos para selector
  const getDiasDisponibles = useCallback(() => {
    const dias = [
      { value: 1, label: "Lunes" },
      { value: 2, label: "Martes" },
      { value: 3, label: "Miércoles" },
      { value: 4, label: "Jueves" },
      { value: 5, label: "Viernes" },
      { value: 6, label: "Sábado" },
      { value: 7, label: "Domingo" },
    ];
    return dias;
  }, []);

  return {
    horarios: getHorariosPorDia(),
    casas,
    talleres,
    facilitadores,
    isLoading,
    error,
    filtroDia,
    setFiltroDia,
    filtroMacrodistrito,
    setFiltroMacrodistrito,
    loadHorarios,
    loadCasasYFacilitadores,
    createHorario,
    deleteHorario,
    getDiasDisponibles,
  };
}
