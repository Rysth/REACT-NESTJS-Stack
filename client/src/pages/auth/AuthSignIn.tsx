import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Mail } from "lucide-react";
import PasswordInput from "../../components/shared/PasswordInput";
import { useAuthStore } from "../../stores/authStore";
import type { SignInForm } from "../../types/auth";

// Define the roles that can access the dashboard
const DASHBOARD_ROLES = ["admin", "manager", "operator"];

export default function AuthSignIn() {
  const { login, isLoading, isLoadingUserInfo, user } = useAuthStore();
  const navigate = useNavigate();
  const [rememberEmail, setRememberEmail] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SignInForm>();

  // Load saved email on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setValue("email", savedEmail);
      setRememberEmail(true);
    }
  }, [setValue]);

  // Check if user has dashboard access and redirect accordingly
  useEffect(() => {
    if (user) {
      const canAccessDashboard = user.roles.some((role) =>
        DASHBOARD_ROLES.includes(role)
      );

      if (canAccessDashboard) {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    }
  }, [user, navigate]);

  const onSubmit = async (data: SignInForm) => {
    try {
      // Handle email remembering
      if (rememberEmail) {
        localStorage.setItem("rememberedEmail", data.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      await login(data);
      toast.success("¡Inicio de sesión exitoso!");
      // The redirect will be handled by the useEffect hook above
      // No need to navigate here
    } catch (err: any) {
      // The auth store already handles specific error messages and throws them
      // We just need to show the error message from the thrown error
      toast.error(err.message || "Error al iniciar sesión");
    }
  };

  // Watching fields can be useful for live UI; keep minimal usage only when needed.

  return (
    <>
      {/* Top icon badge */}
      <div className="grid w-12 h-12 mx-auto mb-4 place-items-center rounded-2xl bg-sky-100 text-sky-700">
        <i className="text-2xl bx bx-log-in" />
      </div>
      <h2 className="w-full mb-1 text-2xl font-bold text-center text-slate-800">
        Inicia sesión con tu correo
      </h2>
      <p className="text-center text-slate-500">
        Vuelve a tus proyectos y tu equipo.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col w-full gap-4 my-6"
      >
        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <InputGroup>
            <InputGroupAddon>
              <Mail className="opacity-50" />
            </InputGroupAddon>
            <InputGroupInput
              id="email"
              type="email"
              placeholder="usuario@dominio.com"
              autoComplete="email"
              {...register("email", {
                required: true,
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Correo electrónico inválido",
                },
              })}
            />
          </InputGroup>
          {errors.email && (
            <span className="text-sm font-bold text-red-600">
              {errors.email.message || "Requerido"}
            </span>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <PasswordInput
            register={register("password", {
              required: true,
            })}
            placeholder="••••••••••••"
            name="password"
            autoComplete="current-password"
          />
          {errors.password && (
            <span className="text-sm font-bold text-red-600">
              {errors.password.message || "Requerido"}
            </span>
          )}
        </div>

        {/* Remember Email Checkbox */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberEmail}
              onCheckedChange={(checked) => setRememberEmail(checked === true)}
            />
            <Label htmlFor="remember" className="text-sm">
              Recordar correo electrónico
            </Label>
          </div>
          <Link
            to="/auth/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <div className="mt-2">
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isLoading || isLoadingUserInfo}
          >
            {isLoading || isLoadingUserInfo ? (
              <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
            ) : (
              <i className="bx bx-log-in"></i>
            )}
            <span>
              {isLoading
                ? "Iniciando sesión..."
                : isLoadingUserInfo
                ? "Cargando información..."
                : "Iniciar Sesión"}
            </span>
          </Button>
        </div>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="h-px bg-slate-200 grow" />
        <span className="text-xs text-slate-400">O ingresa con</span>
        <div className="h-px bg-slate-200 grow" />
      </div>

      {/* Social placeholder (Google only) */}
      <div className="grid grid-cols-1">
        <Button type="button" variant="outline" className="h-10">
          <i className="text-lg bx bxl-google" />
          <span>Continuar con Google</span>
        </Button>
      </div>

      <div className="flex items-center justify-center gap-1 mt-6 text-sm text-center">
        <p className="text-neutral-500">¿No tienes una cuenta?</p>
        <Link
          to="/auth/signup"
          className="text-blue-600 hover:text-blue-800 hover:underline"
        >
          Crear una cuenta
        </Link>
      </div>
      <div className="flex items-center justify-center gap-1 mt-3 text-sm text-center">
        <Link
          to="/auth/confirm"
          className="text-blue-600 hover:text-blue-800 hover:underline"
        >
          ¿No recibiste las instrucciones de confirmación?
        </Link>
      </div>
    </>
  );
}
