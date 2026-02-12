// src/components/DashboardContent.tsx
import { createClient } from "@/lib/supabase/server";
import DashboardTarjetas from "./Dashboard";

export default async function DashboardContent() {
  const supabase = await createClient();

  // Consultas que antes bloqueaban la página
  const { data: tarjetas } = await supabase
    .from('tarjetas')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: gastos } = await supabase.from('gastos').select('*');
  const { data: ingresos } = await supabase.from('ingresos').select('*');

  // Lógica de procesamiento de movimientos
  const movimientosRaw = [
    ...(gastos?.map(g => ({ ...g, tipo: 'gasto' as const })) || []),
    ...(ingresos?.map(i => ({ ...i, tipo: 'ingreso' as const })) || [])
  ];

  const movimientos = movimientosRaw.sort((a, b) => 
    new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

// 1. Sumamos todos los montos de la tabla 'gastos'
const totalDeuda = gastos?.reduce((acc, curr) => acc + curr.monto, 0) || 0;

// 2. Sumamos todos los montos de la tabla 'ingresos'
const totalIngresos = ingresos?.reduce((acc, curr) => acc + curr.monto, 0) || 0;

// 3. LA RESTA CLAVE: Aquí es donde se define 'disponible'
const disponibleEfectivo = totalIngresos - totalDeuda;

  return (
    <DashboardTarjetas 
      tarjetas={tarjetas || []} 
      movimientos={movimientos.slice(0, 5)} 
      resumen={{ disponible: disponibleEfectivo, deuda: totalDeuda }}
    />
  );
}