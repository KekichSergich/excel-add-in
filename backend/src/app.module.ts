import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AnalysisModule } from './analysis/analysis.module';
import { AiModule } from './ai/ai.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AnalysisModule, AiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
