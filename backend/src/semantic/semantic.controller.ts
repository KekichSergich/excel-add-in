import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SEMANTIC_SERVICE } from './interfaces/semantic.service.interface';
import type { ISemanticService } from './interfaces/semantic.service.interface';
import type {
  SemanticProfile,
  SheetInput,
} from './interfaces/semantic-profile.interface';
import { HttpCode } from '@nestjs/common';

interface ProfileRequest {
  sheets: SheetInput[];
}

@ApiTags('Semantic')
@Controller('semantic')
export class SemanticController {
  constructor(
    @Inject(SEMANTIC_SERVICE)
    private readonly semanticService: ISemanticService,
  ) {}

  @Post('profile')
  @ApiOperation({ summary: 'Build semantic profile for sheets' })
  @ApiResponse({
    status: 200,
    description: 'Semantic profile with column roles and quality',
  })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @HttpCode(200)
  buildProfile(@Body() body: ProfileRequest): SemanticProfile {
    return this.semanticService.buildProfile(body.sheets);
  }
}
