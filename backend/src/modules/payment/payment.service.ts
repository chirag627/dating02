import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';
import { Payment, PaymentDocument, PaymentStatus } from './schemas/payment.schema';
import { BookingService } from '../booking/booking.service';
import { CreateOrderDto, VerifyPaymentDto, RefundDto } from './dto/payment.dto';

@Injectable()
export class PaymentService {
  private razorpay: Razorpay;
  private readonly COMMISSION_RATE = 0.15; // 15%

  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private bookingService: BookingService,
    private configService: ConfigService,
  ) {
    this.razorpay = new Razorpay({
      key_id: this.configService.get('RAZORPAY_KEY_ID', 'rzp_test_key'),
      key_secret: this.configService.get('RAZORPAY_KEY_SECRET', 'rzp_test_secret'),
    });
  }

  async createOrder(userId: string, dto: CreateOrderDto): Promise<any> {
    const booking = await this.bookingService.findById(dto.bookingId);
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.isPaid) throw new BadRequestException('Booking already paid');

    const amountInPaise = Math.round(booking.amount * 100);
    const order = await this.razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `booking_${dto.bookingId}`,
    });

    const commission = booking.amount * this.COMMISSION_RATE;
    const payment = new this.paymentModel({
      bookingId: dto.bookingId,
      userId,
      razorpayOrderId: order.id,
      amount: booking.amount,
      commission,
      companionPayout: booking.amount - commission,
    });

    await payment.save();
    return { orderId: order.id, amount: amountInPaise, currency: 'INR' };
  }

  async verifyPayment(dto: VerifyPaymentDto): Promise<PaymentDocument> {
    const payment = await this.paymentModel.findOne({
      razorpayOrderId: dto.razorpayOrderId,
    });
    if (!payment) throw new NotFoundException('Payment record not found');

    const keySecret = this.configService.get('RAZORPAY_KEY_SECRET', 'rzp_test_secret');
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${dto.razorpayOrderId}|${dto.razorpayPaymentId}`)
      .digest('hex');

    if (generatedSignature !== dto.razorpaySignature) {
      throw new BadRequestException('Invalid payment signature');
    }

    payment.razorpayPaymentId = dto.razorpayPaymentId;
    payment.razorpaySignature = dto.razorpaySignature;
    payment.status = PaymentStatus.CAPTURED;
    await payment.save();

    // Mark booking as paid
    const bookingId = payment.bookingId.toString();
    const booking = await this.bookingService.findById(bookingId);
    if (booking) {
      booking.isPaid = true;
      booking.paymentId = payment._id.toString();
      await booking.save();
    }

    return payment;
  }

  async refund(dto: RefundDto): Promise<any> {
    const payment = await this.paymentModel.findById(dto.paymentId);
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status !== PaymentStatus.CAPTURED) {
      throw new BadRequestException('Payment cannot be refunded');
    }

    const refund = await this.razorpay.payments.refund(payment.razorpayPaymentId, {
      amount: Math.round(payment.amount * 100),
    });

    payment.status = PaymentStatus.REFUNDED;
    await payment.save();

    return refund;
  }

  async handleWebhook(body: any, signature: string): Promise<void> {
    const webhookSecret = this.configService.get('RAZORPAY_WEBHOOK_SECRET', '');
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(body))
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new BadRequestException('Invalid webhook signature');
    }

    if (body.event === 'payment.captured') {
      const paymentId = body.payload.payment.entity.order_id;
      await this.paymentModel.findOneAndUpdate(
        { razorpayOrderId: paymentId },
        { status: PaymentStatus.CAPTURED, escrowReleased: false },
      );
    }
  }
}
