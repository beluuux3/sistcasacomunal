"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { useAuth } from "@/context/AuthContext";
import { useGestion } from "@/context/GestionContext";
import {
  listTalleresRequest,
  getTallerParticipantesRequest,
  verificarCertificadoRequest,
} from "@/lib/auth";
import {
  Printer,
  CheckCircle2,
  AlertCircle,
  Award,
  Download,
  Eye,
} from "lucide-react";

export default function CertificadosPage() {
  const { usuario } = useAuth();
  const { gestionActiva } = useGestion();

  const [paso, setPaso] = useState(1);
  const [selectedTaller, setSelectedTaller] = useState("");
  const [talleres, setTalleres] = useState([]);
  const [participantes, setParticipantes] = useState([]);
  const [selectedParticipantes, setSelectedParticipantes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTalleres, setLoadingTalleres] = useState(true);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [previewParticipante, setPreviewParticipante] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const cargar = async () => {
      setLoadingTalleres(true);
      try {
        const data = await listTalleresRequest();
        setTalleres(Array.isArray(data) ? data.filter((t) => t.activo !== false) : []);
      } catch {
        setError("No se pudieron cargar los talleres");
      } finally {
        setLoadingTalleres(false);
      }
    };
    cargar();
  }, []);

  const handleVerificarElegibilidad = async () => {
    if (!selectedTaller) return;
    setIsLoading(true);
    setError("");
    try {
      const inscritos = await getTallerParticipantesRequest(parseInt(selectedTaller));
      const lista = Array.isArray(inscritos) ? inscritos : [];

      const resultados = await Promise.all(
        lista.map(async (p) => {
          try {
            const cert = await verificarCertificadoRequest(p.id, parseInt(selectedTaller));
            return {
              id: p.id,
              nombre: `${p.nombres ?? ""} ${p.apellidos ?? ""}`.trim(),
              ci: p.ci ?? "-",
              asistencia: cert?.porcentaje_asistencia ?? cert?.asistencia ?? null,
              evaluacion: cert?.promedio ?? cert?.evaluacion ?? null,
              elegible: cert?.elegible ?? false,
              razon: cert?.razon ?? "",
            };
          } catch {
            return {
              id: p.id,
              nombre: `${p.nombres ?? ""} ${p.apellidos ?? ""}`.trim(),
              ci: p.ci ?? "-",
              asistencia: null,
              evaluacion: null,
              elegible: false,
              razon: "No se pudo verificar",
            };
          }
        }),
      );

      setParticipantes(resultados);
      setSelectedParticipantes([]);
      setCurrentPage(1);
      setPaso(2);
    } catch (err) {
      setError(err.response?.data?.detail ?? err.message ?? "Error al verificar elegibilidad");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleParticipante = (id) => {
    setSelectedParticipantes((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const handleSelectAllElegibles = () => {
    setSelectedParticipantes(participantes.filter((p) => p.elegible).map((p) => p.id));
  };

  const handleDeselectAll = () => setSelectedParticipantes([]);

  const handleImprimirCertificados = () => window.print();

  // Solo admin
  if (usuario?.rol !== "Administrador") {
    return (
      <div className="space-y-6">
        <Alert
          type="error"
          title="Acceso denegado"
          message="Solo los administradores pueden generar certificados"
        />
      </div>
    );
  }

  const paginatedParticipantes = participantes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Certificados de Participación
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">
          Verifica elegibilidad y genera certificados para los participantes
        </p>
      </div>

      {error && <Alert type="error" title="Error" message={error} />}

      {/* Progress indicator */}
      <div className="flex gap-2 justify-center">
        {[1, 2, 3].map((p) => (
          <div key={p} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                paso >= p ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              {p}
            </div>
            {p < 3 && (
              <div className={`w-8 h-1 ${paso > p ? "bg-blue-600" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* PASO 1: Seleccionar taller */}
      {paso === 1 && (
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Paso 1: Seleccionar Taller</h2>

          {gestionActiva && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                Gestión:{" "}
                <strong>
                  {gestionActiva.anio} - Trimestre {gestionActiva.trimestre}
                </strong>
              </p>
            </div>
          )}

          <Select
            label="Taller"
            value={selectedTaller}
            onChange={(e) => setSelectedTaller(e.target.value)}
            disabled={loadingTalleres}
          >
            <option value="">
              {loadingTalleres ? "Cargando talleres..." : "-- Selecciona un taller --"}
            </option>
            {talleres.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </Select>

          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={handleVerificarElegibilidad}
              disabled={!selectedTaller || isLoading || loadingTalleres}
            >
              {isLoading ? "Verificando..." : "Verificar Elegibilidad"}
            </Button>
          </div>
        </Card>
      )}

      {/* PASO 2: Verificar elegibilidad */}
      {paso === 2 && (
        <Card className="space-y-4">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-slate-900">Paso 2: Verificar Elegibilidad</h2>
            <p className="text-sm text-gray-600 mt-2">
              {participantes.length} participante(s) encontrado(s).{" "}
              <strong>{participantes.filter((p) => p.elegible).length}</strong> elegible(s).
            </p>
          </div>

          <div className="p-6">
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Criterios de elegibilidad:</strong> Mínimo 70% de asistencia y nota ≥ 70
                puntos
              </p>
            </div>

            <div className="flex gap-2 mb-4">
              <Button variant="secondary" onClick={handleSelectAllElegibles}>
                Seleccionar elegibles
              </Button>
              <Button variant="secondary" onClick={handleDeselectAll}>
                Deseleccionar todos
              </Button>
            </div>

            {participantes.length === 0 ? (
              <p className="text-sm text-gray-500 py-4">
                No hay participantes inscritos en este taller.
              </p>
            ) : (
              <>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={
                              selectedParticipantes.length > 0 &&
                              participantes
                                .filter((p) => p.elegible)
                                .every((p) => selectedParticipantes.includes(p.id))
                            }
                            onChange={(e) =>
                              e.target.checked ? handleSelectAllElegibles() : handleDeselectAll()
                            }
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">
                          Participante
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700">CI</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700">
                          Asistencia
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700">
                          Evaluación
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paginatedParticipantes.map((p) => (
                        <tr
                          key={p.id}
                          className={selectedParticipantes.includes(p.id) ? "bg-blue-50" : ""}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedParticipantes.includes(p.id)}
                              onChange={() => handleToggleParticipante(p.id)}
                              disabled={!p.elegible}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            />
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900">{p.nombre}</td>
                          <td className="px-4 py-3 text-center text-gray-600">{p.ci}</td>
                          <td className="px-4 py-3 text-center">
                            {p.asistencia !== null ? (
                              <span
                                className={`px-2 py-1 rounded text-xs font-semibold ${
                                  p.asistencia >= 70
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {p.asistencia}%
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">N/D</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {p.evaluacion !== null ? (
                              <span
                                className={`px-2 py-1 rounded text-xs font-semibold ${
                                  p.evaluacion >= 70
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {p.evaluacion}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">N/D</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {p.elegible ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                                <CheckCircle2 size={12} />
                                Apto
                              </span>
                            ) : (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
                                  <AlertCircle size={12} />
                                  No apto
                                </span>
                                {p.razon && (
                                  <p className="text-xs text-gray-500">{p.razon}</p>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(participantes.length / itemsPerPage)}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={participantes.length}
                />
              </>
            )}

            <div className="mt-6 flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setPaso(1)}>
                Atrás
              </Button>
              <Button
                variant="primary"
                onClick={() => setPaso(3)}
                disabled={selectedParticipantes.length === 0}
              >
                Generar Certificados ({selectedParticipantes.length})
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* PASO 3: Vista previa y descarga */}
      {paso === 3 && (
        <div className="space-y-4">
          <Card className="p-6 bg-green-50 border border-green-200">
            <div className="flex items-start gap-3">
              <Award className="text-green-600 shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-green-900">Certificados listos para generar</h3>
                <p className="text-sm text-green-800 mt-1">
                  Se generarán {selectedParticipantes.length} certificado(s) de participación
                </p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4">
            {participantes
              .filter((p) => selectedParticipantes.includes(p.id))
              .map((p) => (
                <Card key={p.id} className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">{p.nombre}</p>
                      <p className="text-sm text-gray-600">CI: {p.ci}</p>
                    </div>
                    <button
                      onClick={() => {
                        setPreviewParticipante(p);
                        setShowPreview(true);
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Eye size={16} />
                      Vista previa
                    </button>
                  </div>
                </Card>
              ))}
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setPaso(2)}>
              Atrás
            </Button>
            <button
              onClick={handleImprimirCertificados}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors no-print"
            >
              <Printer size={18} />
              Imprimir
            </button>
          </div>
        </div>
      )}

      {/* Modal vista previa certificado */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Vista Previa del Certificado"
      >
        {previewParticipante && (
          <div className="space-y-4">
            <div className="border-4 border-amber-800 bg-amber-50 p-8 text-center space-y-4 rounded-lg">
              <p className="text-sm font-semibold text-amber-900 tracking-widest">GAMLP</p>

              <h2 className="text-2xl font-bold text-amber-900">
                CERTIFICADO DE PARTICIPACIÓN
              </h2>

              <div className="border-b-2 border-amber-800 py-4">
                <p className="text-sm text-amber-800 mb-2">Se otorga a:</p>
                <p className="text-xl font-bold text-amber-900">{previewParticipante.nombre}</p>
                <p className="text-sm text-amber-800">CI: {previewParticipante.ci}</p>
              </div>

              <div className="space-y-2 text-sm text-amber-800">
                <p>
                  Por haber participado y completado satisfactoriamente el taller correspondiente
                </p>
                {gestionActiva && (
                  <p>
                    <strong>
                      Gestión {gestionActiva.anio} — Trimestre {gestionActiva.trimestre}
                    </strong>
                  </p>
                )}
              </div>

              <div className="pt-8 space-y-2">
                <p className="text-xs text-amber-800">_______________________</p>
                <p className="text-xs text-amber-800">Firma autorizada</p>
              </div>

              <p className="text-xs text-gray-500 pt-4">
                {new Date().toLocaleDateString("es-ES")}
              </p>
            </div>

            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setShowPreview(false)}>
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
