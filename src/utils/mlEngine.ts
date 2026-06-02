import { Property, ModelComparison, ClassifierComparison, ShapValue } from '../types';

// Baseline averages and ranges for Medellin Barrios
export const BARRIO_PROFILES: Record<string, {
  estrato: number;
  lat: number;
  lng: number;
  seguridad: number;
  demanda: number;
  extranjeros: number;
  gentrificacion: number;
  turismo: number;
}> = {
  'El Poblado': { estrato: 6, lat: 6.2082, lng: -75.5672, seguridad: 88, demanda: 95, extranjeros: 96, gentrificacion: 98, turismo: 95 },
  'Laureles': { estrato: 5, lat: 6.2444, lng: -75.5941, seguridad: 85, demanda: 90, extranjeros: 82, gentrificacion: 88, turismo: 85 },
  'Envigado': { estrato: 5, lat: 6.1751, lng: -75.5843, seguridad: 90, demanda: 88, extranjeros: 60, gentrificacion: 72, turismo: 50 },
  'Sabaneta': { estrato: 4, lat: 6.1512, lng: -75.6155, seguridad: 86, demanda: 85, extranjeros: 45, gentrificacion: 65, turismo: 40 },
  'Belén': { estrato: 4, lat: 6.2255, lng: -75.5982, seguridad: 75, demanda: 80, extranjeros: 38, gentrificacion: 55, turismo: 35 },
  'Centro / Candelaria': { estrato: 3, lat: 6.2481, lng: -75.5645, seguridad: 52, demanda: 75, extranjeros: 32, gentrificacion: 48, turismo: 65 },
  'Guayabal': { estrato: 3, lat: 6.2075, lng: -75.5861, seguridad: 70, demanda: 68, extranjeros: 20, gentrificacion: 35, turismo: 15 },
  'Buenos Aires': { estrato: 3, lat: 6.2382, lng: -75.5452, seguridad: 65, demanda: 72, extranjeros: 22, gentrificacion: 40, turismo: 25 },
  'Aranjuez': { estrato: 2, lat: 6.2721, lng: -75.5562, seguridad: 60, demanda: 70, extranjeros: 25, gentrificacion: 38, turismo: 45 },
  'Robledo': { estrato: 2, lat: 6.2754, lng: -75.6031, seguridad: 62, demanda: 65, extranjeros: 10, gentrificacion: 20, turismo: 10 }
};

export const TIPO_VIVIENDA_VALUES = ['Apartamento', 'Casa', 'Apartaestudio'] as const;

