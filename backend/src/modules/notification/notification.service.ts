import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class NotificationService {
  constructor(
    @InjectQueue('notifications') private notificationQueue: Queue,
  ) {}

  async sendBookingNotification(userId: string, type: string, data: any) {
    await this.notificationQueue.add('booking', { userId, type, data }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });
  }

  async sendChatNotification(userId: string, data: any) {
    await this.notificationQueue.add('chat', { userId, data }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });
  }

  async sendPaymentNotification(userId: string, type: string, data: any) {
    await this.notificationQueue.add('payment', { userId, type, data }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });
  }

  async sendEmail(to: string, subject: string, html: string) {
    await this.notificationQueue.add('email', { to, subject, html }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
  }
}
