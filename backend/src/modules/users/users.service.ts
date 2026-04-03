import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email: email.toLowerCase() }).select('+password');
  }

  async findByEmailWithTokens(email: string): Promise<UserDocument> {
    return this.userModel
      .findOne({ email: email.toLowerCase() })
      .select('+password +refreshToken +resetPasswordToken +resetPasswordExpires +emailVerificationToken');
  }

  async findByRefreshToken(userId: string): Promise<UserDocument> {
    return this.userModel.findById(userId).select('+refreshToken');
  }

  async create(data: Partial<User>): Promise<UserDocument> {
    const user = new this.userModel(data);
    return user.save();
  }

  async update(id: string, data: Partial<User>): Promise<UserDocument> {
    return this.userModel.findByIdAndUpdate(id, data, { new: true });
  }

  async findAll(query: any = {}): Promise<UserDocument[]> {
    return this.userModel.find(query);
  }

  async ban(id: string, reason: string): Promise<UserDocument> {
    return this.userModel.findByIdAndUpdate(
      id,
      { isBlocked: true, banReason: reason },
      { new: true },
    );
  }

  async unban(id: string): Promise<UserDocument> {
    return this.userModel.findByIdAndUpdate(
      id,
      { isBlocked: false, banReason: null },
      { new: true },
    );
  }

  async calculateProfileCompletion(user: UserDocument): Promise<number> {
    const fields = [
      'firstName', 'lastName', 'bio', 'photos', 'interests',
      'dateOfBirth', 'gender', 'location', 'preferences',
    ];
    let filled = 0;
    for (const field of fields) {
      const value = (user as any)[field];
      if (value && (Array.isArray(value) ? value.length > 0 : true)) {
        filled++;
      }
    }
    return Math.round((filled / fields.length) * 100);
  }
}
