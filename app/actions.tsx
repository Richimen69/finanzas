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
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Usuario no autenticado");
    return { success: false, error: "Debes iniciar sesión" };
  }

  // 3. Insertar en la tabla 'ingresos' que creamos en SQL
  const { error } = await supabase.from("ingresos").insert([
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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autorizado" };

  // 1. Extraemos TODOS los datos necesarios al inicio
  const categoria = (formData.get("categoria") as string) || "Otros";
  const nombreTarjeta = formData.get("nombre_tarjeta") as string;
  const tipoOperacion = formData.get("tipo_operacion");
  const tarjetaId = formData.get("tarjeta_id");
  const montoTotal = parseFloat(formData.get("monto_total") as string);
  const esMSI = formData.get("es_msi") === "on";
  const fechaCompra = formData.get("fecha_compra");
  const establecimiento = formData.get("establecimiento") as string;

  // --- LÓGICA DE PAGO A TARJETA ---
  if (tipoOperacion === "pago_tarjeta") {
    // ... código existente del pago ...

    // ✅ NUEVO: Incrementar parcialidades de los MSI activos de esta tarjeta
    const { data: gastosMSI } = await supabase
      .from("gastos")
      .select("*")
      .eq("tarjeta_id", tarjetaId)
      .eq("es_msi", true);

    if (gastosMSI) {
      for (const gasto of gastosMSI) {
        const parcialidadesRestantes =
          gasto.total_parcialidades - gasto.parcialidad_actual + 1;

        // Si aún hay parcialidades pendientes, incrementar
        if (
          parcialidadesRestantes > 0 &&
          gasto.parcialidad_actual < gasto.total_parcialidades
        ) {
          await supabase
            .from("gastos")
            .update({ parcialidad_actual: gasto.parcialidad_actual + 1 })
            .eq("id", gasto.id);
        }
      }
    }

    revalidatePath("/");
    return { success: true };
  } else {
    // --- LÓGICA DE GASTO NORMAL ---

    if (tarjetaId === "efectivo") {
      const { error } = await supabase.from("ingresos").insert([
        {
          usuario_id: user.id,
          monto: -montoTotal,
          concepto: establecimiento,
          fecha: fechaCompra,
          categoria: categoria, // <--- AGREGADO AQUÍ
        },
      ]);
      if (error) return { success: false, error: error.message };
    } else {
      // Gasto con tarjeta de crédito
      const { error } = await supabase.from("gastos").insert([
        {
          usuario_id: user.id,
          tarjeta_id: tarjetaId,
          establecimiento: establecimiento,
          monto_total: montoTotal,
          fecha_compra: fechaCompra,
          es_msi: esMSI,
          categoria: categoria, // <--- AGREGADO AQUÍ
          total_parcialidades: esMSI
            ? parseInt(formData.get("total_parcialidades") as string)
            : 1,
          parcialidad_actual: esMSI
            ? parseInt(formData.get("parcialidad_actual") as string)
            : 1,
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "No autorizado" };

  const { error } = await supabase.from("tarjetas").insert([
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