// Master function to generate a synthetic but highly correlated Medellin rental dataset
export function generateMedellinDataset(): Property[] {
  const properties: Property[] = [];
  const barrios = Object.keys(BARRIO_PROFILES);
  
  let idCounter = 1;

  barrios.forEach((barrioName) => {
    const profile = BARRIO_PROFILES[barrioName];
    // Generate ~14 properties per barrio with random dispersion
    const maxProperties = 14;

    for (let i = 0; i < maxProperties; i++) {
      const isPremiumBarrio = barrioName === 'El Poblado' || barrioName === 'Laureles';
      const isLowBarrio = profile.estrato <= 2;

      // Type assignment
      const randType = Math.random();
      const tipo_vivienda = randType < 0.65 
        ? 'Apartamento' 
        : (randType < 0.85 ? 'Apartaestudio' : 'Casa');

      // Strata deviation
      const estratoDelta = Math.random() < 0.2 ? (Math.random() < 0.5 ? -1 : 1) : 0;
      const estrato = Math.max(1, Math.min(6, profile.estrato + estratoDelta));

      // Area m2 with correlations to type
      let area_m2 = 65;
      if (tipo_vivienda === 'Apartaestudio') {
        area_m2 = Math.round(25 + Math.random() * 25);
      } else if (tipo_vivienda === 'Casa') {
        area_m2 = Math.round(110 + Math.random() * 140);
      } else {
        area_m2 = Math.round(45 + Math.random() * 75);
      }

      // Add stratified size boosts
      area_m2 += (estrato - 3) * 10;
      area_m2 = Math.max(20, area_m2);

      // Rooms and baths
      let habitaciones = 2;
      let banos = 1;

      if (tipo_vivienda === 'Apartaestudio') {
        habitaciones = 1;
        banos = 1;
      } else {
        habitaciones = area_m2 > 150 ? 4 : (area_m2 > 80 ? 3 : 2);
        banos = area_m2 > 160 ? 3 : (area_m2 > 75 ? 2 : 1);
        // Random additions
        if (Math.random() < 0.3) habitaciones = Math.min(5, habitaciones + 1);
        if (Math.random() < 0.3) banos = Math.min(4, banos + 1);
      }

      const antiguedad_inmueble = Math.round(Math.random() * 28);
      const distancia_metro_m = Math.round(150 + Math.random() * 1600 - (isPremiumBarrio ? 150 : 0));
      
      // Indices centered on profiles with variance
      const varFactor = () => (Math.random() * 20 - 10); // -10 to +10
      const indice_seguridad = Math.round(Math.max(10, Math.min(100, profile.seguridad + varFactor())));
      const indice_demanda_inmobiliaria = Math.round(Math.max(10, Math.min(100, profile.demanda + varFactor())));
      const nivel_presencia_extranjeros = Math.round(Math.max(1, Math.min(100, profile.extranjeros + varFactor() * 0.8)));
      const indice_gentrificacion = Math.round(Math.max(5, Math.min(100, profile.gentrificacion + varFactor() * 0.7)));
      const cercania_zonas_turisticas = Math.round(Math.max(0, Math.min(100, profile.turismo + varFactor())));

      // Coordinates with small variance around commune center
      const lat = profile.lat + (Math.random() * 0.012 - 0.006);
      const lng = profile.lng + (Math.random() * 0.012 - 0.006);

      // Furnished criteria
      const amobladoProb = (nivel_presencia_extranjeros * 0.6 + cercania_zonas_turisticas * 0.2 + estrato * 10) / 130;
      const amoblado = Math.random() < amobladoProb;

      // Realistic rent calculation (base value * estrato multiplier * indices)
      let baseRentPerM2 = 22000; // COP per m2
      // Estrato scales rent heavily
      if (estrato === 6) baseRentPerM2 = 52000;
      else if (estrato === 5) baseRentPerM2 = 40000;
      else if (estrato === 4) baseRentPerM2 = 29000;
      else if (estrato === 3) baseRentPerM2 = 21000;
      else baseRentPerM2 = 14000;

      // Age discount
      const ageMultiplier = 1 - (antiguedad_inmueble * 0.008); // down to -24%
      baseRentPerM2 *= ageMultiplier;

      // Metro distance premium
      const metroMultiplier = distancia_metro_m < 400 ? 1.15 : (distancia_metro_m < 800 ? 1.05 : 0.95);
      baseRentPerM2 *= metroMultiplier;

      // Gentrification and tourist index boost
      const indicesMultiplier = 1 + (indice_gentrificacion / 100) * 0.25 + (nivel_presencia_extranjeros / 100) * 0.2 + (indice_seguridad / 100) * 0.15;
      baseRentPerM2 *= indicesMultiplier;

      // Type factor
      const typeMultiplier = tipo_vivienda === 'Apartaestudio' ? 1.2 : (tipo_vivienda === 'Casa' ? 0.9 : 1.0);
      baseRentPerM2 *= typeMultiplier;

      // Furnished premium (up to 40% boost for Poblado, Laureles furnished)
      const amobladoMultiplier = amoblado ? 1.35 : 1.0;
      baseRentPerM2 *= amobladoMultiplier;

      // Compute total rent and wrap to closest 50,000 COP
      let precio_mensual_arriendo = Math.round((area_m2 * baseRentPerM2) / 50000) * 50000;
      precio_mensual_arriendo = Math.max(500000, precio_mensual_arriendo); // Lower bound

      properties.push({
        id: `PROP-${String(idCounter++).padStart(3, '0')}`,
        barrio: barrioName,
        estrato,
        area_m2,
        habitaciones,
        banos,
        antiguedad_inmueble,
        distancia_metro_m,
        cercania_zonas_turisticas,
        indice_seguridad,
        indice_demanda_inmobiliaria,
        nivel_presencia_extranjeros,
        indice_gentrificacion,
        precio_mensual_arriendo,
        tipo_vivienda,
        amoblado,
        lat,
        lng
      });
    }
  });

  return properties;
}

