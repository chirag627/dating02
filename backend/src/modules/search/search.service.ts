import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { SearchQueryDto } from './dto/search.dto';

@Injectable()
export class SearchService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async searchUsers(dto: SearchQueryDto): Promise<{ users: UserDocument[]; total: number }> {
    const query: any = { isBlocked: false };
    const page = dto.page || 1;
    const limit = dto.limit || 20;
    const skip = (page - 1) * limit;

    if (dto.gender) query.gender = dto.gender;

    if (dto.minAge || dto.maxAge) {
      query.age = {};
      if (dto.minAge) query.age.$gte = dto.minAge;
      if (dto.maxAge) query.age.$lte = dto.maxAge;
    }

    if (dto.interests) {
      const interestList = dto.interests.split(',').map((i) => i.trim());
      query.interests = { $in: interestList };
    }

    if (dto.lng && dto.lat && dto.distanceKm) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [dto.lng, dto.lat],
          },
          $maxDistance: dto.distanceKm * 1000,
        },
      };
    }

    let sort: any = { lastActive: -1 };
    if (dto.sortBy === 'rating') sort = { averageRating: -1 };
    if (dto.sortBy === 'newest') sort = { createdAt: -1 };

    const [users, total] = await Promise.all([
      this.userModel.find(query).sort(sort).skip(skip).limit(limit),
      this.userModel.countDocuments(query),
    ]);

    return { users, total };
  }

  async searchCompanions(dto: SearchQueryDto): Promise<any[]> {
    const pipeline: any[] = [
      {
        $lookup: {
          from: 'companions',
          localField: '_id',
          foreignField: 'userId',
          as: 'companion',
        },
      },
      { $unwind: '$companion' },
      { $match: { 'companion.isApproved': true, 'companion.isAvailable': true, isBlocked: false } },
    ];

    if (dto.gender) {
      pipeline.push({ $match: { gender: dto.gender } });
    }

    if (dto.lng && dto.lat && dto.distanceKm) {
      pipeline.unshift({
        $match: {
          location: {
            $near: {
              $geometry: { type: 'Point', coordinates: [dto.lng, dto.lat] },
              $maxDistance: dto.distanceKm * 1000,
            },
          },
        },
      });
    }

    pipeline.push(
      { $sort: { 'companion.averageRating': -1 } },
      { $skip: ((dto.page || 1) - 1) * (dto.limit || 20) },
      { $limit: dto.limit || 20 },
    );

    return this.userModel.aggregate(pipeline);
  }
}
