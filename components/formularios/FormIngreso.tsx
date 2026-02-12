'use client'

import { agregarIngreso } from '@/app/actions'
import { PlusCircle } from 'lucide-react'

export default function FormIngreso() {
  // Envolvemos la acción para que TypeScript esté feliz y podamos manejar errores
  const handleAction = async (formData: FormData) => {
    const result = await agregarIngreso(formData);
    if (result?.success) {
      alert("¡Ingreso guardado exitosamente!");
    } else if (result?.error) {
      alert("Error: " + result.error);
    }
  };

  return (
    <form action={handleAction} className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <PlusCircle className="text-green-600" size={20} />
        Registrar Nuevo Ingreso
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input 
          name="concepto" 
          type="text" 
          placeholder="Ej. Nómina Toyota" 
          className="p-2 border rounded-lg outline-blue-500"
          required 
        />
        <input 
          name="monto" 
          type="number" 
          step="0.01" 
          placeholder="Monto $" 
          className="p-2 border rounded-lg outline-blue-500"
          required 
        />
        <input 
          name="fecha" 
          type="date" 
          className="p-2 border rounded-lg outline-blue-500"
          required 
        />
      </div>

      <button 
        type="submit" 
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition"
      >
        Guardar Ingreso
      </button>
    </form>
  )
}