import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MlService } from '../ml/ml.service';
import { AiService } from '../ai/ai.service';
import { Analysis } from '../analytics/analysis.schema';
@Injectable()
export class EmailService {
  constructor(private readonly ml: MlService, private readonly ai: AiService, @InjectModel(Analysis.name) private readonly analyses: Model<Analysis>) {}
  async analyze(text: string) {
    const started = Date.now();
    const prediction = await this.ml.predict(text);
    const durationMs = Date.now() - started;
    // Never store raw email text.
    await this.analyses.create({ label: prediction.label, spamProbability: prediction.spamProbability, durationMs, modelVersion: prediction.modelVersion }).catch(() => undefined);
    return { ...prediction, durationMs, disclaimer: 'Demonstration model; not a security verdict.' };
  }
  generate(prompt: string, tone = 'professional') { return this.ai.generate(prompt, tone); }
  improve(text: string) { return this.ai.improve(text); }
  security(text: string) { return this.ai.security(text); }
  async batch(emails: string[]) {
    if (emails.some(x => typeof x !== 'string' || !x.trim() || x.length > 20000)) throw new BadRequestException('Every email must contain 1–20000 characters');
    return this.ml.batch(emails);
  }
  async overview() {
    const [total, spam, stats] = await Promise.all([
      this.analyses.countDocuments(), this.analyses.countDocuments({ label: 'spam' }),
      this.analyses.aggregate([{ $group: { _id: null, avgDurationMs: { $avg: '$durationMs' } } }]),
    ]);
    return { total, spam, ham: total - spam, avgDurationMs: Math.round(stats[0]?.avgDurationMs || 0) };
  }
  feedback(text: string, correctLabel: string) {
    // Avoid storing raw user emails or treating anonymous feedback as verified labels.
    return { accepted: true, message: 'Feedback received for this session; dataset changes require a reviewed labeling workflow.', correctLabel };
  }
}
