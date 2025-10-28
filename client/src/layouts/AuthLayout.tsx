import { Link, Outlet } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import logo from "../assets/logo.svg";

export default function AuthLayout() {
  return (
    <div className="relative flex flex-col min-h-full overflow-hidden">
      {/* Modern gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" />

      {/* Decorative gradient orbs */}
      <div className="pointer-events-none absolute -top-32 right-1/4 w-[36rem] h-[36rem] rounded-full bg-gradient-to-b from-blue-200/30 via-indigo-200/20 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-20 w-[28rem] h-[28rem] rounded-full bg-gradient-to-b from-indigo-200/30 via-purple-200/20 to-transparent blur-3xl" />

      {/* Brand link */}
      <div className="fixed top-0 left-0 z-50 p-4 sm:p-6 shrink-0">
        <Link
          to="/"
          className="inline-flex items-center gap-2 transition-colors text-slate-800/80 hover:text-slate-900"
        >
          <span className="grid border shadow-sm place-items-center w-9 h-9 rounded-xl bg-white/70 backdrop-blur border-white/60">
            <img src={logo} alt="Logo" className="w-5 h-5" />
          </span>
          <span className="font-semibold">MicroBiz</span>
        </Link>
      </div>

      {/* Centered card */}
      <main className="relative z-10 flex items-center justify-center flex-1 px-4 pt-20 pb-8 sm:pt-24 lg:pt-0 lg:pb-0">
        <div className="w-full max-w-lg">
          <Card className="border shadow-xl rounded-3xl border-white/60 bg-white/60 backdrop-blur-xl shadow-sky-200/50">
            <CardContent className="p-6 sm:p-8">
              <Outlet />
            </CardContent>
          </Card>

          {/* Footer with creator link */}
          <div className="mt-6 text-sm text-center text-slate-500">
            Creado por{" "}
            <a
              href="https://rysthdesign.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-sky-700 hover:text-sky-800"
            >
              RysthDesign
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
