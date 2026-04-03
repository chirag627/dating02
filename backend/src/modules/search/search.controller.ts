import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Search')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('users')
  @ApiOperation({ summary: 'Search users with geo and filters' })
  searchUsers(@Query() dto: SearchQueryDto) {
    return this.searchService.searchUsers(dto);
  }

  @Get('companions')
  @ApiOperation({ summary: 'Search companions with filters' })
  searchCompanions(@Query() dto: SearchQueryDto) {
    return this.searchService.searchCompanions(dto);
  }
}
