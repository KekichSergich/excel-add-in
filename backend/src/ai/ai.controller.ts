import { Controller, Post, Body } from '@nestjs/common';
import type { AIRequest } from '../common/interfaces/ai-request.interface';
import { AIService } from '../ai/ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AIService) {}

  @Post('chat')
  async chat(@Body() body: AIRequest) {
    return this.aiService.processRequest(body);
  }
}
