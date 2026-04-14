"use client";

import { useState, useEffect } from "react";
import { Edit, Save, X, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { useCasaSeleccionada } from "@/context/CasaSeleccionadaContext";
import { useAuth } from "@/context/AuthContext";
import { cargarEvaluacionRequest, getGrillaHorariosRequest } from "@/lib/auth";
import api from "@/lib/api";

export default function EvaluacionesPage() {
  const { usuario } = useAuth();
  const { casaSeleccionada } = useCasaSeleccionada();

  const [participantes, setParticipantes] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [tallerId, setTallerId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Estados para administrador
  const [casas, setCasas] = useState([]);
  const [adminSelectedCasa, setAdminSelectedCasa] = useState("");
  const [adminSelectedCasaNombre, setAdminSelectedCasaNombre] = useState("");

  // Cargar participantes de la casa y su taller
  useEffect(() => {
    if (usuario?.rol === "Administrador") {
      // Para admin: cargar todas las casas
      loadCasas();
    } else if (casaSeleccionada?.id && usuario?.id) {
      // Para facilitador: cargar datos de su casa
      loadData(parseInt(casaSeleccionada.id));
    }
  }, [usuario?.rol, casaSeleccionada?.id, usuario?.id]);

  // Cargar datos cuando admin selecciona una casa
  useEffect(() => {
    if (usuario?.rol === "Administrador" && adminSelectedCasa) {
      loadData(parseInt(adminSelectedCasa));
    }
  }, [adminSelectedCasa]);

  const loadCasas = async () => {
    try {
      const response = await api.get("/casas");
      const casasData = Array.isArray(response.data) ? response.data : [];
      setCasas(casasData);

      // Auto-seleccionar la primera casa
      if (casasData.length > 0) {
        setAdminSelectedCasa(casasData[0].id.toString());
        setAdminSelectedCasaNombre(casasData[0].nombre);
      }
    } catch (err) {
      setError("Error al cargar las casas");
    }
  };

  const handleSelectCasa = (casaId) => {
    const casa = casas.find((c) => c.id === parseInt(casaId));
    setAdminSelectedCasa(casaId);
    if (casa) {
      setAdminSelectedCasaNombre(casa.nombre);
    }
  };

  const loadData = async (casaId) => {
    setIsLoading(true);
    setError("");
    try {
      // Cargar participantes de la casa
      const response = await api.get("/participantes", {
        params: { skip: 0, limit: 100, casa_id: casaId },
      });

      const participantesData = Array.isArray(response.data)
        ? response.data
        : [];
      setParticipantes(participantesData);

      // Cargar horarios para obtener talleres de la casa
      const horariosResponse = await getGrillaHorariosRequest(null, null, null);

      const horarios = Array.isArray(horariosResponse) ? horariosResponse : [];
      const horariosDelaCasa = horarios.filter((h) => h.casa_id === casaId);

      if (horariosDelaCasa.length > 0) {
        // Para admin, usar el primer taller de la casa
        // Para facilitador, usar su taller
        const tallerId =
          usuario?.rol === "Administrador"
            ? horariosDelaCasa[0].taller_id
            : horariosDelaCasa.find((h) => h.facilitador_id === usuario?.id)
                ?.taller_id || horariosDelaCasa[0].taller_id;

        setTallerId(tallerId);
      }

      // Cargar evaluaciones existentes
      const evaluacionesMap = {};
      participantesData.forEach((p) => {
        evaluacionesMap[p.id] = { nota_1: "", nota_2: "" };
      });
      setEvaluaciones(evaluacionesMap);
    } catch (err) {
      let errorMsg = "Error al cargar datos";

      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (typeof detail === "object" && detail.msg) {
          errorMsg = detail.msg;
        } else if (typeof detail === "string") {
          errorMsg = detail;
        } else {
          errorMsg = JSON.stringify(detail);
        }
      } else if (err.message) {
        errorMsg = err.message;
      }

      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotaChange = (participanteId, notaKey, value) => {
    setEvaluaciones((prev) => ({
      ...prev,
      [participanteId]: {
        ...prev[participanteId],
        [notaKey]: value,
      },
    }));
  };

  const handleGuardarTodos = async () => {
    if (!tallerId) {
      setError("No se encontró el taller para esta casa");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      let errorOccurred = false;

      // Guardar evaluaciones de todos los participantes que tengan notas
      for (const participante of participantes) {
        const nota1 = parseFloat(evaluaciones[participante.id]?.nota_1 || 0);
        const nota2 = parseFloat(evaluaciones[participante.id]?.nota_2 || 0);

        // Solo guardar si hay al menos una nota
        if (nota1 > 0 || nota2 > 0) {
          if (isNaN(nota1) || nota1 < 0 || nota1 > 100) {
            setError(
              `Participante ${participante.nombres}: Nota 1 debe estar entre 0 y 100`,
            );
            errorOccurred = true;
            break;
          }

          if (isNaN(nota2) || nota2 < 0 || nota2 > 100) {
            setError(
              `Participante ${participante.nombres}: Nota 2 debe estar entre 0 y 100`,
            );
            errorOccurred = true;
            break;
          }

          try {
            await cargarEvaluacionRequest({
              participante_id: participante.id,
              taller_id: tallerId,
              nota_1: nota1,
              nota_2: nota2,
              observaciones: "",
            });
          } catch (err) {
            const errorMsg =
              err.response?.data?.detail ||
              err.message ||
              `Error al guardar ${participante.nombres}`;
            setError(errorMsg);
            errorOccurred = true;
            break;
          }
        }
      }

      if (!errorOccurred) {
        setSuccessMessage("✅ Todas las evaluaciones guardadas correctamente");
        setTimeout(() => setSuccessMessage(""), 3000);
        setIsEditing(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Evaluaciones
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">
          Gestión de evaluaciones de participantes de{" "}
          {usuario?.rol === "Administrador"
            ? adminSelectedCasaNombre || "la casa seleccionada"
            : casaSeleccionada?.nombre || "la casa"}
        </p>
      </div>

      {/* Messages */}
      {error && <Alert type="error" title="Error" message={error} />}
      {successMessage && (
        <Alert type="success" title="Éxito" message={successMessage} />
      )}

      {/* Dropdown de Casas para Administrador */}
      {usuario?.rol === "Administrador" && casas.length > 0 && (
        <Card>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Casa
            </label>
            <select
              value={adminSelectedCasa}
              onChange={(e) => handleSelectCasa(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-slate-500 focus:border-slate-500 text-gray-900"
            >
              <option value="">-- Seleccionar casa --</option>
              {casas.map((casa) => (
                <option key={casa.id} value={casa.id}>
                  {casa.nombre}
                </option>
              ))}
            </select>
          </div>
        </Card>
      )}

      {/* Botones de Editar/Guardar - Solo para Facilitador */}
      {usuario?.rol !== "Administrador" && participantes.length > 0 && (
        <div className="flex justify-end gap-3">
          {!isEditing ? (
            <Button
              variant="primary"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white"
            >
              <Edit size={18} />
              Editar
            </Button>
          ) : (
            <>
              <Button
                variant="primary"
                onClick={handleGuardarTodos}
                disabled={isSaving}
                className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white disabled:bg-gray-400"
              >
                <Save size={18} />
                {isSaving ? "Guardando..." : "Guardar"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                <X size={18} />
                Cancelar
              </Button>
            </>
          )}
        </div>
      )}

      {/* Tabla de Participantes */}
      <Card>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : participantes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay participantes registrados en esta casa
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full px-4 sm:px-0">
              <table className="w-full text-xs sm:text-sm">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-gray-700 text-center w-12">
                      Nº
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-gray-700 text-left">
                      Participante
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-gray-700 text-left">
                      Nota 1
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-gray-700 text-left">
                      Nota 2
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {participantes.map((participante, index) => {
                    const nombreCompleto =
                      [
                        participante.nombres,
                        participante.apellido_paterno,
                        participante.apellido_materno,
                      ]
                        .filter(Boolean)
                        .join(" ")
                        .toUpperCase() || "SIN NOMBRE";

                    const ci =
                      participante.ci || participante.num_documento || "SIN CI";

                    return (
                      <tr
                        key={participante.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-center text-gray-500 font-medium">
                          {index + 1}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3">
                          <div className="text-gray-900 font-medium">
                            {nombreCompleto}
                          </div>
                          <div className="text-gray-600 text-xs">CI: {ci}</div>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3">
                          {usuario?.rol === "Administrador" ? (
                            <span className="text-gray-900">
                              {evaluaciones[participante.id]?.nota_1 || "-"}
                            </span>
                          ) : (
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              disabled={!isEditing}
                              value={
                                evaluaciones[participante.id]?.nota_1 || ""
                              }
                              onChange={(e) =>
                                handleNotaChange(
                                  participante.id,
                                  "nota_1",
                                  e.target.value,
                                )
                              }
                              placeholder="0-100"
                              className="w-20"
                            />
                          )}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3">
                          {usuario?.rol === "Administrador" ? (
                            <span className="text-gray-900">
                              {evaluaciones[participante.id]?.nota_2 || "-"}
                            </span>
                          ) : (
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              disabled={!isEditing}
                              value={
                                evaluaciones[participante.id]?.nota_2 || ""
                              }
                              onChange={(e) =>
                                handleNotaChange(
                                  participante.id,
                                  "nota_2",
                                  e.target.value,
                                )
                              }
                              placeholder="0-100"
                              className="w-20"
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
