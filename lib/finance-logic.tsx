import { differenceInDays, parseISO } from 'date-fns';
export interface Deuda {
  monto: number;
  fechaVencimiento: string;
}

export interface Ingreso {
  monto: number;
  fecha: string;
}

/**
 * Calcula el balance proyectado considerando que el dinero 
 * solo está disponible si la fecha del ingreso es menor o igual 
 * a la fecha de vencimiento de la deuda.
 */
export const calcularLiquidezProyectada = (
  saldoActual: number,
  ingresos: Ingreso[],
  deudas: Deuda[]
) => {
  let balance = saldoActual;
  
  // Ordenamos deudas por fecha de vencimiento
  const deudasOrdenadas = [...deudas].sort((a, b) => 
    parseISO(a.fechaVencimiento).getTime() - parseISO(b.fechaVencimiento).getTime()
  );

  // Sumamos ingresos que ya pasaron o son hoy
  const hoy = new Date();
  const ingresosDisponibles = ingresos.filter(ing => parseISO(ing.fecha) <= hoy);
  const totalIngresosYaCaidos = ingresosDisponibles.reduce((acc, curr) => acc + curr.monto, 0);
  
  balance += totalIngresosYaCaidos;

  // Proyección de pagos
  const proyeccion = deudasOrdenadas.map(deuda => {
    // Buscamos ingresos que caen antes de esta deuda y aún no se sumaron
    // (Esta lógica la puliremos conforme agregues la recurrencia)
    balance -= deuda.monto;
    return {
      ...deuda,
      balanceResultante: balance
    };
  });

  return {
    balanceFinal: balance,
    proyeccion
  };
};