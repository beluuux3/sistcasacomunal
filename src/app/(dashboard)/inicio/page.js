"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import {
  Building2,
  BookOpen,
  Users2,
  Users,
  MapPin,
  Phone,
  Clock,
  Lightbulb,
  CheckCircle,
  Activity,
  Lock,
  Navigation,
} from "lucide-react";

export default function Inicio() {
  const { usuario } = useAuth();
  const { stats, isLoading, error, loadStats } = useDashboardStats();

  useEffect(() => {
    loadStats();
  }, []);

  const statCards = [
    {
      label: "Total Casas",
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
    {
      label: "Facilitadores",
      value: stats.total_facilitadores,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: Users,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Bienvenido, {usuario?.nombre_completo}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">
          Panel de control - Gestión de Casas Comunales
        </p>
      </div>

      {/* Error Alert */}
      {error && <Alert type="error" title="Error" message={error} />}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className={stat.bgColor}>
              <div className="flex flex-col items-center gap-3">
                <Icon size={32} className={stat.color} />
                <p className="text-xs sm:text-sm text-gray-600 text-center">
                  {stat.label}
                </p>
                {isLoading ? (
                  <div className="h-8 w-8 animate-pulse bg-gray-300 rounded"></div>
                ) : (
                  <p className={`text-3xl sm:text-4xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-blue-600 rounded"></div>
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
                Las estadísticas se actualizan automáticamente
              </p>
            </div>

            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <Lock size={20} className="text-amber-600" />
                <h3 className="font-semibold text-amber-900">Acceso Seguro</h3>
              </div>
              <p className="text-sm text-amber-700">
                Conectado como{" "}
                {usuario?.rol === "Administrador"
                  ? "Administrador"
                  : "Facilitador"}
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

          <div className="p-4 bg-gradient-to-r from-blue-100 to-slate-100 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={20} className="text-blue-600" />
              <h3 className="font-semibold text-slate-900">Consejo</h3>
            </div>
            <p className="text-sm text-slate-700">
              Haz clic en el icono de menú (≡) en tu dispositivo móvil para
              expandir/contraer el sidebar y acceder a todos los módulos del
              sistema.
            </p>
          </div>
        </div>
      </Card>

      {/* Contactos Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Casa Comunal Info */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Casas Comunales del Adulto Mayor
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex gap-3">
                <MapPin
                  size={20}
                  className="text-blue-600 flex-shrink-0 mt-1"
                />
                <div>
                  <p className="text-sm text-gray-600 font-semibold">
                    Dirección
                  </p>
                  <p className="text-sm text-gray-900">
                    Mercado Camacho lado Guardia Municipal
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Clock size={20} className="text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Horario</p>
                  <p className="text-sm text-gray-900">
                    Desde las 09:00 hasta las 16:00
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Phone size={20} className="text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 font-semibold">
                    Información
                  </p>
                  <p className="text-sm text-gray-900 font-semibold">
                    Cel. 75273874
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Soporte Info */}
        <Card className="border-2 border-amber-200 bg-amber-50">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Soporte Técnico
              </h3>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-white rounded-lg border border-amber-200">
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  Belen Mariel Segales Ramos
                </p>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-amber-600" />
                  <p className="text-sm text-gray-900 font-semibold">
                    67192700
                  </p>
                </div>
              </div>

              <div className="p-3 bg-amber-100 rounded-lg border border-amber-300">
                <div className="flex items-start gap-2">
                  <Lightbulb
                    size={16}
                    className="text-amber-600 mt-1 flex-shrink-0"
                  />
                  <p className="text-xs text-amber-900">
                    Para reportar problemas técnicos o no poder acceder a
                    funciones específicas, contacta a soporte.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
