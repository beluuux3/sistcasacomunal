"use client";

import { useState, useEffect } from "react";
import {
  listCasasRequest,
  createCasaRequest,
  updateCasaRequest,
} from "@/lib/auth";

/**
 * Hook para gestionar casas comunales
 */
export function useCasas() {
  const [casas, setCasas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState("");

  const loadCasas = async (macrodistrito = null) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listCasasRequest(macrodistrito);
      setCasas(data);
    } catch (err) {
      setError(err.message || "Error al cargar casas");
      console.error("Error loading casas:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const createCasa = async (data) => {
    try {
      const newCasa = await createCasaRequest(data);
      setCasas([...casas, newCasa]);
      return newCasa;
    } catch (err) {
      throw new Error(err.response?.data?.detail || err.message);
    }
  };

  const updateCasa = async (casaId, data) => {
    try {
      const updatedCasa = await updateCasaRequest(casaId, data);
      setCasas(casas.map((c) => (c.id === casaId ? updatedCasa : c)));
      return updatedCasa;
    } catch (err) {
      throw new Error(err.response?.data?.detail || err.message);
    }
  };

  const getCasasFiltradas = () => {
    if (!filtro) return casas;
    const query = filtro.toLowerCase();
    return casas.filter(
      (casa) =>
        casa.nombre.toLowerCase().includes(query) ||
        casa.direccion.toLowerCase().includes(query) ||
        casa.macrodistrito.toLowerCase().includes(query),
    );
  };

  return {
    casas: getCasasFiltradas(),
    allCasas: casas,
    isLoading,
    error,
    filtro,
    setFiltro,
    loadCasas,
    createCasa,
    updateCasa,
  };
}
