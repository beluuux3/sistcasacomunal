"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, Download } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Alert } from "@/components/ui/Alert";
import { Pagination } from "@/components/ui/Pagination";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
  TableEmpty,
} from "@/components/ui/Table";
import { useCasas } from "@/hooks/useCasas";
import { MapPicker } from "@/components/MapPicker";
import { downloadCasaComunalPDF } from "@/utils/generateCasaComunalPDF";

export default function CasasPage() {
  const {
    casas,
    isLoading,
    error,
    filtro,
    setFiltro,
    loadCasas,
    createCasa,
    updateCasa,
  } = useCasas();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCasaId, setEditingCasaId] = useState(null);
  const [formError, setFormError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCasaForView, setSelectedCasaForView] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    direccion: "",
    macrodistrito: "",
    representante_nombre: "",
    representante_ci: "",
    contacto_telefono: "",
    latitud: "",
    longitud: "",
  });

  // Cargar casas al montar componente
  useEffect(() => {
    loadCasas();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    // Validación
    if (!formData.nombre.trim()) {
      setFormError("El nombre es requerido");
      return;
    }
    if (!formData.direccion.trim()) {
      setFormError("La dirección es requerida");
      return;
    }
    if (!formData.macrodistrito.trim()) {
      setFormError("El macrodistrito es requerido");
      return;
    }

    try {
      if (isEditing) {
        await updateCasa(editingCasaId, formData);
      } else {
        await createCasa(formData);
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
      direccion: "",
      macrodistrito: "",
      representante_nombre: "",
      representante_ci: "",
      contacto_telefono: "",
      latitud: "",
      longitud: "",
    });
    setIsEditing(false);
    setEditingCasaId(null);
    setFormError("");
  };

  const handleEdit = (casa) => {
    setFormData({
      nombre: casa.nombre,
      direccion: casa.direccion,
      macrodistrito: casa.macrodistrito,
      representante_nombre: casa.representante_nombre || "",
      representante_ci: casa.representante_ci || "",
      contacto_telefono: casa.contacto_telefono || "",
      latitud: casa.latitud || "",
      longitud: casa.longitud || "",
    });
    setEditingCasaId(casa.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };
  const handleViewCasa = (casa) => {
    setSelectedCasaForView(casa);
    setIsViewModalOpen(true);
  };
  const handleNewCasa = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // Paginación
  const totalPages = Math.ceil(casas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const casasPage = casas.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Casas Comunales
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Gestión de casas comunales
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleNewCasa}
          className="gap-2 whitespace-nowrap"
        >
          <Plus size={20} />
          Nueva Casa
        </Button>
      </div>

      {/* Error Global */}
      {error && <Alert type="error" title="Error" message={error} />}

      {/* Búsqueda */}
      <Card>
        <SearchInput
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder="Buscar por nombre, dirección o macrodistrito..."
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
                  <TableHeader hidden={true}>Dirección</TableHeader>
                  <TableHeader>Macrodistrito</TableHeader>
                  <TableHeader hidden={true}>Representante</TableHeader>
                  <TableHeader>Teléfono</TableHeader>
                  <TableHeader align="center">Acciones</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {casas.length === 0 ? (
                  <TableEmpty message="No hay casas comunales registradas" />
                ) : (
                  casasPage.map((casa, idx) => (
                    <TableRow key={casa.id}>
                      <TableCell className="font-semibold text-gray-600">
                        {startIndex + idx + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {casa.nombre}
                      </TableCell>
                      <TableCell hidden={true}>{casa.direccion}</TableCell>
                      <TableCell>{casa.macrodistrito}</TableCell>
                      <TableCell hidden={true}>
                        {casa.representante_nombre || "-"}
                      </TableCell>
                      <TableCell>{casa.contacto_telefono || "-"}</TableCell>
                      <TableCell align="center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            onClick={() => handleViewCasa(casa)}
                            className="p-1"
                            title="Ver detalles"
                          >
                            <Eye size={18} className="text-slate-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => handleEdit(casa)}
                            className="p-1"
                            title="Editar"
                          >
                            <Edit size={18} className="text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            className="p-1"
                            title="Eliminar"
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
            {casas.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={casas.length}
              />
            )}
          </>
        )}
      </Card>

      {/* Modal Ver Casa Comunal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedCasaForView(null);
        }}
        title="Detalles de Casa Comunal"
        footerActions={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsViewModalOpen(false);
                setSelectedCasaForView(null);
              }}
            >
              Cerrar
            </Button>
            {selectedCasaForView && (
              <Button
                variant="primary"
                onClick={async () =>
                  await downloadCasaComunalPDF(selectedCasaForView)
                }
                className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white"
              >
                <Download size={18} />
                Descargar PDF
              </Button>
            )}
          </>
        }
      >
        {selectedCasaForView && (
          <div className="space-y-6">
            {/* Información General */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Información General
              </h3>
              <div className="space-y-3 text-gray-700">
                <div>
                  <p className="font-semibold text-sm text-gray-600">Nombre</p>
                  <p className="text-base">{selectedCasaForView.nombre}</p>
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-600">
                    Dirección
                  </p>
                  <p className="text-base">{selectedCasaForView.direccion}</p>
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-600">
                    Macrodistrito
                  </p>
                  <p className="text-base">
                    {selectedCasaForView.macrodistrito}
                  </p>
                </div>
              </div>
            </div>

            {/* Representante */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Representante
              </h3>
              <div className="space-y-3 text-gray-700">
                <div>
                  <p className="font-semibold text-sm text-gray-600">Nombre</p>
                  <p className="text-base">
                    {selectedCasaForView.representante_nombre || "-"}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-600">
                    Cédula de Identidad
                  </p>
                  <p className="text-base">
                    {selectedCasaForView.representante_ci || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Contacto */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Contacto</h3>
              <div className="space-y-3 text-gray-700">
                <div>
                  <p className="font-semibold text-sm text-gray-600">
                    Teléfono
                  </p>
                  <p className="text-base">
                    {selectedCasaForView.contacto_telefono || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Ubicación */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Ubicación
              </h3>
              <div className="space-y-3 text-gray-700">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold text-sm text-gray-600">
                      Latitud
                    </p>
                    <p className="text-base">
                      {selectedCasaForView.latitud || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-600">
                      Longitud
                    </p>
                    <p className="text-base">
                      {selectedCasaForView.longitud || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Crear/Editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? "Editar Casa Comunal" : "Nueva Casa Comunal"}
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
          {/* Fila 1 */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nombre"
              required
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              placeholder="Ej: Casa Comunal Zona Sur"
            />
            <Select
              label="Macrodistrito"
              required
              placeholder="Seleccionar Macrodistrito"
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
            </Select>
          </div>

          {/* Dirección */}
          <Input
            label="Dirección"
            required
            value={formData.direccion}
            onChange={(e) =>
              setFormData({ ...formData, direccion: e.target.value })
            }
            placeholder="Ej: Av. Mariscal Santa Cruz #456"
          />

          {/* Fila 2 */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Representante"
              value={formData.representante_nombre}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  representante_nombre: e.target.value,
                })
              }
              placeholder="Nombre del representante"
            />
            <Input
              label="CI Representante"
              value={formData.representante_ci}
              onChange={(e) =>
                setFormData({ ...formData, representante_ci: e.target.value })
              }
              placeholder="Ej: 12345678"
            />
          </div>

          {/* Fila 3 */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Teléfono de Contacto"
              value={formData.contacto_telefono}
              onChange={(e) =>
                setFormData({ ...formData, contacto_telefono: e.target.value })
              }
              placeholder="Ej: +591 1234567"
            />
          </div>

          {/* Ubicación en Mapa */}
          <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Ubicación en Mapa
              </label>
            </div>
            <MapPicker
              macrodistrito={formData.macrodistrito}
              latitud={formData.latitud}
              longitud={formData.longitud}
              onLocationSelect={(lat, lng) => {
                setFormData({
                  ...formData,
                  latitud: lat.toFixed(6),
                  longitud: lng.toFixed(6),
                });
              }}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
