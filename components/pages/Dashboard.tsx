"use client";

import React from "react";
import { BanknoteArrowUp, BanknoteArrowDown, ChartPie } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

type TipoMovimiento = "ingreso" | "gasto";

const ESTILOS_BANCOS: Record<string, { gradient: string; logo: string }> = {
  bbva: {
    gradient: "from-[#004481] to-[#043263]",
    logo: "BBVA",
  },
  didi: {
    gradient: "from-[#F8843F] to-[#FF9760]",
    logo: "DiDiCard",
  },
  santander: {
    gradient: "from-[#ec0000] to-[#b30000]",
    logo: "Santander",
  },
  nu: {
    gradient: "from-[#820ad1] to-[#4b067a]",
    logo: "Nu",
  },
  amex: {
    gradient: "from-[#006fcf] to-[#003f77]",
    logo: "Amex",
  },
  banamex: {
    gradient: "from-[#004691] to-[#002d5d]",
    logo: "Banamex",
  },
  hsbc: {
    gradient: "from-[#db0011] to-[#8b000a]",
    logo: "HSBC",
  },
  generica: {
    gradient: "from-slate-700 to-slate-900",
    logo: "Credit Card",
  },
};

// Colores consistentes para las categorías
const COLORES: Record<string, string> = {
  Gasolina: "#fbbf24", // Ámbar
  Supermercado: "#10b981", // Esmeralda
  "Compras en linea": "#3b82f6", // Azul
  Salud: "#ef4444", // Rojo
  Entretenimiento: "#f472b6", // Rosa
  Vivienda: "#8b5cf6", // Violeta
  Comida: "#fffff",
  Otros: "#64748b", // Slate
};

interface Tarjeta {
  id: number | string;
  nombre: string;
  alias?: string;
  limite_credito?: number;
  dia_corte?: number;
}

interface Movimiento {
  id: string;
  tarjeta_id?: number | string;
  tipo: TipoMovimiento;
  monto?: number;
  monto_total?: number;
  fecha?: string;
  fecha_compra?: string;
  categoria: string;
  concepto?: string;
  establecimiento?: string;
  es_msi?: boolean;
  total_parcialidades?: number;
  parcialidad_actual?: number;
}

interface DashboardProps {
  tarjetas?: Tarjeta[];
  movimientos?: Movimiento[];
  resumen?: {
    disponible: number;
    deuda: number;
  };
}

const obtenerEstiloBanco = (nombre: string) => {
  const nombreLower = nombre.toLowerCase();
  if (nombreLower.includes("bbva")) return ESTILOS_BANCOS.bbva;
  if (nombreLower.includes("nu")) return ESTILOS_BANCOS.nu;
  if (nombreLower.includes("santander")) return ESTILOS_BANCOS.santander;
  if (nombreLower.includes("amex")) return ESTILOS_BANCOS.amex;
  if (nombreLower.includes("citi")) return ESTILOS_BANCOS.banamex;
  if (nombreLower.includes("hsbc")) return ESTILOS_BANCOS.hsbc;
  if (nombreLower.includes("didi")) return ESTILOS_BANCOS.didi;
  return ESTILOS_BANCOS.generica;
};

const obtenerIcono = (categoria: string) => {
  switch (categoria) {
    case "Gasolina":
      return "⛽";
    case "Supermercado":
      return "🛒";
    case "Compras en linea":
      return "📦";
    case "Salud":
      return "💊";
    case "Entretenimiento":
      return "🍿";
    case "Comida":
      return "🍕";
    default:
      return "💰";
  }
};

