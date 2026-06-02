import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Scaling, 
  FileText 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  CartesianGrid
} from 'recharts';
import { Property } from '../types';
import { formatCOP } from '../utils/mlEngine';

interface DashboardViewProps {
  properties: Property[];
  stats: {
    promedioPrecio: number;
    maxPrecio: number;
    minPrecio: number;
    areaPromedio: number;
    total: number;
  };
}

export default function DashboardView({ properties, stats }: DashboardViewProps) {
  // 1. Prepare Price Histogram data (cubes)
  const getHistogramData = () => {
    if (properties.length === 0) return [];
    
    // Group rent pricing into 8 bins
    const min = 500000;
    const max = 10000000;
    const binSize = (max - min) / 8;
    
    const bins = Array(8).fill(0).map((_, i) => ({
      range: `${((min + i * binSize) / 1000000).toFixed(1)}M - ${((min + (i + 1) * binSize) / 1000000).toFixed(1)}M`,
      count: 0
    }));

    properties.forEach((p) => {
      const price = p.precio_mensual_arriendo;
      const binIdx = Math.min(7, Math.floor((price - min) / binSize));
      if (binIdx >= 0 && binIdx < 8) {
        bins[binIdx].count++;
      } else if (price >= max) {
        bins[7].count++;
      }
    });

    return bins;
  };

  // 2. Stratum Distribution
  const getStratumData = () => {
    const strataCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    properties.forEach((p) => {
      if (strataCounts[p.estrato] !== undefined) {
        strataCounts[p.estrato]++;
      }
    });
    return Object.keys(strataCounts).map((key) => ({
      name: `Estrato ${key}`,
      Cantidad: strataCounts[parseInt(key)]
    }));
  };

  // 3. Housing Type Distribution
  const getHousingTypeData = () => {
    const counts: Record<string, number> = { 'Apartamento': 0, 'Casa': 0, 'Apartaestudio': 0 };
    properties.forEach((p) => {
      if (counts[p.tipo_vivienda] !== undefined) {
        counts[p.tipo_vivienda]++;
      }
    });
    return Object.keys(counts).map((key) => ({
      name: key,
      value: counts[key]
    }));
  };

  // 4. Costliest vs Cheapest Neighborhoods (Barrios) averages
  const getBarrioAverages = () => {
    const barrioSums: Record<string, { sum: number; count: number }> = {};
    properties.forEach((p) => {
      if (!barrioSums[p.barrio]) {
        barrioSums[p.barrio] = { sum: 0, count: 0 };
      }
      barrioSums[p.barrio].sum += p.precio_mensual_arriendo;
      barrioSums[p.barrio].count++;
    });

    const list = Object.keys(barrioSums).map((barrioName) => ({
      name: barrioName,
      average: Math.round(barrioSums[barrioName].sum / barrioSums[barrioName].count)
    }));

    // Sort to rank
    const costliest = [...list].sort((a, b) => b.average - a.average).slice(0, 5);
    const cheapest = [...list].sort((a, b) => a.average - b.average).slice(0, 5);

    return { costliest, cheapest };
  };

  const histogramData = getHistogramData();
  const stratumData = getStratumData();
  const housingTypeData = getHousingTypeData();
  const { costliest: topCostliest, cheapest: topCheapest } = getBarrioAverages();

  // Colors
  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ec4899', '#0f172a'];

  return (
    <div id="dashboard-general-view" className="space-y-6 animate-fade-in">
      {/* 5 Indicator cards at top */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Precio Promedio */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Precio Promedio</p>
            <h4 className="text-sm font-black text-slate-800 truncate">{formatCOP(stats.promedioPrecio)}</h4>
          </div>
        </div>

        {/* Precio Máximo */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg shrink-0">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Precio Máximo</p>
            <h4 className="text-sm font-black text-slate-800 truncate">{formatCOP(stats.maxPrecio)}</h4>
          </div>
        </div>

        {/* Precio Mínimo */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
            <ArrowDownRight className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Precio Mínimo</p>
            <h4 className="text-sm font-black text-slate-800 truncate">{formatCOP(stats.minPrecio)}</h4>
          </div>
        </div>

        {/* Área Promedio */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg shrink-0">
            <Scaling className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Área Promedio</p>
            <h4 className="text-sm font-black text-slate-800 truncate">{stats.areaPromedio.toFixed(1)} m²</h4>
          </div>
        </div>

        {/* Número de Registros */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Muestra Filtrada</p>
            <h4 className="text-sm font-black text-slate-800 truncate">{stats.total} Inmuebles</h4>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Histograma de Precios */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Histograma: Distribución de Precios de Renta</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histogramData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#64748b' }} stroke="#cbd5e1" />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} stroke="#cbd5e1" />
                <Tooltip 
                  formatter={(val: number) => [`${val} inmuebles`, 'Cantidad']}
                  contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]}>
                  {histogramData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#2563eb' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribución por Estrato */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Distribución por Estrato Socioeconómico</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stratumData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                />
                <Bar dataKey="Cantidad" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribución por Tipo de Vivienda */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Distribución por Tipo de Inmueble</h3>
          <div className="h-72 flex flex-col md:flex-row items-center justify-center gap-6">
            <div className="w-48 h-48 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={housingTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {housingTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) => [`${val} propiedades`, 'Suma']}
                    contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 w-full">
              {housingTypeData.map((d, index) => {
                const pct = stats.total > 0 ? ((d.value / stats.total) * 100).toFixed(1) : '0';
                return (
                  <div key={d.name} className="flex items-center justify-between border-b border-slate-100 pb-1.5 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <div className="w-3 w-3 rounded" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-xs font-semibold text-slate-700">{d.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-800">{d.value}</span>
                      <span className="text-[10px] text-slate-400 ml-1.5">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Barrios Costosos vs Económicos */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Top Arriendos Promedio por Barrio (COP)</h3>
            <div className="space-y-5">
              {/* Costliest list */}
              <div>
                <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-2 border-b border-rose-100 pb-0.5">Sectores Más Costosos</p>
                <div className="space-y-2">
                  {topCostliest.map((item, idx) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">#{idx + 1}</span>
                        <span className="text-xs text-slate-700 font-medium">{item.name}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-rose-600">{formatCOP(item.average)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cheapest list */}
              <div>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-2 border-b border-emerald-100 pb-0.5">Sectores Más Económicos</p>
                <div className="space-y-2">
                  {topCheapest.map((item, idx) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">#{idx + 1}</span>
                        <span className="text-xs text-slate-700 font-medium">{item.name}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-600">{formatCOP(item.average)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
