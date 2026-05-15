import { Module } from '@nestjs/common';
import { SemanticController } from './semantic.controller';
import { SemanticService } from './semantic.service';
import { SEMANTIC_SERVICE } from './interfaces/semantic.service.interface';

@Module({
  controllers: [SemanticController],
  providers: [
    SemanticService,
    {
      provide: SEMANTIC_SERVICE, // token
      useClass: SemanticService, // implementation
    },
  ],
  exports: [SemanticService, SEMANTIC_SERVICE],
})
export class SemanticModule {}
