import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AnalysisDocument = HydratedDocument<Analysis>;

@Schema({ timestamps: true, collection: 'analyses' })
export class Analysis {
  @Prop({ required: true, enum: ['spam', 'ham'], index: true })
  label!: 'spam' | 'ham';

  @Prop({ required: true, min: 0, max: 1 })
  spamProbability!: number;

  @Prop({ required: true, min: 0 })
  durationMs!: number;
}

export const AnalysisSchema = SchemaFactory.createForClass(Analysis);
