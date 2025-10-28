import { Link } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, LogOut, LogIn } from "lucide-react";

const DASHBOARD_ROLES = ["admin", "manager", "operator"];

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case "admin":
      return "default";
    case "manager":
      return "secondary";
    case "operator":
      return "outline";
    default:
      return "outline";
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case "admin":
      return "Administrador";
    case "manager":
      return "Gerente";
    case "operator":
      return "Operador";
    case "user":
      return "Usuario";
    default:
      return role;
  }
};

export default function Home() {
  const { user, logout, isLoading } = useAuthStore();

  const canAccessDashboard = user?.roles?.some((role) =>
    DASHBOARD_ROLES.includes(role)
  );

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Sesión cerrada correctamente");
      // Force a full page reload to clear all state
      window.location.href = "/auth/signin";
    } catch (error) {
      toast.error("Error al cerrar sesión");
    }
  };

  return (
    <section className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-background to-muted/20">
      <div className="flex flex-col items-center w-full max-w-2xl space-y-8">
        {user ? (
          <Card className="w-full shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Bienvenido</CardTitle>
              <CardDescription className="text-lg">
                {user.fullname}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Info Grid */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Nombre completo
                  </p>
                  <p className="text-base font-medium">{user.fullname}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Usuario
                  </p>
                  <p className="text-base font-medium">@{user.username}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Email
                  </p>
                  <p className="text-base font-medium">{user.email}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Roles
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {user.roles && user.roles.length > 0 ? (
                      user.roles.map((role) => (
                        <Badge
                          key={role}
                          variant={getRoleBadgeVariant(role) as any}
                        >
                          {getRoleLabel(role)}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline">Sin roles</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                {canAccessDashboard && (
                  <Button asChild className="flex-1" size="lg">
                    <Link to="/dashboard">
                      <LayoutDashboard className="w-5 h-5 mr-2" />
                      Ir al Dashboard
                    </Link>
                  </Button>
                )}
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-gray-300 rounded-full animate-spin border-t-gray-600" />
                      Cerrando sesión...
                    </>
                  ) : (
                    <>
                      <LogOut className="w-5 h-5 mr-2" />
                      Cerrar Sesión
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Bienvenido</CardTitle>
              <CardDescription className="text-lg">
                Inicia sesión para acceder a la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/auth/signin">
                  <LogIn className="w-5 h-5 mr-2" />
                  Iniciar Sesión
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <p className="text-center text-muted-foreground">
          Creado por{" "}
          <a
            href="https://rysthdesign.com/"
            className="font-semibold text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            RysthDesign
          </a>
        </p>
      </div>
    </section>
  );
}
