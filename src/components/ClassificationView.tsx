import { useState } from 'react';
import { Activity, ClipboardList, HelpCircle, Sparkles } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { CLASSIFICATION_MODEL_SCORES, predictFurnishedProbability, BARRIO_PROFILES, formatCOP } from '../utils/mlEngine';

export default function ClassificationView() {
  const [metricTab, setMetricTab] = useState<'accuracy' | 'precision' | 'recall' | 'f1'>('accuracy');

  // Prediction inputs
  const [barrio, setBarrio] = useState('El Poblado');
  const [estrato, setEstrato] = useState(5);
  const [area, setArea] = useState(70);
  const [precio, setPrecio] = useState(3500000);
  const [turismo, setTurismo] = useState(85);
  const [extranjeros, setExtranjeros] = useState(90);
  const [gentrificacion, setGentrificacion] = useState(85);
  const [tipoVivienda, setTipoVivienda] = useState('Apartamento');

  const [probValue, setProbValue] = useState<number | null>(null);
  const [loadingPred, setLoadingPred] = useState(false);

  const handleBarrioChange = (bName: string) => {
    setBarrio(bName);
    const prof = BARRIO_PROFILES[bName];
    if (prof) {
      setEstrato(prof.estrato);
      setTurismo(prof.turismo);
      setExtranjeros(prof.extranjeros);
      setGentrificacion(prof.gentrificacion);
    }
  };

  const handlePredictProb = () => {
    setLoadingPred(true);
    setTimeout(() => {
      const prob = predictFurnishedProbability({
        barrio,
        estrato,
        area_m2: area,
        precio,
        turismo,
        extranjeros,
        gentrificacion,
        tipoVivienda
      });
      setProbValue(prob);
      setLoadingPred(false);
    }, 600);
  };

  // Format chart data based on active metrics tab
  const getChartData = () => {
    return [
      { name: 'Regresión Logística', Valor: CLASSIFICATION_MODEL_SCORES.logisticRegression[metricTab], color: '#f59e0b' },
      { name: 'Árbol de Decisión', Valor: CLASSIFICATION_MODEL_SCORES.decisionTree[metricTab], color: '#10b981' },
      { name: 'Naive Bayes', Valor: CLASSIFICATION_MODEL_SCORES.naiveBayes[metricTab], color: '#ec4899' },
      { name: 'Random Forest', Valor: CLASSIFICATION_MODEL_SCORES.randomForest[metricTab], color: '#2563eb' }
    ];
  };

  const chartData = getChartData();

  return (
    <div id="classification-view" className="space-y-6 animate-fade-in">
      
      {/* Title */}
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-bold text-slate-800">Clasificación de Inmuebles Amoblados</h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        
        {/* Classifier comparisons bar chart and table */}
        <div className="xl:col-span-3 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-5">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Comparativa de Clasificadores</h3>
            <div className="flex bg-slate-100 p-1 rounded-lg text-[11px] font-bold border border-slate-200">
              {(['accuracy', 'precision', 'recall', 'f1'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMetricTab(m)}
                  className={`px-2.5 py-1 rounded transition uppercase cursor-pointer ${
                    metricTab === m ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Bar chart */}
          <div className="h-60 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#cbd5e1" />
                <YAxis domain={[0, 1]} tick={{ fontSize: 10 }} stroke="#cbd5e1" />
                <Tooltip 
                  formatter={(val: number) => [`${(val * 100).toFixed(1)}%`, metricTab.toUpperCase()]}
                  contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                />
                <Bar dataKey="Valor" fill="#2563eb" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table comparison */}
          <div className="border border-slate-150 rounded-lg overflow-hidden mt-4">
            <table className="w-full text-[11px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-150 font-mono">
                  <th className="p-2.5">Algoritmo</th>
                  <th className="p-2.5 text-center">Accuracy</th>
                  <th className="p-2.5 text-center">Precision</th>
                  <th className="p-2.5 text-center">Recall</th>
                  <th className="p-2.5 text-center">F1 Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                <tr className="hover:bg-slate-50">
                  <td className="p-2.5 text-amber-600">Regresión Logística</td>
                  <td className="p-2.5 text-center font-mono">{(CLASSIFICATION_MODEL_SCORES.logisticRegression.accuracy * 100).toFixed(0)}%</td>
                  <td className="p-2.5 text-center font-mono">{(CLASSIFICATION_MODEL_SCORES.logisticRegression.precision * 100).toFixed(0)}%</td>
                  <td className="p-2.5 text-center font-mono">{(CLASSIFICATION_MODEL_SCORES.logisticRegression.recall * 100).toFixed(0)}%</td>
                  <td className="p-2.5 text-center font-mono">{(CLASSIFICATION_MODEL_SCORES.logisticRegression.f1 * 100).toFixed(0)}%</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-2.5 text-emerald-600">Árbol de Decisión</td>
                  <td className="p-2.5 text-center font-mono">{(CLASSIFICATION_MODEL_SCORES.decisionTree.accuracy * 100).toFixed(0)}%</td>
                  <td className="p-2.5 text-center font-mono">{(CLASSIFICATION_MODEL_SCORES.decisionTree.precision * 100).toFixed(0)}%</td>
                  <td className="p-2.5 text-center font-mono">{(CLASSIFICATION_MODEL_SCORES.decisionTree.recall * 100).toFixed(0)}%</td>
                  <td className="p-2.5 text-center font-mono">{(CLASSIFICATION_MODEL_SCORES.decisionTree.f1 * 100).toFixed(0)}%</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-2.5 text-rose-600">Naive Bayes</td>
                  <td className="p-2.5 text-center font-mono">{(CLASSIFICATION_MODEL_SCORES.naiveBayes.accuracy * 100).toFixed(0)}%</td>
                  <td className="p-2.5 text-center font-mono">{(CLASSIFICATION_MODEL_SCORES.naiveBayes.precision * 100).toFixed(0)}%</td>
                  <td className="p-2.5 text-center font-mono">{(CLASSIFICATION_MODEL_SCORES.naiveBayes.recall * 100).toFixed(0)}%</td>
                  <td className="p-2.5 text-center font-mono">{(CLASSIFICATION_MODEL_SCORES.naiveBayes.f1 * 100).toFixed(0)}%</td>
                </tr>
                <tr className="bg-blue-50/20 hover:bg-blue-50/40">
                  <td className="p-2.5 text-blue-600 font-bold">Random Forest Class.</td>
                  <td className="p-2.5 text-center font-bold font-mono">{(CLASSIFICATION_MODEL_SCORES.randomForest.accuracy * 100).toFixed(0)}%</td>
                  <td className="p-2.5 text-center font-bold font-mono">{(CLASSIFICATION_MODEL_SCORES.randomForest.precision * 100).toFixed(0)}%</td>
                  <td className="p-2.5 text-center font-bold font-mono">{(CLASSIFICATION_MODEL_SCORES.randomForest.recall * 100).toFixed(0)}%</td>
                  <td className="p-2.5 text-center font-bold font-mono">{(CLASSIFICATION_MODEL_SCORES.randomForest.f1 * 100).toFixed(0)}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Furnished prediction form + probability gauge output */}
        <div className="xl:col-span-2 bg-[#0F172A] text-gray-200 rounded-xl p-5 shadow-sm space-y-4 border border-slate-700/60">
          <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest border-b border-slate-700/60 pb-2 mb-2">Predecir Probabilidad de Amoblado</h3>
          
          <div className="space-y-3.5">
            {/* Barrio selecting */}
            <div className="flex flex-col gap-1 text-[11px]">
              <label className="font-bold text-slate-300">Barrio</label>
              <select
                value={barrio}
                onChange={(e) => handleBarrioChange(e.target.value)}
                className="w-full bg-[#071224] border border-slate-700/60 py-1.5 px-2.5 rounded text-xs text-white outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {Object.keys(BARRIO_PROFILES).map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Price numeric selection & housing type */}
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-300">Canon Mensual (COP)</label>
                <input
                  type="number"
                  step={100000}
                  value={precio}
                  onChange={(e) => setPrecio(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#071224] border border-slate-700/60 py-1.5 px-2.5 rounded text-xs text-white outline-none font-mono font-bold focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-300">Tipo de Inmueble</label>
                <select
                  value={tipoVivienda}
                  onChange={(e) => setTipoVivienda(e.target.value)}
                  className="w-full bg-[#071224] border border-slate-700/60 py-1.5 px-2.5 rounded text-xs text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Apartamento">Apartamento</option>
                  <option value="Casa">Casa</option>
                  <option value="Apartaestudio">Apartaestudio</option>
                </select>
              </div>
            </div>

            {/* Area and stratum */}
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-300">Área (m²): <span className="text-blue-400">{area} m²</span></label>
                <input
                  type="range"
                  min={15}
                  max={250}
                  value={area}
                  onChange={(e) => setArea(parseInt(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer h-1 rounded text-blue-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-300">Estrato: <span className="text-blue-400">{estrato}</span></label>
                <input
                  type="range"
                  min={1}
                  max={6}
                  value={estrato}
                  onChange={(e) => setEstrato(parseInt(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer h-1 rounded text-blue-500"
                />
              </div>
            </div>

            {/* Tourists and gentrification */}
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-300">Zonas Turísticas: <span className="text-blue-400">{turismo}/100</span></label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={turismo}
                  onChange={(e) => setTurismo(parseInt(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer h-1 rounded"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-300">Extranjeros: <span className="text-blue-400">{extranjeros}/100</span></label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={extranjeros}
                  onChange={(e) => setExtranjeros(parseInt(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer h-1 rounded"
                />
              </div>
            </div>

            {/* Predict button */}
            <div className="pt-2">
              <button
                onClick={handlePredictProb}
                disabled={loadingPred}
                className="w-full bg-blue-600 text-white py-2.5 rounded shadow font-bold text-xs uppercase tracking-wider cursor-pointer hover:bg-blue-500 transition-colors"
              >
                {loadingPred ? 'Ejecutando Clasificador...' : 'Calcular Probabilidad'}
              </button>
            </div>
          </div>

          {/* Prob result gauge visualization */}
          <div className="border-t border-slate-700/60 pt-4 text-center mt-4">
            {probValue !== null ? (
              <div className="flex flex-col items-center justify-center space-y-2">
                <p className="text-[11px] text-slate-400 block font-bold uppercase tracking-wider">Probabilidad de Estar Amoblado</p>
                
                {/* Visual gauge percentage circle */}
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      className="text-[#071224]"
                      strokeWidth="6"
                      stroke="currentColor"
                      fill="transparent"
                      r="40"
                      cx="48"
                      cy="48"
                    />
                    <circle
                      className="text-blue-500"
                      strokeWidth="6"
                      strokeDasharray={251}
                      strokeDashoffset={251 - (251 * probValue) / 100}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="40"
                      cx="48"
                      cy="48"
                    />
                  </svg>
                  <span className="absolute text-xl font-black text-white font-mono">{probValue}%</span>
                </div>
                
                <p className="text-[11px] text-slate-400 max-w-xs leading-snug">
                  {probValue > 70 
                    ? '★ Alta probabilidad: Altamente óptimo para alquiler vacacional, nómadas o estancias turísticas cortas en plataformas digitales.' 
                    : probValue > 35 
                    ? '◉ Probabilidad mixta: Sector transicional con potencial de amoblado o renta tradicional simultánea.' 
                    : '◯ Baja probabilidad: Mercado tradicional doméstico. Se recomienda mantener desocupado (rentas tradicionales largas).'}
                </p>
              </div>
            ) : (
              <div className="h-28 flex flex-col items-center justify-center text-slate-500">
                <ClipboardList className="w-10 h-10 mb-1 stroke-1 text-blue-500" />
                <p className="text-xs">Formulario listo para calcular.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
