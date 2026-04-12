"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { useAuth } from "@/context/AuthContext";
import { useCasaSeleccionada } from "@/context/CasaSeleccionadaContext";
import { getGrillaHorariosRequest } from "@/lib/auth";
import api from "@/lib/api";
import { cargarEvaluacionRequest } from "@/lib/auth";

export default function EvaluacionesPage() {
  const { usuario } = useAuth();
  const { casaSeleccionada } = useCasaSeleccionada();

  const [successMessage, setSuccessMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para participantes
  const [participantes, setParticipantes] = useState([]);
  const [horariosData, setHorariosData] = useState([]);
  
  // Estados para admin
  const [casas, setCasas] = useState([]);
  const [adminSelectedCasa, setAdminSelectedCasa] = useState("");
  const [infoTallerAdmin, setInfoTallerAdmin] = useState(null);
  
  // Estados para notas
  const [notas, setNotas] = useState({}); // { participante_id: { nota_1, nota_2 } }

  // Cargar casas para admin
  useEffect(() => {
    if (usuario?.rol === "Administrador") {
      const loadCasas = async () => {
        try {
          const response = await api.get("/casas");
          const casasData = Array.isArray(response.data) ? response.data : [];
          setCasas(casasData);
          // Cargar horarios
          const horariosResp = await getGrillaHorariosRequest();
          setHorariosData(horariosResp);
        } catch (err) {
          setFormError("Error cargando casas");
        }
      };
      loadCasas();
    }
  }, [usuario?.rol]);

  // Auto-seleccionar primera casa para admin
  useEffect(() => {
    if (
      usuario?.rol === "Administrador" &&
      casas.length > 0 &&
      !adminSelectedCasa
    ) {
      handleAdminSelectCasa(casas[0].id.toString());
    }
  }, [usuario?.rol, casas, adminSelectedCasa]);

  // Cargar participantes cuando cambia la casa (facilitador)
  useEffect(() => {
    if (usuario?.rol === "Facilitador" && casaSeleccionada?.id) {
      loadParticipantesDeCasa(casaSeleccionada.id);
    }
  }, [usuario?.rol, casaSeleccionada?.id]);

  const loadParticipantesDeCasa = async (casaId) => {
    setIsLoading(true);
    try {
      const response = await api.get("/participantes");
      const allParticipantes = Array.isArray(response.data) ? response.data : [];
      const participantesDeCasa = allParticipantes.filter(
        (p) => p.casa_comunal_id === casaId,
      );
      setParticipantes(participantesDeCasa);
      
      // Inicializar notas vacías para cada participante
      const notasInit = {};
      participantesDeCasa.forEach((p) => {
        notasInit[p.id] = { nota_1: "", nota_2: "" };
      });
      setNotas(notasInit);
    } catch (err) {
      setFormError("Error cargando participantes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminSelectCasa = async (casaId) => {
    if (!casaId) {
      setAdminSelectedCasa("");
      setInfoTallerAdmin(null);
      setParticipantes([]);
      setNotas({});
      return;
    }

    setAdminSelectedCasa(casaId);

    try {
      // Obtener información del taller de esta casa
      const casaInt = parseInt(casaId);
      const horariosDelaCasa = horariosData.filter(
        (h) => h.casa_id === casaInt,
      );

      if (horariosDelaCasa.length > 0) {
        const horario = horariosDelaCasa[0];
        setInfoTallerAdmin({
          tallerNombre: horario.taller_nombre,
          facilitadorNombre: horario.facilitador_nombre || "No asignado",
          tallerId: horario.taller_id,
        });
      }

      // Cargar participantes
      await loadParticipantesDeCasa(casaInt);
    } catch (err) {
      setFormError("Error seleccionando casa");
    }
  };

  const handleUpdateNota = (participanteId, field, value) => {
    setNotas((prev) => ({
      ...prev,
      [participanteId]: {
        ...prev[participanteId],
        [field]: value,
      },
    }));
  };

  const handleGuardarNotas = async (participanteId) => {
    const participanteNotas = notas[participanteId] || {};
    const nota1 = parseFloat(participanteNotas.nota_1 || 0);
    const nota2 = parseFloat(participanteNotas.nota_2 || 0);

    if (isNaN(nota1) || nota1 < 0 || nota1 > 100) {
      setFormError("Nota 1 debe ser un número entre 0 y 100");
      return;
    }

    if (isNaN(nota2) || nota2 < 0 || nota2 > 100) {
      setFormError("Nota 2 debe ser un número entre 0 y 100");
      return;
    }

    try {
      // Determinar taller_id
      let tallerId;
      if (usuario?.rol === "Administrador" && infoTallerAdmin) {
        tallerId = infoTallerAdmin.tallerId;
      } else if (usuario?.rol === "Facilitador") {
        // Obtener primer taller del horario de la casa
        const casaHorarios = horariosData.filter(
          (h) => h.casa_id === casaSeleccionada?.id,
        );
        tallerId = casaHorarios[0]?.taller_id;
      }

      if (!tallerId) {
        setFormError("No se pudo determinar el taller");
        return;
      }

      await cargarEvaluacionRequest({
        participante_id: participanteId,
        taller_id: tallerId,
        nota_1: nota1,
        nota_2: nota2,
        observaciones: "",
      });

      setSuccessMessage("Notas guardadas correctamente");
      setFormError("");
      
      // Limpiar notas guardadas
      setNotas((prev) => ({
        ...prev,
        [participanteId]: { nota_1: "", nota_2: "" },
      }));
    } catch (err) {
      setFormError(err.message || "Error guardando notas");
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
          Gestión de evaluaciones de participantes por casa comunal
        </p>
      </div>

      {/* Messages */}
      {successMessage && (
        <Alert type="success" title="Éxito" message={successMessage} />
      )}
      {formError && <Alert type="error" title="Error" message={formError} />}

      {/* Selector de Casa para Admin */}
      {usuario?.rol === "Administrador" && (
        <Card>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Seleccionar Casa Comunal
            </label>
            <select
              value={adminSelectedCasa}
              onChange={(e) => handleAdminSelectCasa(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              style={{ color: "#111827" }}
            >
              <option value="">Seleccionar casa</option>
              {casas.map((casa) => (
                <option key={casa.id} value={casa.id}>
                  {casa.nombre}
                </option>
              ))}
            </select>
          </div>
        </Card>
      )}

      {/* Card de información del taller (solo admin) */}
      {usuario?.rol === "Administrador" &&
        adminSelectedCasa &&
        infoTallerAdmin && (
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200">
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">Taller:</p>
                <p className="font-bold text-lg text-slate-900">
                  {infoTallerAdmin.tallerNombre}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Facilitador:</p>
                <p className="font-semibold text-slate-900">
                  {infoTallerAdmin.facilitadorNombre}
                </p>
              </div>
            </div>
          </Card>
        )}

      {/* Tabla de Participantes con Notas */}
      {(usuario?.rol === "Facilitador" ||
        (usuario?.rol === "Administrador" && adminSelectedCasa)) && (
        <Card>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : participantes.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-center">
              <p className="text-sm text-yellow-800">
                No hay participantes en esta casa.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 min-w-[180px]">
                      Nombre
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Nota 1
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Nota 2
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {participantes.map((participante) => (
                    <tr key={participante.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900">
                        <div>
                          <p className="font-medium text-sm">
                            {participante.nombres} {participante.apellidos}
                          </p>
                          <p className="text-xs text-gray-500">
                            CI: {participante.ci}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={notas[participante.id]?.nota_1 || ""}
                          onChange={(e) =>
                            handleUpdateNota(
                              participante.id,
                              "nota_1",
                              e.target.value,
                            )
                          }
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="-"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={notas[participante.id]?.nota_2 || ""}
                          onChange={(e) =>
                            handleUpdateNota(
                              participante.id,
                              "nota_2",
                              e.target.value,
                            )
                          }
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="-"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          variant="primary"
                          onClick={() => handleGuardarNotas(participante.id)}
                          className="p-1 text-xs"
                        >
                          Guardar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
