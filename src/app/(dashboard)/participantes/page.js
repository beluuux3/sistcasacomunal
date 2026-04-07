"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Edit, Trash2, Upload } from "lucide-react";
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
    nombres: "",
    apellidos: "",
    ci: "",
    fecha_nacimiento: "",
    genero: "",
    telefono: "",
    direccion: "",
    contacto_emergencia: "",
    casa_comunal_id: "",
  });

  // Cargar participantes y casas al montar
  useEffect(() => {
    loadParticipantes();
    loadCasas();
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
      setCasas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading casas:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    // Validación
    if (!formData.nombres.trim()) {
      setFormError("El nombre es requerido");
      return;
    }
    if (!formData.apellidos.trim()) {
      setFormError("El apellido es requerido");
      return;
    }
    if (!formData.ci.trim()) {
      setFormError("El CI es requerido");
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
      nombres: "",
      apellidos: "",
      ci: "",
      fecha_nacimiento: "",
      genero: "",
      telefono: "",
      direccion: "",
      contacto_emergencia: "",
      casa_comunal_id: "",
    });
    setIsEditing(false);
    setEditingParticipanteId(null);
    setFormError("");
  };

  const handleEdit = (participante) => {
    setFormData({
      nombres: participante.nombres,
      apellidos: participante.apellidos,
      ci: participante.ci,
      fecha_nacimiento: participante.fecha_nacimiento || "",
      genero: participante.genero || "",
      telefono: participante.telefono || "",
      direccion: participante.direccion || "",
      contacto_emergencia: participante.contacto_emergencia || "",
      casa_comunal_id: participante.casa_comunal_id || "",
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

  // Paginación
  const totalPages = Math.ceil(participantes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const participantesPage = participantes.slice(startIndex, endIndex);

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
                  <TableHeader>Nombre</TableHeader>
                  <TableHeader>Apellido</TableHeader>
                  <TableHeader hidden={true}>CI</TableHeader>
                  <TableHeader hidden={true}>Teléfono</TableHeader>
                  <TableHeader>Casa</TableHeader>
                  <TableHeader align="center">Acciones</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {participantes.length === 0 ? (
                  <TableEmpty message="No hay participantes registrados" />
                ) : (
                  participantesPage.map((participante, idx) => (
                    <TableRow key={participante.id}>
                      <TableCell className="font-semibold text-gray-600">
                        {startIndex + idx + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {participante.nombres}
                      </TableCell>
                      <TableCell>{participante.apellidos}</TableCell>
                      <TableCell hidden={true}>{participante.ci}</TableCell>
                      <TableCell hidden={true}>
                        {participante.telefono || "-"}
                      </TableCell>
                      <TableCell>
                        {participante.casa_comunal_id || "-"}
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

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nombres"
              required
              value={formData.nombres}
              onChange={(e) =>
                setFormData({ ...formData, nombres: e.target.value })
              }
              placeholder="Juan"
            />
            <Input
              label="Apellidos"
              required
              value={formData.apellidos}
              onChange={(e) =>
                setFormData({ ...formData, apellidos: e.target.value })
              }
              placeholder="Pérez García"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="CI"
              required
              value={formData.ci}
              onChange={(e) => setFormData({ ...formData, ci: e.target.value })}
              placeholder="12345678"
            />
            <Input
              label="Fecha de Nacimiento"
              type="date"
              value={formData.fecha_nacimiento}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  fecha_nacimiento: e.target.value,
                })
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Género"
              value={formData.genero}
              onChange={(e) =>
                setFormData({ ...formData, genero: e.target.value })
              }
            >
              <option value="">Seleccionar</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="O">Otro</option>
            </Select>
            <Input
              label="Teléfono"
              value={formData.telefono}
              onChange={(e) =>
                setFormData({ ...formData, telefono: e.target.value })
              }
              placeholder="76123456"
            />
          </div>

          <Input
            label="Dirección"
            value={formData.direccion}
            onChange={(e) =>
              setFormData({ ...formData, direccion: e.target.value })
            }
            placeholder="Calle 123, Casa 45"
          />

          <Input
            label="Contacto de Emergencia"
            value={formData.contacto_emergencia}
            onChange={(e) =>
              setFormData({ ...formData, contacto_emergencia: e.target.value })
            }
            placeholder="Nombre y teléfono"
          />

          <Select
            label="Casa Comunal"
            value={formData.casa_comunal_id}
            onChange={(e) =>
              setFormData({ ...formData, casa_comunal_id: e.target.value })
            }
          >
            <option value="">Seleccionar casa (opcional)</option>
            {casas.map((casa) => (
              <option key={casa.id} value={casa.id}>
                {casa.nombre}
              </option>
            ))}
          </Select>
        </div>
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
