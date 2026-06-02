import { useState, useEffect } from 'react';
import { Compass, HelpCircle, AlertCircle } from 'lucide-react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Property } from '../types';
import { calculateCorrelationMatrix } from '../utils/mlEngine';

interface ExploratoryViewProps {
  properties: Property[];
}

export default function ExploratoryView({ properties }: ExploratoryViewProps) {
  const [selectedCorrelation, setSelectedCorrelation] = useState<{ x: string; y: string; xKey: string; yKey: string; r: number } | null>(null);

  // Correlation variables list
  const variables = [
    { key: 'estrato', label: 'Estrato' },
    { key: 'area_m2', label: 'Área m²' },
    { key: 'habitaciones', label: 'Habitaciones' },
    { key: 'banos', label: 'Baños' },
    { key: 'antiguedad_inmueble', label: 'Antigüedad' },
    { key: 'distancia_metro_m', label: 'Dist. Metro' },
    { key: 'cercania_zonas_turisticas', label: 'Turismo' },
    { key: 'indice_seguridad', label: 'Seguridad' },
    { key: 'indice_demanda_inmobiliaria', label: 'Demanda' },
    { key: 'nivel_presencia_extranjeros', label: 'Extranjeros' },
    { key: 'indice_gentrificacion', label: 'Gentrificación' },
    { key: 'precio_mensual_arriendo', label: 'Precio Arriendo' }
  ];

  // Dynamic Pearson Calculation
  const { labels, matrix } = calculateCorrelationMatrix(properties);

  // Auto-select standard core variables (Area vs Price) on load
  useEffect(() => {
    setSelectedCorrelation({
      x: 'Área m²',
      y: 'Precio Arriendo',
      xKey: 'area_m2',
      yKey: 'precio_mensual_arriendo',
      r: matrix[1][11] // coordinates for Area and Price in matrix
    });
  }, [properties]);

  const handleCellClick = (i: number, j: number) => {
    const varX = variables[i];
    const varY = variables[j];
    setSelectedCorrelation({
      x: varX.label,
      y: varY.label,
      xKey: varX.key,
      yKey: varY.key,
      r: matrix[i][j]
    });
  };

  // Helper to color heatmap cells based on r values [-1 to 1]
  const getCellColor = (val: number) => {
    if (val === 1) return 'bg-blue-600 text-white font-black'; // diagonal perfect identity
    if (val > 0.7) return 'bg-blue-500/90 text-white font-bold';
    if (val > 0.4) return 'bg-blue-400/60 text-slate-900 font-semibold';
    if (val > 0.1) return 'bg-blue-300/30 text-slate-800';
    if (val > -0.1) return 'bg-slate-100 text-slate-400';
    if (val > -0.4) return 'bg-rose-100 text-slate-800';
    if (val > -0.7) return 'bg-rose-400/50 text-slate-900 font-semibold';
    return 'bg-rose-500/90 text-white font-bold';
  };

  // Formatter for values on scatter chart
  const getScatterChartData = () => {
    if (!selectedCorrelation || properties.length === 0) return [];
    const xKey = selectedCorrelation.xKey;
    const yKey = selectedCorrelation.yKey;
    return properties.map((p) => ({
      x: p[xKey as keyof Property] as number,
      y: p[yKey as keyof Property] as number,
      barrio: p.barrio
    }));
  };

  const scatterData = getScatterChartData();

  return (
    <div id="exploratory-view" className="space-y-6 animate-fade-in">
      
      {/* Title block */}
      <div className="flex items-center gap-2 mb-4">
        <Compass className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-bold text-slate-800">Matriz de Correlación e Interacciones Variacionales</h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Heatmap correlation grid */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm overflow-x-auto">
          <div className="min-w-[650px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Matriz de Correlación de Pearson</h3>
              <div className="flex items-center gap-4 text-[10px] font-semibold text-slate-500">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded" />
                  <span>Positiva Fuerte</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-slate-100 border border-slate-200 rounded" />
                  <span>Nula</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-rose-500 rounded" />
                  <span>Negativa Fuerte</span>
                </div>
              </div>
            </div>

            {/* Matrix Frame container */}
            <div className="grid grid-cols-13 gap-1 text-[11px]">
              {/* Row Header corner */}
              <div className="p-1 font-bold text-slate-400 bg-slate-50 border border-slate-100 flex items-center justify-center text-center h-11 shrink-0 rounded truncate">
                Variables
              </div>
              
              {/* Top labels list */}
              {labels.map((lbl, idx) => (
                <div key={`header-${idx}`} className="p-1 text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100 flex items-center justify-center text-center h-11 shrink-0 rounded truncate">
                  {lbl}
                </div>
              ))}

              {/* Rows */}
              {variables.map((vRow, idxRow) => (
                <div key={`row-${idxRow}`} className="contents">
                  {/* Left Label */}
                  <div className="p-1.5 font-bold text-slate-600 bg-slate-50 border border-slate-100 flex items-center text-left rounded truncate text-[10px]">
                    {vRow.label}
                  </div>
                  
                  {/* Cells */}
                  {matrix[idxRow].map((rVal, idxCol) => {
                    const isSelected = selectedCorrelation && 
                      ((selectedCorrelation.xKey === variables[idxRow].key && selectedCorrelation.yKey === variables[idxCol].key) ||
                       (selectedCorrelation.xKey === variables[idxCol].key && selectedCorrelation.yKey === variables[idxRow].key));
                    
                    return (
                      <button
                        key={`cell-${idxRow}-${idxCol}`}
                        onClick={() => handleCellClick(idxRow, idxCol)}
                        className={`p-1.5 h-11 text-center flex flex-col justify-center items-center border border-slate-200 rounded-md transition cursor-pointer select-none outline-none ${getCellColor(rVal)} ${
                          isSelected ? 'ring-2 ring-blue-600 ring-offset-2 z-10 scale-102 border-blue-500' : 'hover:scale-105 hover:shadow-sm'
                        }`}
                        title={`${vRow.label} vs ${variables[idxCol].label}: r = ${rVal}`}
                      >
                        <span className="text-[12px] leading-none mb-0.5">{rVal.toFixed(2)}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2 items-center text-[10px] text-slate-500 leading-snug bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Haz clic en cualquier celda para generar el diagrama de dispersión correspondiente a la derecha y analizar las tendencias en Medellín.</span>
            </div>
          </div>
        </div>

        {/* Scatter plot panel */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Dispersión y Tendencias Dinámicas</h3>
            
            {selectedCorrelation ? (
              <div className="space-y-4">
                <div className="p-3.5 bg-blue-50/50 rounded-lg border border-blue-100 text-xs">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-black">Eje Y de Ordenadas</p>
                      <h4 className="font-bold text-slate-800">{selectedCorrelation.y}</h4>
                    </div>
                    <span className="text-slate-400 font-mono text-xs">v.s.</span>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 uppercase font-black">Eje X de Abscisas</p>
                      <h4 className="font-bold text-slate-800">{selectedCorrelation.x}</h4>
                    </div>
                  </div>
                  <div className="mt-3.5 pt-2 mb-0.5 border-t border-blue-100 flex items-center justify-between text-blue-900 font-medium">
                    <span>Coeficiente r de Pearson:</span>
                    <span className="font-mono font-black text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      {selectedCorrelation.r >= 0 ? '+' : ''}{selectedCorrelation.r.toFixed(3)}
                    </span>
                  </div>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis 
                        type="number" 
                        dataKey="x" 
                        name={selectedCorrelation.x} 
                        tick={{ fontSize: 9 }}
                        stroke="#cbd5e1"
                        label={{ value: selectedCorrelation.x, position: 'bottom', offset: 0, fontSize: 10, fill: '#64748b' }}
                      />
                      <YAxis 
                        type="number" 
                        dataKey="y" 
                        name={selectedCorrelation.y} 
                        tick={{ fontSize: 9 }}
                        stroke="#cbd5e1"
                        label={{ value: selectedCorrelation.y, angle: -90, position: 'insideLeft', offset: -10, fontSize: 10, fill: '#64748b' }}
                      />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-2 border border-slate-250 shadow-md rounded text-[11px] space-y-0.5">
                                <p className="font-bold text-slate-850">{data.barrio}</p>
                                <p><span className="text-slate-400">{selectedCorrelation.x}:</span> <span className="font-mono font-semibold">{data.x}</span></p>
                                <p><span className="text-slate-400">{selectedCorrelation.y}:</span> <span className="font-mono font-semibold">{data.y.toLocaleString('es-CO')}</span></p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Scatter name="Inmuebles" data={scatterData} fill="#2563eb" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="h-72 flex flex-col items-center justify-center text-center text-slate-400">
                <AlertCircle className="w-10 h-10 mb-2 stroke-1" />
                <p className="text-sm">Selecciona una coordenada de correlación.</p>
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-3">
            <strong>Interpretación:</strong> La correlación de Pearson mide la fuerza de la relación lineal entre dos variables. Un coeficiente cercano a 1 indica una relación positiva fuerte, mientras que valores cercanos a -1 representan una relación negativa.
          </div>
        </div>

      </div>
    </div>
  );
}
