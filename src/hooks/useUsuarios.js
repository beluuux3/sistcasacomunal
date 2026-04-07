"use client";

import { useState, useEffect } from "react";
import {
  listUsersRequest,
  createUserRequest,
  updateUserRequest,
  deactivateUserRequest,
} from "@/lib/auth";

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState("");

  const loadUsuarios = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listUsersRequest();
      setUsuarios(data);
    } catch (err) {
      setError(err.message || "Error al cargar usuarios");
      console.error("Error loading usuarios:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const createUsuario = async (data) => {
    try {
      const newUsuario = await createUserRequest(data);
      setUsuarios([...usuarios, newUsuario]);
      return newUsuario;
    } catch (err) {
      throw new Error(err.response?.data?.detail || err.message);
    }
  };

  const updateUsuario = async (userId, data) => {
    try {
      const updatedUsuario = await updateUserRequest(userId, data);
      setUsuarios(usuarios.map((u) => (u.id === userId ? updatedUsuario : u)));
      return updatedUsuario;
    } catch (err) {
      throw new Error(err.response?.data?.detail || err.message);
    }
  };

  const deactivateUsuario = async (userId) => {
    try {
      const deactivatedUsuario = await deactivateUserRequest(userId);
      setUsuarios(
        usuarios.map((u) => (u.id === userId ? deactivatedUsuario : u)),
      );
      return deactivatedUsuario;
    } catch (err) {
      throw new Error(err.response?.data?.detail || err.message);
    }
  };

  const getUsuariosFiltrados = () => {
    if (!filtro) return usuarios;
    const query = filtro.toLowerCase();
    return usuarios.filter(
      (usuario) =>
        usuario.nombre_completo.toLowerCase().includes(query) ||
        usuario.email.toLowerCase().includes(query) ||
        usuario.ci.includes(query),
    );
  };

  return {
    usuarios: getUsuariosFiltrados(),
    allUsuarios: usuarios,
    isLoading,
    error,
    filtro,
    setFiltro,
    loadUsuarios,
    createUsuario,
    updateUsuario,
    deactivateUsuario,
  };
}
