"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCasaSeleccionada } from "@/context/CasaSeleccionadaContext";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";

export default function SeleccionarCasaPage() {
  const router = useRouter();
  const { usuario, isLoading: authLoading } = useAuth();
  const { selectCasa, casasDelFacilitador } = useCasaSeleccionada();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || authLoading) {
      return;
    }

    if (usuario?.rol !== "Facilitador") {
      router.push("/inicio");
      return;
    }

    if (casasDelFacilitador.length <= 1) {
      if (casasDelFacilitador.length === 1) {
        selectCasa(casasDelFacilitador[0]);
      }
      router.push("/inicio");
      return;
    }
  }, [
    mounted,
    authLoading,
    usuario?.rol,
    casasDelFacilitador,
    selectCasa,
    router,
  ]);

  const handleSelectCasa = (casa) => {
    selectCasa(casa);
    router.push("/inicio");
  };

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 sm:p-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Selecciona tu Casa Comunal
          </h1>
          <p className="text-gray-600">
            Estás asignado a múltiples casas. Elige en cuál trabajarás.
          </p>
        </div>

        {casasDelFacilitador.length > 0 ? (
          <div className="space-y-3">
            {casasDelFacilitador.map((casa) => (
              <button
                key={casa.id}
                onClick={() => handleSelectCasa(casa)}
                className="w-full"
              >
                <Card className="p-4 cursor-pointer hover:shadow-lg hover:border-blue-500 transition-all hover:bg-blue-50">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {casa.nombre}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {casa.macrodistrito}
                  </p>
                </Card>
              </button>
            ))}
          </div>
        ) : (
          <Alert
            type="warning"
            title="Sin casas asignadas"
            message="No hay casas comunales asignadas. Contacta al administrador."
          />
        )}

        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            💡 <strong>Nota:</strong> Podrás cambiar de casa desde el menú más
            tarde.
          </p>
        </div>
      </div>
    </div>
  );
}
