import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsEnum,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Gender } from '../../users/schemas/user.schema';

class LocationDto {
  @IsNumber()
  lng: number;

  @IsNumber()
  lat: number;
}

class PreferencesDto {
  @IsOptional()
  @IsNumber()
  minAge?: number;

  @IsOptional()
  @IsNumber()
  maxAge?: number;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsNumber()
  distanceKm?: number;

  @IsOptional()
  @IsArray()
  interests?: string[];
}

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional()
  @IsOptional()
  dateOfBirth?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sexualOrientation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  interests?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  personalityTraits?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  loveLanguages?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  relationshipGoals?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => PreferencesDto)
  preferences?: PreferencesDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  lifestyle?: Record<string, string>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instagramHandle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  spotifyTopSongs?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  favoriteMovies?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  zodiacSign?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  politicalViews?: string;
}
