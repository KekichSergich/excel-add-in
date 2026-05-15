import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AIService } from './ai.service';
import { AnalysisModule } from '../analysis/analysis.module';
import { SemanticModule } from '../semantic/semantic.module';
import { AI_SERVICE } from './interfaces/ai.service.interface';

@Module({
  imports: [AnalysisModule, SemanticModule],
  controllers: [AiController],
  providers: [
    {
      provide: AI_SERVICE,
      useClass: AIService,
    },
  ],
  exports: [AI_SERVICE],
})
export class AiModule {}
