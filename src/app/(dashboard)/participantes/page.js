"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Edit, Trash2, Upload, Eye, Download } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Alert } from "@/components/ui/Alert";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
  TableEmpty,
} from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { useParticipantes } from "@/hooks/useParticipantes";
import { useCasaSeleccionada } from "@/context/CasaSeleccionadaContext";
import { listCasasRequest } from "@/lib/auth";
import { getPDFContent } from "@/utils/generatePDFContent";

export default function ParticipantesPage() {
  const { usuario } = useAuth();
  const { casaSeleccionada: casaActual } = useCasaSeleccionada();
  const {
    participantes,
    isLoading,
    error,
    filtro,
    setFiltro,
    loadParticipantes,
    createParticipante,
    updateParticipante,
    uploadDocumento,
  } = useParticipantes();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingParticipanteId, setEditingParticipanteId] = useState(null);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [casas, setCasas] = useState([]);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [documentParticipanteId, setDocumentParticipanteId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const fileInputRef = useRef(null);

  // Estados para modal de detalles
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedParticipante, setSelectedParticipante] = useState(null);
  const [detailTab, setDetailTab] = useState("info"); // "info" o "documento"
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const [formData, setFormData] = useState({
    // DATOS DE REGISTRO
    casa_comunal_id: "",

    // DATOS PERSONALES
    apellido_paterno: "",
    apellido_materno: "",
    nombres: "",
    fecha_nacimiento: "",
    ci: "",
    genero: "",
    lugar_nacimiento: "",
    macrodistrito: "",
    estado_civil: "",
    direccion: "",
    telefono: "",
    contacto_emergencia: "",

    // DATOS ACADÃ‰MICOS
    grado_instruccion: "",
    ultimo_cargo: "",
    anios_servicio: "",

    // DATOS FAMILIARES
    familia_apellido_paterno: "",
    familia_apellido_materno: "",
    familia_nombres: "",
    familia_parentesco: "",
    familia_telefono: "",
    familia_direccion: "",

    // DATOS MÃ‰DICOS
    sistema_salud: "",
    enfermedad_base: "",
    tratamiento_especifico: "",

    // DATOS ADICIONALES
    como_se_entero: "",
  });

  // Cargar participantes y casas al montar
  useEffect(() => {
    // Pasar casa_id si es facilitador
    const casaId = usuario?.rol === "Facilitador" ? casaActual?.id : null;
    loadParticipantes(casaId);
    loadCasas();

    // Si es facilitador, asignar automáticamente su casa
    if (usuario?.rol === "Facilitador" && casaActual?.id) {
      setFormData((prev) => ({
        ...prev,
        casa_comunal_id: casaActual.id.toString(),
      }));
    }
  }, [usuario?.rol, casaActual?.id]);

  // Ciclo de vida para mensaje de Ã©xito
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  /**
   * Transforma los datos del formulario al formato esperado por la API
   */
  const transformFormDataForAPI = (data) => {
    // Construir apellidos combinados
    const apellidos =
      `${data.apellido_paterno} ${data.apellido_materno}`.trim();

    // Construir array de familia si hay datos
    const familia = [];
    if (
      data.familia_apellido_paterno ||
      data.familia_apellido_materno ||
      data.familia_nombres
    ) {
      familia.push({
        apellido_paterno: data.familia_apellido_paterno || null,
        apellido_materno: data.familia_apellido_materno || null,
        nombres: data.familia_nombres || null,
        parentesco: data.familia_parentesco || null,
        telefono: data.familia_telefono || null,
        direccion: data.familia_direccion || null,
      });
    }

    // Construir array de datos mÃ©dicos si hay datos
    const datos_medicos = [];
    if (
      data.sistema_salud ||
      data.enfermedad_base ||
      data.tratamiento_especifico
    ) {
      datos_medicos.push({
        sistema_salud: data.sistema_salud || null,
        enfermedad_base: data.enfermedad_base || null,
        tratamiento_especifico: data.tratamiento_especifico || null,
      });
    }

    // Construir objeto para enviar a API
    const apiData = {
      nombres: data.nombres || undefined,
      apellidos: apellidos || undefined,
      apellido_paterno: data.apellido_paterno || null,
      apellido_materno: data.apellido_materno || null,
      ci: data.ci || undefined,
      fecha_nacimiento: data.fecha_nacimiento || null,
      genero: data.genero || null,
      lugar_nacimiento: data.lugar_nacimiento || null,
      macrodistrito: data.macrodistrito || null,
      estado_civil: data.estado_civil || null,
      direccion: data.direccion || null,
      telefono: data.telefono || null,
      contacto_emergencia: data.contacto_emergencia || null,
      grado_instruccion: data.grado_instruccion || null,
      ultimo_cargo: data.ultimo_cargo || null,
      anios_servicio: data.anios_servicio
        ? parseInt(data.anios_servicio, 10)
        : null,
      como_se_entero: data.como_se_entero || null,
      casa_comunal_id: data.casa_comunal_id
        ? parseInt(data.casa_comunal_id, 10)
        : null,
      familia: familia.length > 0 ? familia : [],
      datos_medicos: datos_medicos.length > 0 ? datos_medicos : [],
    };

    // Remover campos undefined
    Object.keys(apiData).forEach((key) => {
      if (apiData[key] === undefined) {
        delete apiData[key];
      }
    });

    return apiData;
  };

  const loadCasas = async () => {
    try {
      const data = await listCasasRequest();
      const casasArray = Array.isArray(data) ? data : [];

      // Si es facilitador, filtrar solo su casa actual
      if (usuario?.rol === "Facilitador" && casaActual?.id) {
        const casasFiltradas = casasArray.filter((c) => c.id === casaActual.id);
        setCasas(casasFiltradas);
      } else {
        // Admin ve todas
        setCasas(casasArray);
      }
    } catch (err) {
      console.error("Error loading casas:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    // ValidaciÃ³n
    if (!formData.apellido_paterno.trim()) {
      setFormError("El apellido paterno es requerido");
      return;
    }
    if (!formData.apellido_materno.trim()) {
      setFormError("El apellido materno es requerido");
      return;
    }
    if (!formData.nombres.trim()) {
      setFormError("Los nombres son requeridos");
      return;
    }
    if (!formData.ci.trim()) {
      setFormError("El CI es requerido");
      return;
    }
    if (
      usuario?.rol === "Administrador" &&
      !String(formData.casa_comunal_id).trim()
    ) {
      setFormError("Debes seleccionar una casa comunal");
      return;
    }

    try {
      // Transformar datos al formato esperado por la API
      const apiData = transformFormDataForAPI(formData);

      if (isEditing) {
        await updateParticipante(editingParticipanteId, apiData);
        setSuccessMessage("Participante actualizado correctamente");
      } else {
        await createParticipante(apiData);
        setSuccessMessage("Participante creado correctamente");
      }
      resetForm();
      setIsModalOpen(false);
      const casaId = usuario?.rol === "Facilitador" ? casaActual?.id : null;
      await loadParticipantes(casaId);
    } catch (err) {
      setFormError(err.message || "Error al procesar la solicitud");
    }
  };

  const resetForm = () => {
    setFormData({
      // DATOS DE REGISTRO
      casa_comunal_id:
        usuario?.rol === "Facilitador" && casaActual?.id
          ? casaActual.id.toString()
          : "",

      // DATOS PERSONALES
      apellido_paterno: "",
      apellido_materno: "",
      nombres: "",
      fecha_nacimiento: "",
      ci: "",
      genero: "",
      lugar_nacimiento: "",
      macrodistrito: "",
      estado_civil: "",
      direccion: "",
      telefono: "",
      contacto_emergencia: "",

      // DATOS ACADÃ‰MICOS
      grado_instruccion: "",
      ultimo_cargo: "",
      anios_servicio: "",

      // DATOS FAMILIARES
      familia_apellido_paterno: "",
      familia_apellido_materno: "",
      familia_nombres: "",
      familia_parentesco: "",
      familia_telefono: "",
      familia_direccion: "",

      // DATOS MÃ‰DICOS
      sistema_salud: "",
      enfermedad_base: "",
      tratamiento_especifico: "",

      // DATOS ADICIONALES
      como_se_entero: "",
    });
    setIsEditing(false);
    setEditingParticipanteId(null);
    setFormError("");
  };

  const handleEdit = (participante) => {
    // Extraer datos médicos si vienen como array
    const datosMediacos = participante.datos_medicos?.[0] || {};
    const familia = participante.familia?.[0] || {};

    setFormData({
      // DATOS DE REGISTRO
      casa_comunal_id: participante.casa_comunal_id || "",

      // DATOS PERSONALES
      apellido_paterno: participante.apellido_paterno || "",
      apellido_materno: participante.apellido_materno || "",
      nombres: participante.nombres || "",
      fecha_nacimiento: participante.fecha_nacimiento || "",
      ci: participante.ci || "",
      genero: participante.genero || "",
      lugar_nacimiento: participante.lugar_nacimiento || "",
      macrodistrito: participante.macrodistrito || "",
      estado_civil: participante.estado_civil || "",
      direccion: participante.direccion || "",
      telefono: participante.telefono || "",
      contacto_emergencia: participante.contacto_emergencia || "",

      // DATOS ACADÉMICOS
      grado_instruccion: participante.grado_instruccion || "",
      ultimo_cargo: participante.ultimo_cargo || "",
      anios_servicio: participante.anios_servicio || "",

      // DATOS FAMILIARES
      familia_apellido_paterno: familia.apellido_paterno || "",
      familia_apellido_materno: familia.apellido_materno || "",
      familia_nombres: familia.nombres || "",
      familia_parentesco: familia.parentesco || "",
      familia_telefono: familia.telefono || "",
      familia_direccion: familia.direccion || "",

      // DATOS MÉDICOS (extraídos del array si existe)
      sistema_salud:
        datosMediacos.sistema_salud || participante.sistema_salud || "",
      enfermedad_base:
        datosMediacos.enfermedad_base || participante.enfermedad_base || "",
      tratamiento_especifico:
        datosMediacos.tratamiento_especifico ||
        participante.tratamiento_especifico ||
        "",

      // DATOS ADICIONALES
      como_se_entero: participante.como_se_entero || "",
    });
    setEditingParticipanteId(participante.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleNewParticipante = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setFormError("");
      await uploadDocumento(documentParticipanteId, file);
      setSuccessMessage("Documento subido correctamente");
      setShowDocumentUpload(false);
      const casaId = usuario?.rol === "Facilitador" ? casaActual?.id : null;
      await loadParticipantes(casaId);
    } catch (err) {
      setFormError(err.message);
    }
  };

  const triggerFileInput = (participanteId) => {
    setDocumentParticipanteId(participanteId);
    fileInputRef.current?.click();
  };

  const openDetailModal = (participante) => {
    setSelectedParticipante(participante);
    setDetailTab("info");
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedParticipante(null);
    setDetailTab("info");
  };

  const generatePDF = async (
    participante,
    numeroRegistro = participante.id,
  ) => {
    setIsGeneratingPDF(true);
    try {
      // Dinámicamente importar html2pdf
      const html2pdf = (await import("html2pdf.js")).default;

      // Obtener nombre de la casa comunal
      const casaInfo = casas.find(
        (c) =>
          c.id === parseInt(participante.casa_comunal_id, 10) ||
          c.id == participante.casa_comunal_id,
      ) || { nombre: "No Asignada" };

      // Obtener el contenido HTML como string
      const htmlContent = getPDFContent(participante, numeroRegistro, casaInfo);

      // Crear un contenedor temporal visible en la página
      const element = document.createElement("div");
      element.innerHTML = htmlContent;
      element.style.margin = "0";
      element.style.padding = "0";
      element.style.width = "21cm";

      // Agregar al body
      document.body.appendChild(element);

      // Pequeño delay para asegurar que el DOM está actualizado
      await new Promise((resolve) => setTimeout(resolve, 100));

      const opt = {
        margin: 0,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 1.5, logging: false, useCORS: true },
        jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
      };

      // Generar PDF
      const pdf = await html2pdf().set(opt).from(element).output("blob");

      // Remover el elemento del DOM inmediatamente
      document.body.removeChild(element);

      // Crear blob URL y abrir en nueva ventana
      const blobUrl = URL.createObjectURL(pdf);
      window.open(blobUrl, "_blank");

      // Liberar el blob URL después
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setFormError("Error al generar PDF: " + error.message);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Filtrar participantes por casa si es facilitador
  const participantesFiltrados =
    usuario?.rol === "Facilitador" && casaActual?.id
      ? participantes.filter((p) => p.casa_comunal_id === casaActual.id)
      : participantes;

  // PaginaciÃ³n
  const totalPages = Math.ceil(participantesFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const participantesPage = participantesFiltrados.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Participantes
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Gestión de participantes del sistema
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleNewParticipante}
          className="gap-2 whitespace-nowrap"
        >
          <Plus size={20} />
          Nuevo Participante
        </Button>
      </div>

      {/* Mensajes */}
      {error && <Alert type="error" title="Error" message={error} />}
      {successMessage && (
        <Alert type="success" title="Éxito" message={successMessage} />
      )}

      {/* Búsqueda */}
      <Card>
        <SearchInput
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder="Buscar por nombre, apellido o CI..."
        />
      </Card>

      {/* Tabla */}
      <Card>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Nº</TableHeader>
                  <TableHeader>Nombre Completo</TableHeader>
                  <TableHeader>Celular</TableHeader>
                  <TableHeader>Dirección</TableHeader>
                  <TableHeader>CI</TableHeader>
                  <TableHeader>Casa Comunal</TableHeader>
                  <TableHeader align="center">Acciones</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {participantesFiltrados.length === 0 ? (
                  <TableEmpty message="No hay participantes registrados" />
                ) : (
                  participantesPage.map((participante, index) => (
                    <TableRow key={participante.id}>
                      <TableCell className="font-semibold text-gray-700">
                        {participantesFiltrados.length - startIndex - index}
                      </TableCell>
                      <TableCell className="font-medium">
                        {`${participante.apellido_paterno || ""} ${participante.apellido_materno || ""} ${participante.nombres || ""}`.trim()}
                      </TableCell>
                      <TableCell>{participante.telefono || "-"}</TableCell>
                      <TableCell>{participante.direccion || "-"}</TableCell>
                      <TableCell>{participante.ci || "-"}</TableCell>
                      <TableCell>
                        {participante.casa_nombre ||
                          casas.find(
                            (c) =>
                              c.id ===
                                parseInt(participante.casa_comunal_id, 10) ||
                              c.id == participante.casa_comunal_id,
                          )?.nombre ||
                          "No Asignado"}
                      </TableCell>
                      <TableCell align="center">
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          <Button
                            variant="ghost"
                            onClick={() => openDetailModal(participante)}
                            className="p-1"
                            title="Ver detalles"
                          >
                            <Eye size={18} className="text-indigo-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => handleEdit(participante)}
                            className="p-1"
                            title="Editar"
                          >
                            <Edit size={18} className="text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => triggerFileInput(participante.id)}
                            className="p-1"
                            title="Subir CI"
                          >
                            <Upload size={18} className="text-green-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {participantes.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={participantes.length}
              />
            )}
          </>
        )}
      </Card>

      {/* Modal Crear/Editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={isEditing ? "Editar Participante" : "Nuevo Participante"}
        maxWidth="max-w-2xl"
        footerActions={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {isEditing ? "Actualizar" : "Crear"}
            </Button>
          </>
        }
      >
        {formError && <Alert type="error" title="Error" message={formError} />}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* DATOS DE REGISTRO */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-300 pb-2 mb-4 uppercase">
              Datos de Registro
            </h3>
            {usuario?.rol === "Administrador" ? (
              <Select
                label="Casa Comunal *"
                value={formData.casa_comunal_id}
                onChange={(e) =>
                  setFormData({ ...formData, casa_comunal_id: e.target.value })
                }
              >
                {casas.map((casa) => (
                  <option key={casa.id} value={casa.id}>
                    {casa.nombre}
                  </option>
                ))}
              </Select>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Casa Comunal
                </label>
                <div className="p-3 bg-gray-100 rounded-lg border border-gray-300">
                  <p className="text-sm font-semibold text-gray-900">
                    {casas.find(
                      (c) =>
                        c.id.toString() === formData.casa_comunal_id.toString(),
                    )?.nombre ||
                      casaActual?.nombre ||
                      "Sin asignar"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* DATOS PERSONALES */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-300 pb-2 mb-4 uppercase">
              Datos Personales
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Input
                label="Apellido paterno *"
                value={formData.apellido_paterno}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    apellido_paterno: e.target.value.toUpperCase(),
                  })
                }
              />
              <Input
                label="Apellido materno *"
                value={formData.apellido_materno}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    apellido_materno: e.target.value.toUpperCase(),
                  })
                }
              />
            </div>

            <div className="mb-4">
              <Input
                label="Nombres *"
                value={formData.nombres}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nombres: e.target.value.toUpperCase(),
                  })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Input
                label="Fecha nacimiento"
                type="date"
                value={formData.fecha_nacimiento}
                onChange={(e) =>
                  setFormData({ ...formData, fecha_nacimiento: e.target.value })
                }
              />
              <Input
                label="Carnet identidad (CI) *"
                value={formData.ci}
                onChange={(e) =>
                  setFormData({ ...formData, ci: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Select
                label="Género"
                value={formData.genero}
                onChange={(e) =>
                  setFormData({ ...formData, genero: e.target.value })
                }
              >
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="O">Otro</option>
              </Select>
              <Select
                label="Lugar de nacimiento"
                value={formData.lugar_nacimiento}
                onChange={(e) =>
                  setFormData({ ...formData, lugar_nacimiento: e.target.value })
                }
              >
                <option value="La Paz">La Paz</option>
                <option value="Cochabamba">Cochabamba</option>
                <option value="Santa Cruz">Santa Cruz</option>
                <option value="Chuquisaca">Chuquisaca</option>
                <option value="Potosí">Potosí</option>
                <option value="Oruro">Oruro</option>
                <option value="Tarija">Tarija</option>
                <option value="Beni">Beni</option>
                <option value="Pando">Pando</option>
                <option value="Extranjero">Extranjero</option>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Select
                label="Macrodistrito"
                value={formData.macrodistrito}
                onChange={(e) =>
                  setFormData({ ...formData, macrodistrito: e.target.value })
                }
              >
                <option value="Centro">Centro</option>
                <option value="Cotahuma">Cotahuma</option>
                <option value="Max Paredes">Max Paredes</option>
                <option value="Periférica">Periférica</option>
                <option value="San Antonio">San Antonio</option>
                <option value="Sur">Sur</option>
                <option value="Mallasa">Mallasa</option>
                <option value="Hampaturi">Hampaturi</option>
                <option value="Zongo">Zongo</option>
                <option value="El Alto">El Alto</option>
              </Select>
              <Select
                label="Estado Civil"
                value={formData.estado_civil}
                onChange={(e) =>
                  setFormData({ ...formData, estado_civil: e.target.value })
                }
              >
                <option value="Soltero/a">Soltero/a</option>
                <option value="Casado/a">Casado/a</option>
                <option value="Viudo/a">Viudo/a</option>
                <option value="Divorciado/a">Divorciado/a</option>
                <option value="Unión Libre">Unión Libre</option>
              </Select>
            </div>

            <Textarea
              label="Dirección"
              value={formData.direccion}
              onChange={(e) =>
                setFormData({ ...formData, direccion: e.target.value })
              }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <Input
                label="Teléfono"
                value={formData.telefono}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value })
                }
                placeholder="76123456"
              />
              <Input
                label="Contacto de emergencia"
                value={formData.contacto_emergencia}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contacto_emergencia: e.target.value,
                  })
                }
                placeholder="Nombre del contacto"
              />
            </div>

            <div className="mt-4">
              <Select
                label="¿Cómo se enteró de nosotros?"
                value={formData.como_se_entero}
                onChange={(e) =>
                  setFormData({ ...formData, como_se_entero: e.target.value })
                }
              >
                <option value="">Seleccionar...</option>
                <option value="Referencia">Referencia de amigo/a</option>
                <option value="Radio">Radio</option>
                <option value="TelevisiÃ³n">TelevisiÃ³n</option>
                <option value="Redes Sociales">Redes Sociales</option>
                <option value="Cartel">Cartel/Volante</option>
                <option value="Otro">Otro</option>
              </Select>
            </div>
          </div>

          {/* DATOS ACADÃ‰MICOS */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-300 pb-2 mb-4 uppercase">
              Datos Académicos
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Grado de instrucción"
                value={formData.grado_instruccion}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    grado_instruccion: e.target.value,
                  })
                }
              >
                <option value="Primaria">Primaria</option>
                <option value="Secundaria">Secundaria</option>
                <option value="Técnico">Técnico</option>
                <option value="Universidad">Universidad</option>
              </Select>
              <Input
                label="Último cargo"
                value={formData.ultimo_cargo}
                onChange={(e) =>
                  setFormData({ ...formData, ultimo_cargo: e.target.value })
                }
                placeholder="Ej. DELEGADO"
              />
              <Input
                label="Años de servicio"
                type="number"
                value={formData.anios_servicio}
                onChange={(e) =>
                  setFormData({ ...formData, anios_servicio: e.target.value })
                }
                placeholder="Ej. 5"
              />
            </div>
          </div>

          {/* DATOS FAMILIARES */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-300 pb-2 mb-4 uppercase flex-1">
              Datos Familiares
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Input
                label="Apellido paterno"
                value={formData.familia_apellido_paterno}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    familia_apellido_paterno: e.target.value.toUpperCase(),
                  })
                }
              />
              <Input
                label="Apellido materno"
                value={formData.familia_apellido_materno}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    familia_apellido_materno: e.target.value.toUpperCase(),
                  })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Input
                label="Nombres"
                value={formData.familia_nombres}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    familia_nombres: e.target.value.toUpperCase(),
                  })
                }
              />
              <Select
                label="Parentesco"
                value={formData.familia_parentesco}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    familia_parentesco: e.target.value,
                  })
                }
              >
                <option value="Padre">Padre</option>
                <option value="Madre">Madre</option>
                <option value="Hermano/a">Hermano/a</option>
                <option value="Esposo/a">Esposo/a</option>
                <option value="Hijo/a">Hijo/a</option>
                <option value="Otro">Otro</option>
              </Select>
            </div>

            <Input
              label="Teléfono"
              value={formData.familia_telefono}
              onChange={(e) =>
                setFormData({ ...formData, familia_telefono: e.target.value })
              }
              placeholder="76123456"
            />

            <Textarea
              label="Dirección"
              value={formData.familia_direccion}
              onChange={(e) =>
                setFormData({ ...formData, familia_direccion: e.target.value })
              }
              className="mt-4"
            />
          </div>

          {/* DATOS MÃ‰DICOS */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-300 pb-2 mb-4 uppercase flex-1">
              Datos Médicos
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Select
                label="Sistema de salud"
                value={formData.sistema_salud}
                onChange={(e) =>
                  setFormData({ ...formData, sistema_salud: e.target.value })
                }
              >
                <option value="SUS">SUS</option>
                <option value="CAJA">CAJA</option>
                <option value="Privado">Privado</option>
                <option value="Otro">Otro</option>
              </Select>
              <Input
                label="Enfermedad de base"
                value={formData.enfermedad_base}
                onChange={(e) =>
                  setFormData({ ...formData, enfermedad_base: e.target.value })
                }
                placeholder="Ej. Diabetes, Hipertensión"
              />
            </div>

            <Textarea
              label="Tratamiento específico"
              style={{ minHeight: "80px", color: "gray" }}
              value={formData.tratamiento_especifico}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tratamiento_especifico: e.target.value,
                })
              }
              placeholder="Describe el tratamiento si aplica"
            />
          </div>
        </form>
      </Modal>

      {/* Input oculto para subir archivo */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleDocumentUpload}
        className="hidden"
      />

      {/* Modal de Detalles del Participante */}
      <Modal
        isOpen={detailModalOpen}
        onClose={closeDetailModal}
        title={`Detalles: ${selectedParticipante ? selectedParticipante.nombres : ""}`}
        maxWidth="max-w-4xl"
        footerActions={
          <>
            <Button variant="secondary" onClick={closeDetailModal}>
              Cerrar
            </Button>
            {selectedParticipante && (
              <Button
                variant="primary"
                onClick={() => {
                  const idxInPage = participantesPage.findIndex(
                    (p) => p.id === selectedParticipante.id,
                  );
                  const numeroRegistro =
                    idxInPage >= 0
                      ? startIndex + idxInPage + 1
                      : selectedParticipante.id;
                  generatePDF(selectedParticipante, numeroRegistro);
                }}
                disabled={isGeneratingPDF}
                className="gap-2"
              >
                <Download size={18} />
                {isGeneratingPDF ? "Generando..." : "Ver PDF"}
              </Button>
            )}
          </>
        }
      >
        {selectedParticipante && (
          <div className="space-y-4">
            {/* PestaÃ±as */}
            <div className="border-b border-gray-200">
              <div className="flex gap-4">
                <button
                  onClick={() => setDetailTab("info")}
                  className={`py-2 px-4 font-medium border-b-2 transition ${
                    detailTab === "info"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Información Personal
                </button>
                <button
                  onClick={() => setDetailTab("documento")}
                  className={`py-2 px-4 font-medium border-b-2 transition ${
                    detailTab === "documento"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Documento CI
                </button>
              </div>
            </div>

            {/* Contenido de PestaÃ±as */}
            {detailTab === "info" && (
              <DetailModalInfo
                participante={selectedParticipante}
                onUploadClick={() => triggerFileInput(selectedParticipante.id)}
                casas={casas}
              />
            )}
            {detailTab === "documento" && (
              <DetailModalDocumento
                participante={selectedParticipante}
                onUploadClick={() => {
                  triggerFileInput(selectedParticipante.id);
                  closeDetailModal();
                }}
              />
            )}
          </div>
        )}
      </Modal>

      {/* Contenedor oculto para PDF */}
      {/* Removido - Se usa getPDFContent directamente en generatePDF */}
    </div>
  );
}

