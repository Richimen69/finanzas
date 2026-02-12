'use client'

import { agregarTarjeta } from '@/app/actions'
import { IdCard, CalendarDays, CalendarClock, CreditCard  } from 'lucide-react'

export default function FormTarjeta() {
  async function handleAction(formData: FormData) {
    const result = await agregarTarjeta(formData)
    if (result.success) {
      alert("Tarjeta registrada con éxito")
    } else {
      alert("Error: " + result.error)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Indicador de Progreso Estético */}
      <div className="mb-8 mt-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-blue-500 font-bold text-xs uppercase tracking-wider">Agregar Tarjeta</span>
        </div>
      </div>

      {/* Contenedor Principal */}
      <div className="bg-zinc-900 rounded-2xl shadow-lg border border-zinc-800 p-6">
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
            <span className="material-symbols-outlined text-2xl"><CreditCard/></span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Nueva Tarjeta</h2>
            <p className="text-xs text-zinc-400">Ingresa los detalles de tu crédito</p>
          </div>
        </div>

        <form action={handleAction} className="space-y-6">
          {/* Nombre del Crédito */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide ml-1">
              Nombre del Crédito
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-zinc-400 group-focus-within:text-blue-500 transition-colors text-[20px]"><IdCard/></span>
              </div>
              <input
                name="nombre"
                type="text"
                placeholder="Ej. BBVA Oro"
                className="block w-full rounded-xl border border-transparent bg-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500 focus:bg-zinc-800/50 focus:ring-1 focus:ring-blue-500 sm:text-sm py-3.5 pl-12 pr-4 transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Límite de Crédito */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide ml-1">
              Límite de Crédito
            </label>
            <div className="relative group">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <span className="text-zinc-400 group-focus-within:text-blue-500 transition-colors text-lg">$</span>
              </div>
              <input
                name="limite_credito"
                type="number"
                placeholder="0.00"
                className="block w-full rounded-xl border border-transparent bg-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500 focus:bg-zinc-800/50 focus:ring-1 focus:ring-blue-500 sm:text-sm py-3.5 pl-10 pr-4 transition-all duration-200"
              />
            </div>
          </div>

          {/* Días de Corte y Pago */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide ml-1">
                Día de Corte
              </label>
              <div className="relative group">
                <input
                  name="dia_corte"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="Ej. 5"
                  className="block w-full rounded-xl border border-transparent bg-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm py-3.5 pl-4 pr-10 transition-all duration-200 text-center"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="material-symbols-outlined text-zinc-400 group-focus-within:text-blue-500 text-sm"><CalendarDays/></span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide ml-1">
                Día Límite
              </label>
              <div className="relative group">
                <input
                  name="dia_vencimiento"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="Ej. 25"
                  className="block w-full rounded-xl border border-transparent bg-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm py-3.5 pl-4 pr-10 transition-all duration-200 text-center"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="material-symbols-outlined text-zinc-400 group-focus-within:text-blue-500 text-sm"><CalendarClock/></span>
                </div>
              </div>
            </div>
          </div>

          {/* Botón de Envío */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-blue-500 transition-all transform active:scale-[0.98]"
            >
              Vincular Tarjeta
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}