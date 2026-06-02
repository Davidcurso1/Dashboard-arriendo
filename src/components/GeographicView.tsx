import { useState } from 'react';
import { Map, Layers, Radio, HelpCircle, MapPin } from 'lucide-react';
import { Property } from '../types';
import { formatCOP, BARRIO_PROFILES } from '../utils/mlEngine';

interface GeographicViewProps {
  properties: Property[];
}

export default function GeographicView({ properties }: GeographicViewProps) {
  const [mapType, setMapType] = useState<'heat' | 'cluster' | 'markers'>('markers');
  const [hoveredProp, setHoveredProp] = useState<Property | null>(null);

  // Proximity translation boundaries for Medellín coordinates
  // S-to-N Lat: 6.13 to 6.29, W-to-E Lng: -75.63 to -75.53
  const minLat = 6.13;
  const maxLat = 6.29;
  const minLng = -75.63;
  const maxLng = -75.53;

  const projectX = (lng: number) => {
    return 40 + ((lng - minLng) / (maxLng - minLng)) * 440;
  };

  const projectY = (lat: number) => {
    return 460 - ((lat - minLat) / (maxLat - minLat)) * 420;
  };

  // Group closely projected points together to form Geoclusters
  const getGeoClusters = () => {
    if (properties.length === 0) return [];
    
    // We group points into coarse latitude/longitude slots of size 0.03
    const clusters: Record<string, { lat: number; lng: number; props: Property[]; id: string }> = {};
    
    properties.forEach((p, idx) => {
      const slotLat = Math.round(p.lat * 40) / 40;
      const slotLng = Math.round(p.lng * 40) / 40;
      const key = `${slotLat}_${slotLng}`;
      
      if (!clusters[key]) {
        clusters[key] = {
          lat: 0,
          lng: 0,
          props: [],
          id: `cluster-${idx}`
        };
      }
      clusters[key].props.push(p);
    });

    // Compute average centroids
    return Object.keys(clusters).map((key) => {
      const cl = clusters[key];
      const count = cl.props.length;
      const sumLat = cl.props.reduce((sum, p) => sum + p.lat, 0);
      const sumLng = cl.props.reduce((sum, p) => sum + p.lng, 0);
      return {
        id: cl.id,
        lat: sumLat / count,
        lng: sumLng / count,
        count,
        propertiesList: cl.props
      };
    });
  };

  const geoClusters = getGeoClusters();

  return (
    <div id="geographic-view" className="space-y-6 animate-fade-in">
      
      {/* Tab Title */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Map className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-slate-800">Georreferenciación y Análisis Cartográfico</h2>
        </div>

        {/* View Mode Selectors */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setMapType('markers')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              mapType === 'markers' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Ubicación Individual
          </button>
          <button
            onClick={() => setMapType('heat')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              mapType === 'heat' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Mapa de Calor
          </button>
          <button
            onClick={() => setMapType('cluster')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              mapType === 'cluster' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Clustering ML
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Geographic Canvas (SVG vector map representing Medellin boundary + points) */}
        <div className="xl:col-span-3 bg-slate-900 rounded-2xl p-4 shadow-inner border border-slate-800 relative flex items-center justify-center min-h-[500px]">
          
          {/* Compass Rose overlay */}
          <div className="absolute top-4 left-4 text-slate-600 text-[10px] font-mono leading-none tracking-widest text-left select-none pointer-events-none">
            <p className="font-bold text-slate-500 text-xs">MEDELLÍN CARTOGRAPHY</p>
            <p className="mt-1">LAT LIMIT: 6.13°N - 6.29°N</p>
            <p>LNG LIMIT: 75.53°W - 75.63°W</p>
          </div>

          <svg viewBox="0 0 500 500" className="w-full max-w-[480px] h-auto aspect-square text-white">
            {/* Outline of Medellin Valley Grid / Commune Circles */}
            {Object.keys(BARRIO_PROFILES).map((bKey) => {
              const prof = BARRIO_PROFILES[bKey];
              const bx = projectX(prof.lng);
              const by = projectY(prof.lat);
              return (
                <g key={`barrio-area-${bKey}`} className="group">
                  {/* Communes coverage zones */}
                  <circle
                    cx={bx}
                    cy={by}
                    r={36}
                    className="fill-blue-500/5 stroke-blue-500/10 stroke-dasharray-[2,2] hover:fill-blue-500/10 hover:stroke-blue-400/20 transition-all duration-200"
                  />
                  <text
                    x={bx}
                    y={by - 40}
                    className="fill-slate-500 text-[9px] font-mono select-none font-bold text-center translate-x-[-50%] pointer-events-none"
                    textAnchor="middle"
                  >
                    {bKey}
                  </text>
                </g>
              );
            })}

            {/* Render Heatmap circles */}
            {mapType === 'heat' && properties.map((p, idx) => {
              const px = projectX(p.lng);
              const py = projectY(p.lat);
              
              // Scale size/opacity of heat gradient according to rent prices
              // higher price = larger, more intense red/orange rings
              const priceRatio = Math.min(1.0, (p.precio_mensual_arriendo - 500000) / 4500000);
              const radius = 14 + priceRatio * 24;
              const opacity = 0.15 + priceRatio * 0.25;
              const color = priceRatio > 0.6 ? '#ef4444' : priceRatio > 0.3 ? '#f97316' : '#22c55e'; // heat scale

              return (
                <circle
                  key={`heat-${idx}`}
                  cx={px}
                  cy={py}
                  r={radius}
                  fill={color}
                  opacity={opacity}
                  className="blur-sm pointer-events-none"
                />
              );
            })}

            {/* Render Cluster items */}
            {mapType === 'cluster' && geoClusters.map((cl) => {
              const cx = projectX(cl.lng);
              const cy = projectY(cl.lat);

              return (
                <g key={cl.id} className="cursor-pointer">
                  <circle
                    cx={cx}
                    cy={cy}
                    r={14 + Math.min(10, cl.count)}
                    className="fill-blue-600/80 stroke-blue-400 stroke-2 hover:fill-blue-500 hover:scale-105 transition-all duration-150"
                  />
                  <text
                    x={cx}
                    y={cy + 4}
                    className="fill-white text-[11px] font-black text-center pointer-events-none"
                    textAnchor="middle"
                  >
                    {cl.count}
                  </text>
                </g>
              );
            })}

            {/* Render Individual Property Markers */}
            {mapType === 'markers' && properties.map((p) => {
              const px = projectX(p.lng);
              const py = projectY(p.lat);
              const isHovered = hoveredProp?.id === p.id;

              return (
                <g
                  key={p.id}
                  onMouseEnter={() => setHoveredProp(p)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={px}
                    cy={py}
                    r={isHovered ? 8 : 4.5}
                    className={`transition-all duration-150 ${
                      isHovered
                        ? 'fill-cyan-400 stroke-white stroke-2 shadow-lg shadow-cyan-400/50'
                        : p.amoblado
                        ? 'fill-sky-500 stroke-slate-900 border border-white'
                        : 'fill-emerald-500 stroke-slate-900'
                    }`}
                  />
                </g>
              );
            })}
          </svg>

          {/* Interactive Floating Card tooltips for map points */}
          {hoveredProp && mapType === 'markers' && (
            <div className="absolute bottom-4 right-4 bg-slate-950/95 border border-slate-850 p-4 rounded-xl shadow-lg shadow-black/40 text-slate-200 text-xs w-64 backdrop-blur-sm">
              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase font-mono font-bold text-blue-450">{hoveredProp.id}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                  hoveredProp.amoblado ? 'bg-blue-400/20 text-blue-400 border border-blue-400/20' : 'bg-slate-800 text-slate-400'
                }`}>
                  {hoveredProp.amoblado ? 'Amoblado' : 'Sin amoblar'}
                </span>
              </div>
              <p className="font-extrabold text-white text-sm mt-1">{hoveredProp.barrio}</p>
              <div className="grid grid-cols-2 gap-2 mt-3 text-slate-400">
                <div>
                  <p className="text-[9px] uppercase">Renta Mensual</p>
                  <p className="font-mono text-white text-xs font-bold">{formatCOP(hoveredProp.precio_mensual_arriendo)}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase">Área / Estrato</p>
                  <p className="text-white text-xs font-bold">{hoveredProp.area_m2} m² / E{hoveredProp.estrato}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Legend / Metrics summary Column */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Métricas de Coordenadas</h3>
            
            <div className="space-y-4">
              {/* Map view descriptions */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-150">
                {mapType === 'markers' && (
                  <>
                    <h4 className="text-xs font-bold text-slate-800">Ubicaciones Reales</h4>
                    <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">Cada punto representa una propiedad de arriendo georreferenciada. Desplace el cursor sobre los pines para ver su avalúo detallado en la ventana flotante.</p>
                  </>
                )}
                {mapType === 'heat' && (
                  <>
                    <h4 className="text-xs font-bold text-slate-800">Concentración de Precios</h4>
                    <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">Círculos concéntricos de calor. El rojo indica las rentas más altas situadas en el corredor comercial y las colinas, mientras que el verde/naranja muestra valores tradicionales.</p>
                  </>
                )}
                {mapType === 'cluster' && (
                  <>
                    <h4 className="text-xs font-bold text-slate-800">Clústeres Geográficos</h4>
                    <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">Grupos georreferenciados consolidados automáticamente por proximidad relativa de coordenadas en el Valle de Aburrá.</p>
                  </>
                )}
              </div>

              {/* Color legends */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-400">Leyenda de Inmuebles</span>
                <div className="flex items-center gap-3 text-xs text-slate-705">
                  <div className="w-3.5 h-3.5 rounded-full bg-sky-500" />
                  <span>Amoblado (Digital Nomad Friendly)</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-705">
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
                  <span>Arriendo Tradicional (Vacío)</span>
                </div>
              </div>

              {/* Communes coverage list */}
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <span className="text-[10px] font-black uppercase text-slate-400">Puntos de Referencia GPS</span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1.5 text-xs text-slate-600">
                  {Object.keys(BARRIO_PROFILES).map((b) => (
                    <div key={b} className="flex justify-between font-mono py-1 border-b border-dashed border-slate-100 last:border-0 leading-none">
                      <span className="text-slate-700 font-sans font-medium">{b}</span>
                      <span className="text-[10px] text-slate-400">({BARRIO_PROFILES[b].lat.toFixed(3)}, {BARRIO_PROFILES[b].lng.toFixed(3)})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 leading-snug bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <HelpCircle className="w-4.5 h-4.5 text-slate-450 shrink-0" />
            <span>Módulo georreferenciado optimizado para el Valle de Aburrá.</span>
          </div>
        </div>

      </div>
    </div>
  );
}
