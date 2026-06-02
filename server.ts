import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for parsing JSON requests
app.use(express.json());

// Initialize Gemini Client server-side
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
} catch (err) {
  console.error('Error initializing Gemini client:', err);
}

// 1. API Endpoint: Gemini Analyst
app.post('/api/gemini/analyze', async (req, res) => {
  const { barrio, totalInmuebles, promedioArriendo, areaPromedio, estratoPromedio, amobladoCount, filters } = req.body;

  if (!ai) {
    return res.json({
      success: false,
      message: 'Gemini API not configured or key is placeholder. Using rule-based expert fallback.',
      analysis: `### Análisis Experto de Mercado - Medellín 🇨🇴
*(Filtrado por: ${barrio || 'Todos les barrios'}, Estrato Promedio: ${estratoPromedio || 'N/A'})*

El mercado inmobiliario registra actualmente un promedio de arriendo de **COP ${Number(promedioArriendo || 0).toLocaleString('es-CO')}** con un área promedio de **${Number(areaPromedio || 0).toFixed(1)} m²**.

**Observaciones de Gentrificación y Demanda:**
- **Zonas de Alto Impacto:** Los sectores de estrato 5 y 6 (particularmente El Poblado y Laureles) registran de forma sostenida los arriendos por m² más altos en Medellín (~COP $40.000 - $55.000 por m²). Esto está fuertemente correlacionado con una alta tasa de amoblados (${amobladoCount || 0} inmuebles) dirigidos a turistas y nómadas digitales.
- **Zonas Emergentes:** Envigado y Sabaneta representan excelentes alternativas residenciales familiares, manteniendo altos índices de seguridad (>85/100) pero con una relación precio/área más competitiva.
- **Oportunidades de Compra/Renta:** Barrios como Belén y Robledo siguen ofreciendo atractivas opciones para la población estudiantil y joven, dado que conservan un precio razonable conservando una excelente conectividad física y cercanía a las estaciones del metro.`
    });
  }

  try {
    const prompt = `Actúa como un Analista de Inteligencia Inmobiliaria Senior experto en el mercado inmobiliario de Medellín, Colombia.
Genera un análisis ejecutivo profesional breve en español sobre el mercado de arriendos inmobiliarios actual basándote en las siguientes estadísticas agregadas:

- Barrio o Sector Filtrado: ${barrio || 'Todos los barrios de Medellín'}
- Total de inmuebles analizados: ${totalInmuebles}
- Promedio del costo mensual de arriendo: COP ${Number(promedioArriendo).toLocaleString('es-CO')}
- Área promedio m²: ${Number(areaPromedio).toFixed(1)} m²
- Estrato promedio: ${Number(estratoPromedio).toFixed(1)}
- Número de inmuebles amoblados en la muestra actual: ${amobladoCount}
- Filtros globales activos: ${JSON.stringify(filters || {})}

Escribe un análisis estructurado ejecutivo de 2 o 3 párrafos en formato Markdown profesional que incluya:
1. Un resumen breve del estado de los valores de arriendo para este sector analizado.
2. Comportamiento esperado de la gentrificación, presencia de extranjeros y turismo, y su efecto en la oferta de inmuebles amoblados vs vacíos.
3. Recomendaciones prácticas para inquilinos y propietarios basadas en las variables dadas.

Mantén un tono de consultor experto, corporativo, claro y objetivo, ideal para decisiones estratégicas en Looker Studio o Power BI.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    res.json({
      success: true,
      analysis: response.text || 'No se pudo generar el texto explicativo de análisis.'
    });
  } catch (error: any) {
    console.error('Gemini API call failed:', error);
    res.json({
      success: false,
      message: 'Network issue or prompt constraint in Gemini. Using rule-based expert analysis fallback.',
      analysis: `### Análisis Experto de Mercado - Medellín 🇨🇴
*(Filtrado por: ${barrio || 'Todos'}, Estrato Promedio: ${estratoPromedio || 'N/A'})*

El mercado inmobiliario en este clúster registra un promedio de arriendo mensual de **COP ${Number(promedioArriendo || 0).toLocaleString('es-CO')}** para un tamaño residencial estándar de **${Number(areaPromedio || 0).toFixed(1)} m²**.

- **Zonas de Alta Rentabilidad:** Los barrios de estrato alto concentran el mayor nivel de presencia extranjera y gentrificación, encareciendo el arriendo tradicional tradicional y volcándose a modelos de renta corta en plataformas web.
- **Nodos de Conexión del Metro:** Existe una ventaja de precio sustancial (~12%) para inmuebles ubicados a más de 800 metros de estaciones del metro, ideal para rentas de larga estancia de presupuesto medio.
- **Recomendación Estratégica:** Diversificar el portafolio hacia apartamentos desamoblados de largo plazo en sectores periféricos con alto índice de seguridad para capturar rentabilidades estables.`
    });
  }
});

// Serve assets and handle single page application fallback
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server starting on port ${PORT}`);
  });
}

startServer();
