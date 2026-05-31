import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AiChatDto } from './dto/ai-chat.dto';
import type { IAIService } from './interfaces/ai.service.interface';
import { AI_SERVICE } from './interfaces/ai.service.interface';
import { HttpCode } from '@nestjs/common';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(
    @Inject(AI_SERVICE)
    private readonly aiService: IAIService,
  ) {}

  @Post('chat')
  @ApiOperation({ summary: 'Send message to AI agent' })
  @ApiResponse({
    status: 200,
    description: 'AI response with actions or analysis',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error — invalid request body',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @HttpCode(200)
  async chat(@Body() body: AiChatDto) {
    return this.aiService.processRequest(body);
  }
}
