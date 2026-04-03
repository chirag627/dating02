import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CompanionDocument = Companion & Document;

@Schema({ timestamps: true })
export class Companion {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop([String])
  skills: string[];

  @Prop([String])
  services: string[];

  @Prop({ type: Number, default: 0 })
  hourlyRate: number;

  @Prop({ type: Number, default: 0 })
  dailyRate: number;

  @Prop({ default: true })
  isAvailable: boolean;

  @Prop({ default: true })
  isApproved: boolean;

  @Prop({ type: Number, default: 0 })
  averageRating: number;

  @Prop({ type: Number, default: 0 })
  totalReviews: number;

  @Prop({ type: Number, default: 0 })
  totalBookings: number;

  @Prop([
    {
      dayOfWeek: Number,
      startTime: String,
      endTime: String,
    },
  ])
  availability: { dayOfWeek: number; startTime: string; endTime: string }[];

  @Prop([String])
  languages: string[];

  @Prop([String])
  photos: string[];
}

export const CompanionSchema = SchemaFactory.createForClass(Companion);
CompanionSchema.index({ userId: 1 });
CompanionSchema.index({ averageRating: -1 });
CompanionSchema.index({ isApproved: 1, isAvailable: 1 });
