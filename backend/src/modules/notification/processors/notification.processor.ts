import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Processor('notifications')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  @Process('email')
  async handleEmail(job: Job<{ to: string; subject: string; html: string }>) {
    try {
      await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM', 'noreply@dating02.com'),
        to: job.data.to,
        subject: job.data.subject,
        html: job.data.html,
      });
      this.logger.log(`Email sent to ${job.data.to}`);
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      throw error;
    }
  }

  @Process('booking')
  async handleBookingNotification(job: Job<{ userId: string; type: string; data: any }>) {
    this.logger.log(`Processing booking notification for user ${job.data.userId}: ${job.data.type}`);
    // Push notification via Firebase would be added here
  }

  @Process('chat')
  async handleChatNotification(job: Job<{ userId: string; data: any }>) {
    this.logger.log(`Processing chat notification for user ${job.data.userId}`);
  }

  @Process('payment')
  async handlePaymentNotification(job: Job<{ userId: string; type: string; data: any }>) {
    this.logger.log(`Processing payment notification for user ${job.data.userId}: ${job.data.type}`);
  }
}
