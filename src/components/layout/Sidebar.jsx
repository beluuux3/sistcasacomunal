"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCasaSeleccionada } from "@/context/CasaSeleccionadaContext";
import { useIsAdmin } from "@/lib/hooks";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  Home,
  Users,
  Building2,
  BookOpen,
  Users2,
  Clock,
  CheckSquare,
  FileText,
  LogOut,
  Menu,
  X,
  Calendar,
  Activity,
  BarChart3,
  Award,
  UserCheck,
  MapPin,
} from "lucide-react";

export function Sidebar({ isOpen = true, onClose, isCollapsed = false }) {
  const pathname = usePathname();
  const { logout, usuario } = useAuth();
  const { casasDelFacilitador, casaSeleccionada, selectCasa } =
    useCasaSeleccionada();
  const isAdmin = useIsAdmin();
  const isFacilitador = usuario?.rol === "Facilitador";
  const tieneMultiplesCasas = casasDelFacilitador.length > 1;
  const [showCasaModal, setShowCasaModal] = useState(false);

  const menuItems = [
    {
      label: "Inicio",
      href: "/inicio",
      icon: Home,
      show: true,
    },
    {
      label: "Usuarios",
      href: "/usuarios",
      icon: Users,
      show: isAdmin,
    },
    {
      label: "Casas Comunales",
      href: "/casas",
      icon: Building2,
      show: isAdmin,
    },
    {
      label: "Talleres",
      href: "/talleres",
      icon: BookOpen,
      show: isAdmin,
    },
    {
      label: "Control Llegada/Salida",
      href: "/control-llegada-salida",
      icon: MapPin,
      show: isFacilitador && casaSeleccionada,
    },
    {
      label: "Participantes",
      href: "/participantes",
      icon: Users2,
      show: isAdmin || (isFacilitador && casaSeleccionada),
    },
    {
      label: "Horarios",
      href: "/horarios",
      icon: Clock,
      show: isAdmin,
    },
    {
      label: "Asistencia",
      href: "/asistencia",
      icon: CheckSquare,
      show: isAdmin || (isFacilitador && casaSeleccionada),
    },
    {
      label: "Evaluaciones",
      href: "/evaluaciones",
      icon: FileText,
      show: isAdmin || (isFacilitador && casaSeleccionada),
    },
    // Nuevos módulos Phase 4 - Solo para Admin
    {
      label: "Gestiones",
      href: "/gestiones",
      icon: Calendar,
      show: isAdmin,
    },
    {
      label: "Actividades",
      href: "/actividades",
      icon: Activity,
      show: isAdmin,
    },
    {
      label: "Control de Facilitadores",
      href: "/control-facilitadores",
      icon: UserCheck,
      show: isAdmin,
    },
    {
      label: "Reportes",
      href: "/reportes",
      icon: BarChart3,
      show: isAdmin,
    },
    {
      label: "Certificados",
      href: "/certificados",
      icon: Award,
      show: isAdmin,
    },
  ];

  const isActive = (href) => pathname === href || pathname.startsWith(href);

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <>
      {/* Overlay móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative top-0 left-0 h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 z-50 lg:z-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "w-20" : "w-64"}`}
      >
        {/* Header */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200 lg:hidden">
          <button onClick={onClose} className="text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Logo / Brand */}
        <div
          className={`h-16 flex items-center justify-center border-b border-gray-200 hidden lg:flex ${isCollapsed ? "px-4" : "px-6"}`}
        >
          {!isCollapsed && (
            <div>
              <h2 className="font-bold text-slate-900">Casa Comunal</h2>
              <p className="text-xs text-gray-500">Gestión</p>
            </div>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              CC
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav
          className={`flex-1 overflow-y-auto ${isCollapsed ? "px-2" : "px-4"} py-6 space-y-4`}
        >
          {/* Selector de Casa para Facilitadores */}
          {isFacilitador && tieneMultiplesCasas && (
            <div className={`${isCollapsed ? "" : "mb-6"}`}>
              <label
                className={`text-xs font-semibold text-gray-600 uppercase ${isCollapsed ? "hidden" : "block"}`}
              >
                Seleccionar Casa
              </label>
              <select
                value={casaSeleccionada?.id || ""}
                onChange={(e) => {
                  const casa = casasDelFacilitador.find(
                    (c) => c.id === parseInt(e.target.value),
                  );
                  if (casa) selectCasa(casa);
                }}
                className={`w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isCollapsed ? "hidden" : ""
                }`}
              >
                <option value="">-- Selecciona una casa --</option>
                {casasDelFacilitador.map((casa) => (
                  <option key={casa.id} value={casa.id}>
                    {casa.nombre}
                  </option>
                ))}
              </select>
              {casaSeleccionada && !isCollapsed && (
                <p className="text-xs text-blue-600 mt-2 font-medium">
                  Casa seleccionada: {casaSeleccionada.nombre}
                </p>
              )}
            </div>
          )}

          <ul className="space-y-2">
            {menuItems.map(
              (item) =>
                item.show && (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 ${isCollapsed ? "justify-center p-2" : "px-4 py-2"} rounded-lg transition-colors relative group ${
                        isActive(item.href)
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      title={isCollapsed ? item.label : ""}
                    >
                      <item.icon size={20} />
                      {!isCollapsed && <span>{item.label}</span>}

                      {/* Tooltip en collapsed */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-2 px-3 py-1 bg-gray-900 text-white text-sm rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          {item.label}
                        </div>
                      )}
                    </Link>
                  </li>
                ),
            )}
          </ul>
        </nav>

        {/* User Info & Logout */}
        {!isCollapsed && (
          <div className="border-t border-gray-200 p-4 space-y-4 hidden lg:block">
            <div className="text-sm">
              <p className="text-gray-600">Conectado como:</p>
              <p className="font-semibold text-slate-900">
                {usuario?.nombre_completo}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {usuario?.rol === "Administrador"
                  ? "Administrador"
                  : "Facilitador"}
              </p>
              {isFacilitador && casaSeleccionada && (
                <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                  <MapPin size={14} />
                  {casaSeleccionada.nombre}
                </p>
              )}
            </div>

            {/* Cambiar Casa Button (Solo para facilitadores con múltiples casas) */}
            {tieneMultiplesCasas && (
              <Button
                variant="secondary"
                className="w-full justify-center gap-2"
                onClick={() => setShowCasaModal(true)}
              >
                <MapPin size={18} />
                Cambiar Casa
              </Button>
            )}

            <Button
              variant="danger"
              className="w-full justify-center gap-2"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              Cerrar sesión
            </Button>
          </div>
        )}

        {/* Collapsed User Logout */}
        {isCollapsed && (
          <div className="border-t border-gray-200 p-2 hidden lg:flex justify-center">
            <button
              onClick={handleLogout}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={20} />
            </button>
          </div>
        )}

        {/* Mobile footer */}
        <div className="border-t border-gray-200 p-4 space-y-4 lg:hidden">
          <div className="text-sm">
            <p className="text-gray-600">Conectado como:</p>
            <p className="font-semibold text-slate-900">
              {usuario?.nombre_completo}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {usuario?.rol === "Administrador"
                ? "Administrador"
                : "Facilitador"}
            </p>
          </div>
          <Button
            variant="danger"
            className="w-full justify-center gap-2"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      {/* Modal para cambiar casa */}
      {tieneMultiplesCasas && (
        <Modal
          isOpen={showCasaModal}
          onClose={() => setShowCasaModal(false)}
          title="Cambiar Casa Comunal"
        >
          <div className="space-y-3">
            {casasDelFacilitador.map((casa) => (
              <button
                key={casa.id}
                onClick={() => {
                  selectCasa(casa);
                  setShowCasaModal(false);
                }}
                className={`w-full p-3 rounded-lg border-2 transition-colors text-left ${
                  casaSeleccionada?.id === casa.id
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-blue-400"
                }`}
              >
                <p className="font-semibold text-gray-900">{casa.nombre}</p>
                <p className="text-sm text-gray-600">{casa.macrodistrito}</p>
              </button>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}
