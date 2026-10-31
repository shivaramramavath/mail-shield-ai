import { Body, Controller, Get, Post } from '@nestjs/common';
import { EmailService } from './email.service';
import { BatchDto, FeedbackDto, GenerateDto, TextDto } from './dto';
@Controller()
export class EmailController {
  constructor(private readonly service: EmailService) {}
  @Get('health') health() { return { ok: true }; }
  @Post('email/analyze') analyze(@Body() dto: TextDto) { return this.service.analyze(dto.text); }
  @Post('email/generate') async generate(@Body() dto: GenerateDto) { return { content: await this.service.generate(dto.prompt, dto.tone) }; }
  @Post('email/improve') async improve(@Body() dto: TextDto) { return { content: await this.service.improve(dto.text) }; }
  @Post('email/security-scan') async security(@Body() dto: TextDto) { return { content: await this.service.security(dto.text) }; }
  @Post('email/batch-analyze') batch(@Body() dto: BatchDto) { return this.service.batch(dto.emails); }
  @Get('analytics/overview') overview() { return this.service.overview(); }
  @Post('feedback') feedback(@Body() dto: FeedbackDto) { return this.service.feedback(dto.text, dto.correctLabel); }
}
