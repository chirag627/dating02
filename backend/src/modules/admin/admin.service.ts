import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { BookingService } from '../booking/booking.service';
import { CompanionService } from '../companion/companion.service';

@Injectable()
export class AdminService {
  constructor(
    private usersService: UsersService,
    private bookingService: BookingService,
    private companionService: CompanionService,
  ) {}

  async getAllUsers(page = 1, limit = 20, role?: string) {
    const query: any = {};
    if (role) query.role = role;
    const users = await this.usersService.findAll(query);
    return users;
  }

  async banUser(userId: string, reason: string) {
    return this.usersService.ban(userId, reason);
  }

  async unbanUser(userId: string) {
    return this.usersService.unban(userId);
  }

  async getUserById(userId: string) {
    return this.usersService.findById(userId);
  }

  async getBookings() {
    return this.bookingService.getHistory('', 'ADMIN');
  }

  async approveCompanion(userId: string) {
    const companion = await this.companionService.findByUserId(userId);
    if (!companion) return null;
    return this.companionService.update(userId, { isApproved: true });
  }

  async rejectCompanion(userId: string) {
    const companion = await this.companionService.findByUserId(userId);
    if (!companion) return null;
    return this.companionService.update(userId, { isApproved: false });
  }

  async getDashboardStats() {
    const [totalUsers, blockedUsers, companions] = await Promise.all([
      this.usersService.findAll(),
      this.usersService.findAll({ isBlocked: true }),
      this.companionService.findAll(),
    ]);

    return {
      totalUsers: totalUsers.length,
      blockedUsers: blockedUsers.length,
      totalCompanions: companions.length,
    };
  }
}