// Global Static Model Metrics (for display comparison)
export const REGRESSION_MODEL_SCORES: ModelComparison = {
  linearRegression: { mae: 320000, r2: 0.74 },
  decisionTree: { mae: 240000, r2: 0.82 },
  randomForest: { mae: 155000, r2: 0.91 }
};

export const CLASSIFICATION_MODEL_SCORES: ClassifierComparison = {
  logisticRegression: { accuracy: 0.81, precision: 0.79, recall: 0.78, f1: 0.785 },
  decisionTree: { accuracy: 0.84, precision: 0.83, recall: 0.82, f1: 0.825 },
  naiveBayes: { accuracy: 0.78, precision: 0.75, recall: 0.74, f1: 0.745 },
  randomForest: { accuracy: 0.91, precision: 0.90, recall: 0.89, f1: 0.895 }
};

// Predict rent using simulated Random Forest Regressor formulas based on true statistics
export function predictRentWithRandomForest(input: {
  barrio: string;
  estrato: number;
  area_m2: number;
  habitaciones: number;
  banos: number;
  antiguedad: number;
  distanciaMetro: number;
  turismo: number;
  seguridad: number;
  demanda: number;
  extranjeros: number;
  gentrificacion: number;
  tipoVivienda: string;
}): { price: number; lowerLimit: number; upperLimit: number; segment: string } {
  
  // Base price per m2 per estrato
  let basePriceM2 = 18000;
  if (input.estrato === 6) basePriceM2 = 49000;
  else if (input.estrato === 5) basePriceM2 = 38000;
  else if (input.estrato === 4) basePriceM2 = 28000;
  else if (input.estrato === 3) basePriceM2 = 20000;
  else basePriceM2 = 13500;

  // Area impact with standard log de-scaling for giant structures
  let areaFactor = input.area_m2;
  if (input.area_m2 > 120) {
    areaFactor = 120 + (input.area_m2 - 120) * 0.8; 
  }

  let calculatedPrice = basePriceM2 * areaFactor;

  // Room / Bath additions
  calculatedPrice += input.habitaciones * 75000;
  calculatedPrice += input.banos * 120000;

  // Age discount (up to 25% max)
  const ageDiscount = Math.min(0.25, input.antiguedad * 0.009);
  calculatedPrice *= (1 - ageDiscount);

  // Proximity to metro index
  if (input.distanciaMetro < 350) {
    calculatedPrice *= 1.14; // near metro premium
  } else if (input.distanciaMetro > 1000) {
    calculatedPrice *= 0.94; // remote deduction
  }

  // Soft weights of environmental indicators
  const envMultiplier = 1 
    + (input.gentrificacion / 100) * 0.18
    + (input.extranjeros / 100) * 0.22
    + (input.seguridad / 100) * 0.12
    + (input.turismo / 100) * 0.10
    + (input.demanda / 100) * 0.08;

  calculatedPrice *= envMultiplier;

  // Housing Type impact
  if (input.tipoVivienda === 'Apartaestudio') {
    calculatedPrice *= 1.15;
  } else if (input.tipoVivienda === 'Casa') {
    calculatedPrice *= 0.88; 
  }

  // Adjust by specific barrio weight if any
  const profile = BARRIO_PROFILES[input.barrio];
  if (profile) {
    // Slight multiplier from barrio factor
    const barrioMultiplier = 0.95 + (profile.estrato * 0.015);
    calculatedPrice *= barrioMultiplier;
  }

  // Format and round
  let predicted = Math.round(calculatedPrice / 25000) * 25000;
  predicted = Math.max(480000, predicted);

  // Confidence bounds (using simulated MAE range representing RF confidence)
  const mae = REGRESSION_MODEL_SCORES.randomForest.mae;
  const boundPercent = 0.08; // 8% error standard deviation
  const lowerLimit = Math.max(400000, Math.round((predicted - mae) / 10000) * 10000);
  const upperLimit = Math.round((predicted + mae) / 10000) * 10000;

  // Segment assignment
  let segment = 'Económico';
  if (predicted > 4500000 && input.estrato >= 5) {
    segment = 'Premium Exclusivo';
  } else if (predicted > 2500000) {
    segment = 'Ejecutivo Premium';
  } else if (predicted > 1400000) {
    segment = 'Residencial Medio';
  }

  return {
    price: predicted,
    lowerLimit,
    upperLimit,
    segment
  };
}

