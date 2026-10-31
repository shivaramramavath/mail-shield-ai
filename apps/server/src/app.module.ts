import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { EmailController } from './email/email.controller';
import { EmailService } from './email/email.service';
import { MlService } from './ml/ml.service';
import { AiService } from './ai/ai.service';
import { Analysis, AnalysisSchema } from './analytics/analysis.schema';

@Module({
 imports: [ConfigModule.forRoot({ isGlobal: true }), MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/mailshield'), MongooseModule.forFeature([{ name: Analysis.name, schema: AnalysisSchema }]), ThrottlerModule.forRoot([{ ttl: 60000, limit: 30 }])],
 controllers: [EmailController],
 providers: [EmailService, MlService, AiService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
