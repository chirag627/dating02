import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ type: Types.ObjectId, ref: 'Booking', required: true, unique: true })
  bookingId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  reviewerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Companion', required: true })
  companionId: Types.ObjectId;

  @Prop({ type: Number, min: 1, max: 5, required: true })
  rating: number;

  @Prop()
  review: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
ReviewSchema.index({ bookingId: 1 });
ReviewSchema.index({ companionId: 1 });
