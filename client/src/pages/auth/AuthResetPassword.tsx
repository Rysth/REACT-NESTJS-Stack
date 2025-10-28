import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ResetPasswordForm } from "../../types/auth";
import PasswordInput from "../../components/shared/PasswordInput";
import { useAuthStore } from "../../stores/authStore";

type TokenStatus = "validating" | "valid" | "invalid";

export default function AuthResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>("validating");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordForm>();

  const resetPasswordAction = useAuthStore((s) => s.resetPassword);

  // Validate token when component mounts
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenStatus("invalid");
        return;
      }

      try {
        // Rodauth doesn't have a separate token validation endpoint
        // We'll validate during the actual reset
        setTokenStatus("valid");
      } catch (error) {
        console.error("Token validation error:", error);
        setTokenStatus("invalid");
      }
    };

    validateToken();
  }, [token]);

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      await resetPasswordAction(
        token,
        data.password,
        data.passwordConfirmation
      );
      toast.success("Contraseña restablecida exitosamente");
      navigate("/auth/signin");
    } catch (err: any) {
      let errorMessage = "Error al restablecer la contraseña";

      if (err.response?.status === 401) {
        errorMessage = "El enlace es inválido o ha expirado";
      } else if (err.response?.status === 422) {
        errorMessage =
          "Las contraseñas no coinciden o no cumplen los requisitos";
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenStatus === "validating") {
    return (
      <div className="text-center">
        <div className="w-8 h-8 mx-auto border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        <p className="mt-4 text-neutral-500">Validando enlace...</p>
      </div>
    );
  }

  if (tokenStatus === "invalid") {
    return (
      <div className="text-center">
        <i className="text-6xl text-red-600 bx bx-error-circle"></i>
        <h2 className="mt-4 text-xl font-bold md:text-2xl">Enlace Inválido</h2>
        <p className="mt-2 text-red-600">
          Este enlace ya ha sido utilizado o ha expirado.
        </p>

        <div className="mt-8 space-y-4">
          <Button asChild size="xl" className="w-full">
            <Link to="/auth/forgot-password">
              <i className="bx bx-mail-send"></i>
              <span>Solicitar Nuevo Enlace</span>
            </Link>
          </Button>

          <Button asChild variant="ghost" size="xl" className="w-full">
            <Link to="/auth/signin">
              <i className="bx bx-arrow-back"></i>
              <span>Volver a Iniciar Sesión</span>
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid w-12 h-12 mx-auto mb-4 place-items-center rounded-2xl bg-sky-100 text-sky-700">
        <i className="text-2xl bx bx-lock-open-alt" />
      </div>
      <h2 className="w-full mb-1 text-2xl font-bold text-center text-slate-800">
        Reiniciar Contraseña
      </h2>
      <p className="text-center text-slate-500">Ingresa tu nueva contraseña</p>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <i className="bx bx-x"></i>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col w-full gap-4 mt-6"
      >
        <div className="space-y-2">
          <Label htmlFor="password">Nueva Contraseña</Label>
          <PasswordInput
            register={register("password", {
              required: true,
              minLength: {
                value: 8,
                message: "La contraseña debe tener al menos 8 caracteres",
              },
            })}
            placeholder="••••••••••••"
            name="password"
            autoComplete="new-password"
          />
          {errors.password && (
            <span className="text-sm font-bold text-red-600">
              {errors.password.message || "Requerido"}
            </span>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="passwordConfirmation">Confirmar Contraseña</Label>
          <PasswordInput
            register={register("passwordConfirmation", {
              required: true,
              validate: (value) =>
                value === watch("password") || "Las contraseñas no coinciden",
            })}
            placeholder="••••••••••••"
            name="passwordConfirmation"
            autoComplete="new-password"
          />
          {errors.passwordConfirmation && (
            <span className="text-sm font-bold text-red-600">
              {errors.passwordConfirmation.message || "Requerido"}
            </span>
          )}
        </div>

        <div className="mt-2">
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
            ) : (
              <i className="bx bx-lock-open-alt"></i>
            )}
            <span>{isLoading ? "Reiniciando..." : "Reiniciar Contraseña"}</span>
          </Button>
        </div>
      </form>

      <div className="flex items-center justify-center gap-1 mt-6 text-sm text-center">
        <p className="text-neutral-500">¿Recordaste tu Contraseña?</p>
        <Link
          to="/auth/signin"
          className="text-blue-600 hover:text-blue-800 hover:underline"
        >
          Volver a Iniciar Sesión
        </Link>
      </div>
    </>
  );
}
