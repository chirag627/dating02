import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class AvailabilitySlotDto {
  @IsNumber()
  dayOfWeek: number;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;
}

export class CreateCompanionDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  skills?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  services?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  hourlyRate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  dailyRate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilitySlotDto)
  availability?: AvailabilitySlotDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  languages?: string[];
}