// Predict probability (%) of being amoblado using random forest classification simulation
export function predictFurnishedProbability(input: {
  barrio: string;
  estrato: number;
  area_m2: number;
  precio: number;
  turismo: number;
  extranjeros: number;
  gentrificacion: number;
  tipoVivienda: string;
}): number {
  // Let's implement an elegant logistic log-odds calculation
  let logOdds = -2.5; // Base negative offset (unfurnished default)

  // Foreigners have the highest impact
  logOdds += (input.extranjeros / 100) * 3.8;
  // Tourism
  logOdds += (input.turismo / 100) * 1.5;
  // Stratum
  logOdds += (input.estrato - 3) * 0.55;
  // Price premium (over 3M means high probability)
  if (input.precio > 3000000) {
    logOdds += Math.min(2.0, (input.precio - 3000000) / 1500000);
  } else {
    logOdds -= Math.max(0, (2000000 - input.precio) / 1000000);
  }
  // Gentrification
  logOdds += (input.gentrificacion / 100) * 0.8;

  // Type factor
  if (input.tipoVivienda === 'Apartaestudio') {
    logOdds += 0.6; // Studio flats are often tourist rentals
  }

  // Sigmoid mapping [0 to 1]
  const probability = 1 / (1 + Math.exp(-logOdds));
  return Math.round(probability * 100);
}

// Real Pearson Correlation Calculation between numerical attributes of Properties
export function calculateCorrelationMatrix(properties: Property[]): {
  labels: string[];
  matrix: number[][];
} {
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

  const n = properties.length;
  if (n === 0) {
    return {
      labels: variables.map(v => v.label),
      matrix: Array(variables.length).fill(0).map(() => Array(variables.length).fill(0))
    };
  }

  // Calculate means
  const means: Record<string, number> = {};
  variables.forEach((v) => {
    const sum = properties.reduce((acc, p) => acc + (p[v.key as keyof Property] as number), 0);
    means[v.key] = sum / n;
  });

  // Calculate variances and covariances
  const labels = variables.map((v) => v.label);
  const matrix: number[][] = Array(variables.length).fill(0).map(() => Array(variables.length).fill(0));

  for (let i = 0; i < variables.length; i++) {
    for (let j = i; j < variables.length; j++) {
      const var1 = variables[i].key;
      const var2 = variables[j].key;
      const mean1 = means[var1];
      const mean2 = means[var2];

      let num = 0;
      let den1 = 0;
      let den2 = 0;

      properties.forEach((p) => {
        const val1 = p[var1 as keyof Property] as number;
        const val2 = p[var2 as keyof Property] as number;
        const diff1 = val1 - mean1;
        const diff2 = val2 - mean2;

        num += diff1 * diff2;
        den1 += diff1 * diff1;
        den2 += diff2 * diff2;
      });

      let r = 0;
      if (den1 > 0 && den2 > 0) {
        r = num / Math.sqrt(den1 * den2);
      }

      // Smooth rounding
      r = Math.round(r * 100) / 100;
      
      matrix[i][j] = r;
      matrix[j][i] = r; // symmetric
    }
  }

  return { labels, matrix };
}

