import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  CLIENT = 'CLIENT',
  COMPANION = 'COMPANION',
  ADMIN = 'ADMIN',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  NON_BINARY = 'NON_BINARY',
  OTHER = 'OTHER',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ enum: UserRole, default: UserRole.CLIENT })
  role: UserRole;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: false })
  isBlocked: boolean;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop({ enum: Gender })
  gender: Gender;

  @Prop()
  dateOfBirth: Date;

  @Prop()
  age: number;

  @Prop()
  sexualOrientation: string;

  @Prop()
  bio: string;

  @Prop([String])
  photos: string[];

  @Prop([String])
  interests: string[];

  @Prop({
    type: {
      smoking: String,
      drinking: String,
      diet: String,
      exercise: String,
      pets: String,
      religion: String,
      education: String,
      occupation: String,
      incomeRange: String,
    },
    _id: false,
  })
  lifestyle: {
    smoking: string;
    drinking: string;
    diet: string;
    exercise: string;
    pets: string;
    religion: string;
    education: string;
    occupation: string;
    incomeRange: string;
  };

  @Prop([String])
  personalityTraits: string[];

  @Prop([String])
  loveLanguages: string[];

  @Prop()
  relationshipGoals: string;

  @Prop({
    type: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
    _id: false,
  })
  location: { type: string; coordinates: number[] };

  @Prop({
    type: {
      minAge: Number,
      maxAge: Number,
      gender: String,
      distanceKm: Number,
      interests: [String],
      lifestyleFilters: Object,
    },
    _id: false,
  })
  preferences: {
    minAge: number;
    maxAge: number;
    gender: string;
    distanceKm: number;
    interests: string[];
    lifestyleFilters: Record<string, any>;
  };

  @Prop({ default: false })
  verifiedBadge: boolean;

  @Prop({ default: false })
  premiumUser: boolean;

  @Prop({ default: 0 })
  profileCompletion: number;

  @Prop({ default: Date.now })
  lastActive: Date;

  @Prop({ default: false })
  onlineStatus: boolean;

  @Prop({ default: 0 })
  streakDays: number;

  @Prop({ default: 0 })
  likesSent: number;

  @Prop({ default: 0 })
  likesReceived: number;

  @Prop([{ type: Types.ObjectId, ref: 'User' }])
  matches: Types.ObjectId[];

  @Prop({ default: 0 })
  superLikes: number;

  @Prop({ default: 0 })
  boostsUsed: number;

  @Prop()
  instagramHandle: string;

  @Prop([String])
  spotifyTopSongs: string[];

  @Prop([String])
  favoriteMovies: string[];

  @Prop()
  zodiacSign: string;

  @Prop()
  politicalViews: string;

  @Prop([{ type: Types.ObjectId, ref: 'User' }])
  reports: Types.ObjectId[];

  @Prop([{ type: Types.ObjectId, ref: 'User' }])
  blockedUsers: Types.ObjectId[];

  @Prop()
  banReason: string;

  @Prop({ default: false })
  aiPhotoVerified: boolean;

  @Prop({ select: false })
  refreshToken: string;

  @Prop({ select: false })
  resetPasswordToken: string;

  @Prop({ select: false })
  resetPasswordExpires: Date;

  @Prop({ select: false })
  emailVerificationToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ location: '2dsphere' });
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
