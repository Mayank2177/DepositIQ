import { PredictionResult, ModelMetrics } from '../types';
import { MODEL_METRICS, computePredictions, STAGE2_TOP10_CANDIDATES } from '../data/dataset';

export interface Stage1PredictRequest {
  model_id: 'hybrid' | 'vqc' | 'qfk' | 'classical';
  threshold?: number;
  top_k?: number;
}

export interface Stage1PredictResponse {
  model_id: string;
  metrics: ModelMetrics;
  predictions: PredictionResult[];
  top_10: PredictionResult[];
  calibrated_base_rate: number;
}

class Stage1Service {
  /**
   * Retrieves registered models and cross-validation benchmark metrics
   */
  async getModelRegistry(): Promise<Record<string, ModelMetrics>> {
    return MODEL_METRICS;
  }

  /**
   * Runs prediction pass on customer dataset using specified quantum or classical model
   */
  async predict(request: Stage1PredictRequest): Promise<Stage1PredictResponse> {
    const predictions = computePredictions(request.model_id);
    const top10 = predictions.slice(0, request.top_k || 10);
    const metrics = MODEL_METRICS[request.model_id];

    return {
      model_id: request.model_id,
      metrics,
      predictions,
      top_10: top10,
      calibrated_base_rate: 0.119,
    };
  }

  /**
   * Fetches top 10 ranked customers with calibrated continuous probabilities
   */
  async getTop10Candidates(): Promise<typeof STAGE2_TOP10_CANDIDATES> {
    return STAGE2_TOP10_CANDIDATES;
  }
}

export const stage1Service = new Stage1Service();

