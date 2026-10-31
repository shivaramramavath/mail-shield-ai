import { Module } from '@nestjs/common';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { MlModule } from '../ml/ml.module';
import { AiModule } from '../ai/ai.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [MlModule, AiModule, AnalyticsModule],
  controllers: [EmailController],
  providers: [EmailService],
})
export class EmailModule {}
