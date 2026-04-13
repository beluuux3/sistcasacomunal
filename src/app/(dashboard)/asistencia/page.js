"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { useAsistencia } from "@/hooks/useAsistencia";
import { useTalleres } from "@/hooks/useTalleres";
import { useAuth } from "@/context/AuthContext";
import { useCasaSeleccionada } from "@/context/CasaSeleccionadaContext";
import { getGrillaHorariosRequest } from "@/lib/auth";
import api from "@/lib/api";
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Printer,
} from "lucide-react";

export default function AsistenciaPage() {
  const {
    registrarAsistencia,
    loadHistorial,
    historial,
    selectedTaller,
    isLoading,
    error,
  } = useAsistencia();

  const { usuario } = useAuth();
  const { casaSeleccionada } = useCasaSeleccionada();
  const { talleres, loadTalleres } = useTalleres();

  // Función para obtener fecha de hoy en formato YYYY-MM-DD (sin timezone issues)
  const getFechaHoy = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const fechaLocal = `${year}-${month}-${day}`;
    return fechaLocal;
  };

  // Función para convertir fecha YYYY-MM-DD a objeto Date (evita timezone)
  const parseLocalDate = (dateString) => {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  // Función para obtener todas las fechas del mes que corresponden a un día específico de la semana
  const getFechasPorDiaSemana = (diaDelaSemana, mes = null) => {
    const hoy = new Date();
    const mesActual = mes || hoy.getMonth();
    const anio = hoy.getFullYear();
    const fechas = [];

    const primerDia = new Date(anio, mesActual, 1);
    const ultimoDia = new Date(anio, mesActual + 1, 0);

    for (
      let d = new Date(primerDia);
      d <= ultimoDia;
      d.setDate(d.getDate() + 1)
    ) {
      if (d.getDay() === diaDelaSemana) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        fechas.push({
          fecha: `${year}-${month}-${day}`,
          dia: d.getDate(),
        });
      }
    }

    return fechas;
  };

  const [view, setView] = useState("registro"); // 'registro' o 'reporte'
  const [selectedTallerForAsistencia, setSelectedTallerForAsistencia] =
    useState("");
  const [fecha, setFecha] = useState(getFechaHoy());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [participantes, setParticipantes] = useState([]);
  const [asistencias, setAsistencias] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [talleresDelFacilitador, setTalleresDelFacilitador] = useState([]);
  const [asistenciaYaRegistrada, setAsistenciaYaRegistrada] = useState(false);
  // Estados para admin
  const [casas, setCasas] = useState([]);
  const [adminSelectedCasa, setAdminSelectedCasa] = useState("");
  const [infoTallerAdmin, setInfoTallerAdmin] = useState(null);
  const [horariosData, setHorariosData] = useState([]);
  const itemsPerPage = 5;

  // Cargar talleres
  useEffect(() => {
    loadTalleres();
  }, []);

  // Cargar casas para admin
  useEffect(() => {
    if (usuario?.rol === "Administrador") {
      const loadCasas = async () => {
        try {
          const response = await api.get("/casas");
          const casasData = Array.isArray(response.data) ? response.data : [];
          setCasas(casasData);
          // Cargar horarios también
          const horariosResp = await getGrillaHorariosRequest();
          setHorariosData(horariosResp);
        } catch (err) {
          // Error silencioso para no bloquear
        }
      };
      loadCasas();
    }
  }, [usuario?.rol]);

  // Auto-seleccionar primera casa para admin cuando entra a reporte
  useEffect(() => {
    if (
      usuario?.rol === "Administrador" &&
      view === "reporte" &&
      casas.length > 0 &&
      !adminSelectedCasa
    ) {
      handleAdminSelectCasa(casas[0].id.toString());
    }
  }, [usuario?.rol, view, casas, adminSelectedCasa]);

  // Auto-cambiar a vista reporte para admin
  useEffect(() => {
    if (usuario?.rol === "Administrador" && view === "registro") {
      setView("reporte");
    }
  }, [usuario?.rol]);

  // Cargar historial cuando se abre reporte para facilitador con 1 taller
  useEffect(() => {
    if (
      view === "reporte" &&
      usuario?.rol === "Facilitador" &&
      talleresDelFacilitador.length === 1
    ) {
      loadHistorial(talleresDelFacilitador[0].id);
    }
  }, [view, talleresDelFacilitador, usuario?.rol]);

  // Función para obtener fechas únicas del historial ordenadas
  const getFechasDelHistorial = () => {
    if (!historial || historial.length === 0) return [];

    const fechasUnicas = [...new Set(historial.map((h) => h.fecha))];
    const fechasOrdenadas = fechasUnicas.sort(
      (a, b) => new Date(a) - new Date(b),
    );

    return fechasOrdenadas.map((fecha) => {
      const [year, month, day] = fecha.split("-");
      const fechaFormato = `${day}-${month}-${year}`;
      const fechaLarga = new Date(fecha).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      return {
        fecha,
        dia: parseInt(day),
        fechaFormato,
        fechaLarga,
      };
    });
  };

  // Función para imprimir/exportar el reporte
  const handlePrint = () => {
    window.print();
  };

  // Para facilitadores, filtrar talleres por casa actual Y cargar participantes
  useEffect(() => {
    if (
      usuario?.rol === "Facilitador" &&
      casaSeleccionada?.id &&
      talleres.length > 0
    ) {
      const loadTalleresyParticipantes = async () => {
        try {
          const horarios = await getGrillaHorariosRequest();
          // Filtrar horarios para la casa seleccionada
          const horariosDelaCasa = horarios.filter(
            (h) => h.casa_id === casaSeleccionada.id,
          );
          // Obtener IDs únicos de talleres
          const tallerIds = [
            ...new Set(horariosDelaCasa.map((h) => h.taller_id)),
          ];
          // Filtrar talleres
          const talleresFiltered = talleres.filter((t) =>
            tallerIds.includes(t.id),
          );
          setTalleresDelFacilitador(talleresFiltered);

          // Si hay solo 1 taller, auto-seleccionarlo
          if (talleresFiltered.length === 1) {
            setSelectedTallerForAsistencia(talleresFiltered[0].id.toString());
          }

          // Cargar participantes de la casa
          try {
            const response = await api.get("/participantes");
            const allParticipantes = Array.isArray(response.data)
              ? response.data
              : [];
            // Filtrar participantes de la casa seleccionada
            const participantesDeCasa = allParticipantes.filter(
              (p) => p.casa_comunal_id === casaSeleccionada.id,
            );
            setParticipantes(participantesDeCasa);
            // Inicializar asistencias en blanco
            const asistenciasInit = {};
            participantesDeCasa.forEach((p) => {
              asistenciasInit[p.id] = false;
            });
            setAsistencias(asistenciasInit);
          } catch (err) {
            // Error silencioso
          }
        } catch (err) {
          setTalleresDelFacilitador(talleres);
        }
      };
      loadTalleresyParticipantes();
    } else if (usuario?.rol !== "Facilitador") {
      // Admin ve todos los talleres
      setTalleresDelFacilitador(talleres);
    }
  }, [casaSeleccionada?.id, talleres, usuario?.rol]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Auto-cargar participantes cuando se selecciona un taller
  useEffect(() => {
    // Los participantes ya están cargados en el useEffect anterior
    // Este useEffect solo es para admin que selecciona taller
    if (selectedTallerForAsistencia && usuario?.rol !== "Facilitador") {
      // Solo para admin o múltiples talleres
    }
  }, [selectedTallerForAsistencia, usuario?.rol]);

  // Handler para admin seleccionar casa
  const handleAdminSelectCasa = async (casaId) => {
    if (!casaId) {
      setAdminSelectedCasa("");
      setInfoTallerAdmin(null);
      setParticipantes([]);
      setAsistencias({});
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
        // Obtener horario de diferentes formatos posibles
        const horaFormato =
          horario.hora_inicio && horario.hora_fin
            ? `${horario.hora_inicio} - ${horario.hora_fin}`
            : horario.horario || horario.hora || "Por definir";

        setInfoTallerAdmin({
          tallerNombre: horario.taller_nombre,
          facilitadorNombre: horario.facilitador_nombre || "No asignado",
          horario: horaFormato,
          tallerId: horario.taller_id,
        });

        // Cargar participantes de la casa
        const response = await api.get("/participantes");
        const allParticipantes = Array.isArray(response.data)
          ? response.data
          : [];
        const participantesDeCasa = allParticipantes.filter(
          (p) => p.casa_comunal_id === casaInt,
        );
        setParticipantes(participantesDeCasa);
        setAsistencias({});

        // Cargar historial si estamos en vista reporte
        if (view === "reporte") {
          await loadHistorial(horario.taller_id);
        }
      }
    } catch (err) {
      setInfoTallerAdmin(null);
    }
  };

  const handleSelectTaller = async (tallerId) => {
    if (!tallerId) {
      setParticipantes([]);
      setAsistencias({});
      return;
    }

    setSelectedTallerForAsistencia(tallerId);
    setFormError("");

    // Cargar participantes del taller
    try {
      const participantesData = await getTallerParticipantesRequest(
        parseInt(tallerId),
      );
      setParticipantes(
        Array.isArray(participantesData) ? participantesData : [],
      );
      setAsistencias({}); // Limpiar asistencias previas
    } catch (err) {
      setParticipantes([]);
    }
  };

  const handleToggleAsistencia = (participanteId) => {
    setAsistencias((prev) => ({
      ...prev,
      [participanteId]: !prev[participanteId],
    }));
  };

  const handleRegistrarAsistencia = async () => {
    if (!selectedTallerForAsistencia) {
      setFormError("Debe seleccionar un taller");
      return;
    }

    const registros = Object.entries(asistencias).map(([Id, presente]) => ({
      participante_id: parseInt(Id),
      presente,
    }));

    if (registros.length === 0) {
      setFormError("Debe seleccionar al menos un participante");
      return;
    }

    try {
      setFormError("");
      await registrarAsistencia(
        parseInt(selectedTallerForAsistencia),
        fecha,
        registros,
      );
      setSuccessMessage("Asistencia registrada correctamente");
      setAsistencias({});
      setSelectedTallerForAsistencia("");
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleViewHistorial = async (tallerId) => {
    if (tallerId) {
      await loadHistorial(parseInt(tallerId));
      setView("historial");
      setIsModalOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Asistencia
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">
          Registro y control de asistencia
        </p>
      </div>

      {/* Messages */}
      {error && <Alert type="error" title="Error" message={error} />}
      {successMessage && (
        <Alert type="success" title="Éxito" message={successMessage} />
      )}
      {formError && <Alert type="error" title="Error" message={formError} />}

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {usuario?.rol === "Facilitador" && (
          <Button
            variant={view === "registro" ? "primary" : "secondary"}
            onClick={() => setView("registro")}
          >
            Registrar Asistencia
          </Button>
        )}
        <Button
          variant={view === "reporte" ? "primary" : "secondary"}
          onClick={() => setView("reporte")}
        >
          Ver Reporte
        </Button>
      </div>

      {/* Registro View */}
      {view === "registro" && (
        <Card>
          <div className="space-y-4">
            {usuario?.rol === "Administrador" ? (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-center">
                <p className="text-sm text-blue-900">
                  Los administradores solo pueden ver reportes de asistencia.
                </p>
              </div>
            ) : usuario?.rol === "Facilitador" &&
              talleresDelFacilitador.length === 1 ? (
              <div className="space-y-4">
                <div className="bg-green-50 border-2 border-green-200 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Taller Asignado:</p>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-green-100">
                      <BookOpen size={24} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-lg text-slate-900">
                        {talleresDelFacilitador[0]?.nombre}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        en <strong>{casaSeleccionada?.nombre}</strong>
                      </p>
                    </div>
                  </div>
                </div>

                <Input
                  label="Fecha"
                  type="date"
                  className=" border-gray-300 text-black"
                  value={fecha}
                  max={getFechaHoy()}
                  onChange={(e) => setFecha(e.target.value)}
                  labelClassName="text-gray-700"
                />

                {asistenciaYaRegistrada && (
                  <Alert
                    type="warning"
                    title="Asistencia ya registrada"
                    message="La asistencia para esta fecha ya ha sido registrada. No puedes volver a registrar."
                  />
                )}

                <div className="space-y-4">
                  {/* Tabla de participantes estilo imagen */}
                  {participantes.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg text-slate-900">
                        Participantes ({participantes.length})
                      </h3>
                      <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-100 border-b border-gray-200 sticky top-0">
                            <tr>
                              <th className="px-4 py-3 text-left font-semibold text-gray-700 min-w-[200px]">
                                Nombre
                              </th>
                              <th className="px-4 py-3 text-center font-semibold text-gray-700 whitespace-nowrap">
                                Asistió
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {participantes.map((participante) => (
                              <tr
                                key={participante.id}
                                className="hover:bg-gray-50"
                              >
                                <td className="px-4 py-3 text-gray-900">
                                  <div>
                                    <p className="font-medium text-sm">
                                      {participante.nombres}{" "}
                                      {participante.apellidos}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      CI: {participante.ci}
                                    </p>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <label className="inline-flex items-center cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={
                                        asistencias[participante.id] || false
                                      }
                                      onChange={() =>
                                        handleToggleAsistencia(participante.id)
                                      }
                                      className="w-5 h-5 cursor-pointer accent-green-600"
                                    />
                                  </label>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Resumen de asistencia */}
                      <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                        <p className="text-sm text-green-900 font-medium">
                          ✅ Presentes:{" "}
                          <span className="text-lg font-bold">
                            {Object.values(asistencias).filter(Boolean).length}
                          </span>{" "}
                          de{" "}
                          <span className="text-lg font-bold">
                            {participantes.length}
                          </span>
                        </p>
                      </div>
                    </div>
                  )}

                  {participantes.length === 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        No hay participantes registrados en esta casa.
                      </p>
                    </div>
                  )}

                  <Button
                    variant="primary"
                    onClick={handleRegistrarAsistencia}
                    disabled={
                      isLoading ||
                      participantes.length === 0 ||
                      asistenciaYaRegistrada
                    }
                  >
                    {isLoading ? "Registrando..." : "Registrar Asistencia"}
                  </Button>
                </div>
              </div>
            ) : (
              /* Facilitador con múltiples talleres */
              <div>
                {selectedTallerForAsistencia && (
                  <div className="space-y-4 mt-4">
                    {/* Tabla de participantes */}
                    {participantes.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-semibold text-lg text-slate-900">
                          Participantes ({participantes.length})
                        </h3>
                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-100 border-b border-gray-200">
                              <tr>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                                  Participante
                                </th>
                                <th className="px-4 py-3 text-center font-semibold text-gray-700">
                                  Asistió
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {participantes.map((participante) => (
                                <tr
                                  key={participante.id}
                                  className="hover:bg-gray-50"
                                >
                                  <td className="px-4 py-3 text-gray-900">
                                    <div>
                                      <p className="font-medium">
                                        {participante.nombres}{" "}
                                        {participante.apellidos}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        CI: {participante.ci}
                                      </p>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <input
                                      type="checkbox"
                                      checked={
                                        asistencias[participante.id] || false
                                      }
                                      onChange={() =>
                                        handleToggleAsistencia(participante.id)
                                      }
                                      className="w-5 h-5 cursor-pointer accent-blue-600"
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Resumen de asistencia */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm text-blue-900">
                            <strong>Presentes:</strong>{" "}
                            {Object.values(asistencias).filter(Boolean).length}{" "}
                            de {participantes.length}
                          </p>
                        </div>
                      </div>
                    )}

                    {participantes.length === 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          No hay participantes registrados en este taller.
                        </p>
                      </div>
                    )}

                    <Button
                      variant="primary"
                      onClick={handleRegistrarAsistencia}
                      disabled={isLoading || participantes.length === 0}
                    >
                      {isLoading ? "Registrando..." : "Registrar Asistencia"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Reporte View */}
      {view === "reporte" && (
        <Card>
          <div className="space-y-4">
            {usuario?.rol === "Facilitador" &&
            talleresDelFacilitador.length === 1 ? (
              // REPORTE PARA FACILITADOR CON 1 TALLER
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    Reporte de Asistencia:
                  </p>
                  <p className="font-bold text-lg text-slate-900">
                    {talleresDelFacilitador[0]?.nombre}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Casa: <strong>{casaSeleccionada?.nombre}</strong>
                  </p>
                </div>

                {/* Botón de impresión y tabla dinámica con fechas como columnas */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Detalles de Asistencia
                  </h3>
                  <Button
                    onClick={handlePrint}
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    <Printer size={18} />
                    Imprimir / PDF
                  </Button>
                </div>

                {participantes.length > 0 && historial.length > 0 ? (
                  <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 border-b border-gray-200 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700 min-w-[180px]">
                            Nombre
                          </th>
                          {(() => {
                            const fechas = getFechasDelHistorial();
                            return fechas.map((f) => (
                              <th
                                key={f.fecha}
                                className="px-2 py-3 text-center font-semibold text-gray-700 whitespace-nowrap min-w-[80px] text-xs"
                                title={f.fechaLarga}
                              >
                                {f.fechaFormato}
                              </th>
                            ));
                          })()}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {participantes.map((participante) => {
                          // Obtener asistencias de este participante
                          const asistenciasParticipante = historial.filter(
                            (h) => h.participante_id === participante.id,
                          );

                          return (
                            <tr
                              key={participante.id}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-4 py-3 text-gray-900 font-medium">
                                <div>
                                  <p className="text-sm">
                                    {participante.nombres}{" "}
                                    {participante.apellidos}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {participante.ci}
                                  </p>
                                </div>
                              </td>
                              {(() => {
                                const fechas = getFechasDelHistorial();
                                return fechas.map((f) => {
                                  const asistencia =
                                    asistenciasParticipante.find(
                                      (a) => a.fecha === f.fecha,
                                    );
                                  return (
                                    <td
                                      key={f.fecha}
                                      className="px-2 py-3 text-center"
                                    >
                                      {asistencia ? (
                                        asistencia.presente ? (
                                          <CheckCircle
                                            size={20}
                                            className="inline text-green-600"
                                            title="Asistió"
                                          />
                                        ) : (
                                          <XCircle
                                            size={20}
                                            className="inline text-red-600"
                                            title="Faltó"
                                          />
                                        )
                                      ) : null}
                                    </td>
                                  );
                                });
                              })()}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : participantes.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-center">
                    <p className="text-sm text-yellow-800">
                      No hay participantes registrados en esta casa.
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600">
                      No hay registros de asistencia aún.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // REPORTE PARA ADMIN (CON SELECTOR DE CASA)
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Seleccionar Casa Comunal
                  </label>
                  <select
                    value={adminSelectedCasa}
                    onChange={(e) => handleAdminSelectCasa(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="">Seleccionar casa para ver reporte</option>
                    {casas.map((casa) => (
                      <option key={casa.id} value={casa.id}>
                        {casa.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Card de información del taller */}
                {adminSelectedCasa && infoTallerAdmin && (
                  <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Taller:</p>
                        <p className="font-bold text-lg text-slate-900">
                          {infoTallerAdmin.tallerNombre}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Facilitador:</p>
                          <p className="font-semibold text-slate-900">
                            {infoTallerAdmin.facilitadorNombre}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Horario:</p>
                          <p className="font-semibold text-slate-900">
                            {infoTallerAdmin.horario}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {adminSelectedCasa && participantes.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Detalles de Asistencia
                      </h3>
                      <Button
                        onClick={handlePrint}
                        variant="secondary"
                        className="flex items-center gap-2"
                      >
                        <Printer size={18} />
                        Imprimir / PDF
                      </Button>
                    </div>
                    <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100 border-b border-gray-200 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700 min-w-[180px]">
                              Nombre
                            </th>
                            {(() => {
                              const fechas = getFechasDelHistorial();
                              return fechas.map((f) => (
                                <th
                                  key={f.fecha}
                                  className="px-2 py-3 text-center font-semibold text-gray-700 whitespace-nowrap min-w-[80px] text-xs"
                                  title={f.fechaLarga}
                                >
                                  {f.fechaFormato}
                                </th>
                              ));
                            })()}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {participantes.map((participante) => {
                            const asistenciasParticipante = historial.filter(
                              (h) => h.participante_id === participante.id,
                            );

                            return (
                              <tr
                                key={participante.id}
                                className="hover:bg-gray-50"
                              >
                                <td className="px-4 py-3 text-gray-900 font-medium">
                                  <div>
                                    <p className="text-sm">
                                      {participante.nombres}{" "}
                                      {participante.apellidos}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {participante.ci}
                                    </p>
                                  </div>
                                </td>
                                {(() => {
                                  const fechas = getFechasDelHistorial();
                                  return fechas.map((f) => {
                                    const asistencia =
                                      asistenciasParticipante.find(
                                        (a) => a.fecha === f.fecha,
                                      );
                                    return (
                                      <td
                                        key={f.fecha}
                                        className="px-2 py-3 text-center"
                                      >
                                        {asistencia ? (
                                          asistencia.presente ? (
                                            <CheckCircle
                                              size={20}
                                              className="inline text-green-600"
                                              title="Asistió"
                                            />
                                          ) : (
                                            <XCircle
                                              size={20}
                                              className="inline text-red-600"
                                              title="Faltó"
                                            />
                                          )
                                        ) : null}
                                      </td>
                                    );
                                  });
                                })()}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {adminSelectedCasa && participantes.length === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-center">
                    <p className="text-sm text-yellow-800">
                      No hay participantes en esta casa comunal.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
