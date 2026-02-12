'use client'

import { useState, useRef } from 'react'
import { agregarGasto } from '@/app/actions'
import { ShoppingCart, ChevronDown } from 'lucide-react'

interface Tarjeta {
  id: string;
  nombre: string;
}

export default function FormGasto({ tarjetas }: { tarjetas: Tarjeta[] }) {
  const [esMSI, setEsMSI] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleAction(formData: FormData) {
    const result = await agregarGasto(formData)
    if (result.success) {
      alert("Gasto registrado correctamente")
      formRef.current?.reset()
      setEsMSI(false)
    } else {
      alert("Error: " + result.error)
    }
  }

  const inputStyles = "w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all shadow-sm"
  const labelStyles = "block text-sm font-medium text-slate-700 dark:text-slate-300 ml-1 mb-1.5"

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <ShoppingCart className="text-red-600" size={24} />
        </div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
          Registrar Egreso / Gasto
        </h1>
      </div>

      <form ref={formRef} action={handleAction} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Establecimiento */}
          <div className="space-y-1">
            <label className={labelStyles}>Establecimiento / Concepto</label>
            <input 
              name="establecimiento" 
              type="text" 
              placeholder="Ej. Seguro Nissan, Amazon, Super" 
              className={inputStyles}
              required 
            />
          </div>

          {/* Tarjeta Seleccionada */}
          <div className="space-y-1">
            <label className={labelStyles}>Tarjeta / Cuenta</label>
            <div className="relative">
              <select 
                name="tarjeta_id" 
                className={`${inputStyles} appearance-none bg-white dark:bg-slate-800`}
                required
                defaultValue=""
              >
                <option value="" disabled>Selecciona una tarjeta</option>
                {tarjetas.map((t) => (
                  <option key={t.id} value={t.id} className="dark:bg-slate-800">
                    {t.nombre}
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
            <label className={labelStyles}>Monto Total</label>
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

          {/* Fecha de Compra */}
          <div className="space-y-1">
            <label className={labelStyles}>Fecha de Compra</label>
            <input 
              name="fecha_compra" 
              type="date" 
              className={inputStyles}
              required 
            />
          </div>
        </div>

        {/* Sección MSI */}
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
            <div className="grid grid-cols-2 gap-4 mt-5 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="space-y-1">
                <label className={labelStyles}>Total Meses</label>
                <input 
                  name="total_parcialidades" 
                  type="number" 
                  placeholder="Ej. 12" 
                  min="2"
                  className={inputStyles}
                  required={esMSI}
                />
              </div>
              <div className="space-y-1">
                <label className={labelStyles}>Mes Actual</label>
                <input 
                  name="parcialidad_actual" 
                  type="number" 
                  placeholder="Ej. 1" 
                  min="1"
                  className={inputStyles}
                  required={esMSI}
                />
              </div>
            </div>
          )}
        </div>

        <button 
          type="submit" 
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transform active:scale-[0.98] transition-all duration-200 flex items-center justify-center"
        >
          Guardar Gasto
        </button>
      </form>
    </div>
  )
}