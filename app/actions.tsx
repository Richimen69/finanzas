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
// app/actions.tsx

export async function agregarGasto(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autorizado" };

  const categoria = (formData.get("categoria") as string) || "Otros";
  const tipoOperacion = formData.get("tipo_operacion");
  const tarjetaId = formData.get("tarjeta_id");
  const montoTotal = parseFloat(formData.get("monto_total") as string);
  const esMSI = formData.get("es_msi") === "on";
  const fechaCompra = formData.get("fecha_compra");
  const establecimiento = formData.get("establecimiento") as string;

  // --- LÓGICA DE PAGO A TARJETA ---
  if (tipoOperacion === "pago_tarjeta") {
    // 1. Obtener nombre de la tarjeta
    const { data: tarjetaData } = await supabase
      .from("tarjetas")
      .select("nombre, alias")
      .eq("id", tarjetaId)
      .single();

    const nombreTarjetaCompleto =
      tarjetaData?.alias || tarjetaData?.nombre || "Tarjeta";

    // 2. Registrar el abono en la tarjeta (gasto negativo)
    const { error: errorPago } = await supabase.from("gastos").insert([
      {
        usuario_id: user.id,
        tarjeta_id: tarjetaId,
        establecimiento: "PAGO A TARJETA (ABONO)",
        monto_total: -montoTotal,
        fecha_compra: fechaCompra,
        es_msi: false,
        categoria: "Pagos",
      },
    ]);

    if (errorPago) return { success: false, error: errorPago.message };

    // 3. Registrar salida de efectivo
    const { error: errorSalida } = await supabase.from("ingresos").insert([
      {
        usuario_id: user.id,
        monto: -montoTotal,
        concepto: `Pago a tarjeta: ${nombreTarjetaCompleto}`,
        fecha: fechaCompra,
        categoria: "Pagos",
      },
    ]);

    if (errorSalida) return { success: false, error: errorSalida.message };

    // ✅ 4. NUEVO: Incrementar parcialidades de MSI activos de esta tarjeta
    const { data: gastosMSI, error: errorConsulta } = await supabase
      .from("gastos")
      .select("*")
      .eq("tarjeta_id", tarjetaId)
      .eq("es_msi", true)
      .gt("monto_total", 0); // Solo gastos reales, no abonos

    if (!errorConsulta && gastosMSI) {
      for (const gasto of gastosMSI) {
        // Solo incrementar si aún hay parcialidades pendientes
        if (gasto.parcialidad_actual < gasto.total_parcialidades) {
          const { error: errorUpdate } = await supabase
            .from("gastos")
            .update({
              parcialidad_actual: gasto.parcialidad_actual + 1,
            })
            .eq("id", gasto.id);

          if (errorUpdate) {
            console.error("Error al incrementar parcialidad:", errorUpdate);
          }
        }
      }
    }

    revalidatePath("/");
    return {
      success: true,
      message: "Pago registrado y parcialidades actualizadas",
    };
  }

  // --- LÓGICA DE GASTO NORMAL ---
  else {
    if (tarjetaId === "efectivo") {
      const { error } = await supabase.from("ingresos").insert([
        {
          usuario_id: user.id,
          monto: -montoTotal,
          concepto: establecimiento,
          fecha: fechaCompra,
          categoria: categoria,
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
          categoria: categoria,
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
