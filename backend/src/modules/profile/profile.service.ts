import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private usersService: UsersService,
  ) {}

  async getProfile(userId: string): Promise<UserDocument> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('Profile not found');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserDocument> {
    const updateData: any = { ...dto };

    if (dto.location) {
      updateData.location = {
        type: 'Point',
        coordinates: [dto.location.lng, dto.location.lat],
      };
    }

    if (dto.dateOfBirth) {
      const dob = new Date(dto.dateOfBirth);
      const ageDiff = Date.now() - dob.getTime();
      const ageDate = new Date(ageDiff);
      updateData.age = Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    const user = await this.userModel.findByIdAndUpdate(userId, updateData, { new: true });
    if (!user) throw new NotFoundException('User not found');

    const completion = await this.usersService.calculateProfileCompletion(user);
    return this.userModel.findByIdAndUpdate(userId, { profileCompletion: completion }, { new: true });
  }

  async addPhoto(userId: string, photoUrl: string): Promise<UserDocument> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { $push: { photos: photoUrl } },
      { new: true },
    );
  }

  async getMatches(userId: string): Promise<UserDocument[]> {
    const user = await this.userModel.findById(userId).populate('matches');
    return (user.matches as any) || [];
  }

  async discover(userId: string): Promise<UserDocument[]> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const query: any = {
      _id: { $nin: [userId, ...(user.blockedUsers || []), ...(user.matches || [])] },
      isBlocked: false,
    };

    if (user.preferences?.gender) {
      query.gender = user.preferences.gender;
    }

    if (user.preferences?.minAge || user.preferences?.maxAge) {
      query.age = {};
      if (user.preferences.minAge) query.age.$gte = user.preferences.minAge;
      if (user.preferences.maxAge) query.age.$lte = user.preferences.maxAge;
    }

    if (user.location?.coordinates && user.preferences?.distanceKm) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: user.location.coordinates,
          },
          $maxDistance: user.preferences.distanceKm * 1000,
        },
      };
    }

    return this.userModel.find(query).limit(20);
  }

  async getCompatibilityScore(userId: string, targetId: string): Promise<{ score: number; breakdown: any }> {
    const [user, target] = await Promise.all([
      this.userModel.findById(userId),
      this.userModel.findById(targetId),
    ]);

    if (!user || !target) throw new NotFoundException('User not found');

    let score = 0;
    const breakdown: any = {};

    // Interest overlap
    const commonInterests = (user.interests || []).filter(i =>
      (target.interests || []).includes(i),
    );
    breakdown.interests = commonInterests.length;
    score += Math.min(commonInterests.length * 10, 30);

    // Personality traits
    const commonTraits = (user.personalityTraits || []).filter(t =>
      (target.personalityTraits || []).includes(t),
    );
    breakdown.personalityTraits = commonTraits.length;
    score += Math.min(commonTraits.length * 5, 20);

    // Love languages
    const commonLoveLangs = (user.loveLanguages || []).filter(l =>
      (target.loveLanguages || []).includes(l),
    );
    breakdown.loveLanguages = commonLoveLangs.length;
    score += Math.min(commonLoveLangs.length * 10, 20);

    // Relationship goals
    if (user.relationshipGoals && user.relationshipGoals === target.relationshipGoals) {
      breakdown.relationshipGoals = true;
      score += 15;
    }

    // Lifestyle compatibility
    if (user.lifestyle && target.lifestyle) {
      const lifestyleKeys = ['smoking', 'drinking', 'diet', 'exercise', 'pets', 'religion'];
      let lifestyleMatches = 0;
      for (const key of lifestyleKeys) {
        if ((user.lifestyle as any)[key] === (target.lifestyle as any)[key]) {
          lifestyleMatches++;
        }
      }
      breakdown.lifestyle = lifestyleMatches;
      score += Math.min(lifestyleMatches * 2.5, 15);
    }

    return { score: Math.min(score, 100), breakdown };
  }
}
