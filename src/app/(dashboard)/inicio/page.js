"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCasaSeleccionada } from "@/context/CasaSeleccionadaContext";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useCasaStats } from "@/hooks/useCasaStats";
import {
  Building2,
  BookOpen,
  Users2,
  MapPin,
  Phone,
  Clock,
  Lightbulb,
  CheckCircle,
  Activity,
  Lock,
  Navigation,
  RefreshCw,
  BarChart3,
} from "lucide-react";

export default function Inicio() {
  const { usuario } = useAuth();
  const { casaSeleccionada } = useCasaSeleccionada();

  // Usar hooks diferentes según el rol
  const isFacilitador = usuario?.rol === "Facilitador";
  const casaId = isFacilitador ? casaSeleccionada?.id : null;

  const {
    stats: casaStats,
    isLoading: casaLoading,
    error: casaError,
    loadStats: loadCasaStats,
  } = useCasaStats(casaId);
  const {
    stats: adminStats,
    charts,
    isLoading: adminLoading,
    error: adminError,
    loadStats: loadAdminStats,
  } = useDashboardStats();

  // Seleccionar los datos y funciones correctas según el rol
  const stats = isFacilitador ? casaStats : adminStats;
  const isLoading = isFacilitador ? casaLoading : adminLoading;
  const error = isFacilitador ? casaError : adminError;
  const loadStats = isFacilitador ? loadCasaStats : loadAdminStats;

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Para facilitadores, solo mostrar participantes
  if (usuario?.rol === "Facilitador") {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Bienvenido, {usuario?.nombre_completo}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Casa: <strong>{casaSeleccionada?.nombre}</strong>
            </p>
          </div>

          <button
            onClick={loadStats}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>

        {error && (
          <Alert
            type="warning"
            title="No se pudieron cargar las estadisticas"
            message={error}
          />
        )}

        <div className="grid grid-cols-1 gap-6">
          <Card className="bg-slate-50">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-slate-50">
                <Users2 size={28} className="text-slate-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500">
                  Participantes en {casaSeleccionada?.nombre}
                </p>
                {isLoading ? (
                  <div className="h-8 w-16 animate-pulse bg-gray-300 rounded mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-slate-600">
                    {stats.total_participantes}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>

        <Card className="border-2 border-blue-200 bg-blue-50">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              {casaSeleccionada?.nombre}
            </h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <MapPin size={20} className="text-blue-600 shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 font-semibold">
                    Macrodistrito
                  </p>
                  <p className="text-sm text-gray-900">
                    {casaSeleccionada?.macrodistrito || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Contactos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Unidad del Adulto Mayor */}
          <Card>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Lightbulb size={24} className="text-amber-500" />
                <h2 className="text-lg font-bold text-slate-900">
                  Unidad del Adulto Mayor
                </h2>
              </div>
              <h3 className="text-gray-600">
                Para asuntos administrativos y coordinacion de talleres
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <Phone size={18} className="text-gray-500 shrink-0 mt-0.5" />
                  <p className="text-gray-700">
                    <strong>Celular:</strong> 75273874
                  </p>
                </div>
                <div className="flex gap-3">
                  <MapPin size={18} className="text-gray-500 shrink-0 mt-0.5" />
                  <p className="text-gray-700">
                    <strong>Dirección:</strong> Unidad del Adulto Mayor (Mercado
                    Camacho, lado Guardia Municipal).
                  </p>
                </div>
                <div className="flex gap-3">
                  <Clock size={18} className="text-gray-500 shrink-0 mt-0.5" />
                  <p className="text-gray-700">
                    <strong>Horarios:</strong> 09:00 a 16:00
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Soporte Técnico */}
          <Card>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Users2 size={24} className="text-green-500" />
                <h2 className="text-lg font-bold text-slate-900">
                  Soporte técnico del Sistema
                </h2>
              </div>
              <h3 className="text-gray-600">Errores, dudas o consultas </h3>
              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <Phone size={18} className="text-gray-500 shrink-0 mt-0.5" />
                  <p className="text-gray-700">
                    <strong>Celular:</strong> 67192700
                  </p>
                </div>
                <div className="flex gap-3">
                  <MapPin size={18} className="text-gray-500 shrink-0 mt-0.5" />
                  <p className="text-gray-700">
                    <strong>Email:</strong> bsegales53@gmail.com
                  </p>
                </div>
                <div className="flex gap-3">
                  <Clock size={18} className="text-gray-500 shrink-0 mt-0.5" />
                  <p className="text-gray-700">
                    <strong>Horarios:</strong> 09:00-15:00 (Lun-Vie)
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Para administradores, mostrar todo el dashboard
  const statCards = [
    {
      label: "Casas Comunales",
      value: stats.total_casas,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      icon: Building2,
    },
    {
      label: "Talleres Activos",
      value: stats.talleres_activos,
      color: "text-green-600",
      bgColor: "bg-green-50",
      icon: BookOpen,
    },
    {
      label: "Participantes",
      value: stats.total_participantes,
      color: "text-slate-600",
      bgColor: "bg-slate-50",
      icon: Users2,
    },
  ];

  // Calcular el máximo para las barras de macrodistrito
  const maxMacro =
    charts.porMacrodistrito.length > 0
      ? Math.max(...charts.porMacrodistrito.map((m) => m.total), 1)
      : 1;

  // Entradas de género
  const generoEntries = Object.entries(charts.porGenero).filter(
    ([, v]) => typeof v === "number",
  );
  const totalGenero = generoEntries.reduce((sum, [, v]) => sum + v, 0);

  const generoColors = {
    Masculino: "bg-blue-500",
    Femenino: "bg-pink-500",
    Otro: "bg-purple-500",
    M: "bg-blue-500",
    F: "bg-pink-500",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Bienvenido, {usuario?.nombre_completo}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Panel de control — Gestión de Casas Comunales
          </p>
        </div>

        <button
          onClick={loadStats}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
          title="Actualizar estadísticas"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          <span className="hidden sm:inline">Actualizar</span>
        </button>
      </div>

      {error && (
        <Alert
          type="warning"
          title="No se pudieron cargar las estadísticas"
          message={error}
        />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className={stat.bgColor}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <Icon size={28} className={stat.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  {isLoading ? (
                    <div className="h-8 w-16 animate-pulse bg-gray-300 rounded mt-1" />
                  ) : (
                    <p className={`text-3xl font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Participantes por macrodistrito */}
        <Card>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 size={20} className="text-blue-600" />
              <h2 className="font-bold text-slate-900">
                Participantes por Macrodistrito
              </h2>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-6 bg-gray-200 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : charts.porMacrodistrito.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">
                Sin datos disponibles
              </p>
            ) : (
              <div className="space-y-3">
                {charts.porMacrodistrito.map((item) => {
                  const pct =
                    maxMacro > 0
                      ? Math.round((item.total / maxMacro) * 100)
                      : 0;
                  return (
                    <div key={item.macrodistrito} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700 font-medium">
                          {item.macrodistrito}
                        </span>
                        <span className="text-gray-500 font-semibold">
                          {item.total}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        {/* Participantes por género */}
        <Card>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users2 size={20} className="text-slate-600" />
              <h2 className="font-bold text-slate-900">
                Participantes por Género
              </h2>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-gray-200 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : generoEntries.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">
                Sin datos disponibles
              </p>
            ) : (
              <div className="space-y-4">
                {generoEntries.map(([genero, count]) => {
                  const pct =
                    totalGenero > 0
                      ? Math.round((count / totalGenero) * 100)
                      : 0;
                  const barColor = generoColors[genero] ?? "bg-slate-500";
                  return (
                    <div key={genero} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700 font-medium capitalize">
                          {genero}
                        </span>
                        <span className="text-gray-500">
                          {count}{" "}
                          <span className="text-gray-400">({pct}%)</span>
                        </span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${barColor} rounded-full transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                <p className="text-xs text-gray-400 pt-1">
                  Total: {totalGenero} participantes
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Estado del Sistema */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-blue-600 rounded" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Estado del Sistema
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={20} className="text-green-600" />
                <h3 className="font-semibold text-green-900">
                  Sistema Operativo
                </h3>
              </div>
              <p className="text-sm text-green-700">
                Todos los módulos están funcionando correctamente
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Activity size={20} className="text-blue-600" />
                <h3 className="font-semibold text-blue-900">
                  Datos en Tiempo Real
                </h3>
              </div>
              <p className="text-sm text-blue-700">
                Usa el botón <strong>Actualizar</strong> para refrescar las
                estadísticas
              </p>
            </div>

            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <Lock size={20} className="text-amber-600" />
                <h3 className="font-semibold text-amber-900">Acceso Seguro</h3>
              </div>
              <p className="text-sm text-amber-700">
                Conectado como{" "}
                <strong>
                  {usuario?.rol === "Administrador"
                    ? "Administrador"
                    : "Facilitador"}
                </strong>
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <Navigation size={20} className="text-slate-600" />
                <h3 className="font-semibold text-slate-900">Navegación</h3>
              </div>
              <p className="text-sm text-slate-700">
                Usa el menú lateral para acceder a los módulos disponibles
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Contactos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-2 border-blue-200 bg-blue-50">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Casas Comunales del Adulto Mayor
            </h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <MapPin size={20} className="text-blue-600 shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 font-semibold">
                    Direccion
                  </p>
                  <p className="text-sm text-gray-900">
                    Mercado Camacho lado Guardia Municipal
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock size={20} className="text-blue-600 shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Horario</p>
                  <p className="text-sm text-gray-900">
                    Desde las 09:00 hasta las 16:00
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Phone size={20} className="text-blue-600 shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 font-semibold">
                    Contacto oficial
                  </p>
                  <p className="text-sm text-gray-900 font-semibold">
                    Tel. 75273874
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-2 border-amber-200 bg-amber-50">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Equipo Responsable
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-white rounded-lg border border-amber-200">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  Responsable Administrativo
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <Phone size={16} className="text-amber-600" />
                  <p className="text-sm text-gray-900">Contacto: 75273874</p>
                </div>
                <p className="text-xs text-gray-600">
                  Para asuntos administrativos y coordinacion de talleres
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-amber-200">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  Soporte Tecnico del Sistema
                </p>
                <p className="text-sm text-gray-900 font-semibold">
                  Belen Mariel Segales Ramos
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Phone size={16} className="text-amber-600" />
                  <p className="text-sm text-gray-900">67192700</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
