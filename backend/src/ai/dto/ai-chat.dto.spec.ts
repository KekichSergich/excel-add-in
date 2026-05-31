import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { AiChatDto } from './ai-chat.dto';
import 'reflect-metadata';

async function validateDto(plain: object) {
  const dto = plainToInstance(AiChatDto, plain);
  return validate(dto);
}

describe('AiChatDto', () => {
  it('should pass with valid selection request', async () => {
    const errors = await validateDto({
      userMessage: 'calculate sum',
      mode: 'selection',
      selection: {
        worksheetName: 'Sheet1',
        address: 'A1:B5',
        values: [
          ['Name', 'Amount'],
          ['Alice', 100],
        ],
      },
    });
    expect(errors.length).toBe(0);
  });

  it('should pass with valid all-sheets request', async () => {
    const errors = await validateDto({
      userMessage: 'analyze workbook',
      mode: 'all-sheets',
      sheets: [
        {
          name: 'Sheet1',
          values: [
            ['A', 'B'],
            [1, 2],
          ],
        },
      ],
    });
    expect(errors.length).toBe(0);
  });

  it('should fail when userMessage is empty', async () => {
    const errors = await validateDto({
      userMessage: '',
      mode: 'selection',
    });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('userMessage');
  });

  it('should fail when userMessage is missing', async () => {
    const errors = await validateDto({
      mode: 'selection',
    });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when mode is invalid', async () => {
    const errors = await validateDto({
      userMessage: 'test',
      mode: 'wrong-mode',
    });
    const modeError = errors.find((e) => e.property === 'mode');
    expect(modeError).toBeDefined();
  });

  it('should fail when mode is missing', async () => {
    const errors = await validateDto({
      userMessage: 'test',
    });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should pass without optional selection field', async () => {
    const errors = await validateDto({
      userMessage: 'test',
      mode: 'selection',
    });
    expect(errors.length).toBe(0);
  });

  it('should fail when userMessage is a number', async () => {
    const errors = await validateDto({
      userMessage: 123,
      mode: 'selection',
    });
    expect(errors.length).toBeGreaterThan(0);
  });
});
