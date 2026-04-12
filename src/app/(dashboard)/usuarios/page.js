"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Power } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
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
import { useAuth } from "@/context/AuthContext";
import { useUsuarios } from "@/hooks/useUsuarios";
import { useCasas } from "@/hooks/useCasas";

export default function UsuariosPage() {
  const { usuario: usuarioActual } = useAuth();
  const {
    usuarios,
    isLoading,
    error,
    filtro,
    setFiltro,
    loadUsuarios,
    createUsuario,
    updateUsuario,
    deactivateUsuario,
  } = useUsuarios();
  const { casas, loadCasas } = useCasas();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    password: "",
    rol: "Facilitador",
    ci: "",
    telefono: "",
  });

  useEffect(() => {
    loadUsuarios();
    loadCasas();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timeout = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timeout);
    }
  }, [successMessage]);

  const generateEmail = (nombres, apellidos, ci) => {
    if (!nombres || !apellidos || !ci) return "";
    const primerNombre = nombres.trim().charAt(0).toLowerCase();
    const primerApellido = apellidos.trim().charAt(0).toLowerCase();
    return `${primerNombre}${primerApellido}${ci}@casacomunal.bo`;
  };

  const handleNombresChange = (e) => {
    const nombres = e.target.value.toUpperCase();
    setFormData((prev) => ({
      ...prev,
      nombres,
      email: generateEmail(nombres, prev.apellidos, prev.ci),
    }));
  };

  const handleApellidosChange = (e) => {
    const apellidos = e.target.value.toUpperCase();
    setFormData((prev) => ({
      ...prev,
      apellidos,
      email: generateEmail(prev.nombres, apellidos, prev.ci),
    }));
  };

  const handleCIChange = (e) => {
    const ci = e.target.value.toUpperCase();
    setFormData((prev) => ({
      ...prev,
      ci,
      password: !isEditing ? ci : prev.password,
      email: generateEmail(prev.nombres, prev.apellidos, ci),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.nombres.trim()) {
      setFormError("Los nombres son requeridos");
      return;
    }
    if (!formData.apellidos.trim()) {
      setFormError("Los apellidos son requeridos");
      return;
    }
    if (!formData.email.trim()) {
      setFormError("El email es requerido");
      return;
    }
    if (!formData.ci.trim()) {
      setFormError("El CI es requerido");
      return;
    }
    if (!formData.rol) {
      setFormError("El rol es requerido");
      return;
    }
    if (!isEditing && !formData.password) {
      setFormError("La contraseña es requerida");
      return;
    }

    try {
      // Combinar nombres y apellidos para nombre_completo
      const submitData = {
        ...formData,
        nombre_completo: `${formData.nombres} ${formData.apellidos}`.trim(),
      };
      delete submitData.nombres;
      delete submitData.apellidos;

      if (isEditing && !submitData.password) {
        delete submitData.password;
      }

      if (isEditing) {
        await updateUsuario(editingUserId, submitData);
        setSuccessMessage("Usuario actualizado correctamente");
      } else {
        await createUsuario(submitData);
        setSuccessMessage("Usuario creado correctamente");
      }
      resetForm();
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      nombres: "",
      apellidos: "",
      email: "",
      password: "",
      rol: "Facilitador",
      ci: "",
      telefono: "",
    });
    setIsEditing(false);
    setEditingUserId(null);
    setFormError("");
  };

  const handleEdit = (user) => {
    const [nombres, ...apellidosParts] = user.nombre_completo.split(" ");
    const apellidos = apellidosParts.join(" ");
    setFormData({
      nombres: nombres || "",
      apellidos: apellidos || "",
      email: user.email,
      password: "",
      rol: user.rol,
      ci: user.ci,
      telefono: user.telefono || "",
    });
    setEditingUserId(user.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm("¿Desactivar este usuario?")) {
      try {
        await deactivateUsuario(userId);
        setSuccessMessage("Usuario desactivado correctamente");
      } catch (err) {
        setFormError(err.message);
      }
    }
  };

  const handleNewUser = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const getRolBadge = (rol) => {
    return rol === "Administrador" ? (
      <Badge variant="admin">Administrador</Badge>
    ) : (
      <Badge variant="facilitador">Facilitador</Badge>
    );
  };

  const getActivoBadge = (activo) => {
    return activo ? (
      <Badge variant="activo">Activo</Badge>
    ) : (
      <Badge variant="inactivo">Inactivo</Badge>
    );
  };

  // Paginación
  const totalPages = Math.ceil(usuarios.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const usuariosPage = usuarios.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Usuarios
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Gestión de usuarios del sistema
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleNewUser}
          className="gap-2 whitespace-nowrap"
        >
          <Plus size={20} />
          Nuevo Usuario
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
          placeholder="Buscar por nombre, email o CI..."
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
                  <TableHeader>Email</TableHeader>
                  <TableHeader hidden={true}>CI</TableHeader>
                  <TableHeader>Rol</TableHeader>
                  <TableHeader>Estado</TableHeader>
                  <TableHeader align="center">Acciones</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {usuarios.length === 0 ? (
                  <TableEmpty message="No hay usuarios registrados" />
                ) : (
                  usuariosPage.map((user, idx) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-semibold text-gray-600">
                        {startIndex + idx + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {user.nombre_completo}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell hidden={true}>{user.ci}</TableCell>
                      <TableCell>{getRolBadge(user.rol)}</TableCell>
                      <TableCell>{getActivoBadge(user.activo)}</TableCell>
                      <TableCell align="center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            onClick={() => handleEdit(user)}
                            className="p-1"
                            title="Editar"
                          >
                            <Edit size={18} className="text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => handleDelete(user.id)}
                            className="p-1"
                            title="Desactivar"
                          >
                            <Power size={18} className="text-amber-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {usuarios.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={usuarios.length}
              />
            )}
          </>
        )}
      </Card>

      {/* Modal Crear/Editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? "Editar Usuario" : "Nuevo Usuario"}
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
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nombres"
              required
              value={formData.nombres}
              onChange={handleNombresChange}
              placeholder="EJ: JUAN"
              className="placeholder:text-gray-500 uppercase"
            />
            <Input
              label="Apellidos"
              required
              value={formData.apellidos}
              onChange={handleApellidosChange}
              placeholder="EJ: PÉREZ GARCÍA"
              className="placeholder:text-gray-500 uppercase"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Auto-generado"
              disabled
              className="placeholder:text-gray-500 bg-gray-50"
            />
            <Input
              label="CI (Cédula de Identidad)"
              required
              value={formData.ci}
              onChange={handleCIChange}
              placeholder="EJ: 12345678"
              className="placeholder:text-gray-500 uppercase"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Teléfono"
              value={formData.telefono}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  telefono: e.target.value.toUpperCase(),
                })
              }
              placeholder="EJ: +591 75123456"
              className="placeholder:text-gray-500 uppercase"
            />
            <Select
              label="Rol"
              required
              value={formData.rol}
              onChange={(e) =>
                setFormData({ ...formData, rol: e.target.value })
              }
            >
              <option value="Facilitador">Facilitador</option>
              <option value="Administrador">Administrador</option>
            </Select>
          </div>

          {!isEditing && (
            <Input
              label="Contraseña"
              type="password"
              required={!isEditing}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Auto-generada como CI"
              disabled
              className="placeholder:text-gray-500 bg-gray-50"
            />
          )}
          {isEditing && (
            <Input
              label="Nueva Contraseña (dejar vacío para no cambiar)"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Dejar vacío para mantener la actual"
              className="placeholder:text-gray-500"
            />
          )}
        </form>
      </Modal>
    </div>
  );
}
