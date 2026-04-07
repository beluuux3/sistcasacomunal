"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Pagination } from "@/components/ui/Pagination";
import { useReportes } from "@/hooks/useReportes";
import { useAuth } from "@/context/AuthContext";
import {
  BarChart3,
  Users,
  Building2,
  BookOpen,
  Activity,
  Printer,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
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

  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("resumen");
  const [participantes, setParticipantes] = useState([]);
  const [talleres, setTalleres] = useState([]);
  const [casas, setCasas] = useState([]);
  const [actividades, setActividades] = useState([]);

  // Filtros
  const [selectedParticipante, setSelectedParticipante] = useState("");
  const [selectedTaller, setSelectedTaller] = useState("");
  const [selectedCasa, setSelectedCasa] = useState("");
  const [selectedActividad, setSelectedActividad] = useState("");

  // Pagination state for all tables
  const [
    currentPageAsistenciaParticipante,
    setCurrentPageAsistenciaParticipante,
  ] = useState(1);
  const [currentPageAsistenciaCasa, setCurrentPageAsistenciaCasa] = useState(1);
  const [currentPageEvaluaciones, setCurrentPageEvaluaciones] = useState(1);
  const [currentPageActividades, setCurrentPageActividades] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    loadEstadisticas();

    // Cargar listas simuladas
    setParticipantes([
      { id: 1, nombre: "Juan Pérez" },
      { id: 2, nombre: "María García" },
      { id: 3, nombre: "Carlos López" },
      { id: 4, nombre: "Ana Martínez" },
    ]);

    setTalleres([
      { id: 1, nombre: "Taller 1" },
      { id: 2, nombre: "Taller 2" },
      { id: 3, nombre: "Taller 3" },
    ]);

    setCasas([
      { id: 1, nombre: "Casa Central" },
      { id: 2, nombre: "Casa Sur" },
      { id: 3, nombre: "Casa Este" },
    ]);

    setActividades([
      { id: 1, nombre: "Actividad 1" },
      { id: 2, nombre: "Actividad 2" },
      { id: 3, nombre: "Actividad 3" },
    ]);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  // Solo admin puede ver reportes
  if (user?.rol !== "admin") {
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

      {/* Error */}
      {error && <Alert type="error" title="Error" message={error} />}

      {/* Tabs */}
      <Card className="overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setActiveTab("resumen")}
            className={`px-4 py-3 font-medium transition-colors whitespace-nowrap border-b-2 ${
              activeTab === "resumen"
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <span className="flex items-center gap-2">
              <BarChart3 size={18} />
              Resumen
            </span>
          </button>

          <button
            onClick={() => setActiveTab("asistencia-participante")}
            className={`px-4 py-3 font-medium transition-colors whitespace-nowrap border-b-2 ${
              activeTab === "asistencia-participante"
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <span className="flex items-center gap-2">
              <Users size={18} />
              Asistencia
            </span>
          </button>

          <button
            onClick={() => setActiveTab("asistencia-casa")}
            className={`px-4 py-3 font-medium transition-colors whitespace-nowrap border-b-2 ${
              activeTab === "asistencia-casa"
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <span className="flex items-center gap-2">
              <Building2 size={18} />
              Por Casa
            </span>
          </button>

          <button
            onClick={() => setActiveTab("evaluaciones")}
            className={`px-4 py-3 font-medium transition-colors whitespace-nowrap border-b-2 ${
              activeTab === "evaluaciones"
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <span className="flex items-center gap-2">
              <BookOpen size={18} />
              Evaluaciones
            </span>
          </button>

          <button
            onClick={() => setActiveTab("actividades")}
            className={`px-4 py-3 font-medium transition-colors whitespace-nowrap border-b-2 ${
              activeTab === "actividades"
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <span className="flex items-center gap-2">
              <Activity size={18} />
              Actividades
            </span>
          </button>
        </div>

        {/* Tab content */}
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : activeTab === "resumen" ? (
            // RESUMEN
            <div className="space-y-6">
              {/* Metric cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-700 mb-1">
                    Total de participantes
                  </p>
                  <p className="text-3xl font-bold text-blue-900">
                    {estadisticas?.total_participantes || 0}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-green-700 mb-1">
                    Total de casas
                  </p>
                  <p className="text-3xl font-bold text-green-900">
                    {estadisticas?.total_casas || 0}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-purple-700 mb-1">
                    Total de talleres
                  </p>
                  <p className="text-3xl font-bold text-purple-900">
                    {estadisticas?.total_talleres || 0}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-orange-700 mb-1">
                    Tasa de asistencia
                  </p>
                  <p className="text-3xl font-bold text-orange-900">
                    {estadisticas?.tasa_asistencia || 0}%
                  </p>
                </div>
              </div>

              {/* Sample chart area */}
              <Card className="p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="text-blue-600" />
                  Resumen por casa
                </h3>
                <div className="space-y-3">
                  {casas.slice(0, 3).map((casa) => (
                    <div key={casa.id} className="flex items-center gap-4">
                      <span className="text-sm font-medium text-gray-700 w-32">
                        {casa.nombre}
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-full"
                          style={{ width: `${Math.random() * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                        {Math.floor(Math.random() * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ) : activeTab === "asistencia-participante" ? (
            // ASISTENCIA PARTICIPANTE
            <div className="space-y-4">
              <Select
                label="Seleccionar participante"
                value={selectedParticipante}
                onChange={(e) => {
                  setSelectedParticipante(e.target.value);
                  if (e.target.value) {
                    loadReporteAsistenciaParticipante(parseInt(e.target.value));
                  }
                }}
              >
                <option value="">-- Selecciona un participante --</option>
                {participantes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </Select>

              {selectedParticipante && (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">
                          Taller
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">
                          Asistencias
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">
                          Porcentaje
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {(() => {
                        const totalPages = Math.ceil(
                          talleres.length / itemsPerPage,
                        );
                        const startIndex =
                          (currentPageAsistenciaParticipante - 1) *
                          itemsPerPage;
                        const paginatedData = talleres.slice(
                          startIndex,
                          startIndex + itemsPerPage,
                        );
                        return paginatedData.map((taller) => (
                          <tr key={taller.id}>
                            <td className="px-4 py-3 text-gray-900">
                              {taller.nombre}
                            </td>
                            <td className="px-4 py-3 text-gray-600">12 / 15</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                                80%
                              </span>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : activeTab === "asistencia-casa" ? (
            // ASISTENCIA POR CASA
            <div className="space-y-4">
              <Select
                label="Seleccionar casa"
                value={selectedCasa}
                onChange={(e) => {
                  setSelectedCasa(e.target.value);
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

              {selectedCasa && (
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
                      {(() => {
                        const totalPages = Math.ceil(
                          talleres.length / itemsPerPage,
                        );
                        const startIndex =
                          (currentPageAsistenciaCasa - 1) * itemsPerPage;
                        const paginatedData = talleres.slice(
                          startIndex,
                          startIndex + itemsPerPage,
                        );
                        return paginatedData.map((taller) => (
                          <tr key={taller.id}>
                            <td className="px-4 py-3 text-gray-900 font-medium">
                              {taller.nombre}
                            </td>
                            <td className="px-4 py-3 text-center text-gray-600">
                              15
                            </td>
                            <td className="px-4 py-3 text-center text-gray-600">
                              48
                            </td>
                            <td className="px-4 py-3 text-center text-gray-600">
                              12
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                                80%
                              </span>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                  <Pagination
                    currentPage={currentPageAsistenciaCasa}
                    totalPages={Math.ceil(talleres.length / itemsPerPage)}
                    onPageChange={setCurrentPageAsistenciaCasa}
                    itemsPerPage={itemsPerPage}
                    totalItems={talleres.length}
                  />
                </div>
              )}
            </div>
          ) : activeTab === "evaluaciones" ? (
            // EVALUACIONES
            <div className="space-y-4">
              <Select
                label="Seleccionar taller"
                value={selectedTaller}
                onChange={(e) => {
                  setSelectedTaller(e.target.value);
                  if (e.target.value) {
                    loadReporteEvaluaciones(parseInt(e.target.value));
                  }
                }}
              >
                <option value="">-- Selecciona un taller --</option>
                {talleres.map((taller) => (
                  <option key={taller.id} value={taller.id}>
                    {taller.nombre}
                  </option>
                ))}
              </Select>

              {selectedTaller && (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">
                          Participante
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700">
                          Nota
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {(() => {
                        const totalPages = Math.ceil(
                          participantes.length / itemsPerPage,
                        );
                        const startIndex =
                          (currentPageEvaluaciones - 1) * itemsPerPage;
                        const paginatedData = participantes.slice(
                          startIndex,
                          startIndex + itemsPerPage,
                        );
                        return paginatedData.map((participante) => {
                          const nota = Math.floor(Math.random() * 100);
                          const estado = nota >= 60 ? "Aprobado" : "Reprobado";
                          return (
                            <tr key={participante.id}>
                              <td className="px-4 py-3 text-gray-900">
                                {participante.nombre}
                              </td>
                              <td className="px-4 py-3 text-center font-bold text-gray-900">
                                {nota}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-semibold ${
                                    estado === "Aprobado"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {estado}
                                </span>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                  <Pagination
                    currentPage={currentPageEvaluaciones}
                    totalPages={Math.ceil(participantes.length / itemsPerPage)}
                    onPageChange={setCurrentPageEvaluaciones}
                    itemsPerPage={itemsPerPage}
                    totalItems={participantes.length}
                  />
                </div>
              )}
            </div>
          ) : (
            // ACTIVIDADES
            <div className="space-y-4">
              <Select
                label="Seleccionar actividad"
                value={selectedActividad}
                onChange={(e) => {
                  setSelectedActividad(e.target.value);
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

              {selectedActividad && (
                <div className="space-y-4">
                  <Card className="p-4 bg-blue-50 border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Resumen:</strong> 24 participantes registrados, 20
                      asistieron (83.3%)
                    </p>
                  </Card>

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
                        {(() => {
                          const totalPages = Math.ceil(
                            participantes.length / itemsPerPage,
                          );
                          const startIndex =
                            (currentPageActividades - 1) * itemsPerPage;
                          const paginatedData = participantes.slice(
                            startIndex,
                            startIndex + itemsPerPage,
                          );
                          return paginatedData.map((p, idx) => (
                            <tr key={p.id}>
                              <td className="px-4 py-3 text-gray-900">
                                {p.nombre}
                              </td>
                              <td className="px-4 py-3 text-center text-gray-600">
                                2024-01-15
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold flex items-center justify-center gap-1">
                                  <CheckCircle2 size={14} />
                                  Presente
                                </span>
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                    <Pagination
                      currentPage={currentPageActividades}
                      totalPages={Math.ceil(
                        participantes.length / itemsPerPage,
                      )}
                      onPageChange={setCurrentPageActividades}
                      itemsPerPage={itemsPerPage}
                      totalItems={participantes.length}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
