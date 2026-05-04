"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SearchInput } from "@/components/ui/SearchInput";
import { Alert } from "@/components/ui/Alert";
import { useAsistencia } from "@/hooks/useAsistencia";
import { useTalleres } from "@/hooks/useTalleres";
import { useAuth } from "@/context/AuthContext";
import { useCasaSeleccionada } from "@/context/CasaSeleccionadaContext";
import { getGrillaHorariosRequest } from "@/lib/auth";
import api from "@/lib/api";
import { generateCasaListaPDF } from "@/utils/generateCasaListaPDF";
import {
  BookOpen,
  CheckCircle,
  XCircle,
  Printer,
  FileText,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

export default function AsistenciaPage() {
  const { registrarAsistencia, loadHistorial, historial, isLoading, error } =
    useAsistencia();

  const { usuario } = useAuth();
  const { casaSeleccionada } = useCasaSeleccionada();
  const { talleres, loadTalleres } = useTalleres();

  const getFechaHoy = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [view, setView] = useState("registro");
  const [selectedTallerForAsistencia, setSelectedTallerForAsistencia] =
    useState("");
  const [fecha, setFecha] = useState(getFechaHoy());
  const [successMessage, setSuccessMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [participantes, setParticipantes] = useState([]);
  const [asistencias, setAsistencias] = useState({});
  const [talleresDelFacilitador, setTalleresDelFacilitador] = useState([]);
  const [asistenciaYaRegistrada, setAsistenciaYaRegistrada] = useState(false);

  // Estados para admin
  const [casas, setCasas] = useState([]);
  const [adminSelectedCasa, setAdminSelectedCasa] = useState("");
  const [infoTallerAdmin, setInfoTallerAdmin] = useState(null);
  const [horariosData, setHorariosData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentCasaIndex, setCurrentCasaIndex] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    loadTalleres();
  }, []);

  useEffect(() => {
    if (usuario?.rol === "Administrador") {
      const loadCasas = async () => {
        try {
          const response = await api.get("/casas");
          const casasData = (
            Array.isArray(response.data) ? response.data : []
          ).sort((a, b) => a.nombre.localeCompare(b.nombre));
          setCasas(casasData);
          const horariosResp = await getGrillaHorariosRequest();
          setHorariosData(horariosResp);
        } catch (err) {
          // Error silencioso
        }
      };
      loadCasas();
    }
  }, [usuario?.rol]);

  const filteredCasas = casas.filter((casa) =>
    casa.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    if (
      usuario?.rol === "Administrador" &&
      view === "reporte" &&
      casas.length > 0
    ) {
      const casaId = casas[currentCasaIndex]?.id?.toString();
      if (casaId) {
        handleAdminSelectCasa(casaId);
      }
    }
  }, [usuario?.rol, view, casas, currentCasaIndex]);

  useEffect(() => {
    if (usuario?.rol === "Administrador" && view === "registro") {
      setView("reporte");
    }
  }, [usuario?.rol]);

  useEffect(() => {
    if (
      view === "reporte" &&
      usuario?.rol === "Facilitador" &&
      talleresDelFacilitador.length === 1
    ) {
      loadHistorial(talleresDelFacilitador[0].id);
    }
  }, [view, talleresDelFacilitador, usuario?.rol]);

  const getFechasDelHistorial = () => {
    if (!historial || historial.length === 0) return [];
    const fechasUnicas = [...new Set(historial.map((h) => h.fecha))];
    return fechasUnicas
      .sort((a, b) => new Date(a) - new Date(b))
      .map((fecha) => {
        const [year, month, day] = fecha.split("-");
        return {
          fecha,
          fechaFormato: `${day}-${month}-${year}`,
          fechaLarga: new Date(fecha).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
        };
      });
  };

  const handlePrintAsistencia = () => {
    window.print();
  };

  const handlePrintLista = async () => {
    if (!adminSelectedCasa || !infoTallerAdmin || participantes.length === 0) {
      alert("No hay datos suficientes para generar el PDF de la lista.");
      return;
    }
    const casaActual = casas.find((c) => c.id.toString() === adminSelectedCasa);

    try {
      await generateCasaListaPDF(casaActual, infoTallerAdmin, participantes);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Hubo un error al generar el PDF. Por favor, intente de nuevo.");
    }
  };

  useEffect(() => {
    if (
      usuario?.rol === "Facilitador" &&
      casaSeleccionada?.id &&
      talleres.length > 0
    ) {
      const loadData = async () => {
        try {
          const horarios = await getGrillaHorariosRequest();
          const horariosDelaCasa = horarios.filter(
            (h) =>
              h.casa_id === casaSeleccionada.id &&
              h.facilitador_id === usuario?.id,
          );
          const tallerIds = [
            ...new Set(horariosDelaCasa.map((h) => h.taller_id)),
          ];
          const talleresFiltered = talleres.filter((t) =>
            tallerIds.includes(t.id),
          );
          setTalleresDelFacilitador(talleresFiltered);

          if (talleresFiltered.length === 1) {
            setSelectedTallerForAsistencia(talleresFiltered[0].id.toString());
          }

          const response = await api.get("/participantes", {
            params: { skip: 0, limit: 100, casa_id: casaSeleccionada.id },
          });
          const participantesDeCasa = Array.isArray(response.data)
            ? response.data
            : [];
          setParticipantes(participantesDeCasa);
          const asistenciasInit = {};
          participantesDeCasa.forEach((p) => {
            asistenciasInit[p.id] = false;
          });
          setAsistencias(asistenciasInit);
        } catch (err) {
          setTalleresDelFacilitador(talleres);
        }
      };
      loadData();
    } else if (usuario?.rol !== "Facilitador") {
      setTalleresDelFacilitador(talleres);
    }
  }, [casaSeleccionada?.id, talleres, usuario?.rol]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleAdminSelectCasa = async (casaId) => {
    if (!casaId) {
      setAdminSelectedCasa("");
      setInfoTallerAdmin(null);
      setParticipantes([]);
      setAsistencias({});
      return;
    }

    const newIndex = casas.findIndex((c) => c.id.toString() === casaId);
    if (newIndex !== -1) {
      setCurrentCasaIndex(newIndex);
    }

    setAdminSelectedCasa(casaId);
    setIsDropdownOpen(false); // Cierra el dropdown al seleccionar

    try {
      const casaInt = parseInt(casaId);
      const horariosDelaCasa = horariosData.filter(
        (h) => h.casa_id === casaInt,
      );

      if (horariosDelaCasa.length > 0) {
        const horario = horariosDelaCasa[0];
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

        const response = await api.get("/participantes", {
          params: { skip: 0, limit: 100, casa_id: casaInt },
        });
        const participantesDeCasa = Array.isArray(response.data)
          ? response.data
          : [];
        setParticipantes(participantesDeCasa);
        setAsistencias({});

        if (view === "reporte") {
          await loadHistorial(horario.taller_id);
        }
      } else {
        setInfoTallerAdmin(null);
        setParticipantes([]);
      }
    } catch (err) {
      setInfoTallerAdmin(null);
      setParticipantes([]);
    }
  };

  const handleNextCasa = () => {
    setCurrentCasaIndex((prevIndex) =>
      Math.min(prevIndex + 1, casas.length - 1),
    );
  };

  const handlePrevCasa = () => {
    setCurrentCasaIndex((prevIndex) => Math.max(prevIndex - 1, 0));
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
      if (talleresDelFacilitador.length !== 1) {
        setSelectedTallerForAsistencia("");
      }
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Asistencia
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">
          Registro y control de asistencia
        </p>
      </div>

      {error && <Alert type="error" title="Error" message={error} />}
      {successMessage && (
        <Alert type="success" title="Éxito" message={successMessage} />
      )}
      {formError && <Alert type="error" title="Error" message={formError} />}

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
                    message="La asistencia para esta fecha ya ha sido registrada."
                  />
                )}

                {participantes.length > 0 ? (
                  <div className="space-y-4">
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
                          {participantes.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-gray-900">
                                <div>
                                  <p className="font-medium text-sm">
                                    {p.nombres} {p.apellidos}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    CI: {p.ci}
                                  </p>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <label className="inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={asistencias[p.id] || false}
                                    onChange={() =>
                                      handleToggleAsistencia(p.id)
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
                    <Button
                      variant="primary"
                      onClick={handleRegistrarAsistencia}
                      disabled={isLoading || asistenciaYaRegistrada}
                    >
                      {isLoading ? "Registrando..." : "Registrar Asistencia"}
                    </Button>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      No hay participantes registrados en esta casa.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {/* Facilitador con múltiples talleres (UI simplificada) */}
              </div>
            )}
          </div>
        </Card>
      )}

      {view === "reporte" && (
        <Card>
          <div className="space-y-4">
            {usuario?.rol === "Facilitador" &&
            talleresDelFacilitador.length === 1 ? (
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
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Detalles de Asistencia
                  </h3>
                  <Button
                    onClick={handlePrintAsistencia}
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
                          {getFechasDelHistorial().map((f) => (
                            <th
                              key={f.fecha}
                              className="px-2 py-3 text-center font-semibold text-gray-700 whitespace-nowrap min-w-[80px] text-xs"
                              title={f.fechaLarga}
                            >
                              {f.fechaFormato}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {participantes.map((p) => (
                          <tr key={p.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-900 font-medium">
                              <div>
                                <p className="text-sm">
                                  {p.nombres} {p.apellidos}
                                </p>
                                <p className="text-xs text-gray-500">{p.ci}</p>
                              </div>
                            </td>
                            {getFechasDelHistorial().map((f) => {
                              const asistencia = historial.find(
                                (a) =>
                                  a.participante_id === p.id &&
                                  a.fecha === f.fecha,
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
                                      />
                                    ) : (
                                      <XCircle
                                        size={20}
                                        className="inline text-red-600"
                                      />
                                    )
                                  ) : null}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600">
                      {participantes.length === 0
                        ? "No hay participantes."
                        : "No hay registros de asistencia."}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <Button
                    onClick={handlePrevCasa}
                    disabled={currentCasaIndex === 0}
                    variant="secondary"
                  >
                    <ChevronLeft size={20} />
                    Anterior
                  </Button>

                  <div className="relative text-center flex-grow">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center justify-center gap-2 w-full"
                    >
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Casa Comunal
                        </label>
                        <p className="font-bold text-lg text-slate-900">
                          {casas[currentCasaIndex]?.nombre || "Cargando..."}
                        </p>
                      </div>
                      <ChevronDown
                        size={20}
                        className={`transition-transform ${
                          isDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                        <div className="p-2">
                          <SearchInput
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar casa..."
                          />
                        </div>
                        <ul className="max-h-60 overflow-y-auto">
                          {filteredCasas.map((casa) => (
                            <li
                              key={casa.id}
                              onClick={() =>
                                handleAdminSelectCasa(casa.id.toString())
                              }
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-black"
                            >
                              {casa.nombre}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleNextCasa}
                    disabled={currentCasaIndex === casas.length - 1}
                    variant="secondary"
                  >
                    Siguiente
                    <ChevronRight size={20} />
                  </Button>
                </div>

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

                {adminSelectedCasa && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Detalles de Asistencia
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          onClick={handlePrintLista}
                          variant="secondary"
                          className="flex items-center gap-2"
                          disabled={participantes.length === 0}
                        >
                          <Users size={18} />
                          PDF Lista
                        </Button>
                        <Button
                          onClick={handlePrintAsistencia}
                          variant="secondary"
                          className="flex items-center gap-2"
                          disabled={
                            participantes.length === 0 || historial.length === 0
                          }
                        >
                          <FileText size={18} />
                          PDF Asistencia
                        </Button>
                      </div>
                    </div>
                    {participantes.length > 0 && historial.length > 0 ? (
                      <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-100 border-b border-gray-200 sticky top-0">
                            <tr>
                              <th className="px-4 py-3 text-left font-semibold text-gray-700 min-w-[180px]">
                                Nombre
                              </th>
                              {getFechasDelHistorial().map((f) => (
                                <th
                                  key={f.fecha}
                                  className="px-2 py-3 text-center font-semibold text-gray-700 whitespace-nowrap min-w-[80px] text-xs"
                                  title={f.fechaLarga}
                                >
                                  {f.fechaFormato}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {participantes.map((p) => (
                              <tr key={p.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-gray-900 font-medium">
                                  <div>
                                    <p className="text-sm">
                                      {p.nombres} {p.apellidos}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {p.ci}
                                    </p>
                                  </div>
                                </td>
                                {getFechasDelHistorial().map((f) => {
                                  const asistencia = historial.find(
                                    (a) =>
                                      a.participante_id === p.id &&
                                      a.fecha === f.fecha,
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
                                          />
                                        ) : (
                                          <XCircle
                                            size={20}
                                            className="inline text-red-600"
                                          />
                                        )
                                      ) : null}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-center">
                        <p className="text-sm text-yellow-800">
                          {participantes.length === 0
                            ? "No hay participantes en esta casa."
                            : "No hay registros de asistencia para generar el reporte."}
                        </p>
                      </div>
                    )}
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
