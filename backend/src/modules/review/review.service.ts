import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { CreateReviewDto } from './dto/review.dto';
import { BookingService } from '../booking/booking.service';
import { BookingStatus } from '../booking/schemas/booking.schema';
import { CompanionService } from '../companion/companion.service';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    private bookingService: BookingService,
    private companionService: CompanionService,
  ) {}

  async create(userId: string, dto: CreateReviewDto): Promise<ReviewDocument> {
    const booking = await this.bookingService.findById(dto.bookingId);
    if (!booking) throw new NotFoundException('Booking not found');

    if (booking.clientId.toString() !== userId) {
      throw new ForbiddenException('Only the client can review a booking');
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException('Booking must be completed before reviewing');
    }

    if (booking.isReviewed) {
      throw new BadRequestException('Booking has already been reviewed');
    }

    const companion = await this.companionService.findById(booking.companionId.toString());
    if (!companion) throw new NotFoundException('Companion not found');

    const review = new this.reviewModel({
      bookingId: dto.bookingId,
      reviewerId: userId,
      companionId: companion._id,
      rating: dto.rating,
      review: dto.review,
    });

    await review.save();

    // Mark booking as reviewed using the already-fetched document
    booking.isReviewed = true;
    await booking.save();

    // Update companion rating
    await this.companionService.updateRating(companion._id.toString(), dto.rating);

    return review;
  }

  async getCompanionReviews(companionId: string): Promise<ReviewDocument[]> {
    return this.reviewModel
      .find({ companionId })
      .populate('reviewerId', 'firstName lastName photos')
      .sort({ createdAt: -1 });
  }
}