function DetailModalInfo({ participante, onUploadClick, casas = [] }) {
  // Buscar el nombre de la casa comunal
  const casaInfo = casas.find(
    (c) =>
      c.id === parseInt(participante.casa_comunal_id, 10) ||
      c.id == participante.casa_comunal_id,
  );
  const casaNombre = casaInfo?.nombre || "No Asignada";

  // Extraer datos médicos si vienen como array (desde la API)
  const datosMedicos = participante.datos_medicos?.[0] || {};

  return (
    <div className="py-4 max-h-96 overflow-y-auto space-y-6">
      {/* Casa Comunal Destacada */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border-l-4 border-teal-500 p-4 rounded-lg shadow-sm">
        <p className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">
          Casa Comunal Asignada
        </p>
        <p className="text-lg font-bold text-teal-600">{casaNombre}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Datos Personales */}
        <InfoSection
          title="Datos Personales"
          fields={[
            { label: "Nombre", value: participante.nombres },
            {
              label: "Apellido",
              value: `${participante.apellido_paterno} ${participante.apellido_materno}`,
            },
            { label: "CI", value: participante.ci },
            {
              label: "Fecha Nacimiento",
              value: participante.fecha_nacimiento || "-",
            },
            { label: "Género", value: participante.genero || "-" },
            { label: "Estado Civil", value: participante.estado_civil || "-" },
          ]}
        />

        {/* Datos Contacto */}
        <InfoSection
          title="Contacto"
          fields={[
            { label: "Teléfono", value: participante.telefono || "-" },
            {
              label: "Emergencia",
              value: participante.contacto_emergencia || "-",
            },
            { label: "Dirección", value: participante.direccion || "-" },
            {
              label: "Macrodistrito",
              value: participante.macrodistrito || "-",
            },
            {
              label: "Como se enteró",
              value: participante.como_se_entero || "-",
            },
          ]}
        />

        {/* Datos Académicos */}
        <InfoSection
          title="Datos Académicos"
          fields={[
            {
              label: "Grado de Instrucción",
              value: participante.grado_instruccion || "-",
            },
            { label: "Último Cargo", value: participante.ultimo_cargo || "-" },
            {
              label: "Años de Servicio",
              value: participante.anios_servicio || "-",
            },
          ]}
        />

        {/* Datos Médicos */}
        <InfoSection
          title="Datos Médicos"
          fields={[
            {
              label: "Sistema de Salud",
              value:
                datosMedicos.sistema_salud || participante.sistema_salud || "-",
            },
            {
              label: "Enfermedad de Base",
              value:
                datosMedicos.enfermedad_base ||
                participante.enfermedad_base ||
                "-",
            },
            {
              label: "Tratamiento",
              value:
                datosMedicos.tratamiento_especifico ||
                participante.tratamiento_especifico ||
                "-",
            },
          ]}
        />
      </div>

      {/* Datos Familiares */}
      {participante.familia?.length > 0 && (
        <div className="mt-6 border-t pt-6">
          <h3 className="font-bold text-gray-900 mb-4">Datos Familiares</h3>
          <div className="space-y-4">
            {participante.familia.map((familiar, idx) => (
              <FamilyCard key={idx} familiar={familiar} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Componente para la pestaña de Documento CI
 */
function DetailModalDocumento({ participante, onUploadClick }) {
  return (
    <div className="py-4">
      {participante.documento_ci_url ? (
        <div className="flex flex-col items-center">
          <img
            src={participante.documento_ci_url}
            alt="Documento CI"
            className="max-w-full h-auto max-h-96 rounded-lg border border-gray-300"
          />
          <p className="mt-4 text-sm text-gray-600">
            Documento CI del participante
          </p>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay documento CI cargado</p>
          <Button
            variant="primary"
            onClick={onUploadClick}
            className="mt-4 gap-2"
          >
            <Upload size={18} />
            Subir Documento
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Componente reutilizable para secciones de informaciÃ³n
 */
function InfoSection({ title, fields }) {
  return (
    <div>
      <h3 className="font-bold text-gray-900 mb-3">{title}</h3>
      <div className="space-y-2 text-sm">
        {fields.map((field, idx) => (
          <div key={idx}>
            <span className="font-medium text-gray-700">{field.label}:</span>
            <p className="text-gray-900">{field.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Componente para mostrar un miembro de la familia
 */
function FamilyCard({ familiar }) {
  const fields = [
    { label: "Apellido Paterno", value: familiar.apellido_paterno || "-" },
    { label: "Apellido Materno", value: familiar.apellido_materno || "-" },
    { label: "Nombres", value: familiar.nombres || "-" },
    { label: "Parentesco", value: familiar.parentesco || "-" },
    { label: "Celular", value: familiar.telefono || "-" },
    { label: "Dirección", value: familiar.direccion || "-" },
  ];

  return (
    <div className="bg-gray-50 p-3 rounded">
      <div className="grid grid-cols-2 gap-3 text-sm">
        {fields.map((field, idx) => (
          <div key={idx}>
            <span className="font-medium text-gray-700">{field.label}:</span>
            <p className="text-gray-900">{field.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
