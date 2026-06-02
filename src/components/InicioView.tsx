import { Building, Coins, Scaling, Star, Map } from 'lucide-react';
import { Property } from '../types';
import { formatCOP } from '../utils/mlEngine';

interface InicioViewProps {
  stats: {
    total: number;
    promedioPrecio: number;
    areaPromedio: number;
    estratoPromedio: number;
    numBarrios: number;
  };
  setTab: (tab: string) => void;
  filteredCount: number;
  unfilteredCount: number;
}

export default function InicioView({ stats, setTab, filteredCount, unfilteredCount }: InicioViewProps) {
  const cardData = [
    {
      title: 'Total Inmuebles Analizados',
      value: stats.total,
      subtitle: 'Muestra total georreferenciada',
      icon: Building,
      color: 'from-blue-500 to-sky-400',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Promedio de Arriendo',
      value: formatCOP(stats.promedioPrecio),
      subtitle: 'Valor medio mensual COP',
      icon: Coins,
      color: 'from-emerald-500 to-teal-400',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Área Promedio',
      value: `${stats.areaPromedio.toFixed(1)} m²`,
      subtitle: 'Tamaño de construcción promedio',
      icon: Scaling,
      color: 'from-amber-500 to-orange-400',
      bgColor: 'bg-amber-50'
    },
    {
      title: 'Estrato Socioeconómico Promedio',
      value: `Estrato ${stats.estratoPromedio.toFixed(1)}`,
      subtitle: 'Nivel medio socioeconómico',
      icon: Star,
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Sectores / Barrios Analizados',
      value: stats.numBarrios,
      subtitle: 'De Medellín y Valle de Aburrá',
      icon: Map,
      color: 'from-rose-500 to-pink-400',
      bgColor: 'bg-rose-50'
    }
  ];

  return (
    <div id="inicio-view" className="space-y-8 animate-fade-in">
      {/* Banner de Bienvenida */}
      <div className="bg-[#0F172A] text-white rounded-2xl p-8 relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 p-8 opacity-10 select-none">
          <Building className="w-64 h-64 text-blue-500" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <span className="text-xs font-mono font-bold tracking-wider text-blue-400 uppercase bg-blue-950/40 border border-blue-400/20 px-3 py-1 rounded-full">
            Plataforma de Analítica Inmobiliaria
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-4 text-white">
            Inteligencia Inmobiliaria Medellín
          </h1>
          <p className="text-slate-300 mt-3 text-lg leading-relaxed">
            Plataforma analítica avanzada con Machine Learning para estimar, segmentar y analizar las dinámicas residenciales, arriendos y gentrificación del mercado de vivienda en Medellín.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={() => setTab('dashboard')}
              className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition text-sm cursor-pointer"
            >
              Consultar Dashboard
            </button>
            <button
              onClick={() => setTab('prediccion')}
              className="px-5 py-2.5 bg-slate-800 border border-slate-750 text-white font-bold rounded-lg hover:bg-slate-700 transition text-sm cursor-pointer"
            >
              Predecir Arriendo (ML)
            </button>
          </div>
        </div>
      </div>

      {/* Tarjetas KPI Modernas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        {cardData.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition duration-200 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.title}</p>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-xl font-black text-slate-800">{card.value}</h3>
                <p className="text-xs text-slate-400 mt-1">{card.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional market insight section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Módulo Científico de Datos</h3>
            <p className="text-sm text-slate-500 mt-1">Lógica matemática integrada y validación de modelos inmobiliarios.</p>
            <div className="mt-6 space-y-4">
              <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">Regresión para Avalúo de Rentas</h4>
                  <p className="text-xs text-slate-500">Estimación de cánones mensuales optimizada mediante Random Forest Regressor en base a variables extrínsecas y ubicación geográfica.</p>
                </div>
              </div>
              <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">Clasificación de Preferación Turística (Amoblados)</h4>
                  <p className="text-xs text-slate-500">Separación categórica de propiedades óptimas para alojamiento de estadía corta usando regresiones logísticas e indicadores de gentrificación.</p>
                </div>
              </div>
              <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">Clústeres por K-Means</h4>
                  <p className="text-xs text-slate-500">Agrupación automática en perfiles Premium, Comerciales/Residenciales y Económicos según el flujo económico y el comportamiento local.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Estado de la Muestra</h3>
            <p className="text-xs text-slate-500 mt-1">Representatividad del dataset actual.</p>
            <div className="mt-6 text-center">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-95">
                  <circle
                    className="text-slate-100"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="50"
                    cx="64"
                    cy="64"
                  />
                  <circle
                    className="text-blue-600"
                    strokeWidth="10"
                    strokeDasharray={314}
                    strokeDashoffset={314 - (314 * filteredCount) / unfilteredCount}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="50"
                    cx="64"
                    cy="64"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-2xl font-black text-slate-800">{Math.round((filteredCount / unfilteredCount) * 100)}%</span>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Filtrado</p>
                </div>
              </div>
              <div className="mt-6 space-y-2 text-left">
                <div className="flex justify-between text-xs font-semibold border-b border-slate-100 pb-1 text-slate-650">
                  <span>Muestra total:</span>
                  <span className="font-mono text-slate-800">{unfilteredCount}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold border-b border-slate-100 pb-1 text-slate-650">
                  <span>Inmuebles Filtrados:</span>
                  <span className="font-mono text-slate-800">{filteredCount}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-slate-650">
                  <span>Sectores Analizados:</span>
                  <span className="font-mono text-blue-600 font-bold">{stats.numBarrios} / 10 Co</span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 italic text-center border-t border-slate-100 pt-3">
            Base de datos simulada del mercado de Medellín
          </div>
        </div>
      </div>
    </div>
  );
}
