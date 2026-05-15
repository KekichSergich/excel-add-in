import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AnalysisModule } from './analysis/analysis.module';
import { AiModule } from './ai/ai.module';
import { ConfigModule } from '@nestjs/config';
import { SemanticModule } from './semantic/semantic.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AnalysisModule,
    AiModule,
    SemanticModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
