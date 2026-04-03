import { IsString, IsOptional, IsDateString, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty()
  @IsString()
  companionId: string;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RespondBookingDto {
  @ApiProperty()
  @IsString()
  bookingId: string;

  @ApiProperty({ enum: ['ACCEPTED', 'REJECTED'] })
  @IsString()
  status: 'ACCEPTED' | 'REJECTED';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
