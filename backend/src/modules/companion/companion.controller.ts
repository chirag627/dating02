import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CompanionService } from './companion.service';
import { CreateCompanionDto } from './dto/companion.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/utils/current-user.decorator';
import { Roles } from '../../common/utils/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Companion')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('companion')
export class CompanionController {
  constructor(private readonly companionService: CompanionService) {}

  @Post('create')
  @Roles('COMPANION')
  @ApiOperation({ summary: 'Create companion profile' })
  create(@CurrentUser() user: any, @Body() dto: CreateCompanionDto) {
    return this.companionService.create(user._id.toString(), dto);
  }

  @Get('list')
  @ApiOperation({ summary: 'List all companions' })
  findAll(@Query() query: any) {
    return this.companionService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get companion by ID' })
  findOne(@Param('id') id: string) {
    return this.companionService.findById(id);
  }
}
