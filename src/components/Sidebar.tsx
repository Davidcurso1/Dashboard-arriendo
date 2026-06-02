import { 
  Home, 
  BarChart3, 
  MapPin, 
  Compass, 
  BrainCircuit, 
  GitCompare, 
  Activity, 
  Boxes, 
  FileSpreadsheet, 
  FileText, 
  SlidersHorizontal,
  Settings
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  filtersActive: boolean;
  onClearFilters: () => void;
}

export default function Sidebar({ currentTab, setTab, filtersActive, onClearFilters }: SidebarProps) {
  const menuItems = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'dashboard', label: 'Dashboard General', icon: BarChart3 },
    { id: 'exploracion', label: 'Análisis Exploratorio', icon: Compass },
    { id: 'geografia', label: 'Análisis Geográfico', icon: MapPin },
    { id: 'prediccion', label: 'Predicción de Arriendos', icon: BrainCircuit },
    { id: 'comparador', label: 'Comparador de Modelos', icon: GitCompare },
    { id: 'clasificacion', label: 'Clasificación de Amoblado', icon: Activity },
    { id: 'segmentacion', label: 'Segmentación (K-Means)', icon: Boxes },
    { id: 'interpretativa', label: 'Interpretabilidad IA (SHAP)', icon: SlidersHorizontal },
    { id: 'reportes', label: 'Exportación y Reportes', icon: FileSpreadsheet },
    { id: 'administracion', label: 'Administración del Sistema', icon: Settings },
  ];

  return (
    <div id="app-sidebar" className="w-68 bg-[#0F172A] text-slate-300 flex flex-col border-r border-slate-700/50 h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-700/50 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shrink-0"></div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white leading-tight">
              Intel Inmobiliaria
            </h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Medellín Analytics</p>
          </div>
        </div>
        <p className="text-[9px] uppercase tracking-widest mt-1 opacity-50 font-semibold">Platform v2.4 (ML-Driven)</p>
      </div>

      {/* Navigation list */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 custom-scrollbar">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-tab-${item.id}`}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600/10 border-r-4 border-blue-500 text-white italic shadow-sm'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white opacity-85 hover:opacity-100'
              }`}
            >
              <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
              {item.id === 'administracion' && (
                <span className="ml-auto text-[9px] bg-blue-500/20 text-blue-400 border border-blue-400/30 px-1 py-0.2 rounded-full font-mono">
                  PRO
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* System info / Clear Filters action */}
      {filtersActive && (
        <div className="p-3 mx-2 mb-2 bg-blue-500/10 rounded border border-blue-500/20 flex flex-col gap-1.5">
          <p className="text-[10px] text-blue-300 font-semibold">Filtros activos reducen la muestra.</p>
          <button
            onClick={onClearFilters}
            className="w-full text-center text-[11px] py-1 bg-blue-600/30 border border-blue-400/30 text-white rounded hover:bg-blue-600/40 transition font-bold"
          >
            Restablecer Filtros
          </button>
        </div>
      )}

      {/* Server Status Indicators (Clean, polished footer) */}
      <div className="p-3 border-t border-slate-700/50 bg-[#071224]/40 text-xs flex flex-col gap-1">
        <div className="bg-slate-800/50 rounded p-2.5">
          <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Status del Modelo</div>
          <div className="flex items-center gap-1.5 text-xs text-slate-200">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            Random Forest Active
          </div>
        </div>
        <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1 px-1">
          <span>v2.4-stable</span>
          <span>Vite + Express</span>
        </div>
      </div>
    </div>
  );
}
