import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailModule } from './email/email.module';
import { AiModule } from './ai/ai.module';
import { MlModule } from './ml/ml.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('MONGODB_URI'),
        serverSelectionTimeoutMS: 5000,
      }),
    }),
    MlModule,
    AiModule,
    AnalyticsModule,
    EmailModule,
  ],
   controllers: [AppController],
})
export class AppModule {}
