'use client'

import { useState } from 'react'
import { agregarGasto } from '@/app/actions'
import { CreditCard, Calendar, ShoppingCart } from 'lucide-react'

interface Tarjeta {
  id: string;
  nombre: string;
}

export default function FormGasto({ tarjetas }: { tarjetas: Tarjeta[] }) {
  const [esMSI, setEsMSI] = useState(false)

  async function handleAction(formData: FormData) {
    const result = await agregarGasto(formData)
    if (result.success) {
      alert("Gasto registrado correctamente")
      // Opcional: resetear formulario
    } else {
      alert("Error: " + result.error)
    }
  }

  return (
    <form action={handleAction} className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <ShoppingCart className="text-red-600" size={20} />
        Registrar Egreso / Gasto
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Establecimiento */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">Establecimiento / Concepto</label>
          <input 
            name="establecimiento" 
            type="text" 
            placeholder="Ej. Seguro Nissan, Amazon, Super" 
            className="p-2 border rounded-lg outline-blue-500"
            required 
          />
        </div>

        {/* Tarjeta Seleccionada */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">Tarjeta / Cuenta</label>
          <select 
            name="tarjeta_id" 
            className="p-2 border rounded-lg outline-blue-500 bg-white"
            required
          >
            <option value="">Selecciona una tarjeta</option>
            {tarjetas.map((t) => (
              <option key={t.id} value={t.id}>{t.nombre}</option>
            ))}
          </select>
        </div>

        {/* Monto Total */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">Monto Total</label>
          <input 
            name="monto_total" 
            type="number" 
            step="0.01" 
            placeholder="$ 0.00" 
            className="p-2 border rounded-lg outline-blue-500"
            required 
          />
        </div>

        {/* Fecha de Compra */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">Fecha de Compra</label>
          <input 
            name="fecha_compra" 
            type="date" 
            className="p-2 border rounded-lg outline-blue-500"
            required 
          />
        </div>
      </div>

      {/* Sección MSI */}
      <div className="border-t pt-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            name="es_msi" 
            checked={esMSI}
            onChange={(e) => setEsMSI(e.target.checked)}
            className="w-4 h-4 text-blue-600"
          />
          <span className="text-sm font-semibold text-gray-700 italic">¿Compra a Meses Sin Intereses (MSI)?</span>
        </label>

        {esMSI && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">Total de Mensualidades</label>
              <input 
                name="total_parcialidades" 
                type="number" 
                placeholder="Ej. 12" 
                min="2"
                className="p-2 border rounded-lg outline-blue-500"
                required={esMSI}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">Mensualidad Actual</label>
              <input 
                name="parcialidad_actual" 
                type="number" 
                placeholder="Ej. 1" 
                min="1"
                className="p-2 border rounded-lg outline-blue-500"
                required={esMSI}
              />
            </div>
          </div>
        )}
      </div>

      <button 
        type="submit" 
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition shadow-md"
      >
        Guardar Gasto
      </button>
    </form>
  )
}