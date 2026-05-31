import {
  IsString,
  IsNotEmpty,
  IsIn,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SheetDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsArray()
  values!: unknown[][];
}

export class SelectionDto {
  @IsString()
  @IsNotEmpty()
  worksheetName!: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsArray()
  values!: unknown[][];
}

export class AiChatDto {
  @IsString()
  @IsNotEmpty()
  userMessage!: string;

  @IsIn(['selection', 'all-sheets'])
  mode!: 'selection' | 'all-sheets';

  @IsOptional()
  @ValidateNested()
  @Type(() => SelectionDto)
  selection?: SelectionDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SheetDto)
  sheets?: SheetDto[];
}
