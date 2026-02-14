// src/components/pages/DashboardContent.tsx
import { createClient } from "@/lib/supabase/server";
import DashboardTarjetas from "./Dashboard";
import FormGasto from "../formularios/FormGastos";
import FormIngreso from "../formularios/FormIngreso";

export default async function DashboardContent() {
  const supabase = await createClient();

  // Consultas que antes bloqueaban la página
  const { data: tarjetas } = await supabase
    .from("tarjetas")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: gastos } = await supabase.from("gastos").select("*");
  const { data: ingresos } = await supabase.from("ingresos").select("*");

  // Lógica de procesamiento de movimientos
  const movimientosRaw = [
    ...(gastos?.map((g) => ({ ...g, tipo: "gasto" as const })) || []),
    ...(ingresos?.map((i) => ({ ...i, tipo: "ingreso" as const })) || []),
  ];

  // ✅ CORRECCIÓN: Usar fecha correcta según el tipo
  const movimientos = movimientosRaw.sort(
    (a, b) => {
      const fechaA = new Date(a.fecha || a.fecha_compra!);
      const fechaB = new Date(b.fecha || b.fecha_compra!);
      return fechaB.getTime() - fechaA.getTime();
    }
  );

  const totalDeuda =
    gastos?.reduce((acc, curr) => acc + (Number(curr.monto_total) || 0), 0) ||
    0;

  const totalIngresos =
    ingresos?.reduce((acc, curr) => acc + (Number(curr.monto) || 0), 0) || 0;

  const disponibleEfectivo = totalIngresos - totalDeuda;

  return (
    <div>
      <DashboardTarjetas
        tarjetas={tarjetas || []}
        movimientos={movimientos}
        resumen={{ disponible: disponibleEfectivo, deuda: totalDeuda }}
      />
      <div className="max-w-md mx-auto p-4">
        <FormGasto tarjetas={tarjetas || []} />
      </div>
      <div className="max-w-md mx-auto p-4">
        <FormIngreso/>
      </div>
    </div>
  );
}