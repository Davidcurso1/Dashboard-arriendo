import { Boxes, Sparkles, Home, Wallet, TrendingUp } from 'lucide-react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis,
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Property } from '../types';
import { partitionKMeans, formatCOP } from '../utils/mlEngine';

interface SegmentationViewProps {
  properties: Property[];
}

export default function SegmentationView({ properties }: SegmentationViewProps) {
  // Partition filtered properties using K-Means (k=3)
  const { clustered, centers } = partitionKMeans(properties, 3);

  // Group properties into clusters
  const clusterGroups = [
    { id: 0, name: 'Clúster Premium', color: '#2563eb', icon: Sparkles, desc: 'Rentas elevadas sumado a una notable gentrificación y masiva presencia de extranjeros.' },
    { id: 1, name: 'Clúster Residencial', color: '#10b981', icon: Home, desc: 'Mercado doméstico medio. Valores equilibrados, excelente seguridad e índices familiares estables.' },
    { id: 2, name: 'Clúster Popular', color: '#f59e0b', icon: Wallet, desc: 'Cánones económicos. Orientado a presupuestos moderados, estudiantes y familias tradicionales.' }
  ];

  // Helper stats per cluster derived in real-time
  const getClusterStats = (cid: number) => {
    const list = clustered.filter((p) => p.cluster === cid);
    const count = list.length;
    if (count === 0) return { count: 0, avgPrice: 0, avgGent: 0, avgFgn: 0 };

    const sumPrice = list.reduce((sum, p) => sum + p.precio_mensual_arriendo, 0);
    const sumGent = list.reduce((sum, p) => sum + p.indice_gentrificacion, 0);
    const sumFgn = list.reduce((sum, p) => sum + p.nivel_presencia_extranjeros, 0);

    return {
      count,
      avgPrice: Math.round(sumPrice / count),
      avgGent: Math.round(sumGent / count),
      avgFgn: Math.round(sumFgn / count)
    };
  };

  // Convert clustered points for Scatter plot
  // X: Gentrificacion [0-100], Y: Precio Mensual [COP], Size: Expats [0-100]
  const scatterProps = clustered.map((p) => ({
    x: p.indice_gentrificacion,
    y: p.precio_mensual_arriendo,
    z: p.nivel_presencia_extranjeros + 10, // offset size
    cluster: p.cluster ?? 1,
    barrio: p.barrio,
    extranjeros: p.nivel_presencia_extranjeros,
    precioForm: formatCOP(p.precio_mensual_arriendo)
  }));

  // Cluster colors matching IDs
  const CLUSTER_COLORS = ['#2563eb', '#10b981', '#f59e0b'];

  return (
    <div id="segmentation-view" className="space-y-6 animate-fade-in">
      
      {/* Title */}
      <div className="flex items-center gap-2 mb-4">
        <Boxes className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-bold text-slate-800">Segmentación Inteligente K-Means (K=3)</h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Scatter plot of multidimensional distribution */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Dispersión de Clústeres: Precio vs Gentrificación</h3>
              <p className="text-xs text-slate-400 mt-1">El diámetro de cada nodo representa el flujo/presencia de extranjeros</p>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Gentrificación" 
                  domain={[0, 100]} 
                  stroke="#cbd5e1"
                  tick={{ fontSize: 9 }}
                  label={{ value: 'Índice de Gentrificación (0-100)', position: 'bottom', offset: 0, fontSize: 10, fill: '#64748b' }}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Arriendo"
                  stroke="#cbd5e1"
                  tick={{ fontSize: 9 }}
                  label={{ value: 'Precio Mensual (COP)', angle: -90, position: 'insideLeft', offset: -10, fontSize: 10, fill: '#64748b' }}
                />
                <ZAxis type="number" dataKey="z" range={[33, 180]} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const cName = clusterGroups[data.cluster]?.name || 'N/A';
                      return (
                        <div className="bg-white p-2.5 border border-slate-200 shadow-lg rounded-xl text-[11px] space-y-0.5">
                          <p className="font-extrabold text-slate-800">{data.barrio}</p>
                          <p className="font-bold uppercase text-[9px]" style={{ color: CLUSTER_COLORS[data.cluster] }}>{cName}</p>
                          <p><span className="text-slate-400">Renta:</span> <span className="font-mono font-bold text-slate-800">{data.precioForm}</span></p>
                          <p><span className="text-slate-400">Gentrificación:</span> <span className="font-semibold">{data.x}/100</span></p>
                          <p><span className="text-slate-400">Flujo Extranjero:</span> <span className="font-semibold">{data.extranjeros}/100</span></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Propiedades" data={scatterProps}>
                  {scatterProps.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CLUSTER_COLORS[entry.cluster]} opacity={0.8} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="flex gap-4 items-center justify-center pt-2 text-[11px] font-bold">
            {clusterGroups.map((cl) => {
              const Icon = cl.icon;
              return (
                <div key={cl.id} className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: cl.color }} />
                  <span className="text-slate-700">{cl.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Clustered Stats Profile list */}
        <div className="space-y-4">
          {clusterGroups.map((group) => {
            const IconComponent = group.icon;
            const cStats = getClusterStats(group.id);

            return (
              <div
                key={group.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between hover:border-slate-350 transition duration-150"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded text-white" style={{ backgroundColor: group.color }}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-black uppercase text-slate-800">{group.name}</h4>
                    <span className="ml-auto font-mono text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                      n = {cStats.count}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">{group.desc}</p>
                </div>

                {cStats.count > 0 ? (
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center font-mono text-[10px]">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-sans font-bold">Arriendo Prom.</span>
                      <p className="font-bold text-slate-800 mt-0.5 leading-none">{formatCOP(cStats.avgPrice)}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-sans font-bold">Gentrificación</span>
                      <p className="font-bold text-slate-800 mt-0.5 leading-none">{cStats.avgGent}/100</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-sans font-bold">Extranjeros</span>
                      <p className="font-bold text-[#2563eb] mt-0.5 leading-none font-black">{cStats.avgFgn}/100</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center italic text-slate-400 text-[10px] mt-4 pt-2 border-t border-slate-100">
                    Sin inmuebles asignados bajo los filtros activos.
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
