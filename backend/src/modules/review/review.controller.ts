import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/review.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/utils/current-user.decorator';

@ApiTags('Review')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a review after booking' })
  create(@CurrentUser() user: any, @Body() dto: CreateReviewDto) {
    return this.reviewService.create(user._id.toString(), dto);
  }

  @Get('companion/:id')
  @ApiOperation({ summary: 'Get reviews for a companion' })
  getCompanionReviews(@Param('id') companionId: string) {
    return this.reviewService.getCompanionReviews(companionId);
  }
}
