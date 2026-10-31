import { Injectable, BadGatewayException } from '@nestjs/common';
export interface Prediction { label: 'spam' | 'ham'; spamProbability: number; hamProbability: number; modelVersion: string }
@Injectable()
export class MlService {
  private readonly url = process.env.ML_URL || 'http://localhost:8000';
  private async post<T>(path: string, body: unknown): Promise<T> {
    try {
      const response = await fetch(this.url + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error(`ML HTTP ${response.status}`);
      return await response.json() as T;
    } catch { throw new BadGatewayException('ML service unavailable'); }
  }
  predict(text: string) { return this.post<Prediction>('/ml/predict', { text }); }
  batch(emails: string[]) { return this.post<{ results: Prediction[] }>('/ml/predict/batch', { emails: emails.map(text => ({ text })) }); }
}
