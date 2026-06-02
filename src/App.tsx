import { useState, useEffect } from 'react';
import { 
  generateMedellinDataset, 
  BARRIO_PROFILES 
} from './utils/mlEngine';
import { Property, FilterState } from './types';

// Importing views and elements
import Sidebar from './components/Sidebar';
import GlobalFilters from './components/GlobalFilters';
import InicioView from './components/InicioView';
import DashboardView from './components/DashboardView';
import ExploratoryView from './components/ExploratoryView';
import GeographicView from './components/GeographicView';
import PredictionView from './components/PredictionView';
import ComparisonView from './components/ComparisonView';
import ClassificationView from './components/ClassificationView';
import SegmentationView from './components/SegmentationView';
import ShapView from './components/ShapView';
import ReportsView from './components/ReportsView';
import AdminView from './components/AdminView';

import { Sparkles, HelpCircle, Loader2 } from 'lucide-react';

const INITIAL_FILTERS: FilterState = {
  barrio: 'Todos',
  estrato: 'Todos',
  tipo_vivienda: 'Todos',
  minPrecio: 500000,
  maxPrecio: 12000000,
  habitaciones: 'Todos'
};

export default function App() {
  const [currentTab, setTab] = useState('inicio');
  const [allProperties] = useState<Property[]>(() => generateMedellinDataset());
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(allProperties);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  // Gemini states
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [loadingAnalysis, setLoadingAnalysis] = useState<boolean>(false);

  // Apply filters in real-time
  useEffect(() => {
    let result = [...allProperties];

    if (filters.barrio !== 'Todos') {
      result = result.filter((p) => p.barrio === filters.barrio);
    }
    if (filters.estrato !== 'Todos') {
      result = result.filter((p) => p.estrato === parseInt(filters.estrato));
    }
    if (filters.tipo_vivienda !== 'Todos') {
      result = result.filter((p) => p.tipo_vivienda === filters.tipo_vivienda);
    }
    if (filters.habitaciones !== 'Todos') {
      result = result.filter((p) => p.habitaciones === parseInt(filters.habitaciones));
    }
    // Price cap
    result = result.filter(
      (p) => p.precio_mensual_arriendo <= filters.maxPrecio
    );

    setFilteredProperties(result);
  }, [filters, allProperties]);

  // Aggregate stats of active sample
  const getStats = () => {
    const total = filteredProperties.length;
    if (total === 0) {
      return { total: 0, promedioPrecio: 0, maxPrecio: 0, minPrecio: 0, areaPromedio: 0, estratoPromedio: 0, numBarrios: 0 };
    }

    const priceSum = filteredProperties.reduce((sum, p) => sum + p.precio_mensual_arriendo, 0);
    const areaSum = filteredProperties.reduce((sum, p) => sum + p.area_m2, 0);
    const estratoSum = filteredProperties.reduce((sum, p) => sum + p.estrato, 0);
    
    const prices = filteredProperties.map((p) => p.precio_mensual_arriendo);
    const maxRec = Math.max(...prices);
    const minRec = Math.min(...prices);

    const uniqueBarrios = new Set(filteredProperties.map((p) => p.barrio));

    return {
      total,
      promedioPrecio: Math.round(priceSum / total),
      maxPrecio: maxRec,
      minPrecio: minRec,
      areaPromedio: areaSum / total,
      estratoPromedio: estratoSum / total,
      numBarrios: uniqueBarrios.size
    };
  };

  const activeStats = getStats();
  const filtersActive = JSON.stringify(filters) !== JSON.stringify(INITIAL_FILTERS);

  // Fetch full-stack Gemini analysis whenever the filtered sample or tab shifts
  const triggerGeminiAnalysis = async () => {
    if (filteredProperties.length === 0) return;
    setLoadingAnalysis(true);
    setAiAnalysis('');

    const furnishedCount = filteredProperties.filter((p) => p.amoblado).length;

    try {
      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          barrio: filters.barrio,
          totalInmuebles: activeStats.total,
          promedioArriendo: activeStats.promedioPrecio,
          areaPromedio: activeStats.areaPromedio,
          estratoPromedio: activeStats.estratoPromedio,
          amobladoCount: furnishedCount,
          filters
        }),
      });
      const data = await res.json();
      setAiAnalysis(data.analysis || 'No se pudo compilar el reporte.');
    } catch (err) {
      console.error('Call to Express Gemini API failed:', err);
      setAiAnalysis('Ocurrió un inconveniente al conectar con el motor analítico de Inteligencia Artificial.');
    } finally {
      setLoadingAnalysis(false);
    }
  };

  // Run automatically when tab shifts or filter changes to keep dashboard summaries completely fresh
  useEffect(() => {
    if (currentTab === 'dashboard' || currentTab === 'interpretativa' || currentTab === 'inicio') {
      triggerGeminiAnalysis();
    }
  }, [filters, currentTab]);

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  return (
    <div id="app-root-container" className="flex bg-[#F1F5F9] min-h-screen text-slate-800 font-sans leading-normal">
      {/* Sidebar component */}
      <Sidebar 
        currentTab={currentTab} 
        setTab={setTab} 
        filtersActive={filtersActive}
        onClearFilters={handleResetFilters}
      />

      {/* Main active workspace viewport */}
      <div className="flex-1 flex flex-col p-5 overflow-x-hidden min-h-screen">
        
        {/* Global filter toggles visible for analytics views */}
        {['inicio', 'dashboard', 'exploracion', 'geografia', 'segmentacion', 'reportes'].includes(currentTab) && (
          <GlobalFilters
            filters={filters}
            onChange={setFilters}
            onReset={handleResetFilters}
            maxPriceLimit={12000000}
          />
        )}

        {/* Selected tab conditional view renderer */}
        <div className="flex-1">
          {currentTab === 'inicio' && (
            <InicioView 
              stats={activeStats} 
              setTab={setTab} 
              filteredCount={filteredProperties.length}
              unfilteredCount={allProperties.length}
            />
          )}
          {currentTab === 'dashboard' && (
            <DashboardView 
              properties={filteredProperties} 
              stats={activeStats} 
            />
          )}
          {currentTab === 'exploracion' && (
            <ExploratoryView 
              properties={filteredProperties} 
            />
          )}
          {currentTab === 'geografia' && (
            <GeographicView 
              properties={filteredProperties} 
            />
          )}
          {currentTab === 'prediccion' && (
            <PredictionView />
          )}
          {currentTab === 'comparador' && (
            <ComparisonView />
          )}
          {currentTab === 'clasificacion' && (
            <ClassificationView />
          )}
          {currentTab === 'segmentacion' && (
            <SegmentationView 
              properties={filteredProperties} 
            />
          )}
          {currentTab === 'interpretativa' && (
            <ShapView 
              properties={filteredProperties} 
            />
          )}
          {currentTab === 'reportes' && (
            <ReportsView 
              properties={filteredProperties} 
            />
          )}
          {currentTab === 'administracion' && (
            <AdminView />
          )}
        </div>

        {/* REAL-TIME AI REPORT EXPANDABLE FOOTER CARD (Adds massive full-stack premium value) */}
        {['inicio', 'dashboard', 'interpretativa'].includes(currentTab) && (
          <div className="mt-8 bg-[#0F172A] border border-slate-700/60 rounded-xl p-5 text-white shadow-xl flex flex-col gap-3 font-sans print:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400 animate-pulse shrink-0" />
                <h4 className="text-xs font-black uppercase tracking-wider text-blue-400">Inteligencia Artificial: Reporte Analítico Exclusivo (Gemini 3.5)</h4>
              </div>
              <button 
                onClick={triggerGeminiAnalysis}
                className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-400/30 px-2 py-0.5 rounded cursor-pointer font-bold hover:bg-blue-500/30 whitespace-nowrap"
              >
                Actualizar Análisis
              </button>
            </div>

            <div className="text-xs text-slate-300 leading-relaxed font-medium">
              {loadingAnalysis ? (
                <div className="flex items-center gap-2 text-slate-400 py-3 font-mono">
                  <Loader2 className="w-4.5 h-4.5 animate-spin text-blue-400" />
                  <span>Generando comentarios analíticos con Gemini...</span>
                </div>
              ) : aiAnalysis ? (
                <div className="space-y-4">
                  {/* Clean Markdown rendering equivalent parser using regular paragraphs */}
                  {aiAnalysis.split('\n\n').map((para, i) => {
                    const isHeader = para.startsWith('###') || para.startsWith('**');
                    return (
                      <p 
                        key={i} 
                        className={isHeader ? 'text-sm font-bold text-blue-200 mt-2 border-b border-slate-700 pb-1' : 'text-slate-300'}
                      >
                        {para.replace(/###|\*\*|\*/g, '')}
                      </p>
                    );
                  })}
                </div>
              ) : (
                <p className="italic text-slate-500 py-2">Presiona "Actualizar Análisis" para instruir a la IA redactar un análisis del clúster actual.</p>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
