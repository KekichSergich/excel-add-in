// src/analysis/analysis.module.ts
import { Module } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { ANALYSIS_SERVICE } from './interfaces/analysis.service.interface';

@Module({
  providers: [
    {
      provide: ANALYSIS_SERVICE,
      useClass: AnalysisService,
    },
  ],
  exports: [ANALYSIS_SERVICE],
})
export class AnalysisModule {}
