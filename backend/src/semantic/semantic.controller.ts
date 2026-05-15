import { Controller, Post, Body, Inject } from '@nestjs/common';
import { SEMANTIC_SERVICE } from './interfaces/semantic.service.interface';
import type { ISemanticService } from './interfaces/semantic.service.interface';
import type {
  SemanticProfile,
  SheetInput,
} from './interfaces/semantic-profile.interface';
interface ProfileRequest {
  sheets: SheetInput[];
}

@Controller('semantic')
export class SemanticController {
  constructor(
    @Inject(SEMANTIC_SERVICE)
    private readonly semanticService: ISemanticService,
  ) {}

  @Post('profile')
  buildProfile(@Body() body: ProfileRequest): SemanticProfile {
    return this.semanticService.buildProfile(body.sheets);
  }
}
