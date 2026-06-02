import { useState } from 'react';
import { FileSpreadsheet, Download, FileText, Search, TableIcon } from 'lucide-react';
import { Property } from '../types';
import { formatCOP } from '../utils/mlEngine';

interface ReportsViewProps {
  properties: Property[];
}

export default function ReportsView({ properties }: ReportsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Local searching on properties
  const filtered = properties.filter((p) => {
    return p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
           p.barrio.toLowerCase().includes(searchTerm.toLowerCase()) ||
           p.tipo_vivienda.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Action: Export directly to client CSV
  const handleExportCSV = () => {
    if (properties.length === 0) return;

    const headers = [
      'id', 'barrio', 'estrato', 'area_m2', 'habitaciones', 'banos',
      'antiguedad_inmueble', 'distancia_metro_m', 'cercania_zonas_turisticas',
      'indice_seguridad', 'indice_demanda_inmobiliaria', 'nivel_presencia_extranjeros',
      'indice_gentrificacion', 'precio_mensual_arriendo', 'tipo_vivienda', 'amoblado', 'lat', 'lng'
    ];

    const rows = properties.map((p) => [
      p.id, p.barrio, p.estrato, p.area_m2, p.habitaciones, p.banos,
      p.antiguedad_inmueble, p.distancia_metro_m, p.cercania_zonas_turisticas,
      p.indice_seguridad, p.indice_demanda_inmobiliaria, p.nivel_presencia_extranjeros,
      p.indice_gentrificacion, p.precio_mensual_arriendo, p.tipo_vivienda, p.amoblado, p.lat, p.lng
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `medellin_rentals_dataset_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Action: Export mock Excel
  const handleExportExcel = () => {
    // Generate simple comma-separated content in .xls format
    const excelContent = `<table><tr><th>ID</th><th>Barrio</th><th>Estrato</th><th>Area m²</th><th>Habitaciones</th><th>Baños</th><th>Arriendo Mensual</th><th>Tipo Vivienda</th><th>Amoblado</th></tr>${
      properties.map(p => `<tr><td>${p.id}</td><td>${p.barrio}</td><td>${p.estrato}</td><td>${p.area_m2}</td><td>${p.habitaciones}</td><td>${p.banos}</td><td>${p.precio_mensual_arriendo}</td><td>${p.tipo_vivienda}</td><td>${p.amoblado ? 'SI' : 'NO'}</td></tr>`).join('')
    }</table>`;

    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reporte_inmobiliario_medellin_${Date.now()}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Action: Print layout PDF equivalent
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div id="reports-view" className="space-y-6 animate-fade-in print:bg-white print:p-8">
      
      {/* Title */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4 print:hidden">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-slate-800">Generación de Reportes y Descargas</h2>
        </div>

        {/* Action Triggers */}
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 border border-slate-250 rounded-lg text-xs font-semibold text-slate-705 hover:bg-slate-200 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            Descargar CSV
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 border border-emerald-250 rounded-lg text-xs font-semibold text-emerald-705 hover:bg-emerald-100/65 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            Descargar Excel
          </button>
          <button
            onClick={handlePrintReport}
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 rounded-lg text-xs font-bold text-white hover:bg-blue-500 shadow-sm shadow-blue-600/10 transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            Imprimir Reporte (PDF)
          </button>
        </div>
      </div>

      {/* Main Table view */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <TableIcon className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Registros de Propiedades de Arriendo</h3>
          </div>

          {/* Local search bar */}
          <div className="relative w-80">
            <input
              type="text"
              placeholder="Buscar por ID, Barrio o Tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 border border-slate-250 bg-slate-50 rounded-lg text-xs text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.2" />
          </div>
        </div>

        {/* AgGrid equivalent Table frame */}
        <div className="overflow-x-auto border border-slate-150 rounded-lg">
          <table className="w-full text-[11px] text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-150 font-mono tracking-wider">
                <th className="p-3">ID Inmueble</th>
                <th className="p-3">Barrio</th>
                <th className="p-3 text-center">Estrato</th>
                <th className="p-3 text-center">Área m²</th>
                <th className="p-3 text-center">Hab</th>
                <th className="p-3 text-center">Baños</th>
                <th className="p-3 text-center">Antigüedad</th>
                <th className="p-3 text-center">Metro (m)</th>
                <th className="p-3 text-center">Amoblado</th>
                <th className="p-3 text-right">Precio Mensual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {filtered.length > 0 ? filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3 font-mono font-bold text-blue-600">{p.id}</td>
                  <td className="p-3 text-slate-805">{p.barrio}</td>
                  <td className="p-3 text-center font-mono">{p.estrato}</td>
                  <td className="p-2 text-center font-mono">{p.area_m2}</td>
                  <td className="p-3 text-center font-mono">{p.habitaciones}</td>
                  <td className="p-3 text-center font-mono">{p.banos}</td>
                  <td className="p-3 text-center font-mono">{p.antiguedad_inmueble}</td>
                  <td className="p-3 text-center font-mono">{p.distancia_metro_m}</td>
                  <td className="p-3 text-center font-mono">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      p.amoblado ? 'bg-blue-50 text-blue-600 border border-blue-250' : 'bg-slate-50 text-slate-400'
                    }`}>
                      {p.amoblado ? 'Amoblado' : 'Tradicional'}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono text-slate-900 font-bold">{formatCOP(p.precio_mensual_arriendo)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-405 italic">
                    No se encontraron coincidencias de propiedades en el dataset analizado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Total stats count footer */}
        <div className="flex justify-between items-center text-[11px] text-slate-400 font-semibold px-1">
          <span>Mostrando {filtered.length} de {properties.length} registros analizados</span>
          <span className="print:hidden">Impresiones configuradas en tamaño de página estándar carta (Letter)</span>
        </div>
      </div>
    </div>
  );
}
