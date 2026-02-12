"use client";

import { useState, useRef } from "react";
import { agregarGasto } from "@/app/actions";
import { ShoppingCart, ChevronDown, Banknote, CreditCard } from "lucide-react";

interface Tarjeta {
  id: string;
  nombre: string;
  alias: string;
}
const categorias = [
  { nombre: "Gasolina", icon: "⛽" },
  { nombre: "Supermercado", icon: "🛒" },
  { nombre: "Compras en linea", icon: "📦" },
  { nombre: "Comida", icon: "🍕" },
  { nombre: "Otros", icon: "❔" },
];

export default function FormGasto({ tarjetas }: { tarjetas: Tarjeta[] }) {
  // Estados para controlar la lógica del formulario
  const [tipoOperacion, setTipoOperacion] = useState<"gasto" | "pago_tarjeta">(
    "gasto",
  );
  const [esMSI, setEsMSI] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleAction(formData: FormData) {
    // Añadimos el tipo de operación manualmente al formData
    formData.append("tipo_operacion", tipoOperacion);

    const result = await agregarGasto(formData);
    if (result.success) {
      alert(
        tipoOperacion === "gasto"
          ? "Gasto registrado"
          : "Pago a tarjeta registrado",
      );
      formRef.current?.reset();
      setEsMSI(false);
      setTipoOperacion("gasto");
    } else {
      alert("Error: " + result.error);
    }
  }

  const inputStyles =
    "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all shadow-sm";
  const labelStyles =
    "block text-sm font-medium text-slate-700 dark:text-slate-300 ml-1 mb-1.5";

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 transition-colors duration-200">
      {/* Selector de Tipo de Operación */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-8">
        <button
          type="button"
          onClick={() => setTipoOperacion("gasto")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
            tipoOperacion === "gasto"
              ? "bg-white dark:bg-slate-700 text-red-600 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <ShoppingCart size={18} /> EGRESO / GASTO
        </button>
        <button
          type="button"
          onClick={() => {
            setTipoOperacion("pago_tarjeta");
            setEsMSI(false);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
            tipoOperacion === "pago_tarjeta"
              ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Banknote size={18} /> PAGAR TARJETA
        </button>
      </div>

      <form ref={formRef} action={handleAction} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Establecimiento o Concepto de Pago */}
          <div className="space-y-1">
            <label className={labelStyles}>
              {tipoOperacion === "gasto"
                ? "Establecimiento / Concepto"
                : "Concepto del Abono"}
            </label>
            <input
              name="establecimiento"
              type="text"
              placeholder={
                tipoOperacion === "gasto"
                  ? "Ej. Amazon, Super"
                  : "Ej. Abono mensual, Pago para liberar cupo"
              }
              className={inputStyles}
              required
            />
          </div>

          {/* Tarjeta Seleccionada (Incluye Efectivo) */}
          <div className="space-y-1">
            <label className={labelStyles}>
              {tipoOperacion === "gasto"
                ? "¿Con qué pagaste?"
                : "Tarjeta a la que abonas"}
            </label>
            <div className="relative">
              <select
                name="tarjeta_id"
                className={`${inputStyles} appearance-none bg-white dark:bg-slate-800`}
                required
                defaultValue=""
              >
                <option value="" disabled>
                  Selecciona una opción
                </option>
                {/* Opción de Efectivo solo para Gastos */}
                {tipoOperacion === "gasto" && (
                  <option
                    value="efectivo"
                    className="font-bold text-emerald-600"
                  >
                    💵 Efectivo (Dinero en mano)
                  </option>
                )}
                {tarjetas.map((t) => (
                  <option key={t.id} value={t.id}>
                    💳 {t.alias}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <ChevronDown size={20} />
              </div>
            </div>
          </div>

          {/* Monto Total */}
          <div className="space-y-1">
            <label className={labelStyles}>
              Monto {tipoOperacion === "gasto" ? "Total" : "a Pagar"}
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <span className="text-slate-500">$</span>
              </div>
              <input
                name="monto_total"
                type="number"
                step="0.01"
                placeholder="0.00"
                className={`${inputStyles} pl-8`}
                required
              />
            </div>
          </div>

          {/* Fecha */}
          <div className="space-y-1">
            <label className={labelStyles}>Fecha</label>
            <input
              name="fecha_compra"
              type="date"
              className={inputStyles}
              defaultValue={new Date().toISOString().split("T")[0]}
              required
            />
          </div>
        </div>

        <select name="categoria" className={inputStyles}>
          {categorias.map((cat) => (
            <option key={cat.nombre} value={cat.nombre}>
              {cat.icon} {cat.nombre}
            </option>
          ))}
        </select>

        {/* Sección MSI (Solo visible en Gastos) */}
        {tipoOperacion === "gasto" && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center group cursor-pointer">
              <input
                type="checkbox"
                name="es_msi"
                checked={esMSI}
                onChange={(e) => setEsMSI(e.target.checked)}
                className="w-5 h-5 text-red-600 bg-slate-100 border-slate-300 rounded focus:ring-red-500 dark:bg-slate-700 dark:border-slate-600 transition-colors"
              />
              <span className="ml-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-red-500 transition-colors">
                ¿Compra a Meses Sin Intereses (MSI)?
              </span>
            </label>

            {esMSI && (
              <div className="grid grid-cols-2 gap-4 mt-5 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-1">
                  <label className={labelStyles}>Total Meses</label>
                  <input
                    name="total_parcialidades"
                    type="number"
                    min="2"
                    className={inputStyles}
                    required={esMSI}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelStyles}>Mes Inicial</label>
                  <input
                    name="parcialidad_actual"
                    type="number"
                    defaultValue="1"
                    min="1"
                    className={inputStyles}
                    required={esMSI}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Botón Dinámico */}
        <button
          type="submit"
          className={`w-full text-white font-bold py-4 px-4 rounded-xl shadow-lg transform active:scale-[0.98] transition-all duration-200 flex items-center justify-center ${
            tipoOperacion === "gasto"
              ? "bg-red-600 hover:bg-red-700 shadow-red-500/30"
              : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30"
          }`}
        >
          {tipoOperacion === "gasto"
            ? "Guardar Gasto"
            : "Confirmar Pago a Tarjeta"}
        </button>
      </form>
    </div>
  );
}
