"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
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
import { useTalleres } from "@/hooks/useTalleres";

export default function TalleresPage() {
  const {
    talleres,
    isLoading,
    error,
    filtro,
    setFiltro,
    loadTalleres,
    createTaller,
    updateTaller,
    deactivateTaller,
    participantes,
    selectedTaller,
    loadParticipantes,
  } = useTalleres();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isParticipantesModalOpen, setIsParticipantesModalOpen] =
    useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTallerId, setEditingTallerId] = useState(null);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [currentPageTalleres, setCurrentPageTalleres] = useState(1);
  const [currentPageParticipantes, setCurrentPageParticipantes] = useState(1);
  const itemsPerPage = 5;
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
  });

  useEffect(() => {
    loadTalleres();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timeout = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timeout);
    }
  }, [successMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.nombre.trim()) {
      setFormError("El nombre es requerido");
      return;
    }

    try {
      if (isEditing) {
        await updateTaller(editingTallerId, formData);
        setSuccessMessage("Taller actualizado correctamente");
      } else {
        await createTaller(formData);
        setSuccessMessage("Taller creado correctamente");
      }
      resetForm();
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      descripcion: "",
    });
    setIsEditing(false);
    setEditingTallerId(null);
    setFormError("");
  };

  const handleEdit = (taller) => {
    setFormData({
      nombre: taller.nombre,
      descripcion: taller.descripcion || "",
    });
    setEditingTallerId(taller.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (tallerId) => {
    if (window.confirm("¿Desactivar este taller?")) {
      try {
        await deactivateTaller(tallerId);
        setSuccessMessage("Taller desactivado correctamente");
      } catch (err) {
        setFormError(err.message);
      }
    }
  };

  const handleViewParticipantes = async (tallerId) => {
    try {
      await loadParticipantes(tallerId);
      setIsParticipantesModalOpen(true);
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleNewTaller = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // Paginación Talleres
  const totalPagesTalleres = Math.ceil(talleres.length / itemsPerPage);
  const startIndexTalleres = (currentPageTalleres - 1) * itemsPerPage;
  const endIndexTalleres = startIndexTalleres + itemsPerPage;
  const talleresPage = talleres.slice(startIndexTalleres, endIndexTalleres);

  // Paginación Participantes
  const totalPagesParticipantes = Math.ceil(
    participantes.length / itemsPerPage,
  );
  const startIndexParticipantes = (currentPageParticipantes - 1) * itemsPerPage;
  const endIndexParticipantes = startIndexParticipantes + itemsPerPage;
  const participantesPage = participantes.slice(
    startIndexParticipantes,
    endIndexParticipantes,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Talleres
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Gestión de talleres y capacitaciones
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleNewTaller}
          className="gap-2 whitespace-nowrap"
        >
          <Plus size={20} />
          Nuevo Taller
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
          placeholder="Buscar por nombre o descripción..."
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
                  <TableHeader>Descripción</TableHeader>
                  <TableHeader align="center">Acciones</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {talleres.length === 0 ? (
                  <TableEmpty message="No hay talleres registrados" />
                ) : (
                  talleresPage.map((taller, idx) => (
                    <TableRow key={taller.id}>
                      <TableCell className="font-semibold text-gray-600">
                        {startIndexTalleres + idx + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {taller.nombre}
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        {taller.descripcion || "-"}
                      </TableCell>
                      <TableCell align="center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            onClick={() => handleViewParticipantes(taller.id)}
                            className="p-1"
                            title="Ver participantes"
                          >
                            <Users size={18} className="text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => handleEdit(taller)}
                            className="p-1"
                            title="Editar"
                          >
                            <Edit size={18} className="text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => handleDelete(taller.id)}
                            className="p-1"
                            title="Desactivar"
                          >
                            <Trash2 size={18} className="text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {talleres.length > 0 && (
              <Pagination
                currentPage={currentPageTalleres}
                totalPages={totalPagesTalleres}
                onPageChange={setCurrentPageTalleres}
                itemsPerPage={itemsPerPage}
                totalItems={talleres.length}
              />
            )}
          </>
        )}
      </Card>

      {/* Modal Crear/Editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? "Editar Taller" : "Nuevo Taller"}
        maxWidth="max-w-2xl"
        footerActions={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {isEditing ? "Actualizar" : "Crear"}
            </Button>
          </>
        }
      >
        {formError && (
          <Alert
            type="error"
            title="Error"
            message={formError}
            className="mb-4"
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre del Taller"
            required
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
            placeholder="Ej: Fisioterapia"
            className="placeholder:text-gray-700"
          />

          <Textarea
            label="Descripción"
            value={formData.descripcion}
            onChange={(e) =>
              setFormData({ ...formData, descripcion: e.target.value })
            }
            placeholder="Descripción del taller"
            rows={4}
          />
        </form>
      </Modal>

      {/* Modal Participantes */}
      <Modal
        isOpen={isParticipantesModalOpen}
        onClose={() => setIsParticipantesModalOpen(false)}
        title={`Participantes del Taller`}
        maxWidth="max-w-2xl"
        footerActions={
          <Button
            variant="ghost"
            onClick={() => setIsParticipantesModalOpen(false)}
          >
            Cerrar
          </Button>
        }
      >
        <div>
          {participantes.length === 0 ? (
            <p className="text-gray-600 text-center py-4">
              No hay participantes registrados
            </p>
          ) : (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Nº</TableHeader>
                    <TableHeader>Nombre</TableHeader>
                    <TableHeader>CI</TableHeader>
                    <TableHeader>Teléfono</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {participantesPage.map((p, idx) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-semibold text-gray-600">
                        {startIndexParticipantes + idx + 1}
                      </TableCell>
                      <TableCell>
                        {p.nombres} {p.apellidos}
                      </TableCell>
                      <TableCell>{p.ci}</TableCell>
                      <TableCell>{p.telefono || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {participantes.length > 0 && (
                <Pagination
                  currentPage={currentPageParticipantes}
                  totalPages={totalPagesParticipantes}
                  onPageChange={setCurrentPageParticipantes}
                  itemsPerPage={itemsPerPage}
                  totalItems={participantes.length}
                />
              )}
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
