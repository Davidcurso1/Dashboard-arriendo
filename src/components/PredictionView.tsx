import { useState } from 'react';
import { BrainCircuit, Play, TrendingUp, HelpCircle, Coins } from 'lucide-react';
import { predictRentWithRandomForest, formatCOP, BARRIO_PROFILES } from '../utils/mlEngine';

export default function PredictionView() {
  const [barrio, setBarrio] = useState('El Poblado');
  const [estrato, setEstrato] = useState(5);
  const [area, setArea] = useState(85);
  const [habitaciones, setHabitaciones] = useState(3);
  const [banos, setBanos] = useState(2);
  const [antiguedad, setAntiguedad] = useState(8);
  const [distanciaMetro, setDistanciaMetro] = useState(450);
  const [turismo, setTurismo] = useState(70);
  const [seguridad, setSeguridad] = useState(80);
  const [demanda, setDemanda] = useState(85);
  const [extranjeros, setExtranjeros] = useState(75);
  const [gentrificacion, setGentrificacion] = useState(80);
  const [tipoVivienda, setTipoVivienda] = useState('Apartamento');

  const [prediction, setPrediction] = useState<{
    price: number;
    lowerLimit: number;
    upperLimit: number;
    segment: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);

  // Sync index values quickly when changing barrio
  const handleBarrioChange = (barrioName: string) => {
    setBarrio(barrioName);
    const profile = BARRIO_PROFILES[barrioName];
    if (profile) {
      setEstrato(profile.estrato);
      setSeguridad(profile.seguridad);
      setDemanda(profile.demanda);
      setExtranjeros(profile.extranjeros);
      setGentrificacion(profile.gentrificacion);
      setTurismo(profile.turismo);
    }
  };

  const handlePredict = () => {
    setLoading(true);
    // Simulate real delay of Forest calculations Trees
    setTimeout(() => {
      const pred = predictRentWithRandomForest({
        barrio,
        estrato,
        area_m2: area,
        habitaciones,
        banos,
        antiguedad,
        distanciaMetro,
        turismo,
        seguridad,
        demanda,
        extranjeros,
        gentrificacion,
        tipoVivienda
      });
      setPrediction(pred);
      setLoading(false);
    }, 800);
  };

  return (
    <div id="prediction-view" className="space-y-6 animate-fade-in">
      
      {/* Title */}
      <div className="flex items-center gap-2 mb-4">
        <BrainCircuit className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-bold text-slate-800">Estimación de Arriendos - Random Forest Regressor</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Input variables Form */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">Variables del Inmueble y Ubicación</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Barrio Select */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500">Barrio de Ubicación</label>
              <select
                value={barrio}
                onChange={(e) => handleBarrioChange(e.target.value)}
                className="bg-slate-50 border border-slate-200 py-2 px-3 rounded-lg text-xs md:text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {Object.keys(BARRIO_PROFILES).map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Tipo Vivienda Select */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500">Tipo de Vivienda</label>
              <select
                value={tipoVivienda}
                onChange={(e) => setTipoVivienda(e.target.value)}
                className="bg-slate-50 border border-slate-200 py-2 px-3 rounded-lg text-xs md:text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Apartamento">Apartamento</option>
                <option value="Casa">Casa</option>
                <option value="Apartaestudio">Apartaestudio</option>
              </select>
            </div>

            {/* Area m2 Input */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-slate-500">Área Construida (m²)</label>
                <span className="font-bold text-blue-600 font-mono">{area} m²</span>
              </div>
              <input
                type="range"
                min={18}
                max={300}
                value={area}
                onChange={(e) => setArea(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none mt-1"
              />
            </div>

            {/* Estrato selection */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500">Estrato Socioeconómico</label>
              <div className="flex gap-1.5 mt-1">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    onClick={() => setEstrato(num)}
                    className={`flex-1 py-1.5 rounded text-xs font-bold border transition cursor-pointer ${
                      estrato === num
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Rooms Selector */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500">Habitaciones</label>
              <div className="flex gap-1.5 mt-1">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    onClick={() => setHabitaciones(num)}
                    className={`flex-1 py-1.5 rounded text-xs font-bold border transition cursor-pointer ${
                      habitaciones === num
                        ? 'bg-sky-650 border-sky-655 text-white shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {num} {num === 5 ? '+' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Bathrooms Selector */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500">Baños</label>
              <div className="flex gap-1.5 mt-1">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => setBanos(num)}
                    className={`flex-1 py-1.5 rounded text-xs font-bold border transition cursor-pointer ${
                      banos === num
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {num} {num === 4 ? '+' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Antiguedad m2 Slider */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-slate-500">Antigüedad del Inmueble</label>
                <span className="font-mono font-bold text-slate-700">{antiguedad === 0 ? 'A estrenar (0 años)' : `${antiguedad} años`}</span>
              </div>
              <input
                type="range"
                min={0}
                max={30}
                value={antiguedad}
                onChange={(e) => setAntiguedad(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none mt-1"
              />
            </div>

            {/* Distancia Metro Slider */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-slate-500">Distancia al Metro (m)</label>
                <span className="font-mono font-bold text-slate-700">{distanciaMetro} metros</span>
              </div>
              <input
                type="range"
                min={50}
                max={2500}
                step={50}
                value={distanciaMetro}
                onChange={(e) => setDistanciaMetro(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none mt-1"
              />
            </div>
          </div>

          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2 mt-6 mb-3">Indicadores del Barrio</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Seguridad Index */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs">
                <label className="font-semibold text-slate-500">Índice de Seguridad</label>
                <span className="font-mono font-bold text-slate-700">{seguridad}/100</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                value={seguridad}
                onChange={(e) => setSeguridad(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-150 rounded"
              />
            </div>

            {/* Demanda Index */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs">
                <label className="font-semibold text-slate-500">Índice de Demanda Renta</label>
                <span className="font-mono font-bold text-slate-700">{demanda}/100</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                value={demanda}
                onChange={(e) => setDemanda(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-150 rounded"
              />
            </div>

            {/* Presencia extranjeros */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs">
                <label className="font-semibold text-slate-500">Flujo de Extranjeros / Expats</label>
                <span className="font-mono font-bold text-slate-700">{extranjeros}/100</span>
              </div>
              <input
                type="range"
                min={5}
                max={100}
                value={extranjeros}
                onChange={(e) => setExtranjeros(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-150 rounded"
              />
            </div>

            {/* Gentrificación Index */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs">
                <label className="font-semibold text-slate-500">Índice de Gentrificación</label>
                <span className="font-mono font-bold text-slate-700">{gentrificacion}/100</span>
              </div>
              <input
                type="range"
                min={5}
                max={100}
                value={gentrificacion}
                onChange={(e) => setGentrificacion(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-150 rounded"
              />
            </div>

            {/* Cercania turistica */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs">
                <label className="font-semibold text-slate-500">Cercanía Zonas Turísticas</label>
                <span className="font-mono font-bold text-slate-700">{turismo}/100</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={turismo}
                onChange={(e) => setTurismo(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-150 rounded"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handlePredict}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 border border-blue-500 text-white rounded-xl shadow-lg font-bold text-sm tracking-wide cursor-pointer hover:bg-blue-500 disabled:opacity-50 select-none transition-colors"
            >
              <Play className="w-4.5 h-4.5 fill-white" />
              {loading ? 'Calculando Estimación...' : 'Predecir Costo de Arriendo'}
            </button>
          </div>
        </div>

        {/* Output prediction display side pane */}
        <div className="bg-[#0F172A] text-white rounded-xl p-6 shadow-md border border-slate-755 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">Pronóstico Estimado de Renta</h3>
            
            {loading ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                <div className="w-12 h-12 border-4 border-blue-400/20 border-t-blue-500 rounded-full animate-spin mb-4" />
                <p className="text-xs font-semibold animate-pulse">Consultando Bosque de Decisiones...</p>
              </div>
            ) : prediction ? (
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Valor Estimado Sugerido</p>
                  <p className="text-2xl md:text-3xl font-black text-blue-400 font-mono mt-0.5">{formatCOP(prediction.price)}</p>
                  <p className="text-[11px] text-slate-400 italic mt-1 font-mono">Mensuales (COP)</p>
                </div>

                <div className="border-t border-slate-700/60 pt-4 space-y-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Intervalo de Confianza ML (90%)</span>
                    <div className="flex justify-between text-xs font-mono font-bold text-blue-400 mt-1">
                      <span>{formatCOP(prediction.lowerLimit)}</span>
                      <span className="text-slate-400">-</span>
                      <span>{formatCOP(prediction.upperLimit)}</span>
                    </div>
                  </div>

                  <div className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-lg flex items-start gap-2.5">
                    <TrendingUp className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400">Clúster de Mercado Estimado</span>
                      <p className="text-xs font-black text-blue-400">{prediction.segment}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-700/60 pt-4 text-xs text-slate-400 leading-snug">
                  <span className="font-bold text-slate-300">Notas del Modelo:</span>
                  <p className="mt-1">Nivel y desviación calculada bajo un algoritmo de Random Forest Regressor de 500 árboles de decisión, parametrizado con MAE relativo local.</p>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400">
                <Coins className="w-12 h-12 mb-2 stroke-1 text-blue-400" />
                <p className="text-sm font-semibold">Calculador Listo</p>
                <p className="text-[10px] text-slate-500 max-w-xs mt-1">Ingresa los valores a la izquierda y presiona el botón para consultar el avalúo inteligente de Medellín.</p>
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-3 flex gap-1 items-start mt-6 leading-tight">
            <HelpCircle className="w-4 h-4 shrink-0 mt-0.2" />
            <span>Los intervalos de confianza responden al MAE estimado del modelo entrenado de Medellín.</span>
          </div>
        </div>

      </div>
    </div>
  );
}
