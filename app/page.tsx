// src/app/page.tsx
import { Suspense } from "react";
import FormTarjeta from "@/components/formularios/FormTarjeta";
import Loading from "@/components/ui/loading";
import DashboardContent from "@/components/pages/DashboardContent";

export default function Dashboard() {
  // NOTA: Ya no es async porque no usamos await aquí directamente.
  return (
    <main className="bg-[#0f172a] min-h-screen">
      {/* Suspense ahora sí funcionará porque DashboardContent 
          es el que contiene los awaits internos.
      */}
      <Suspense fallback={<Loading />}>
        <DashboardContent />
      </Suspense>

      <div className="max-w-md mx-auto p-6 pb-32 space-y-10">
        <section className="border-t border-gray-800 pt-10">
          <h2 className="text-white font-bold mb-6">Administrar</h2>
          <div className="space-y-8">
            <details className="group bg-slate-800/30 rounded-xl p-4 border border-white/5">
              <summary className="text-blue-400 cursor-pointer font-medium list-none flex justify-between">
                + Agregar Nueva Tarjeta
                <span className="group-open:rotate-180 transition-transform">↓</span>
              </summary>
              <div className="mt-4">
                <FormTarjeta />
              </div>
            </details>
          </div>
        </section>
      </div>
    </main>
  );
}