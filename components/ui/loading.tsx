// src/app/loading.tsx
export default function Loading() {
    return (
      <div className="bg-[#0f172a] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-blue-400 font-medium animate-pulse">Cargando tu Dashboard...</p>
        </div>
      </div>
    );
  }