const DashboardTarjetas: React.FC<DashboardProps> = ({
  tarjetas = [],
  movimientos = [],
  resumen = { disponible: 0, deuda: 0 },
}) => {
  // Cálculos de saldos
const calcularSaldoTarjeta = (
  tarjetaId: number | string,
  limite: number = 0,
) => {
  const deudaInsoluta = movimientos
    .filter((m) => m.tarjeta_id === tarjetaId)
    .reduce((acc, m) => {
      const montoTotalGasto = m.monto_total || m.monto || 0;

      // ✅ SIMPLIFICADO: Todo es MSI ahora
      if (m.total_parcialidades && m.parcialidad_actual !== undefined) {
        const cuota = montoTotalGasto / m.total_parcialidades;
        const mesesRestantes = m.total_parcialidades - m.parcialidad_actual + 1;

        if (mesesRestantes > 0) {
          return acc + cuota * mesesRestantes;
        }
        return acc;
      }

      // Fallback por si hay registros antiguos sin estas columnas
      return acc + montoTotalGasto;
    }, 0);

  return {
    disponible: limite - deudaInsoluta,
    consumido: deudaInsoluta,
    porcentaje: limite > 0 ? (deudaInsoluta / limite) * 100 : 0,
  };
};

  console.log("=== DEBUG PAGO DEL MES ===");
  movimientos
    .filter((m) => m.tarjeta_id && m.tarjeta_id !== "efectivo")
    .forEach((mov) => {
      if (
        mov.es_msi &&
        mov.total_parcialidades &&
        mov.parcialidad_actual !== undefined
      ) {
        const cuota = (mov.monto_total || 0) / mov.total_parcialidades;
        const restantes = mov.total_parcialidades - mov.parcialidad_actual + 1;

        console.log({
          establecimiento: mov.establecimiento,
          parcialidades: `${mov.parcialidad_actual}/${mov.total_parcialidades}`,
          restantes: restantes,
          cuota_mensual: cuota.toFixed(2),
          se_suma: restantes > 0 ? "SÍ" : "NO",
        });
      }
    });
  const calcularSaldoEfectivo = () => {
    let saldoCalculado = 0;

    console.log("💰 === CALCULANDO EFECTIVO DISPONIBLE ===");

    movimientos.forEach((mov) => {
      const monto = mov.monto || mov.monto_total || 0;

      // REGLA: Solo sumamos ingresos reales
      if (mov.tipo === "ingreso" && monto > 0) {
        saldoCalculado += monto;
        console.log("✅ Ingreso sumado:", {
          concepto: mov.concepto,
          monto: monto,
          saldo_ahora: saldoCalculado,
        });
      }

      // REGLA: Solo restamos si el gasto fue en EFECTIVO
      if (mov.tipo === "gasto" && mov.tarjeta_id === "efectivo") {
        saldoCalculado -= monto;
        console.log("❌ Gasto efectivo restado:", {
          establecimiento: mov.establecimiento,
          monto: monto,
          saldo_ahora: saldoCalculado,
        });
      }

      // REGLA: Solo restamos al PAGAR la tarjeta (Salida de dinero real)
      const esPagoATarjeta =
        mov.tipo === "ingreso" &&
        monto < 0 &&
        (mov.concepto?.toLowerCase().includes("pago a tarjeta") ||
          mov.establecimiento?.toLowerCase().includes("pago a tarjeta"));

      if (esPagoATarjeta) {
        saldoCalculado += monto; // Suma el negativo (resta)
        console.log("💳 Pago a tarjeta restado:", {
          concepto: mov.concepto,
          monto: monto,
          saldo_ahora: saldoCalculado,
        });
      }
    });

    console.log("🏁 EFECTIVO FINAL:", saldoCalculado);
    return saldoCalculado;
  };
  const prepararDatosGrafico = () => {
    const resumenPorCat: Record<string, number> = {};
    movimientos.forEach((mov) => {
      const monto = Math.abs(mov.monto || mov.monto_total || 0);
      const cat = mov.categoria || "Otros";
      // Solo sumamos al gráfico si es un gasto real
      if (
        mov.tipo === "gasto" ||
        (mov.tipo === "ingreso" && (mov.monto || 0) < 0)
      ) {
        resumenPorCat[cat] = (resumenPorCat[cat] || 0) + monto;
      }
    });
    return Object.keys(resumenPorCat).map((key) => ({
      name: key,
      value: resumenPorCat[key],
      color: COLORES[key] || COLORES.Otros,
    }));
  };

  const calcularResumenFinanciero = () => {
    const hoy = new Date();
    const mesActual = hoy.getMonth();

    let ingresoTotalMes = 0;
    let deudaTotalAcumulada = 0;
    let deudaExigibleMes = 0;

    movimientos.forEach((mov) => {
      const montoGasto = mov.monto_total || mov.monto || 0;
      const fechaMov = new Date(mov.fecha || mov.fecha_compra!);
      const tarjeta = tarjetas.find((t) => t.id === mov.tarjeta_id);

      // 1. Ingresos (Solo este mes)
      if (mov.tipo === "ingreso" && (mov.monto || 0) > 0) {
        if (fechaMov.getMonth() === mesActual) {
          ingresoTotalMes += mov.monto || 0;
        }
      }

      // 2. Deudas de Tarjeta
      if (mov.tarjeta_id && mov.tarjeta_id !== "efectivo") {
        // CASO A: Gasto MSI
        if (
          mov.es_msi &&
          mov.total_parcialidades &&
          mov.parcialidad_actual !== undefined
        ) {
          const cuota = montoGasto / mov.total_parcialidades;
          const mesesRestantes =
            mov.total_parcialidades - mov.parcialidad_actual + 1;

          if (mesesRestantes > 0) {
            deudaTotalAcumulada += cuota * mesesRestantes;
            deudaExigibleMes += cuota;
          }
        }
        // CASO B: Gasto normal (de contado)
        else if (montoGasto > 0) {
          deudaTotalAcumulada += montoGasto;

          if (tarjeta) {
            const diaCorte = tarjeta.dia_corte || 31;
            const diaCompra = fechaMov.getDate();
            const esMismoMes = fechaMov.getMonth() === mesActual;
            const caeEnEstePeriodo = diaCompra <= diaCorte;

            if (caeEnEstePeriodo && esMismoMes) {
              deudaExigibleMes += montoGasto;
            }
          }
        }
      }
    });

    return { ingresoTotalMes, deudaTotalAcumulada, deudaExigibleMes };
  };

  // 1. Calculamos los indicadores financieros
  const { ingresoTotalMes, deudaTotalAcumulada, deudaExigibleMes } =
    calcularResumenFinanciero();

  // 2. Calculamos el efectivo disponible real
  const saldoEfectivoReal = calcularSaldoEfectivo();

  // 3. Preparamos el gráfico
  const datosGrafico = prepararDatosGrafico();

  return (
    <div className="bg-[#0f172a] min-h-screen text-gray-100 font-sans pb-24">
      <header className="px-6 pt-12 pb-6 flex justify-between items-center sticky top-0 z-20 bg-[#0f172a]/90 backdrop-blur-md">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Mis Finanzas
          </h1>
          <p className="text-sm text-gray-400 mt-1">Dashboard General</p>
        </div>
      </header>

      {/* Tarjetas */}
      <section className="mt-2 mb-8 overflow-x-auto scrollbar-hide flex space-x-6 px-6 pb-4 snap-x">
        {tarjetas.map((tarjeta) => {
          const estilo = obtenerEstiloBanco(tarjeta.nombre);
          const info = calcularSaldoTarjeta(tarjeta.id, tarjeta.limite_credito);

          return (
            <div
              key={tarjeta.id}
              className="snap-center shrink-0 w-[85%] relative group"
            >
              <div
                className={`rounded-3xl p-6 text-white h-56 flex flex-col justify-between shadow-2xl relative overflow-hidden bg-gradient-to-br ${estilo.gradient} border border-white/10 transition-transform duration-500`}
              >
                {/* Brillo decorativo */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>

                <div className="flex justify-between items-start z-10">
                  <div>
                    {/* ALIAS COMO TÍTULO PRINCIPAL */}
                    <h2 className="text-xl font-bold tracking-tight mb-0.5">
                      {tarjeta.alias || "Mi Tarjeta"}
                    </h2>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
                      {estilo.logo} {/* El banco ahora es el subtexto */}
                    </p>
                  </div>

                  {/* Chip de tarjeta */}
                  <div className="w-10 h-8 bg-gradient-to-br from-yellow-200/80 to-yellow-500/80 rounded-md shadow-inner relative overflow-hidden">
                    <div className="absolute inset-0 grid grid-cols-2 border border-black/10 opacity-20">
                      <div className="border-r border-b"></div>
                      <div className="border-b"></div>
                      <div className="border-r"></div>
                      <div></div>
                    </div>
                  </div>
                </div>

                <div className="z-10">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider">
                        Disponible
                      </p>
                      <p className="text-3xl font-bold">
                        ${info.disponible.toLocaleString()}
                      </p>
                    </div>

                    {/* Info del día de corte */}
                    {tarjeta.dia_corte && (
                      <div className="text-right bg-black/20 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/5">
                        <p className="text-[8px] text-white/50 uppercase font-bold">
                          Corte
                        </p>
                        <p className="text-xs font-bold">
                          Día {tarjeta.dia_corte}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Barra de progreso de deuda */}
                  <div className="w-full bg-black/20 h-1.5 rounded-full mt-4 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${info.porcentaje > 85 ? "bg-orange-400" : "bg-white/90"}`}
                      style={{ width: `${Math.min(info.porcentaje, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Cuentas Rápidas */}
      <section className="px-6 mb-8">
        <div className="bg-slate-800/40 backdrop-blur-md rounded-3xl p-6 border border-white/5 shadow-2xl">
          <div className="grid grid-cols-2 gap-y-8 gap-x-4">
            {/* 1. Ingreso Total Mes */}
            <div className="relative">
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-1">
                Ingreso del Mes
              </p>
              <p className="text-2xl font-bold text-white">
                ${ingresoTotalMes.toLocaleString()}
              </p>
              <div className="absolute -left-2 top-0 h-full w-0.5 bg-emerald-500 rounded-full"></div>
            </div>

            {/* 2. Efectivo Disponible */}
            <div className="relative">
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-1">
                Dinero en Mano / Débito
              </p>
              <p className="text-2xl font-bold text-white">
                ${saldoEfectivoReal.toLocaleString()}
              </p>
              <div className="absolute -left-2 top-0 h-full w-0.5 bg-blue-500 rounded-full"></div>
            </div>

            {/* 3. Deuda en el Mes (Lo urgente) */}
            <div className="relative">
              <p className="text-[10px] text-orange-400 font-bold uppercase tracking-widest mb-1">
                Pago del Mes (Corte)
              </p>
              <p className="text-2xl font-bold text-white">
                $
                {deudaExigibleMes.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-[9px] text-gray-500 mt-1 italic">
                Incluye MSI exigibles
              </p>
              <div className="absolute -left-2 top-0 h-full w-0.5 bg-orange-500 rounded-full"></div>
            </div>

            {/* 4. Deuda Total (Todo lo acumulado) */}
            <div className="relative">
              <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest mb-1">
                Deuda Total
              </p>
              <p className="text-2xl font-bold text-white">
                ${deudaTotalAcumulada.toLocaleString()}
              </p>
              <div className="absolute -left-2 top-0 h-full w-0.5 bg-red-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Gráfico de Gastos */}
      {datosGrafico.length > 0 && (
        <section className="px-6 mb-8">
          <div className="bg-slate-800/40 rounded-3xl p-6 border border-white/5">
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
              <ChartPie size={16} /> Distribución de Gastos
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={datosGrafico}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {datosGrafico.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "none",
                      borderRadius: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      )}

      {/* Movimientos */}
      <section className="px-6">
        <h3 className="text-lg font-bold mb-4">Actividad Reciente</h3>
        <div className="space-y-3">
          {movimientos
            .sort(
              (a, b) =>
                new Date(b.fecha || b.fecha_compra!).getTime() -
                new Date(a.fecha || a.fecha_compra!).getTime(),
            )
            .map((mov) => {
              const tarjeta = tarjetas.find((t) => t.id === mov.tarjeta_id);
              const monto = mov.monto || mov.monto_total || 0;

              // IDENTIFICACIÓN DE TIPOS
              const esPagoATarjeta =
                mov.establecimiento === "PAGO A TARJETA (ABONO)" ||
                (monto < 0 && mov.tarjeta_id);
              const esIngresoReal = mov.tipo === "ingreso" && monto > 0; // Tu sueldo, por ejemplo
              const esGasto =
                mov.tipo === "gasto" || (mov.tipo === "ingreso" && monto < 0);

              return (
                <div
                  key={mov.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/30 border border-white/5"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner ${
                        esIngresoReal ? "bg-emerald-500/20" : "bg-slate-700"
                      }`}
                    >
                      {/* Si es ingreso real, mostramos billete, si no, el icono de categoría */}
                      {esIngresoReal ? (
                        <BanknoteArrowDown />
                      ) : (
                        <BanknoteArrowUp />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-200">
                        {esPagoATarjeta
                          ? `Abono a ${tarjeta?.nombre}`
                          : mov.concepto || mov.establecimiento}
                      </p>
                      <p className="text-[10px] text-gray-500 uppercase font-bold">
                        {esIngresoReal
                          ? "Entrada de dinero"
                          : `${mov.categoria} • ${tarjeta ? tarjeta.nombre : "Efectivo"}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold ${
                        esIngresoReal || esPagoATarjeta
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {esIngresoReal || esPagoATarjeta ? "+" : "-"}$
                      {Math.abs(monto).toLocaleString("es-MX", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {new Date(
                        mov.fecha || mov.fecha_compra!,
                      ).toLocaleDateString("es-MX", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
        </div>
      </section>
    </div>
  );
};

export default DashboardTarjetas;
