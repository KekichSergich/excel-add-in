import { Module } from '@nestjs/common';
import { AIService } from './ai.service';
import { AiController } from './ai.controller';
import { AnalysisModule } from '../analysis/analysis.module';

@Module({
  imports: [AnalysisModule],
  controllers: [AiController],
  providers: [AIService],
})
export class AiModule {}
