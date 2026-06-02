import React, { useState, useRef } from 'react';
import { 
  Settings, 
  Lock, 
  Unlock, 
  Upload, 
  RefreshCcw, 
  Download, 
  Cpu, 
  Database, 
  Terminal, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { formatCOP } from '../utils/mlEngine';

export default function AdminView() {
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loginError, setLoginError] = useState('');

  // ML Training States
  const [trainingState, setTrainingState] = useState<'idle' | 'running' | 'completed'>('idle');
  const [trainLogs, setTrainLogs] = useState<string[]>([]);
  const [epochs, setEpochs] = useState(0);

  // CSV Drag and Drop states
  const [dragActive, setDragActive] = useState(false);
  const [uploadLog, setUploadLog] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Monitor stats
  const [cpuUsage, setCpuUsage] = useState(34);
  const [memUsage, setMemUsage] = useState(65);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '1234') {
      setIsAuthorized(true);
      setLoginError('');
      // start slow system monitor intervals
      const interval = setInterval(() => {
        setCpuUsage(Math.round(20 + Math.random() * 30));
        setMemUsage(Math.round(55 + Math.random() * 12));
      }, 3000);
    } else {
      setLoginError('Código PIN inválido (Sugerencia: "1234")');
    }
  };

  // Drag handles
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = (file: File) => {
    setUploadLog(`Subiendo ${file.name}...`);
    setTimeout(() => {
      setUploadLog(`✓ Éxito: Se importaron 48 nuevos registros desde ${file.name} al dataset inmobiliario de Medellín.`);
    }, 1200);
  };

  // Initiate ML training simulation with live outputs
  const handleRetrain = () => {
    setTrainingState('running');
    setTrainLogs([]);
    let progress = 0;
    const logs = [
      'Cargando muestra del mercado inmobiliario (N=140)...',
      'Configurando regresores del Bosque de Decisión y matrices de K-Means...',
      'Entrenando Regresor Random Forest (n_estimators=500)...',
      'Calculando valores de Shapley (SHAP) para interpretabilidad...',
      'Entrenando K-Means (K=3) para segmentaciones socioeconómicas...',
      'Configurando Clasificador de Amoblados (Random Forest Classifier)...',
      'Modelo reentrenado con éxito en 0.85s.',
      'R² corregido: 0.914 | MAE final: COP $154.500 | Accuracy: 91%'
    ];

    const interval = setInterval(() => {
      if (progress < logs.length) {
        setTrainLogs((prev) => [...prev, `[system-ml] ${logs[progress]}`]);
        setEpochs((prev) => prev + 1);
        progress++;
      } else {
        clearInterval(interval);
        setTrainingState('completed');
      }
    }, 450);
  };

  // Helper downloads simulated compiled .pkl files directly
  const triggerPKLDownload = (filename: string) => {
    const mockBinary = new Uint8Array([80, 107, 108, 0, 1, 2, 3, 4, 32, 64]); // fake compiled metrics
    const blob = new Blob([mockBinary], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Locked Login overlay
  if (!isAuthorized) {
    return (
      <div id="admin-login-lock" className="h-[520px] flex items-center justify-center animate-fade-in text-slate-800">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-250 p-8 shadow-lg text-center space-y-6">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center border border-blue-150">
              <Lock className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-black mt-2 text-slate-800">Terminal de Administración Protegido</h3>
            <p className="text-xs text-slate-450">Ingresa la contraseña maestra para habilitar la carga de datos y reentrenamiento.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[11px] font-bold text-slate-400 uppercase">PIN de Acceso Administrador</label>
              <input
                type="password"
                placeholder="Ingresar PIN (Suj. 1234)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-250 py-2.5 px-3 rounded-xl text-center font-bold tracking-widest text-[#0c1a30] outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {loginError && (
              <div className="p-2.5 bg-rose-50 border border-rose-150 rounded text-rose-600 text-xs font-semibold flex items-center gap-1.5 justify-center">
                <AlertCircle className="w-4 h-4" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow hover:from-slate-850 hover:to-blue-900 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              Verificar Conexión
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Authentic Admin view layout
  return (
    <div id="admin-view" className="space-y-6 animate-fade-in text-slate-800">
      
      {/* Header title */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-slate-800">Consola Central de Administración DB</h2>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-250 text-xs font-semibold">
          <Unlock className="w-3.5 h-3.5" />
          <span>Acceso Autorizado</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Dataset loader & ML Trainer logs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Cargar nuevos CSV (Drag-and-Drop) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Database className="w-4 h-4" />
              Cargar nuevos registros (CSV / XLS)
            </h3>
            
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center cursor-pointer transition ${
                dragActive ? 'border-blue-500 bg-blue-50/20' : 'border-slate-300 hover:border-blue-400 bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xls,.xlsx"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
              />
              <Upload className="w-10 h-10 text-slate-400 mb-2 stroke-1" />
              <p className="text-xs font-bold text-slate-600">Suelte el archivo CSV aquí o haga clic para escanear</p>
              <p className="text-[10px] text-slate-400 mt-1">Estructura esperada: barrio, estrato, area_m2, canon, amoblado, lat, lng</p>
            </div>

            {uploadLog && (
              <div className="p-3 bg-slate-100 border border-slate-200 rounded text-xs font-mono text-slate-700 leading-snug">
                {uploadLog}
              </div>
            )}
          </div>

          {/* Model Re-training dashboard */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <RefreshCcw className="w-4 h-4" />
                Reentrenar Bosque e Indicadores ML
              </h3>
              <button
                onClick={handleRetrain}
                disabled={trainingState === 'running'}
                className="px-4 py-1.5 bg-blue-600 text-white font-bold text-xs uppercase tracking-wider rounded cursor-pointer hover:bg-blue-700 disabled:opacity-50 transition"
              >
                Ejecutar Reentrenamiento
              </button>
            </div>

            {/* Simulated training terminal log screen */}
            <div className="bg-[#050c18] text-[#10b981] font-mono text-xs rounded-xl p-4 min-h-48 border border-slate-800 space-y-1 relative max-h-[220px] overflow-y-auto custom-scrollbar">
              <div className="absolute top-2 right-3 text-[10px] text-slate-500 flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                <span>sh-session</span>
              </div>
              
              {trainLogs.length > 0 ? (
                trainLogs.map((log, idx) => (
                  <p key={idx} className="leading-snug">{log}</p>
                ))
              ) : (
                <div className="h-32 flex flex-col items-center justify-center text-slate-500">
                  <p>Consola lista para compilaciones.</p>
                  <p className="text-[10px] text-slate-650 mt-1">Presiona "Ejecutar" para actualizar modelos con los nuevos datos cargados.</p>
                </div>
              )}

              {trainingState === 'running' && (
                <p className="text-yellow-400 animate-pulse mt-2">Compilando e integrando pesos...</p>
              )}
            </div>
          </div>

        </div>

        {/* Model Export / System performance monitors */}
        <div className="space-y-6">
          
          {/* Trained models .pkl serialization downloads */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Download className="w-4 h-4" />
              Descargar Pesos (.pkl)
            </h3>
            
            <p className="text-[11px] text-slate-400 leading-snug">Descargue los serializados comprimidos de Python (`.pkl`) listos para despliegue en entornos productivos locales o Django/FastAPI:</p>
            
            <div className="space-y-2.5">
              <button
                onClick={() => triggerPKLDownload('random_forest_regressor.pkl')}
                className="w-full flex items-center justify-between text-xs py-2 px-3 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-350 transition text-left cursor-pointer"
              >
                <span className="font-semibold text-slate-800">random_forest_regressor.pkl</span>
                <span className="text-[10px] text-blue-600 font-bold uppercase font-mono tracking-wider flex items-center gap-1">
                  <Download className="w-3.5 h-3.5" /> Descargar
                </span>
              </button>

              <button
                onClick={() => triggerPKLDownload('furnished_classifier.pkl')}
                className="w-full flex items-center justify-between text-xs py-2 px-3 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-350 transition text-left cursor-pointer"
              >
                <span className="font-semibold text-slate-800">furnished_classifier.pkl</span>
                <span className="text-[10px] text-blue-600 font-bold uppercase font-mono tracking-wider flex items-center gap-1">
                  <Download className="w-3.5 h-3.5" /> Descargar
                </span>
              </button>

              <button
                onClick={() => triggerPKLDownload('kmeans_segmenter.pkl')}
                className="w-full flex items-center justify-between text-xs py-2 px-3 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-350 transition text-left cursor-pointer"
              >
                <span className="font-semibold text-slate-800">kmeans_segmentation.pkl</span>
                <span className="text-[10px] text-blue-600 font-bold uppercase font-mono tracking-wider flex items-center gap-1">
                  <Download className="w-3.5 h-3.5" /> Descargar
                </span>
              </button>
            </div>
          </div>

          {/* System Performance Vitals and load monitors */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Cpu className="w-4 h-4" />
              Métricas del Servidor
            </h3>

            <div className="space-y-3.5">
              {/* cpu usage */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-600">Carga vCPU ML</span>
                  <span className="font-mono font-bold text-slate-700">{cpuUsage}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded overflow-hidden">
                  <div className="bg-blue-600 h-full rounded transition-all duration-500" style={{ width: `${cpuUsage}%` }} />
                </div>
              </div>

              {/* ram usage */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-600">Memoria Buffer RAM</span>
                  <span className="font-mono font-bold text-slate-700">{memUsage}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded transition-all duration-500" style={{ width: `${memUsage}%` }} />
                </div>
              </div>

              {/* latency status */}
              <div className="flex justify-between text-xs border-t border-slate-105 pt-3.5 font-semibold text-slate-500">
                <span>Latencia de Inferencia average:</span>
                <span className="text-emerald-600 font-mono">1.2ms</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
