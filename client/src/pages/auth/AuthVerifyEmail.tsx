import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "../../stores/authStore";

type VerificationStatus =
  | "pending"
  | "awaiting_verification"
  | "success"
  | "error";

export default function AuthVerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<VerificationStatus>(
    location.state?.status || "pending"
  );
  const [hasAttempted, setHasAttempted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [email, setEmail] = useState<string>(location.state?.email || "");
  const verifyEmailAction = useAuthStore((s) => s.verifyEmail);

  useEffect(() => {
    const verifyEmail = async () => {
      // ✅ Don't verify if user just signed up
      if (status === "awaiting_verification" || hasAttempted) return;

      const searchParams = new URLSearchParams(location.search);
      const token = searchParams.get("token");

      if (!token) {
        setHasAttempted(true);
        setStatus("error");
        setErrorMessage("No se proporcionó un token de verificación");
        return;
      }

      try {
        // Send the full token as received from the URL
        await verifyEmailAction(token);
        setStatus("success");
      } catch (err: any) {
        console.error("Verification failed:", err);
        setStatus("error");
        setErrorMessage(err.message || "Token inválido o ya utilizado");
      } finally {
        setHasAttempted(true);
      }
    };

    verifyEmail();
  }, [location, hasAttempted, status, verifyEmailAction]);

  // Handle automatic redirect for success only
  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        navigate("/auth/signin");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

  // ✅ NEW: Show "check your email" message after signup
  if (status === "awaiting_verification") {
    return (
      <div className="text-center">
        <i className="text-6xl bx bx-envelope text-blue-600"></i>
        <h2 className="mt-4 text-xl font-bold md:text-2xl">
          ¡Revisa tu correo!
        </h2>
        <p className="mt-2 text-neutral-500">
          Hemos enviado un enlace de verificación a:
        </p>
        <p className="mt-1 font-medium text-blue-600">{email}</p>

        <div className="mt-6 space-y-4">
          <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
            <p className="text-sm text-gray-900">
              <i className="mr-1 bx bx-info-circle"></i>
              Por favor, revisa tu bandeja de entrada y haz clic en el enlace
              para verificar tu cuenta.
            </p>
          </div>

          <div className="text-sm text-neutral-500">
            <p>¿No recibiste el correo?</p>
            <Link
              to="/auth/confirm"
              className="inline-block mt-2 text-blue-600 hover:text-blue-800 hover:underline"
            >
              Reenviar correo de verificación
            </Link>
          </div>

          <Button asChild variant="ghost" className="w-full">
            <Link to="/auth/signin">
              <i className="bx bx-arrow-back"></i>
              <span>Volver a Iniciar Sesión</span>
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Initial state - waiting for user to verify email (when clicking link)
  if (status === "pending") {
    return (
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="mt-4 text-xl font-bold md:text-2xl">
          Verificando tu correo...
        </h2>
        <p className="mt-2 text-neutral-500">
          Por favor espera mientras verificamos tu cuenta.
        </p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="text-center">
        <i className="text-6xl bx bx-check-circle text-green-600"></i>
        <h2 className="mt-4 text-xl font-bold md:text-2xl">
          ¡Correo Verificado!
        </h2>
        <p className="mt-2 text-neutral-500">
          Tu correo ha sido verificado exitosamente.
        </p>

        <div className="mt-6">
          <div className="p-4 mb-4 border rounded-lg bg-green-50 border-green-200">
            <p className="font-medium text-green-600">
              Redirigiendo a inicio de sesión en 3 segundos...
            </p>
          </div>

          <Button asChild className="w-full">
            <Link to="/auth/signin">
              <i className="bx bx-log-in"></i>
              <span>Ir a Iniciar Sesión</span>
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="text-center">
        <i className="text-6xl bx bx-error-circle text-red-600"></i>
        <h2 className="mt-4 text-xl font-bold md:text-2xl">
          Verificación Fallida
        </h2>
        <p className="mt-2 text-red-600">
          {errorMessage ||
            "Ya has verificado tu correo o el token es inválido."}
        </p>

        <div className="mt-8 space-y-4">
          <Button asChild className="w-full">
            <Link to="/auth/confirm">
              <i className="bx bx-mail-send"></i>
              <span>Reenviar Correo de Verificación</span>
            </Link>
          </Button>

          <Button asChild variant="ghost" className="w-full">
            <Link to="/auth/signin">
              <i className="bx bx-arrow-back"></i>
              <span>Volver a Iniciar Sesión</span>
            </Link>
          </Button>
        </div>
      </div>
    );
  }
}
