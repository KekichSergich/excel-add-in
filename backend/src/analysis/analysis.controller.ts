import { Body, Controller, Post } from '@nestjs/common';
import { AnalysisService } from './analysis.service';

@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post('selection')
  analyzeSelection(@Body() body: any) {
    console.log('[Backend] Received request:', body);
    return this.analysisService.prepareContext(body);
  }
}
