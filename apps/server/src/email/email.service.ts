import { Injectable } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { MlService } from '../ml/ml.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { GenerateEmailDto } from './dto/generate-email.dto';

@Injectable()
export class EmailService {
  constructor(
    private readonly ml: MlService,
    private readonly ai: AiService,
    private readonly analytics: AnalyticsService,
  ) {}

  async analyze(text: string) {
    const startedAt = Date.now();
    const prediction = await this.ml.predict(text);
    const durationMs = Date.now() - startedAt;

    // Store only classification metadata, never the submitted email body.
    await this.analytics.record({
      label: prediction.label,
      spamProbability: prediction.spamProbability,
      durationMs,
    });

    return {
      label: prediction.label,
      spamProbability: prediction.spamProbability,
      hamProbability: prediction.hamProbability,
      durationMs,
      modelVersion: prediction.modelVersion ?? null,
    };
  }

  async generate(dto: GenerateEmailDto) {
    const content = await this.ai.generate(dto.prompt, dto.tone, dto.length);
    return { content };
  }

  async improve(text: string) {
    const content = await this.ai.improve(text);
    return { content };
  }

  async securityScan(text: string) {
    const report = await this.ai.securityScan(text);
    return { report };
  }

  async batchAnalyze(emails: string[]) {
    // Bounded concurrency prevents a large batch from overwhelming FastAPI.
    const results: Array<any> = new Array(emails.length);
    const concurrency = 4;
    let nextIndex = 0;

    const workers = Array.from(
      { length: Math.min(concurrency, emails.length) },
      async () => {
        while (true) {
          const index = nextIndex++;
          if (index >= emails.length) return;
          try {
            results[index] = {
              index,
              ...(await this.analyze(emails[index])),
            };
          } catch (error) {
            results[index] = {
              index,
              error: error instanceof Error ? error.message : 'Analysis failed',
            };
          }
        }
      },
    );

    await Promise.all(workers);
    return { total: emails.length, results };
  }
}
