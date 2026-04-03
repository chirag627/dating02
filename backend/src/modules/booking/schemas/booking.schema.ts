import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BookingDocument = Booking & Document;

export enum BookingStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  clientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Companion', required: true })
  companionId: Types.ObjectId;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @Prop()
  notes: string;

  @Prop()
  rejectionReason: string;

  @Prop({ default: false })
  isPaid: boolean;

  @Prop()
  paymentId: string;

  @Prop({ default: false })
  isReviewed: boolean;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
BookingSchema.index({ clientId: 1 });
BookingSchema.index({ companionId: 1 });
BookingSchema.index({ status: 1 });
