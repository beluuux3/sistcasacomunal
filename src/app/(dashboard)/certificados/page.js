"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { useAuth } from "@/context/AuthContext";
import { useGestion } from "@/context/GestionContext";
import {
  Printer,
  CheckCircle2,
  AlertCircle,
  Award,
  Download,
  Eye,
} from "lucide-react";

export default function CertificadosPage() {
  const { user } = useAuth();
  const { gestionActiva } = useGestion();

  const [paso, setPaso] = useState(1); // 1: seleccionar, 2: verificar, 3: generar
  const [selectedTaller, setSelectedTaller] = useState("");
  const [talleres, setTalleres] = useState([]);
  const [participantes, setParticipantes] = useState([]);
  const [selectedParticipantes, setSelectedParticipantes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewParticipante, setPreviewParticipante] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    // Cargar talleres simulados
    setTalleres([
      { id: 1, nombre: "Taller de Matemáticas" },
      { id: 2, nombre: "Taller de Español" },
      { id: 3, nombre: "Taller de Ciencias" },
      { id: 4, nombre: "Taller de Arte" },
    ]);
  }, []);

  // Verificar elegibilidad
  const handleVerificarElegibilidad = async () => {
    if (!selectedTaller) {
      alert("Por favor selecciona un taller");
      return;
    }

    setIsLoading(true);
    try {
      // Simulado: obtener participantes elegibles
      const mockParticipantes = [
        {
          id: 1,
          nombre: "Juan Pérez",
          ci: "1234567890",
          asistencia: 85,
          evaluacion: 75,
          elegible: true,
          razon: "",
        },
        {
          id: 2,
          nombre: "María García",
          ci: "0987654321",
          asistencia: 92,
          evaluacion: 88,
          elegible: true,
          razon: "",
        },
        {
          id: 3,
          nombre: "Carlos López",
          ci: "5555555555",
          asistencia: 45,
          evaluacion: 60,
          elegible: false,
          razon: "Asistencia insuficiente (<70%)",
        },
        {
          id: 4,
          nombre: "Ana Martínez",
          ci: "4444444444",
          asistencia: 88,
          evaluacion: 55,
          elegible: false,
          razon: "Evaluación insuficiente (<70%)",
        },
      ];

      setParticipantes(mockParticipantes);
      setPaso(2);
    } catch (err) {
      alert("Error al verificar elegibilidad");
    } finally {
      setIsLoading(false);
    }
  };

  // Cambiar selección de participante
  const handleToggleParticipante = (id) => {
    if (selectedParticipantes.includes(id)) {
      setSelectedParticipantes(selectedParticipantes.filter((p) => p !== id));
    } else {
      setSelectedParticipantes([...selectedParticipantes, id]);
    }
  };

  // Seleccionar todos los elegibles
  const handleSelectAllElegibles = () => {
    const elegibles = participantes.filter((p) => p.elegible).map((p) => p.id);
    setSelectedParticipantes(elegibles);
  };

  // Desseleccionar todos
  const handleDeselectAll = () => {
    setSelectedParticipantes([]);
  };

  // Generar certificados
  const handleGenerarCertificados = () => {
    if (selectedParticipantes.length === 0) {
      alert("Selecciona al menos un participante");
      return;
    }

    setPaso(3);
  };

  const handleDescargarCertificados = () => {
    // Simular descarga
    alert(
      "Descargando PDF con " +
        selectedParticipantes.length +
        " certificados...",
    );
    // window.print() sería la opción real en el navegador
  };

  const handleImprimirCertificados = () => {
    window.print();
  };

  // Solo admin
  if (user?.rol !== "admin") {
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

      {/* Progress indicator */}
      <div className="flex gap-2 justify-center">
        {[1, 2, 3].map((p) => (
          <div key={p} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                paso >= p
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {p}
            </div>
            {p < 3 && (
              <div
                className={`w-8 h-1 ${paso > p ? "bg-blue-600" : "bg-gray-200"}`}
              ></div>
            )}
          </div>
        ))}
      </div>

      {/* PASO 1: Seleccionar taller */}
      {paso === 1 && (
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">
            Paso 1: Seleccionar Taller
          </h2>

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
          >
            <option value="">-- Selecciona un taller --</option>
            {talleres.map((taller) => (
              <option key={taller.id} value={taller.id}>
                {taller.nombre}
              </option>
            ))}
          </Select>

          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={handleVerificarElegibilidad}
              disabled={!selectedTaller || isLoading}
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
            <h2 className="text-lg font-bold text-slate-900">
              Paso 2: Verificar Elegibilidad
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Se encontraron {participantes.length} participantes.{" "}
              {participantes.filter((p) => p.elegible).length} son elegibles
              para el certificado.
            </p>
          </div>

          <div className="p-6">
            {/* Resumen de criterios */}
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Criterios de elegibilidad:</strong> Mínimo 70% de
                asistencia y nota ≥ 70 puntos
              </p>
            </div>

            {/* Acciones */}
            <div className="flex gap-2 mb-4">
              <Button variant="secondary" onClick={handleSelectAllElegibles}>
                Seleccionar elegibles
              </Button>
              <Button variant="secondary" onClick={handleDeselectAll}>
                Deseleccionar todos
              </Button>
            </div>

            {/* Tabla */}
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
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleSelectAllElegibles();
                          } else {
                            handleDeselectAll();
                          }
                        }}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Participante
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">
                      CI
                    </th>
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
                  {(() => {
                    const totalPages = Math.ceil(
                      participantes.length / itemsPerPage,
                    );
                    const startIndex = (currentPage - 1) * itemsPerPage;
                    const paginatedData = participantes.slice(
                      startIndex,
                      startIndex + itemsPerPage,
                    );
                    return paginatedData.map((participante) => (
                      <tr
                        key={p.id}
                        className={`${selectedParticipantes.includes(p.id) ? "bg-blue-50" : ""}`}
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
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {p.nombre}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-600">
                          {p.ci}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              p.asistencia >= 70
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {p.asistencia}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              p.evaluacion >= 70
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {p.evaluacion}
                          </span>
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
                              <p className="text-xs text-gray-500 mt-1">
                                {p.razon}
                              </p>
                            </div>
                          )}
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(participantes.length / itemsPerPage)}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={participantes.length}
              />
            </div>

            {/* Acciones */}
            <div className="mt-6 flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setPaso(1)}>
                Atrás
              </Button>
              <Button
                variant="primary"
                onClick={handleGenerarCertificados}
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
              <Award className="text-green-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-green-900">
                  Certificados listos para generar
                </h3>
                <p className="text-sm text-green-800 mt-1">
                  Se generarán {selectedParticipantes.length} certificado(s) de
                  participación
                </p>
              </div>
            </div>
          </Card>

          {/* Grid de certificados previa */}
          <div className="grid grid-cols-1 gap-4">
            {participantes
              .filter((p) => selectedParticipantes.includes(p.id))
              .map((participante) => (
                <Card key={participante.id} className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {participante.nombre}
                      </p>
                      <p className="text-sm text-gray-600">
                        CI: {participante.ci}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setPreviewParticipante(participante);
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

          {/* Botones de descarga */}
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setPaso(2)}>
              Atrás
            </Button>
            <button
              onClick={handleDescargarCertificados}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              <Download size={18} />
              Descargar PDF
            </button>
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
            {/* Certificado */}
            <div className="border-4 border-amber-800 bg-amber-50 p-8 text-center space-y-4 rounded-lg">
              <p className="text-sm font-semibold text-amber-900 tracking-widest">
                GAMLP
              </p>

              <h2 className="text-2xl font-bold text-amber-900">
                CERTIFICADO DE PARTICIPACIÓN
              </h2>

              <div className="border-b-2 border-amber-800 py-4">
                <p className="text-sm text-amber-800 mb-2">Se otorga a:</p>
                <p className="text-xl font-bold text-amber-900">
                  {previewParticipante.nombre}
                </p>
                <p className="text-sm text-amber-800">
                  CI: {previewParticipante.ci}
                </p>
              </div>

              <div className="space-y-2 text-sm text-amber-800">
                <p>
                  Por haber participado completamente en el taller
                  correspondiente
                </p>
                <p>Durante el trimestre del año académico correspondiente.</p>
                {gestionActiva && (
                  <p>
                    <strong>
                      {gestionActiva.anio} - Trimestre {gestionActiva.trimestre}
                    </strong>
                  </p>
                )}
              </div>

              <div className="pt-4 space-y-8">
                <p className="text-xs text-amber-800">
                  _______________________
                </p>
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
