import {
  BadGatewayException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface MlPrediction {
  label: 'spam' | 'ham';
  spamProbability: number;
  hamProbability: number;
  durationMs: number;
  modelVersion?: string;
}

@Injectable()
export class MlService {
  private readonly logger = new Logger(MlService.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async predict(text: string): Promise<MlPrediction> {
    const baseUrl = this.config.get<string>(
      'ML_SERVICE_URL',
      'http://127.0.0.1:8000',
    );
    const timeout = this.config.get<number>('ML_SERVICE_TIMEOUT_MS', 15000);

    try {
      // Contract: FastAPI POST /predict accepts { "text": "..." }.
      const { data } = await firstValueFrom(
        this.http.post(`${baseUrl.replace(/\/$/, '')}/predict`, { text }, { timeout }),
      );

      const label = String(data.label ?? data.prediction ?? '').toLowerCase();
      const spamProbability = Number(
        data.spamProbability ?? data.spam_probability ?? data.probabilities?.spam,
      );
      const hamProbability = Number(
        data.hamProbability ?? data.ham_probability ?? data.probabilities?.ham,
      );

      if (
        !['spam', 'ham'].includes(label) ||
        !Number.isFinite(spamProbability) ||
        !Number.isFinite(hamProbability)
      ) {
        this.logger.error('ML service returned an unexpected response shape.');
        throw new BadGatewayException('ML service returned an invalid prediction.');
      }

      return {
        label: label as 'spam' | 'ham',
        spamProbability,
        hamProbability,
        durationMs: Number(data.durationMs ?? data.duration_ms ?? 0),
        modelVersion: data.modelVersion ?? data.model_version,
      };
    } catch (error) {
      if (error instanceof BadGatewayException) throw error;
      this.logger.error(
        `ML service request failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      if ((error as any)?.response) {
        throw new BadGatewayException('The ML service could not process the request.');
      }
      throw new ServiceUnavailableException(
        'ML service is unavailable. Start the FastAPI service and try again.',
      );
    }
  }
}