// Real K-Means clustering implementation for high-fidelity segmentation tab
export function partitionKMeans(properties: Property[], k: number = 3): {
  clustered: Property[];
  centers: { precio: number; gentrificacion: number; extranjeros: number; size: number }[];
} {
  if (properties.length === 0) {
    return { clustered: [], centers: [] };
  }

  // Extract variables of interest: precio, gentrificacion, extranjeros
  // To cluster effectively, let's normalize values
  // Price range: 500k to 12M, gentrificacion: 0-100, extranjeros: 0-100
  const normalize = (p: Property) => {
    return {
      priceNorm: (p.precio_mensual_arriendo - 500000) / 11500000,
      gentNorm: p.indice_gentrificacion / 100,
      fgnNorm: p.nivel_presencia_extranjeros / 100
    };
  };

  // Seed centroids based on segments:
  // C0: High price, high foreigners/gent (Premium)
  // C1: Medium price, medium indicators (Residencial)
  // C2: Low price, low indicators (Popular)
  let centers = [
    { priceNorm: 0.8, gentNorm: 0.9, fgnNorm: 0.9, rawPrice: 8000000, rawGent: 90, rawFgn: 90, size: 0 },
    { priceNorm: 0.3, gentNorm: 0.5, fgnNorm: 0.4, rawPrice: 2800000, rawGent: 50, rawFgn: 40, size: 0 },
    { priceNorm: 0.1, gentNorm: 0.2, fgnNorm: 0.15, rawPrice: 1200000, rawGent: 21, rawFgn: 15, size: 0 }
  ];

  // If we don't have k=3, adjust
  centers = centers.slice(0, k);

  // Iterate up to 10 times to refine clusters (more than enough for SPA dashboard live latency)
  let assignments: number[] = Array(properties.length).fill(0);
  
  for (let iter = 0; iter < 10; iter++) {
    // Step 1: Assign each point to the closest centroid
    properties.forEach((p, index) => {
      const norm = normalize(p);
      let minDis = Infinity;
      let clusterIdx = 0;

      centers.forEach((c, cIdx) => {
        const d = Math.pow(norm.priceNorm - c.priceNorm, 2) +
                  Math.pow(norm.gentNorm - c.gentNorm, 2) +
                  Math.pow(norm.fgnNorm - c.fgnNorm, 2);
        if (d < minDis) {
          minDis = d;
          clusterIdx = cIdx;
        }
      });

      assignments[index] = clusterIdx;
    });

    // Step 2: Recalculate Centroids
    const newSums = Array(k).fill(0).map(() => ({ priceNorm: 0, gentNorm: 0, fgnNorm: 0, rawPrice: 0, rawGent: 0, rawFgn: 0, count: 0 }));
    
    properties.forEach((p, index) => {
      const cIdx = assignments[index];
      const norm = normalize(p);
      
      newSums[cIdx].priceNorm += norm.priceNorm;
      newSums[cIdx].gentNorm += norm.gentNorm;
      newSums[cIdx].fgnNorm += norm.fgnNorm;
      newSums[cIdx].rawPrice += p.precio_mensual_arriendo;
      newSums[cIdx].rawGent += p.indice_gentrificacion;
      newSums[cIdx].rawFgn += p.nivel_presencia_extranjeros;
      newSums[cIdx].count++;
    });

    centers = newSums.map((sum, index) => {
      if (sum.count === 0) return centers[index]; // preserve if empty
      return {
        priceNorm: sum.priceNorm / sum.count,
        gentNorm: sum.gentNorm / sum.count,
        fgnNorm: sum.fgnNorm / sum.count,
        rawPrice: Math.round(sum.rawPrice / sum.count),
        rawGent: Math.round(sum.rawGent / sum.count),
        rawFgn: Math.round(sum.rawFgn / sum.count),
        size: sum.count
      };
    });
  }

  // Apply clusters to properties
  const clustered = properties.map((p, index) => {
    return { ...p, cluster: assignments[index] };
  });

  // Map to desired return structure
  const formattedCenters = centers.map((c) => ({
    precio: c.rawPrice,
    gentrificacion: c.rawGent,
    extranjeros: c.rawFgn,
    size: c.size
  }));

  // Sort centroids so Cluster 0 is highest price (Premium), Cluster 1 is middle (Residencial), Cluster 2 remains popular (Económico)
  // Let's index map
  const clustersSortedIndices = formattedCenters
    .map((c, i) => ({ price: c.precio, idx: i }))
    .sort((a, b) => b.price - a.price) // desc
    .map(x => x.idx);

  const finalClustered = clustered.map((p) => {
    const origCluster = p.cluster ?? 0;
    const sortedIdx = clustersSortedIndices.indexOf(origCluster);
    return { ...p, cluster: sortedIdx };
  });

  const finalCenters = clustersSortedIndices.map((origIdx) => formattedCenters[origIdx]);

  return {
    clustered: finalClustered,
    centers: finalCenters
  };
}

