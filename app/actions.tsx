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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
  
    if (!user) return { success: false, error: "No autorizado" };
  
    const esMSI = formData.get("es_msi") === "on";
  
    const { error } = await supabase
      .from("gastos")
      .insert([
        {
          usuario_id: user.id,
          tarjeta_id: formData.get("tarjeta_id"),
          establecimiento: formData.get("establecimiento"),
          monto_total: parseFloat(formData.get("monto_total") as string),
          fecha_compra: formData.get("fecha_compra"),
          es_msi: esMSI,
          total_parcialidades: esMSI ? parseInt(formData.get("total_parcialidades") as string) : 1,
          parcialidad_actual: esMSI ? parseInt(formData.get("parcialidad_actual") as string) : 1,
        },
      ]);
  
    if (error) return { success: false, error: error.message };
  
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
          limite_credito: parseFloat(formData.get("limite_credito") as string) || 0,
          dia_corte: parseInt(formData.get("dia_corte") as string),
          dia_vencimiento: parseInt(formData.get("dia_vencimiento") as string),
        },
      ]);
  
    if (error) return { success: false, error: error.message };
  
    revalidatePath("/");
    return { success: true };
  }