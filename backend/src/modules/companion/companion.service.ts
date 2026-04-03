import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Companion, CompanionDocument } from './schemas/companion.schema';
import { CreateCompanionDto } from './dto/companion.dto';

function toObjectId(id: string): Types.ObjectId {
  if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid ID format');
  return new Types.ObjectId(id);
}

@Injectable()
export class CompanionService {
  constructor(
    @InjectModel(Companion.name) private companionModel: Model<CompanionDocument>,
  ) {}

  async create(userId: string, dto: CreateCompanionDto): Promise<CompanionDocument> {
    const existing = await this.companionModel.findOne({ userId: toObjectId(userId) });
    if (existing) throw new BadRequestException('Companion profile already exists');

    const companion = new this.companionModel({ ...dto, userId });
    return companion.save();
  }

  async findAll(query: any = {}): Promise<CompanionDocument[]> {
    return this.companionModel
      .find({ ...query, isApproved: true, isAvailable: true })
      .populate('userId', 'firstName lastName photos averageRating')
      .sort({ averageRating: -1 });
  }

  async findById(id: string): Promise<CompanionDocument> {
    const companion = await this.companionModel
      .findById(toObjectId(id))
      .populate('userId', 'firstName lastName photos bio');
    if (!companion) throw new NotFoundException('Companion not found');
    return companion;
  }

  async findByUserId(userId: string): Promise<CompanionDocument> {
    if (!Types.ObjectId.isValid(userId)) return null;
    return this.companionModel.findOne({ userId: toObjectId(userId) });
  }

  async update(userId: string, data: Partial<Companion>): Promise<CompanionDocument> {
    return this.companionModel.findOneAndUpdate({ userId: toObjectId(userId) }, data, { new: true });
  }

  async updateRating(companionId: string, rating: number): Promise<void> {
    const companion = await this.companionModel.findById(toObjectId(companionId));
    if (!companion) return;

    const newTotal = companion.totalReviews + 1;
    const newAvg =
      (companion.averageRating * companion.totalReviews + rating) / newTotal;

    await this.companionModel.findByIdAndUpdate(toObjectId(companionId), {
      averageRating: parseFloat(newAvg.toFixed(2)),
      totalReviews: newTotal,
    });
  }

  async checkAvailability(companionId: string, dayOfWeek: number): Promise<boolean> {
    const companion = await this.findById(companionId);
    if (!companion.isAvailable) return false;

    const slot = companion.availability?.find((a) => a.dayOfWeek === dayOfWeek);
    return !!slot;
  }
}
