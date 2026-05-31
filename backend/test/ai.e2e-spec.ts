import request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { ValidationPipe, INestApplication } from '@nestjs/common';
import { GlobalExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('AI Controller (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.useGlobalFilters(new GlobalExceptionFilter());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ===== ВАЛИДАЦИЯ =====

  it('POST /ai/chat — 400 on empty body', () => {
    return request(app.getHttpServer()).post('/ai/chat').send({}).expect(400);
  });

  it('POST /ai/chat — 400 on empty userMessage', () => {
    return request(app.getHttpServer())
      .post('/ai/chat')
      .send({ userMessage: '', mode: 'selection' })
      .expect(400);
  });

  it('POST /ai/chat — 400 on invalid mode', () => {
    return request(app.getHttpServer())
      .post('/ai/chat')
      .send({ userMessage: 'test', mode: 'wrong' })
      .expect(400);
  });

  it('POST /ai/chat — 400 on missing mode', () => {
    return request(app.getHttpServer())
      .post('/ai/chat')
      .send({ userMessage: 'test' })
      .expect(400);
  });

  // ===== SEMANTIC =====

  it('POST /semantic/profile — 200 with valid sheets', () => {
    return request(app.getHttpServer())
      .post('/semantic/profile')
      .send({
        sheets: [
          {
            name: 'Sheet1',
            values: [
              ['Name', 'Amount'],
              ['Alice', 100],
              ['Bob', 200],
            ],
          },
        ],
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.sheets).toBeDefined();
        expect(res.body.sheets.length).toBe(1);
        expect(res.body.sheets[0].name).toBe('Sheet1');
      });
  });

  // ===== HEALTH =====

  it('GET / — 200 health check', () => {
    return request(app.getHttpServer()).get('/').expect(200);
  });
});
