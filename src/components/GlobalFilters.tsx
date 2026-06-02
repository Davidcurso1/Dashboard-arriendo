import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { FilterState } from '../types';
import { BARRIO_PROFILES } from '../utils/mlEngine';

interface GlobalFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  maxPriceLimit: number;
}

export default function GlobalFilters({ filters, onChange, onReset, maxPriceLimit }: GlobalFiltersProps) {
  const barrios = ['Todos', ...Object.keys(BARRIO_PROFILES)];
  const estratos = ['Todos', '1', '2', '3', '4', '5', '6'];
  const tiposVivienda = ['Todos', 'Apartamento', 'Casa', 'Apartaestudio'];
  const habitacionesOpts = ['Todos', '1', '2', '3', '4', '5'];

  const handleChange = (key: keyof FilterState, value: any) => {
    onChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <div id="global-filters" className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-blue-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Filtros Globales de Mercado</h2>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restablecer Filtros
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Barrio Dropdown */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500">Barrio / Sector</label>
          <select
            value={filters.barrio}
            onChange={(e) => handleChange('barrio', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 py-2 px-3 rounded-lg text-sm text-slate-700 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none"
          >
            {barrios.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* Estrato Dropdown */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500">Estrato Socioeconómico</label>
          <select
            value={filters.estrato}
            onChange={(e) => handleChange('estrato', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 py-2 px-3 rounded-lg text-sm text-slate-700 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none"
          >
            {estratos.map((est) => (
              <option key={est} value={est}>{est === 'Todos' ? 'Todos los Estratos' : `Estrato ${est}`}</option>
            ))}
          </select>
        </div>

        {/* Tipo de vivienda Dropdown */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500">Tipo de Inmueble</label>
          <select
            value={filters.tipo_vivienda}
            onChange={(e) => handleChange('tipo_vivienda', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 py-2 px-3 rounded-lg text-sm text-slate-700 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none"
          >
            {tiposVivienda.map((tv) => (
              <option key={tv} value={tv}>{tv === 'Todos' ? 'Todos' : tv}</option>
            ))}
          </select>
        </div>

        {/* Habitaciones select */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500">Habitaciones</label>
          <select
            value={filters.habitaciones}
            onChange={(e) => handleChange('habitaciones', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 py-2 px-3 rounded-lg text-sm text-slate-700 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none"
          >
            {habitacionesOpts.map((h) => (
              <option key={h} value={h}>{h === 'Todos' ? 'Todos' : `${h} Hab`}</option>
            ))}
          </select>
        </div>

        {/* Rango de Precios */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-slate-500">Arriendo Máximo</label>
            <span className="text-[11px] font-mono font-bold text-blue-600">
              COP ${(filters.maxPrecio / 1000000).toFixed(1)}M
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-slate-400 font-mono">0.5M</span>
            <input
              type="range"
              min={500000}
              max={12000000}
              step={200000}
              value={filters.maxPrecio}
              onChange={(e) => handleChange('maxPrecio', parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
            />
            <span className="text-[10px] text-slate-400 font-mono">12M+</span>
          </div>
        </div>
      </div>
    </div>
  );
}
