import { Body, Controller, Post } from '@nestjs/common';
import { EmailService } from './email.service';
import { AnalyzeEmailDto } from './dto/analyze-email.dto';
import { GenerateEmailDto } from './dto/generate-email.dto';
import { ImproveEmailDto } from './dto/improve-email.dto';
import { BatchAnalyzeDto } from './dto/batch-analyze.dto';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('analyze')
  analyze(@Body() dto: AnalyzeEmailDto) {
    return this.emailService.analyze(dto.text);
  }

  @Post('generate')
  generate(@Body() dto: GenerateEmailDto) {
    return this.emailService.generate(dto);
  }

  @Post('improve')
  improve(@Body() dto: ImproveEmailDto) {
    return this.emailService.improve(dto.text);
  }

  @Post('security-scan')
  securityScan(@Body() dto: AnalyzeEmailDto) {
    return this.emailService.securityScan(dto.text);
  }

  @Post('batch-analyze')
  batchAnalyze(@Body() dto: BatchAnalyzeDto) {
    return this.emailService.batchAnalyze(dto.emails);
  }
}
