import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking, BookingDocument, BookingStatus } from './schemas/booking.schema';
import { CreateBookingDto, RespondBookingDto } from './dto/booking.dto';
import { CompanionService } from '../companion/companion.service';

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    private companionService: CompanionService,
  ) {}

  async create(clientId: string, dto: CreateBookingDto): Promise<BookingDocument> {
    const companion = await this.companionService.findById(dto.companionId);
    if (!companion) throw new NotFoundException('Companion not found');
    if (!companion.isAvailable) throw new BadRequestException('Companion is not available');

    // Concurrency check
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    const conflict = await this.bookingModel.findOne({
      companionId: dto.companionId,
      status: { $in: [BookingStatus.PENDING, BookingStatus.ACCEPTED] },
      $or: [
        { startDate: { $lt: end }, endDate: { $gt: start } },
      ],
    });

    if (conflict) throw new BadRequestException('Companion is already booked for this period');

    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const amount = hours * companion.hourlyRate;

    const booking = new this.bookingModel({
      clientId,
      companionId: dto.companionId,
      startDate: start,
      endDate: end,
      amount,
      notes: dto.notes,
    });

    return booking.save();
  }

  async respond(companionUserId: string, dto: RespondBookingDto): Promise<BookingDocument> {
    const booking = await this.bookingModel.findById(dto.bookingId).populate('companionId');
    if (!booking) throw new NotFoundException('Booking not found');

    const companion = await this.companionService.findByUserId(companionUserId);
    if (!companion || companion._id.toString() !== booking.companionId.toString()) {
      throw new ForbiddenException('Not authorized to respond to this booking');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Booking is not in pending state');
    }

    booking.status =
      dto.status === 'ACCEPTED' ? BookingStatus.ACCEPTED : BookingStatus.REJECTED;
    if (dto.rejectionReason) booking.rejectionReason = dto.rejectionReason;

    return booking.save();
  }

  async complete(userId: string, bookingId: string): Promise<BookingDocument> {
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) throw new NotFoundException('Booking not found');

    if (booking.clientId.toString() !== userId) {
      throw new ForbiddenException('Not authorized to complete this booking');
    }

    if (booking.status !== BookingStatus.ACCEPTED) {
      throw new BadRequestException('Booking must be accepted before completing');
    }

    booking.status = BookingStatus.COMPLETED;
    return booking.save();
  }

  async getHistory(userId: string, role: string): Promise<BookingDocument[]> {
    if (role === 'ADMIN') {
      return this.bookingModel
        .find()
        .populate('clientId', 'firstName lastName photos')
        .populate('companionId')
        .sort({ createdAt: -1 });
    }

    if (role === 'COMPANION') {
      const companion = await this.companionService.findByUserId(userId);
      return companion
        ? this.bookingModel
            .find({ companionId: companion._id })
            .populate('clientId', 'firstName lastName photos')
            .sort({ createdAt: -1 })
        : [];
    }

    return this.bookingModel
      .find({ clientId: userId })
      .populate('companionId')
      .sort({ createdAt: -1 });
  }

  async findById(id: string): Promise<BookingDocument> {
    return this.bookingModel.findById(id);
  }
}