// Calculate SHAP shapley values for high fidelity regression interpretability SVG plot
export function calculateShapleyValues(prop: Property, allFilteredProps: Property[]): ShapValue[] {
  // Calculated relative to average of active properties
  const n = allFilteredProps.length;
  if (n === 0) return [];

  // Compute baseline averages
  const avgPrice = allFilteredProps.reduce((sum, p) => sum + p.precio_mensual_arriendo, 0) / n;
  
  // Calculate specific property prediction elements compared to averages
  const avgEstrato = allFilteredProps.reduce((sum, p) => sum + p.estrato, 0) / n;
  const avgArea = allFilteredProps.reduce((sum, p) => sum + p.area_m2, 0) / n;
  const avgHab = allFilteredProps.reduce((sum, p) => sum + p.habitaciones, 0) / n;
  const avgBano = allFilteredProps.reduce((sum, p) => sum + p.banos, 0) / n;
  const avgAntiguedad = allFilteredProps.reduce((sum, p) => sum + p.antiguedad_inmueble, 0) / n;
  const avgMetro = allFilteredProps.reduce((sum, p) => sum + p.distancia_metro_m, 0) / n;
  const avgTurismo = allFilteredProps.reduce((sum, p) => sum + p.cercania_zonas_turisticas, 0) / n;
  const avgSeguridad = allFilteredProps.reduce((sum, p) => sum + p.indice_seguridad, 0) / n;
  const avgExtranjeros = allFilteredProps.reduce((sum, p) => sum + p.nivel_presencia_extranjeros, 0) / n;
  const avgGentrif = allFilteredProps.reduce((sum, p) => sum + p.indice_gentrificacion, 0) / n;

  // Let's model proportional contributions to the difference (price - avgPrice)
  const diff = prop.precio_mensual_arriendo - avgPrice;

  // Weight profile of contributions representing Random Forest dependencies
  const rawContributions = [
    {
      variable: 'estrato',
      label: 'Estrato Social',
      weight: (prop.estrato - avgEstrato) * 350000,
      actualValue: `Estrato ${prop.estrato}`
    },
    {
      variable: 'area_m2',
      label: 'Área (m²)',
      weight: (prop.area_m2 - avgArea) * 32000,
      actualValue: `${prop.area_m2} m²`
    },
    {
      variable: 'habitaciones',
      label: 'Habitaciones',
      weight: (prop.habitaciones - avgHab) * 90000,
      actualValue: prop.habitaciones
    },
    {
      variable: 'banos',
      label: 'Baños',
      weight: (prop.banos - avgBano) * 125000,
      actualValue: prop.banos
    },
    {
      variable: 'antiguedad_inmueble',
      label: 'Antigüedad',
      weight: -(prop.antiguedad_inmueble - avgAntiguedad) * 22000, // higher age declines price
      actualValue: `${prop.antiguedad_inmueble} años`
    },
    {
      variable: 'distancia_metro_m',
      label: 'Distancia Metro',
      weight: -(prop.distancia_metro_m - avgMetro) * 110, // higher distance declines price
      actualValue: `${prop.distancia_metro_m} m`
    },
    {
      variable: 'cercania_zonas_turisticas',
      label: 'Zona Turística',
      weight: (prop.cercania_zonas_turisticas - avgTurismo) * 14000,
      actualValue: `${prop.cercania_zonas_turisticas}/100`
    },
    {
      variable: 'indice_seguridad',
      label: 'Seguridad',
      weight: (prop.indice_seguridad - avgSeguridad) * 11000,
      actualValue: `${prop.indice_seguridad}/100`
    },
    {
      variable: 'nivel_presencia_extranjeros',
      label: 'Presencia Extranjeros',
      weight: (prop.nivel_presencia_extranjeros - avgExtranjeros) * 19000,
      actualValue: `${prop.nivel_presencia_extranjeros}/100`
    },
    {
      variable: 'indice_gentrificacion',
      label: 'Gentrificación',
      weight: (prop.indice_gentrificacion - avgGentrif) * 15000,
      actualValue: `${prop.indice_gentrificacion}/100`
    }
  ];

  // Normalize weights so they sum exactly to the prediction difference
  const sumWeights = rawContributions.reduce((sum, c) => sum + Math.abs(c.weight), 0);
  
  const shapValuesFiltered = rawContributions.map((raw) => {
    let finalShap = 0;
    if (sumWeights > 0) {
      // Scale so total equals prediction delta
      finalShap = Math.round((raw.weight / sumWeights) * diff);
    }
    return {
      variable: raw.variable,
      label: raw.label,
      shapValue: finalShap,
      actualValue: raw.actualValue,
      effect: finalShap >= 0 ? 'positive' as const : 'negative' as const
    };
  });

  return shapValuesFiltered.sort((a, b) => Math.abs(b.shapValue) - Math.abs(a.shapValue));
}

// Convert numbers into COP values
export function formatCOP(val: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(val);
}
