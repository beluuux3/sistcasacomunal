"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Edit, Trash2, Upload } from "lucide-react";
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
import { listCasasRequest } from "@/lib/auth";

export default function ParticipantesPage() {
  const { usuario, casaActual } = useAuth();
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

    // DATOS ACADÉMICOS
    grado_instruccion: "",
    ultimo_cargo: "",
    anos_servicio: "",

    // DATOS FAMILIARES
    familia_apellido_paterno: "",
    familia_apellido_materno: "",
    familia_nombres: "",
    familia_parentesco: "",
    familia_telefono: "",

    // DATOS MÉDICOS
    sistema_salud: "",
    enfermedad_base: "",
    tratamiento_especifico: "",
  });

  // Cargar participantes y casas al montar
  useEffect(() => {
    loadParticipantes();
    loadCasas();

    // Si es facilitador, asignar automáticamente su casa
    if (usuario?.rol === "Facilitador" && casaActual) {
      setFormData((prev) => ({
        ...prev,
        casa_comunal_id: casaActual.id.toString(),
      }));
    }
  }, []);

  // Ciclo de vida para mensaje de éxito
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const loadCasas = async () => {
    try {
      const data = await listCasasRequest();
      const casasArray = Array.isArray(data) ? data : [];

      // Si es facilitador, filtrar solo su casa actual
      if (usuario?.rol === "Facilitador" && casaActual) {
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

    // Validación
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
    if (usuario?.rol === "Administrador" && !formData.casa_comunal_id.trim()) {
      setFormError("Debes seleccionar una casa comunal");
      return;
    }

    try {
      if (isEditing) {
        await updateParticipante(editingParticipanteId, formData);
        setSuccessMessage("Participante actualizado correctamente");
      } else {
        await createParticipante(formData);
        setSuccessMessage("Participante creado correctamente");
      }
      resetForm();
      setIsModalOpen(false);
      await loadParticipantes();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      // DATOS DE REGISTRO
      casa_comunal_id:
        usuario?.rol === "Facilitador" && casaActual
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

      // DATOS ACADÉMICOS
      grado_instruccion: "",
      ultimo_cargo: "",
      anos_servicio: "",

      // DATOS FAMILIARES
      familia_apellido_paterno: "",
      familia_apellido_materno: "",
      familia_nombres: "",
      familia_parentesco: "",
      familia_telefono: "",

      // DATOS MÉDICOS
      sistema_salud: "",
      enfermedad_base: "",
      tratamiento_especifico: "",
    });
    setIsEditing(false);
    setEditingParticipanteId(null);
    setFormError("");
  };

  const handleEdit = (participante) => {
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

      // DATOS ACADÉMICOS
      grado_instruccion: participante.grado_instruccion || "",
      ultimo_cargo: participante.ultimo_cargo || "",
      anos_servicio: participante.anos_servicio || "",

      // DATOS FAMILIARES
      familia_apellido_paterno: participante.familia_apellido_paterno || "",
      familia_apellido_materno: participante.familia_apellido_materno || "",
      familia_nombres: participante.familia_nombres || "",
      familia_parentesco: participante.familia_parentesco || "",
      familia_telefono: participante.familia_telefono || "",

      // DATOS MÉDICOS
      sistema_salud: participante.sistema_salud || "",
      enfermedad_base: participante.enfermedad_base || "",
      tratamiento_especifico: participante.tratamiento_especifico || "",
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
      await loadParticipantes();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const triggerFileInput = (participanteId) => {
    setDocumentParticipanteId(participanteId);
    fileInputRef.current?.click();
  };

  // Filtrar participantes por casa si es facilitador
  const participantesFiltrados =
    usuario?.rol === "Facilitador" && casaActual
      ? participantes.filter((p) => p.casa_comunal_id === casaActual.id)
      : participantes;

  // Paginación
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
                  <TableHeader>Nombre Completo</TableHeader>
                  <TableHeader>Celular</TableHeader>
                  <TableHeader>Dirección</TableHeader>
                  <TableHeader>CI</TableHeader>
                  <TableHeader>Casa</TableHeader>
                  <TableHeader align="center">Acciones</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {participantesFiltrados.length === 0 ? (
                  <TableEmpty message="No hay participantes registrados" />
                ) : (
                  participantesPage.map((participante) => (
                    <TableRow key={participante.id}>
                      <TableCell className="font-medium">
                        {`${participante.apellido_paterno || ""} ${participante.apellido_materno || ""} ${participante.nombres || ""}`.trim()}
                      </TableCell>
                      <TableCell>
                        {participante.familia_telefono || "-"}
                      </TableCell>
                      <TableCell>{participante.direccion || "-"}</TableCell>
                      <TableCell>{participante.ci || "-"}</TableCell>
                      <TableCell>
                        {participante.casa_nombre ||
                          casas.find(
                            (c) => c.id === participante.casa_comunal_id,
                          )?.nombre ||
                          "-"}
                      </TableCell>
                      <TableCell align="center">
                        <div className="flex items-center justify-center gap-2 flex-wrap">
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
                <option value="">Seleccionar...</option>
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
                    {casaActual?.nombre || "Sin asignar"}
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
                <option value="">Seleccionar...</option>
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
                <option value="">Seleccionar...</option>
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
                <option value="">Seleccionar...</option>
                <option value="Macrodistrito 1">Macrodistrito 1</option>
                <option value="Macrodistrito 2">Macrodistrito 2</option>
                <option value="Macrodistrito 3">Macrodistrito 3</option>
                <option value="Macrodistrito 4">Macrodistrito 4</option>
                <option value="Macrodistrito 5">Macrodistrito 5</option>
                <option value="Macrodistrito 6">Macrodistrito 6</option>
                <option value="Macrodistrito 7">Macrodistrito 7</option>
                <option value="Macrodistrito 8">Macrodistrito 8</option>
                <option value="El Alto">El Alto</option>
              </Select>
              <Select
                label="Estado Civil"
                value={formData.estado_civil}
                onChange={(e) =>
                  setFormData({ ...formData, estado_civil: e.target.value })
                }
              >
                <option value="">Seleccionar...</option>
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
          </div>

          {/* DATOS ACADÉMICOS */}
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
                <option value="">Seleccionar...</option>
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
                value={formData.anos_servicio}
                onChange={(e) =>
                  setFormData({ ...formData, anos_servicio: e.target.value })
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
                <option value="">Seleccionar...</option>
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
          </div>

          {/* DATOS MÉDICOS */}
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
                <option value="">Seleccionar...</option>
                <option value="SAPS">SAPS</option>
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
    </div>
  );
}
