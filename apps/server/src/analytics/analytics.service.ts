import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Analysis, AnalysisDocument } from './schemas/analysis.schema';
import { RecordAnalysisDto } from './dto/record-analysis.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Analysis.name)
    private readonly analysisModel: Model<AnalysisDocument>,
  ) {}

  async record(input: RecordAnalysisDto): Promise<void> {
    await this.analysisModel.create(input);
  }

  async getOverview() {
    const [result] = await this.analysisModel.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          spam: {
            $sum: { $cond: [{ $eq: ['$label', 'spam'] }, 1, 0] },
          },
          ham: {
            $sum: { $cond: [{ $eq: ['$label', 'ham'] }, 1, 0] },
          },
          avgDurationMs: { $avg: '$durationMs' },
        },
      },
    ]);

    return {
      total: result?.total ?? 0,
      spam: result?.spam ?? 0,
      ham: result?.ham ?? 0,
      avgDurationMs: Math.round(result?.avgDurationMs ?? 0),
    };
  }

  async getRecent() {
    const records = await this.analysisModel
      .find({}, { label: 1, spamProbability: 1, durationMs: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return records.map((item: any) => ({
      id: String(item._id),
      label: item.label,
      spamProbability: item.spamProbability,
      durationMs: item.durationMs,
      createdAt: item.createdAt,
    }));
  }
}
