'use client'

import React from 'react'
import { ChartPie } from 'lucide-react';
type TipoMovimiento = 'ingreso' | 'gasto';
// --- 1. DEFINICIÓN DE INTERFACES (Fuera del componente) ---
interface Tarjeta {
  id: number | string;
  nombre: string;
  limite_credito?: number;
}

interface Movimiento {
  id: any;
  tipo: TipoMovimiento;
  descripcion: string;
  monto: number;
  fecha: string;
}

interface DashboardProps {
  tarjetas?: Tarjeta[]; // Las hacemos opcionales con ? para evitar errores si no vienen datos
  movimientos?: Movimiento[];
  resumen?: {
    disponible: number;
    deuda: number;
  };
}

// --- 2. COMPONENTE PRINCIPAL ---
// Usamos las interfaces para tipar las props
const DashboardTarjetas: React.FC<DashboardProps> = ({ 
  tarjetas = [], 
  movimientos = [],
  resumen = { disponible: 0, deuda: 0 } // Valores por defecto
}) => {
  return (
    <div className="bg-[#0f172a] min-h-screen text-gray-100 font-sans pb-24">
      {/* Header */}
      <header className="px-6 pt-12 pb-6 flex justify-between items-center sticky top-0 z-20 bg-[#0f172a]/90 backdrop-blur-md">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Mis Tarjetas</h1>
          <p className="text-sm text-gray-400 mt-1">Resumen de cuenta</p>
        </div>
      </header>

      {/* Slider de Tarjetas */}
      <section className="mt-2 mb-8 relative">
        <div className="flex overflow-x-auto space-x-6 px-6 pb-8 pt-4 scrollbar-hide snap-x snap-mandatory">
          {tarjetas.length > 0 ? tarjetas.map((tarjeta, index) => (
            <div key={tarjeta.id || index} className="snap-center shrink-0 w-[88%] relative group transition-transform duration-300">
              <div className={`rounded-3xl p-6 text-white h-56 flex flex-col justify-between shadow-xl relative overflow-hidden transform hover:-translate-y-1 transition-all duration-300 ${
                index % 2 === 0 ? 'bg-gradient-to-br from-blue-600 to-indigo-900' : 'bg-gradient-to-br from-purple-600 to-slate-900'
              }`}>
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                
                <div className="flex justify-between items-start z-10">
                  <div>
                    <span className="block text-xs font-semibold tracking-wider text-blue-200 mb-1 uppercase">Crédito</span>
                    <span className="font-bold text-lg tracking-wide">{tarjeta.nombre}</span>
                  </div>
                </div>

                <div className="z-10 mt-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-blue-200 opacity-80 uppercase tracking-wider mb-1">Disponible</p>
                      <p className="font-medium text-lg tracking-wide">${tarjeta.limite_credito?.toLocaleString() || '0.00'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="px-6 text-gray-500 italic">No hay tarjetas vinculadas.</div>
          )}
        </div>
      </section>

      {/* Resumen dinámico con los datos de las props */}
      <section className="px-6 mb-8">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-6 border-b border-gray-700/50 pb-4">
            <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-400 text-sm"><ChartPie/></span>
              Resumen Mensual
            </h2>
          </div>
          
          <div className="grid grid-cols-2 gap-6 relative z-10">
            <div className="col-span-1">
              <p className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">Efectivo Disponible</p>
              <p className="text-2xl font-bold text-white tracking-tight">
                ${resumen.disponible.toLocaleString()}<span className="text-lg text-gray-500">.00</span>
              </p>
            </div>
            <div className="col-span-1 pl-6 border-l border-gray-700">
              <p className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">Deuda del Mes</p>
              <p className="text-2xl font-bold text-red-400 tracking-tight">
                ${resumen.deuda.toLocaleString()}<span className="text-lg opacity-50">.00</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Movimientos Recientes */}
      <section className="px-6 flex-1">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-semibold text-gray-100">Movimientos</h3>
          <button className="text-xs text-blue-400 font-medium uppercase tracking-wide">Ver todo</button>
        </div>
        
        <div className="space-y-3">
          {movimientos.length > 0 ? movimientos.map((mov, i) => (
            <div key={mov.id || i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/40 hover:bg-slate-800 transition border border-gray-800 group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-110 ${
                  mov.tipo === 'ingreso' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                }`}>
                  <span className="material-symbols-outlined text-lg">
                    {mov.tipo === 'ingreso' ? 'attach_money' : 'shopping_bag'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-200">{mov.descripcion}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{mov.fecha}</p>
                </div>
              </div>
              <span className={`font-semibold text-sm ${mov.tipo === 'ingreso' ? 'text-emerald-400' : 'text-gray-200'}`}>
                {mov.tipo === 'ingreso' ? '+' : '-'} ${mov.monto.toLocaleString()}
              </span>
            </div>
          )) : (
            <p className="text-center text-gray-600 text-sm py-4">Sin movimientos recientes</p>
          )}
        </div>
      </section>
    </div>
  )
}



export default DashboardTarjetas;