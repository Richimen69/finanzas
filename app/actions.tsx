"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function agregarIngreso(formData: FormData) {
  const supabase = await createClient();

  // 1. Obtener los datos del formulario
  const monto = formData.get("monto");
  const concepto = formData.get("concepto");
  const fecha = formData.get("fecha");

  // 2. Obtener el usuario autenticado (gracias al template de Supabase)
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Usuario no autenticado");
    return { success: false, error: "Debes iniciar sesión" };
  }

  // 3. Insertar en la tabla 'ingresos' que creamos en SQL
  const { error } = await supabase
    .from("ingresos")
    .insert([
      {
        monto: parseFloat(monto as string),
        concepto: concepto as string,
        fecha: fecha as string,
        usuario_id: user.id, // Se vincula automáticamente a tu cuenta
      },
    ]);

  if (error) {
    console.error("Error al insertar:", error.message);
    return { success: false, error: error.message };
  }

  // 4. Limpiar caché para mostrar el nuevo ingreso en el Dashboard
  revalidatePath("/");
  return { success: true };
}
export async function agregarGasto(formData: FormData) {
  const categoria = formData.get("categoria") as string;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const nombreTarjeta = formData.get("nombre_tarjeta") as string;
  if (!user) return { success: false, error: "No autorizado" };

  const tipoOperacion = formData.get("tipo_operacion"); // 'gasto' o 'pago_tarjeta'
  const tarjetaId = formData.get("tarjeta_id"); // Puede ser un UUID o 'efectivo'
  const montoTotal = parseFloat(formData.get("monto_total") as string);
  const esMSI = formData.get("es_msi") === "on";

  const { error } = await supabase
  .from("gastos")
  .insert([
    {
      // ... tus otros campos
      categoria: categoria || "Otros",
    },
  ]);

  // --- LÓGICA DE PAGO A TARJETA ---
  if (tipoOperacion === "pago_tarjeta") {
    // 1. Registramos el abono en la tarjeta (esto liberará saldo disponible en la tarjeta)
    // En tu base de datos, un pago a tarjeta se puede guardar como un 'gasto negativo' 
    // o en una tabla de 'pagos'. Aquí lo guardaremos como un ingreso especial o gasto negativo.
    const { error: errorPago } = await supabase
      .from("gastos") 
      .insert([
        {
          usuario_id: user.id,
          tarjeta_id: tarjetaId, // La tarjeta que recibe el dinero
          establecimiento: "PAGO A TARJETA (ABONO)",
          monto_total: -montoTotal, // <--- VALOR NEGATIVO para que al sumar los gastos, este reste
          fecha_compra: formData.get("fecha_compra"),
          es_msi: false,
        },
      ]);

    if (errorPago) return { success: false, error: errorPago.message };

    // 2. Registramos la salida de dinero de tu EFECTIVO
    const { error: errorSalida } = await supabase
      .from("ingresos") // Lo registramos como un "Ingreso negativo" o puedes crear tabla de egresos
      .insert([
        {
          usuario_id: user.id,
          monto: -montoTotal, // Sale de tu disponible
          concepto: `Pago a tarjeta: ${nombreTarjeta}`,
          fecha: formData.get("fecha_compra"),
        },
      ]);

    if (errorSalida) return { success: false, error: errorSalida.message };

  } else {
    // --- LÓGICA DE GASTO NORMAL ---
    
    // Si el tarjetaId es 'efectivo', lo mandamos a la tabla de ingresos como monto negativo
    if (tarjetaId === "efectivo") {
      const { error } = await supabase
        .from("ingresos")
        .insert([{
          usuario_id: user.id,
          monto: -montoTotal,
          concepto: formData.get("establecimiento") as string,
          fecha: formData.get("fecha_compra"),
        }]);
      if (error) return { success: false, error: error.message };
    } else {
      // Es un gasto normal con tarjeta de crédito
      const { error } = await supabase
        .from("gastos")
        .insert([
          {
            usuario_id: user.id,
            tarjeta_id: tarjetaId,
            establecimiento: formData.get("establecimiento"),
            monto_total: montoTotal,
            fecha_compra: formData.get("fecha_compra"),
            es_msi: esMSI,
            total_parcialidades: esMSI ? parseInt(formData.get("total_parcialidades") as string) : 1,
            parcialidad_actual: esMSI ? parseInt(formData.get("parcialidad_actual") as string) : 1,
          },
        ]);
      if (error) return { success: false, error: error.message };
    }
  }

  revalidatePath("/");
  return { success: true };
}
  export async function agregarTarjeta(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
  
    if (!user) return { success: false, error: "No autorizado" };
  
    const { error } = await supabase
      .from("tarjetas")
      .insert([
        {
          usuario_id: user.id,
          nombre: formData.get("nombre") as string,
          alias: formData.get("alias") as string,
          limite_credito: parseFloat(formData.get("limite_credito") as string) || 0,
          dia_corte: parseInt(formData.get("dia_corte") as string),
          dia_vencimiento: parseInt(formData.get("dia_vencimiento") as string),
        },
      ]);
  
    if (error) return { success: false, error: error.message };
  
    revalidatePath("/");
    return { success: true };
  }