import { GitCompare, Trophy, TrendingUp, ShieldAlert } from 'lucide-react';
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
import { REGRESSION_MODEL_SCORES, formatCOP } from '../utils/mlEngine';

export default function ComparisonView() {
  const dataR2 = [
    { name: 'Regresión Lineal', Valor: REGRESSION_MODEL_SCORES.linearRegression.r2, color: '#f59e0b' },
    { name: 'Árbol de Decisión', Valor: REGRESSION_MODEL_SCORES.decisionTree.r2, color: '#3b82f6' },
    { name: 'Random Forest Regressor', Valor: REGRESSION_MODEL_SCORES.randomForest.r2, color: '#2563eb' }
  ];

  const dataMAE = [
    { name: 'Regresión Lineal', Error: REGRESSION_MODEL_SCORES.linearRegression.mae, color: '#ef4444' },
    { name: 'Árbol de Decisión', Error: REGRESSION_MODEL_SCORES.decisionTree.mae, color: '#f59e0b' },
    { name: 'Random Forest Regressor', Error: REGRESSION_MODEL_SCORES.randomForest.mae, color: '#10b981' }
  ];

  return (
    <div id="comparison-view" className="space-y-6 animate-fade-in">
      
      {/* Title */}
      <div className="flex items-center gap-2 mb-4">
        <GitCompare className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-bold text-slate-800">Comparativa Global de Modelos de Regresión</h2>
      </div>

      {/* R2 and MAE Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* R2 Chart (Higher is better) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Coeficiente de Determinación (R²)</h3>
              <p className="text-xs text-slate-400 mt-1">Capacidad explicativa de las variaciones del mercado (Óptimo cercano a 1.0)</p>
            </div>
            <Trophy className="w-5 h-5 text-blue-500" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataR2} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#cbd5e1" />
                <YAxis domain={[0, 1]} tick={{ fontSize: 10 }} stroke="#cbd5e1" />
                <Tooltip 
                  formatter={(val: number) => [`${(val * 100).toFixed(1)}%`, 'Explicabilidad (R²)']}
                  contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                />
                <Bar dataKey="Valor" fill="#2563eb" radius={[4, 4, 0, 0]}>
                  {dataR2.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MAE Chart (Lower is better) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Error Absoluto Medio (MAE)</h3>
              <p className="text-xs text-slate-400 mt-1">Margen promedio de error absoluto de las predicciones (COP)</p>
            </div>
            <ShieldAlert className="w-5 h-5 text-rose-500" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataMAE} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#cbd5e1" />
                <YAxis tick={{ fontSize: 10 }} stroke="#cbd5e1" />
                <Tooltip 
                  formatter={(val: number) => [formatCOP(val), 'Margen Error Absoluto']}
                  contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                />
                <Bar dataKey="Error" fill="#10b981" radius={[4, 4, 0, 0]}>
                  {dataMAE.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Model Interpretations / Explanations section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-amber-500">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <h4 className="text-sm font-bold text-slate-800">Regresión Lineal</h4>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Asume una relación lineal estricta entre las variables físicas (Área, Habitaciones) y el precio final de arriendo. Posee un R² menor ({REGRESSION_MODEL_SCORES.linearRegression.r2 * 100}%) dado que el mercado de Medellín tiene dependencias altamente no lineales (por ejemplo, el impacto explosivo de la gentrificación).
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-blue-500">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <h4 className="text-sm font-bold text-slate-800">Árbol de Decisión</h4>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Divide la muestra de manera jerárquica mediante umbrales (ej. ¿Estrato {'>'} 4?, ¿Área {'>'} 80m²?). Es excelente capturando relaciones complejas pero tiene tendencia al sobreajuste (overfitting). Alcanza un MAE de {formatCOP(REGRESSION_MODEL_SCORES.decisionTree.mae)}.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm bg-gradient-to-tr from-blue-50/20 to-white">
          <div className="flex items-center gap-2 text-blue-600">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <h4 className="text-sm font-bold text-blue-700">Random Forest Regressor</h4>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Consolida las ventajas de múltiples árboles de decisión mediante ensamblaje y aleatorización (Bagging). Reduce drásticamente el error promedio a sólo **{formatCOP(REGRESSION_MODEL_SCORES.randomForest.mae)}** por predicción, posicionándolo como el modelo principal de nuestra plataforma empresarial Medellín Analytics.
          </p>
        </div>
      </div>
    </div>
  );
}
