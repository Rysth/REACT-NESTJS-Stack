import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Mail } from "lucide-react";
import type { ForgotPasswordForm } from "../../types/auth";
import { useAuthStore } from "../../stores/authStore";

export default function AuthForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>();

  const requestPasswordReset = useAuthStore((s) => s.requestPasswordReset);

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    setMessage(null);

    try {
      await requestPasswordReset(data.email);
      setMessage({
        type: "success",
        text: "Si tu correo existe, recibirás instrucciones para restablecer tu contraseña en breve",
      });
      formRef.current?.reset();
    } catch (error: any) {
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Algo salió mal. Por favor, inténtalo de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="grid w-12 h-12 mx-auto mb-4 place-items-center rounded-2xl bg-sky-100 text-sky-700">
        <i className="text-2xl bx bx-lock" />
      </div>
      <h2 className="w-full mb-1 text-2xl font-bold text-center text-slate-800">
        Restablecer tu contraseña
      </h2>
      <p className="text-center text-slate-500">
        Te enviaremos instrucciones para restablecer
      </p>

      {message && (
        <Alert
          variant={message.type === "success" ? "default" : "destructive"}
          className="mt-4"
        >
          <i
            className={`bx ${message.type === "success" ? "bx-check" : "bx-x"}`}
          ></i>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <form
        ref={formRef}
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col w-full gap-4 mt-6"
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
              placeholder="user@domain.com"
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
            <span className="text-sm font-bold text-red-600">Requerido</span>
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
              <i className="bx bx-mail-send"></i>
            )}
            <span>{isLoading ? "Enviando..." : "Enviar instrucciones"}</span>
          </Button>
        </div>
      </form>

      <div className="flex items-center justify-center gap-1 mt-6 text-sm text-center">
        <p className="text-neutral-500">¿Recuerdas tu contraseña?</p>
        <Link
          to="/auth/signin"
          className="text-blue-600 hover:text-blue-800 hover:underline"
        >
          Volver a iniciar sesión
        </Link>
      </div>
    </>
  );
}
