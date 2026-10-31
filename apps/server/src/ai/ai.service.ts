import {
  BadGatewayException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  private async chat(system: string, user: string): Promise<string> {
    const apiKey = this.config.get<string>('GROQ_API_KEY');
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'AI generation is not configured. Set GROQ_API_KEY in the server environment.',
      );
    }

    const baseUrl = this.config.get<string>(
      'GROQ_BASE_URL',
      'https://api.groq.com/openai/v1',
    );
    const model = this.config.get<string>(
      'GROQ_MODEL',
      'llama-3.3-70b-versatile',
    );
    const timeout = this.config.get<number>('GROQ_TIMEOUT_MS', 30000);

    try {
      const { data } = await firstValueFrom(
        this.http.post(
          `${baseUrl.replace(/\/$/, '')}/chat/completions`,
          {
            model,
            temperature: 0.4,
            max_tokens: 1800,
            messages: [
              { role: 'system', content: system },
              { role: 'user', content: user },
            ],
          },
          {
            timeout,
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const content = data?.choices?.[0]?.message?.content;
      if (typeof content !== 'string' || !content.trim()) {
        throw new BadGatewayException('AI provider returned an empty response.');
      }
      return content.trim();
    } catch (error) {
      if (error instanceof BadGatewayException) throw error;
      this.logger.error(
        `Groq request failed: ${(error as any)?.response?.status ?? ''} ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      if ((error as any)?.response) {
        throw new BadGatewayException('AI provider request failed. Check server logs.');
      }
      throw new ServiceUnavailableException('AI provider is temporarily unavailable.');
    }
  }

  generate(prompt: string, tone: string, length: string): Promise<string> {
    return this.chat(
      'You write clear, useful emails. Follow the requested tone and length. Return the email itself, with a subject line when appropriate. Do not claim to have sent the email.',
      `Requirements: ${prompt}\nTone: ${tone}\nLength: ${length}`,
    );
  }

  improve(text: string): Promise<string> {
    return this.chat(
      'Improve the supplied email for clarity, grammar, structure, and professional quality. Preserve the original intent and factual details. Return only the improved email.',
      text,
    );
  }

  securityScan(text: string): Promise<string> {
    return this.chat(
      [
        'You are an email security assistant.',
        'Review the email for phishing indicators, social engineering, impersonation, urgency, credential/payment requests, suspicious links, and attachment risks.',
        'Return a concise Markdown report with headings: Risk assessment, Indicators, Recommended actions.',
        'Do not claim to verify URLs, sender identity, or attachments when their technical data is not provided.',
        'State that this is a heuristic AI assessment, not a guarantee.',
      ].join(' '),
      text,
    );
  }
}
