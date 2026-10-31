import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
@Schema({ timestamps: true })
export class Analysis {
  @Prop({ required: true, enum: ['spam', 'ham'] }) label!: string;
  @Prop({ required: true }) spamProbability!: number;
  @Prop({ required: true }) durationMs!: number;
  @Prop({ required: true }) modelVersion!: string;
}
export type AnalysisDocument = HydratedDocument<Analysis>;
export const AnalysisSchema = SchemaFactory.createForClass(Analysis);
