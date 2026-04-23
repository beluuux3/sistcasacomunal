import { useState, useCallback } from "react";
import {
  checkInFacilitadorRequest,
  checkOutFacilitadorRequest,
  listarControlesFacilitadorRequest,
  validarControlFacilitadorRequest,
  crearControlFacilitadorAdminRequest,
  actualizarControlFacilitadorAdminRequest,
  listarDocumentosFacilitadorRequest,
  subirDocumentoFacilitadorRequest,
  actualizarEstadoDocumentoRequest,
} from "@/lib/auth";

/**
 * Hook para gestionar Control de Facilitadores (check-in/check-out y documentos)
 * @returns {Object} Estado y funciones
 */
export function useControlFacilitadores() {
  const [controles, setControles] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [controlHoy, setControlHoy] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Check-in (con geolocalización y foto)
  const checkIn = useCallback(
    async (latitud, longitud, foto, casaComunalId) => {
      try {
        const response = await checkInFacilitadorRequest(
          latitud,
          longitud,
          foto,
          casaComunalId,
        );
        setControlHoy(response);
        return response;
      } catch (err) {
        const errorMsg =
          err.response?.data?.detail || err.message || "Error en check-in";
        throw { message: errorMsg };
      }
    },
    [],
  );

  // Check-out (con foto)
  const checkOut = useCallback(async (controlId, foto) => {
    try {
      const response = await checkOutFacilitadorRequest(controlId, foto);
      setControlHoy(response);
      return response;
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail || err.message || "Error en check-out";
      throw { message: errorMsg };
    }
  }, []);

  // Listar controles (filtrable)
  const loadControles = useCallback(
    async (facilitadorId = null, fecha = null, validado = null) => {
      setIsLoading(true);
      setError("");
      try {
        const data = await listarControlesFacilitadorRequest(
          facilitadorId,
          fecha,
          validado,
        );
        setControles(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            err.message ||
            "Error al cargar controles",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Validar/rechazar control
  const validarControl = useCallback(
    async (controlId, validado, observaciones = null) => {
      try {
        const result = await validarControlFacilitadorRequest(
          controlId,
          validado,
          observaciones,
        );
        setControles((prev) =>
          prev.map((c) => (c.id === controlId ? result : c)),
        );
        return result;
      } catch (err) {
        const errorMsg =
          err.response?.data?.detail ||
          err.message ||
          "Error al validar control";
        throw { message: errorMsg };
      }
    },
    [],
  );

  // Crear control manual (admin)
  const crearControlAdmin = useCallback(async (payload) => {
    try {
      const result = await crearControlFacilitadorAdminRequest(payload);
      setControles((prev) => [result, ...prev]);
      return result;
    } catch (err) {
      let errorMsg = "Error al crear control";
      if (err.response?.data?.detail) {
        errorMsg =
          typeof err.response.data.detail === "string"
            ? err.response.data.detail
            : JSON.stringify(err.response.data.detail);
      } else if (err.message && typeof err.message === "string") {
        errorMsg = err.message;
      } else if (err.message && typeof err.message === "object") {
        errorMsg = err.message.msg || JSON.stringify(err.message);
      }
      throw { message: errorMsg };
    }
  }, []);

  // Actualizar control manual (admin)
  const actualizarControlAdmin = useCallback(async (controlId, payload) => {
    try {
      const result = await actualizarControlFacilitadorAdminRequest(
        controlId,
        payload,
      );
      setControles((prev) =>
        prev.map((c) => (c.id === controlId ? result : c)),
      );
      return result;
    } catch (err) {
      let errorMsg = "Error al actualizar control";
      if (err.response?.data?.detail) {
        errorMsg =
          typeof err.response.data.detail === "string"
            ? err.response.data.detail
            : JSON.stringify(err.response.data.detail);
      } else if (err.message && typeof err.message === "string") {
        errorMsg = err.message;
      } else if (err.message && typeof err.message === "object") {
        errorMsg = err.message.msg || JSON.stringify(err.message);
      }
      throw { message: errorMsg };
    }
  }, []);

  // Listar documentos de facilitador
  const loadDocumentos = useCallback(async (facilitadorId = null) => {
    try {
      const data = await listarDocumentosFacilitadorRequest(facilitadorId);
      setDocumentos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar documentos:", err);
    }
  }, []);

  // Subir documento
  const subirDocumento = useCallback(async (tipoDocumento, archivo) => {
    try {
      const result = await subirDocumentoFacilitadorRequest(
        tipoDocumento,
        archivo,
      );
      setDocumentos((prev) => [...prev, result]);
      return result;
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail || err.message || "Error al subir documento";
      throw { message: errorMsg };
    }
  }, []);

  // Actualizar estado de documento
  const actualizarEstadoDocumento = useCallback(
    async (docId, estado, observaciones = null) => {
      try {
        const result = await actualizarEstadoDocumentoRequest(
          docId,
          estado,
          observaciones,
        );
        setDocumentos((prev) => prev.map((d) => (d.id === docId ? result : d)));
        return result;
      } catch (err) {
        const errorMsg =
          err.response?.data?.detail ||
          err.message ||
          "Error al actualizar documento";
        throw { message: errorMsg };
      }
    },
    [],
  );

  return {
    controles,
    documentos,
    controlHoy,
    isLoading,
    error,
    checkIn,
    checkOut,
    loadControles,
    validarControl,
    crearControlAdmin,
    actualizarControlAdmin,
    loadDocumentos,
    subirDocumento,
    actualizarEstadoDocumento,
  };
}
