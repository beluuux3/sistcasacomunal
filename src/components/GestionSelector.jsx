"use client";

import { useState } from "react";
import { useGestion } from "@/context/GestionContext";
import { useAuth } from "@/context/AuthContext";
import { ChevronDown } from "lucide-react";

const TRIMESTRE_LABELS = {
  1: "Ene–Mar",
  2: "Abr–Jun",
  3: "Jul–Sep",
  4: "Oct–Dic",
};

export default function GestionSelector() {
  const { gestionActiva, gestiones, cambiarGestion, isLoading, error } =
    useGestion();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading || !gestionActiva) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  const isAdmin = user?.rol === "admin";
  const trimestreLabel =
    TRIMESTRE_LABELS[gestionActiva.trimestre] || gestionActiva.trimestre;
  const displayName = `${gestionActiva.anio} - T${gestionActiva.trimestre}`;

  return (
    <div className="relative">
      {/* Display */}
      <button
        onClick={() => isAdmin && setIsOpen(!isOpen)}
        disabled={!isAdmin}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
          isAdmin
            ? "bg-gray-50 text-gray-900 hover:bg-gray-100 cursor-pointer"
            : "text-gray-600 cursor-default"
        }`}
        title={
          isAdmin ? "Click para cambiar gestión" : "Solo admin puede cambiar"
        }
      >
        <div className="flex flex-col items-end">
          <span className="font-semibold text-gray-900">{displayName}</span>
          <span className="text-xs text-gray-500">{trimestreLabel}</span>
        </div>
        <div className="flex items-center gap-1">
          {gestionActiva.activo && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-semibold">
              <span className="w-2 h-2 bg-green-600 rounded-full"></span>
              ACTIVA
            </span>
          )}
          {isAdmin && (
            <ChevronDown
              size={16}
              className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          )}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isAdmin && isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-600 uppercase">
              Cambiar Gestión
            </p>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {gestiones.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No hay gestiones disponibles
              </div>
            ) : (
              gestiones.map((gestion) => (
                <button
                  key={gestion.id}
                  onClick={() => {
                    cambiarGestion(gestion.id);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-sm border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    gestion.id === gestionActiva.id ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {gestion.anio} - T{gestion.trimestre}
                      </div>
                      <div className="text-xs text-gray-500">
                        {TRIMESTRE_LABELS[gestion.trimestre] ||
                          gestion.trimestre}
                      </div>
                    </div>
                    {gestion.activo && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-semibold">
                        <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                        ACTIVA
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {error && (
            <div className="px-4 py-2 text-xs text-red-600 bg-red-50 border-t border-gray-100">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Backdrop - click to close */}
      {isAdmin && isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
}
