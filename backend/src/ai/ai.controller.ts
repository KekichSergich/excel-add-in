import { Controller, Post, Body, Inject } from '@nestjs/common';
import type { AIRequest } from './interfaces/ai.interface';
import type { IAIService } from './interfaces/ai.service.interface';
import { AI_SERVICE } from './interfaces/ai.service.interface';

@Controller('ai')
export class AiController {
  constructor(
    @Inject(AI_SERVICE)
    private readonly aiService: IAIService,
  ) {}

  @Post('chat')
  async chat(@Body() body: AIRequest) {
    return this.aiService.processRequest(body);
  }
}
