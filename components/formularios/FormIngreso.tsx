'use client'

import { useRef } from 'react'
import { agregarIngreso } from '@/app/actions'
import { PlusCircle, Check, DollarSign, Calendar, Tag } from 'lucide-react'

export default function FormIngreso() {
  const formRef = useRef<HTMLFormElement>(null)

  const handleAction = async (formData: FormData) => {
    const result = await agregarIngreso(formData);
    if (result?.success) {
      alert("¡Ingreso guardado exitosamente!");
      formRef.current?.reset();
    } else if (result?.error) {
      alert("Error: " + result.error);
    }
  };

  const inputStyles = "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
  const labelStyles = "block text-sm font-medium text-slate-700 dark:text-slate-300 ml-1 mb-1.5"

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
          <PlusCircle className="text-emerald-500" size={24} />
        </div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
          Registrar Nuevo Ingreso
        </h1>
      </div>

      <form ref={formRef} action={handleAction} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Concepto / Establecimiento */}
          <div className="space-y-1">
            <label className={labelStyles}>Concepto de Ingreso</label>
            <div className="relative">
              <input 
                name="concepto" 
                type="text" 
                placeholder="Ej. Nómina, Venta, Regalo" 
                className={inputStyles}
                required 
              />
            </div>
          </div>

          {/* Monto */}
          <div className="space-y-1">
            <label className={labelStyles}>Monto del Ingreso</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <span className="text-slate-500">$</span>
              </div>
              <input 
                name="monto" 
                type="number" 
                step="0.01" 
                placeholder="0.00" 
                className={`${inputStyles} pl-8`}
                required 
              />
            </div>
          </div>

          {/* Fecha */}
          <div className="space-y-1 md:col-span-2">
            <label className={labelStyles}>Fecha del Ingreso</label>
            <input 
              name="fecha" 
              type="date" 
              className={inputStyles}
              required 
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transform active:scale-[0.98] transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <span>Guardar Ingreso</span>
          <Check size={20} />
        </button>
      </form>
    </div>
  )
}