// eslint-disable-next-line @typescript-eslint/no-require-imports
const ARIMA = require('arima');

export type ForecastModelName = 'AutoARIMA' | 'LinearRegression';

export interface ForecastResult {
  model: ForecastModelName;
  predictions: number[];
  lower: number[];
  upper: number[];
  trainedOn: number;
}

const MIN_ARIMA_POINTS = 6;

function linearRegressionPredict(values: number[], horizon: number): number[] {
  const n = values.length;
  if (n === 0) return Array.from({ length: horizon }, () => 0);
  if (n === 1) return Array.from({ length: horizon }, () => values[0]);

  const x = Array.from({ length: n }, (_, i) => i);
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

  const denom = n * sumXX - sumX * sumX;
  const slope = denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  return Array.from({ length: horizon }, (_, i) => {
    const predicted = slope * (n + i) + intercept;
    return Math.max(0, Math.round(predicted));
  });
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function linearRegressionForecast(series: number[], horizon: number): ForecastResult {
  const predictions = linearRegressionPredict(series, horizon);
  const residualStd = stdDev(series);
  const z = 1.0;

  const lower = predictions.map((p) => Math.max(0, Math.round(p - z * residualStd)));
  const upper = predictions.map((p, i) => Math.max(lower[i], Math.round(p + z * residualStd)));

  return {
    model: 'LinearRegression',
    predictions,
    lower,
    upper,
    trainedOn: series.length,
  };
}

function arimaForecast(series: number[], horizon: number, seasonal: boolean): ForecastResult {
  const options: Record<string, unknown> = { auto: true, verbose: false };
  // SARIMA with s=12 needs at least ~26 observations per arima package constraints.
  if (seasonal && series.length >= 26) {
    options.s = 12;
    options.P = 1;
    options.D = 1;
    options.Q = 1;
  }

  const model = new ARIMA(options).train(series);
  const [predictions, errors] = model.predict(horizon) as [number[], number[]];

  const rounded = predictions.map((p: number) => Math.max(0, Math.round(p)));
  const lower = rounded.map((p: number, i: number) => {
    const err = Math.abs(errors?.[i] ?? stdDev(series));
    return Math.max(0, Math.round(p - err));
  });
  const upper = rounded.map((p: number, i: number) => {
    const err = Math.abs(errors?.[i] ?? stdDev(series));
    return Math.max(lower[i], Math.round(p + err));
  });

  return {
    model: 'AutoARIMA',
    predictions: rounded,
    lower,
    upper,
    trainedOn: series.length,
  };
}

/**
 * Run ML time-series forecast on a numeric series.
 * Uses AutoARIMA when enough history exists; falls back to linear regression.
 */
export function runForecast(
  series: number[],
  horizon: number,
  options: { seasonal?: boolean } = {}
): ForecastResult {
  if (series.length === 0) {
    return {
      model: 'LinearRegression',
      predictions: Array.from({ length: horizon }, () => 0),
      lower: Array.from({ length: horizon }, () => 0),
      upper: Array.from({ length: horizon }, () => 0),
      trainedOn: 0,
    };
  }

  if (series.length < MIN_ARIMA_POINTS) {
    return linearRegressionForecast(series, horizon);
  }

  try {
    return arimaForecast(series, horizon, options.seasonal ?? false);
  } catch {
    return linearRegressionForecast(series, horizon);
  }
}

export function inferTrend(
  series: number[],
  nextPredicted: number
): 'increasing' | 'decreasing' | 'stable' {
  if (series.length < 2) return 'stable';
  const last = series[series.length - 1];
  const prev = series[series.length - 2];
  const recentDelta = last - prev;
  const forecastDelta = nextPredicted - last;

  if (forecastDelta > 0 && recentDelta >= 0) return 'increasing';
  if (forecastDelta < 0 && recentDelta <= 0) return 'decreasing';
  if (Math.abs(forecastDelta) <= 1 && Math.abs(recentDelta) <= 1) return 'stable';
  return forecastDelta >= 0 ? 'increasing' : 'decreasing';
}
