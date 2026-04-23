"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { Pagination } from "@/components/ui/Pagination";
import { useReportes } from "@/hooks/useReportes";
import { useAuth } from "@/context/AuthContext";
import {
  listTalleresRequest,
  listParticipantesRequest,
  listCasasRequest,
  listActividadesRequest,
} from "@/lib/auth";
import {
  BarChart3,
  Users,
  Building2,
  BookOpen,
  Activity,
  Printer,
  TrendingUp,
} from "lucide-react";

export default function ReportesPage() {
  const {
    estadisticas,
    reporteAsistenciaParticipante,
    reporteAsistenciaCasa,
    reporteEvaluaciones,
    reporteActividad,
    isLoading,
    error,
    loadEstadisticas,
    loadReporteAsistenciaParticipante,
    loadReporteAsistenciaCasa,
    loadReporteEvaluaciones,
    loadReporteActividad,
  } = useReportes();

  const { usuario } = useAuth();
  const [activeTab, setActiveTab] = useState("resumen");

  const [participantes, setParticipantes] = useState([]);
  const [talleres, setTalleres] = useState([]);
  const [casas, setCasas] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [loadingLists, setLoadingLists] = useState(true);

  const [selectedParticipante, setSelectedParticipante] = useState("");
  const [selectedTaller, setSelectedTaller] = useState("");
  const [selectedCasa, setSelectedCasa] = useState("");
  const [selectedActividad, setSelectedActividad] = useState("");

  const [
    currentPageAsistenciaParticipante,
    setCurrentPageAsistenciaParticipante,
  ] = useState(1);
  const [currentPageAsistenciaCasa, setCurrentPageAsistenciaCasa] = useState(1);
  const [currentPageEvaluaciones, setCurrentPageEvaluaciones] = useState(1);
  const [currentPageActividades, setCurrentPageActividades] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadEstadisticas();
    const cargarListas = async () => {
      setLoadingLists(true);
      try {
        const [talleresData, participantesData, casasData, actividadesData] =
          await Promise.all([
            listTalleresRequest(),
            listParticipantesRequest(0, 200),
            listCasasRequest(),
            listActividadesRequest(),
          ]);
        setTalleres(Array.isArray(talleresData) ? talleresData : []);
        setParticipantes(
          Array.isArray(participantesData) ? participantesData : [],
        );
        setCasas(Array.isArray(casasData) ? casasData : []);
        setActividades(Array.isArray(actividadesData) ? actividadesData : []);
      } catch {
        // Las listas individuales fallarán silenciosamente; la page mostrará vacío
      } finally {
        setLoadingLists(false);
      }
    };
    cargarListas();
  }, [loadEstadisticas]);

  const handlePrint = () => window.print();

  if (usuario?.rol !== "Administrador") {
    return (
      <div className="space-y-6">
        <Alert
          type="error"
          title="Acceso denegado"
          message="Solo los administradores pueden acceder a los reportes"
        />
      </div>
    );
  }

  // ----- helpers de paginación -----
  const paginate = (data, page) => {
    if (!Array.isArray(data)) return [];
    const start = (page - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  };

  const totalPages = (data) =>
    Array.isArray(data) ? Math.ceil(data.length / itemsPerPage) : 1;

  // ----- datos de reportes -----
  const asistenciaRows = Array.isArray(reporteAsistenciaParticipante?.talleres)
    ? reporteAsistenciaParticipante.talleres
    : [];

  const asistenciaCasaRows = Array.isArray(reporteAsistenciaCasa?.talleres)
    ? reporteAsistenciaCasa.talleres
    : [];

  const evaluacionesRows = Array.isArray(reporteEvaluaciones?.participantes)
    ? reporteEvaluaciones.participantes
    : [];

  const actividadRows = Array.isArray(reporteActividad?.participantes)
    ? reporteActividad.participantes
    : [];

  const tabs = [
    { key: "resumen", label: "Resumen", icon: BarChart3 },
    { key: "asistencia-participante", label: "Asistencia", icon: Users },
    { key: "asistencia-casa", label: "Por Casa", icon: Building2 },
    { key: "evaluaciones", label: "Evaluaciones", icon: BookOpen },
    { key: "actividades", label: "Actividades", icon: Activity },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Reportes
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Análisis integral de la gestión
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Printer size={18} />
          Imprimir
        </button>
      </div>

      {error && <Alert type="error" title="Error" message={error} />}

      {/* Tabs */}
      <Card className="overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-200 bg-gray-50">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-3 font-medium transition-colors whitespace-nowrap border-b-2 ${
                activeTab === key
                  ? "border-blue-600 text-blue-600 bg-white"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <span className="flex items-center gap-2">
                <Icon size={18} />
                {label}
              </span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : activeTab === "resumen" ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-linear-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-700 mb-1">
                    Total participantes
                  </p>
                  <p className="text-3xl font-bold text-blue-900">
                    {estadisticas?.total_participantes ?? 0}
                  </p>
                </div>
                <div className="bg-linear-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-green-700 mb-1">
                    Total casas
                  </p>
                  <p className="text-3xl font-bold text-green-900">
                    {estadisticas?.total_casas ?? 0}
                  </p>
                </div>
                <div className="bg-linear-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-purple-700 mb-1">
                    Total talleres
                  </p>
                  <p className="text-3xl font-bold text-purple-900">
                    {estadisticas?.total_talleres ??
                      estadisticas?.talleres_activos ??
                      0}
                  </p>
                </div>
                <div className="bg-linear-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-orange-700 mb-1">
                    Facilitadores
                  </p>
                  <p className="text-3xl font-bold text-orange-900">
                    {estadisticas?.total_facilitadores ?? 0}
                  </p>
                </div>
              </div>

              <Card className="p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="text-blue-600" />
                  Casas registradas
                </h3>
                {loadingLists ? (
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                ) : casas.length === 0 ? (
                  <p className="text-sm text-gray-500">Sin casas registradas</p>
                ) : (
                  <div className="space-y-3">
                    {casas.slice(0, 8).map((casa) => (
                      <div key={casa.id} className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-700 w-48 truncate">
                          {casa.nombre}
                        </span>
                        <span className="text-xs text-gray-500">
                          {casa.macrodistrito}
                        </span>
                      </div>
                    ))}
                    {casas.length > 8 && (
                      <p className="text-xs text-gray-400">
                        +{casas.length - 8} más...
                      </p>
                    )}
                  </div>
                )}
              </Card>
            </div>
          ) : activeTab === "asistencia-participante" ? (
            <div className="space-y-4">
              <Select
                label="Seleccionar participante"
                value={selectedParticipante}
                onChange={(e) => {
                  setSelectedParticipante(e.target.value);
                  setCurrentPageAsistenciaParticipante(1);
                  if (e.target.value) {
                    loadReporteAsistenciaParticipante(parseInt(e.target.value));
                  }
                }}
              >
                <option value="">-- Selecciona un participante --</option>
                {participantes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombres} {p.apellidos}
                  </option>
                ))}
              </Select>

              {selectedParticipante &&
                (asistenciaRows.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4">
                    Sin registros de asistencia.
                  </p>
                ) : (
                  <>
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                              Taller
                            </th>
                            <th className="px-4 py-3 text-center font-semibold text-gray-700">
                              Presentes
                            </th>
                            <th className="px-4 py-3 text-center font-semibold text-gray-700">
                              Total
                            </th>
                            <th className="px-4 py-3 text-center font-semibold text-gray-700">
                              %
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {paginate(
                            asistenciaRows,
                            currentPageAsistenciaParticipante,
                          ).map((row, i) => {
                            const pct =
                              row.total_clases > 0
                                ? Math.round(
                                    (row.presentes / row.total_clases) * 100,
                                  )
                                : 0;
                            return (
                              <tr key={i}>
                                <td className="px-4 py-3 text-gray-900">
                                  {row.taller_nombre ?? row.taller ?? "-"}
                                </td>
                                <td className="px-4 py-3 text-center text-gray-600">
                                  {row.presentes ?? "-"}
                                </td>
                                <td className="px-4 py-3 text-center text-gray-600">
                                  {row.total_clases ?? "-"}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-semibold ${pct >= 70 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                                  >
                                    {pct}%
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <Pagination
                      currentPage={currentPageAsistenciaParticipante}
                      totalPages={totalPages(asistenciaRows)}
                      onPageChange={setCurrentPageAsistenciaParticipante}
                      itemsPerPage={itemsPerPage}
                      totalItems={asistenciaRows.length}
                    />
                  </>
                ))}
            </div>
          ) : activeTab === "asistencia-casa" ? (
            <div className="space-y-4">
              <Select
                label="Seleccionar casa"
                value={selectedCasa}
                onChange={(e) => {
                  setSelectedCasa(e.target.value);
                  setCurrentPageAsistenciaCasa(1);
                  if (e.target.value) {
                    loadReporteAsistenciaCasa(parseInt(e.target.value));
                  }
                }}
              >
                <option value="">-- Selecciona una casa --</option>
                {casas.map((casa) => (
                  <option key={casa.id} value={casa.id}>
                    {casa.nombre}
                  </option>
                ))}
              </Select>

              {selectedCasa &&
                (asistenciaCasaRows.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4">
                    Sin registros de asistencia.
                  </p>
                ) : (
                  <>
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                              Taller
                            </th>
                            <th className="px-4 py-3 text-center font-semibold text-gray-700">
                              Sesiones
                            </th>
                            <th className="px-4 py-3 text-center font-semibold text-gray-700">
                              Presentes
                            </th>
                            <th className="px-4 py-3 text-center font-semibold text-gray-700">
                              Ausentes
                            </th>
                            <th className="px-4 py-3 text-center font-semibold text-gray-700">
                              %
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {paginate(
                            asistenciaCasaRows,
                            currentPageAsistenciaCasa,
                          ).map((row, i) => {
                            const pct =
                              row.total_clases > 0
                                ? Math.round(
                                    (row.presentes / row.total_clases) * 100,
                                  )
                                : 0;
                            return (
                              <tr key={i}>
                                <td className="px-4 py-3 text-gray-900 font-medium">
                                  {row.taller_nombre ?? row.taller ?? "-"}
                                </td>
                                <td className="px-4 py-3 text-center text-gray-600">
                                  {row.total_clases ?? "-"}
                                </td>
                                <td className="px-4 py-3 text-center text-gray-600">
                                  {row.presentes ?? "-"}
                                </td>
                                <td className="px-4 py-3 text-center text-gray-600">
                                  {row.ausentes ?? "-"}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-semibold ${pct >= 70 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                                  >
                                    {pct}%
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <Pagination
                      currentPage={currentPageAsistenciaCasa}
                      totalPages={totalPages(asistenciaCasaRows)}
                      onPageChange={setCurrentPageAsistenciaCasa}
                      itemsPerPage={itemsPerPage}
                      totalItems={asistenciaCasaRows.length}
                    />
                  </>
                ))}
            </div>
          ) : activeTab === "evaluaciones" ? (
            <div className="space-y-4">
              <Select
                label="Seleccionar taller"
                value={selectedTaller}
                onChange={(e) => {
                  setSelectedTaller(e.target.value);
                  setCurrentPageEvaluaciones(1);
                  if (e.target.value) {
                    loadReporteEvaluaciones(parseInt(e.target.value));
                  }
                }}
              >
                <option value="">-- Selecciona un taller --</option>
                {talleres.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </Select>

              {selectedTaller &&
                (evaluacionesRows.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4">
                    Sin evaluaciones registradas.
                  </p>
                ) : (
                  <>
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                              Participante
                            </th>
                            <th className="px-4 py-3 text-center font-semibold text-gray-700">
                              Nota 1
                            </th>
                            <th className="px-4 py-3 text-center font-semibold text-gray-700">
                              Nota 2
                            </th>
                            <th className="px-4 py-3 text-center font-semibold text-gray-700">
                              Promedio
                            </th>
                            <th className="px-4 py-3 text-center font-semibold text-gray-700">
                              Estado
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {paginate(
                            evaluacionesRows,
                            currentPageEvaluaciones,
                          ).map((row, i) => {
                            const nota1 = row.nota_1 ?? null;
                            const nota2 = row.nota_2 ?? null;
                            const promedio =
                              nota1 !== null && nota2 !== null
                                ? Math.round((nota1 + nota2) / 2)
                                : (nota1 ?? nota2 ?? null);
                            const aprobado =
                              promedio !== null && promedio >= 60;
                            return (
                              <tr key={i}>
                                <td className="px-4 py-3 text-gray-900">
                                  {row.participante_nombre ?? row.nombre ?? "-"}
                                </td>
                                <td className="px-4 py-3 text-center text-gray-600">
                                  {nota1 ?? "-"}
                                </td>
                                <td className="px-4 py-3 text-center text-gray-600">
                                  {nota2 ?? "-"}
                                </td>
                                <td className="px-4 py-3 text-center font-bold text-gray-900">
                                  {promedio ?? "-"}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {promedio !== null ? (
                                    <span
                                      className={`px-2 py-1 rounded text-xs font-semibold ${aprobado ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                                    >
                                      {aprobado ? "Aprobado" : "Reprobado"}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 text-xs">
                                      Sin nota
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <Pagination
                      currentPage={currentPageEvaluaciones}
                      totalPages={totalPages(evaluacionesRows)}
                      onPageChange={setCurrentPageEvaluaciones}
                      itemsPerPage={itemsPerPage}
                      totalItems={evaluacionesRows.length}
                    />
                  </>
                ))}
            </div>
          ) : (
            // ACTIVIDADES
            <div className="space-y-4">
              <Select
                label="Seleccionar actividad"
                value={selectedActividad}
                onChange={(e) => {
                  setSelectedActividad(e.target.value);
                  setCurrentPageActividades(1);
                  if (e.target.value) {
                    loadReporteActividad(parseInt(e.target.value));
                  }
                }}
              >
                <option value="">-- Selecciona una actividad --</option>
                {actividades.map((act) => (
                  <option key={act.id} value={act.id}>
                    {act.nombre}
                  </option>
                ))}
              </Select>

              {selectedActividad &&
                (actividadRows.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4">
                    Sin registros de asistencia para esta actividad.
                  </p>
                ) : (
                  <>
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                              Participante
                            </th>
                            <th className="px-4 py-3 text-center font-semibold text-gray-700">
                              Fecha
                            </th>
                            <th className="px-4 py-3 text-center font-semibold text-gray-700">
                              Asistencia
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {paginate(actividadRows, currentPageActividades).map(
                            (row, i) => (
                              <tr key={i}>
                                <td className="px-4 py-3 text-gray-900">
                                  {row.participante_nombre ?? row.nombre ?? "-"}
                                </td>
                                <td className="px-4 py-3 text-center text-gray-600">
                                  {row.fecha ?? "-"}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-semibold ${row.presente ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                                  >
                                    {row.presente ? "Presente" : "Ausente"}
                                  </span>
                                </td>
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>
                    <Pagination
                      currentPage={currentPageActividades}
                      totalPages={totalPages(actividadRows)}
                      onPageChange={setCurrentPageActividades}
                      itemsPerPage={itemsPerPage}
                      totalItems={actividadRows.length}
                    />
                  </>
                ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
