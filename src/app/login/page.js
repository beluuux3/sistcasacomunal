"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import Image from "next/image";
import {
  Phone,
  MessageSquare,
  Clock,
  HelpCircle,
  X,
  Eye,
  EyeOff,
} from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [mostrarContraseña, setMostrarContraseña] = useState(false);
  const [localError, setLocalError] = useState("");
  const [showSupport, setShowSupport] = useState(false);

  const router = useRouter();
  const { login, isLoading, usuario } = useAuth();

  useEffect(() => {
    if (usuario) {
      router.push("/inicio");
    }
  }, [usuario, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (!username.trim() || !contraseña) {
      setLocalError("El usuario y la contraseña son requeridos.");
      return;
    }

    let loggedIn = false;
    while (!loggedIn) {
      try {
        await login(username, contraseña);
        loggedIn = true;
      } catch (err) {
        // Si el error no es de conexión, muéstralo y para.
        if (
          !err.message.includes("500") &&
          !err.message.includes("Network Error")
        ) {
          setLocalError(err.message);
          return;
        }
        // Si es un error de conexión, espera un poco y vuelve a intentarlo.
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0A2540] flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="w-full max-w-md z-10">
        <div className="bg-white/30 backdrop-blur-lg rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-block bg-gray-800 p-1 rounded-full mb-4">
              <Image
                src="/LOGOCASACOMUNAL.jpeg"
                alt="Logo Casas Comunales"
                width={100}
                height={110}
                className="rounded-full"
              />
            </div>
            <h1 className="text-2xl font-bold text-white">CASAS COMUNALES</h1>
            <p className="text-gray-300">Gestión de la Alcaldía de La Paz</p>
          </div>

          {localError && !isLoading && (
            <Alert
              type="error"
              title="Error de Autenticación"
              message={localError}
              className="mb-6 bg-red-500/20 text-white"
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Correo"
              type="email"
              placeholder="Ingresa tu correo institucional"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
              leftIcon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              }
            />

            <Input
              label="Contraseña"
              type={mostrarContraseña ? "text" : "password"}
              placeholder="••••••••••"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              disabled={isLoading}
              className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
              leftIcon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              }
              rightElement={
                <button
                  type="button"
                  onClick={() => setMostrarContraseña((v) => !v)}
                  className="text-gray-400 hover:text-white"
                  aria-label={
                    mostrarContraseña
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                >
                  {mostrarContraseña ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              }
            />

            <Button
              variant="primary"
              className="w-full py-3 text-base bg-[#0052CC] hover:bg-[#0065FF] disabled:bg-gray-500"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? "Ingresando..." : "Acceder"}
            </Button>
          </form>

          <p className="text-center text-xs text-gray-300 mt-8 tracking-wider">
            UNIDAD DEL ADULTO MAYOR
          </p>
          <p className="text-center text-xs text-gray-300  tracking-wider">
            DIRECCION DE ATENCION SOCIAL INTEGRAL
          </p>
        </div>
      </div>

      {/* Support Floating Button */}
      <button
        onClick={() => setShowSupport(!showSupport)}
        className="fixed bottom-6 right-6 bg-[#0052CC] text-white p-4 rounded-full shadow-lg hover:bg-[#0065FF] transition-transform transform hover:scale-110 z-20"
        aria-label="Soporte"
      >
        <HelpCircle size={24} />
      </button>

      {/* Support Card */}
      {showSupport && (
        <div className="fixed bottom-24 right-6 w-72 bg-[#10355b] backdrop-blur-md text-white rounded-2xl shadow-2xl p-5 z-20 animate-fade-in-up">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Soporte</h3>
            <button
              onClick={() => setShowSupport(false)}
              className="text-gray-300 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <div>
                <p>El correo debe proporcionarte la Unidad del Adulto Mayor</p>

                <p>Si tienes problemas para acceder, escríbeme</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone size={18} className="text-gray-300" />
              <div>
                <p>+591 67192700</p>
                <p className="text-xs text-gray-400">Whatsapp</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock size={18} className="text-gray-300" />
              <div>
                <p>09:00 - 16:00</p>
                <p className="text-xs text-gray-400">Horario de atención</p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => setShowSupport(false)}
            className="w-full mt-6 bg-white/10 hover:bg-white/20 text-white py-2"
          >
            Cerrar
          </Button>
        </div>
      )}

      <footer className="absolute bottom-4 text-center text-sm text-gray-400 z-10">
        <p>© 2026 BMSR - All rights reserved.</p>
      </footer>
    </div>
  );
}
