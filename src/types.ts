/**
 * Types and interfaces for the Medellín Real Estate Analysis Platform
 */

export interface Property {
  id: string;
  barrio: string;
  estrato: number;
  area_m2: number;
  habitaciones: number;
  banos: number;
  antiguedad_inmueble: number; // years
  distancia_metro_m: number; // meters
  cercania_zonas_turisticas: number; // index 0-100
  indice_seguridad: number; // index 0-100
  indice_demanda_inmobiliaria: number; // index 0-100
  nivel_presencia_extranjeros: number; // index 0-100
  indice_gentrificacion: number; // index 0-100
  precio_mensual_arriendo: number; // COP
  tipo_vivienda: 'Apartamento' | 'Casa' | 'Apartaestudio';
  amoblado: boolean;
  lat: number;
  lng: number;
  cluster?: number;
}

export interface RegressionMetrics {
  mae: number;
  r2: number;
}

export interface ModelComparison {
  linearRegression: RegressionMetrics;
  decisionTree: RegressionMetrics;
  randomForest: RegressionMetrics;
}

export interface ClassificationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
}

export interface ClassifierComparison {
  logisticRegression: ClassificationMetrics;
  decisionTree: ClassificationMetrics;
  naiveBayes: ClassificationMetrics;
  randomForest: ClassificationMetrics;
}

export interface FilterState {
  barrio: string; // 'Todos' or specific
  estrato: string; // 'Todos' or specific number
  tipo_vivienda: string; // 'Todos' or specific
  minPrecio: number;
  maxPrecio: number;
  habitaciones: string; // 'Todos' or specific number
}

export interface ShapValue {
  variable: string;
  label: string;
  shapValue: number;
  actualValue: string | number;
  effect: 'positive' | 'negative';
}
